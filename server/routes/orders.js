const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');
const { sendOrderConfirmationEmail, sendOrderNotificationEmail } = require('../utils/email');

const router = express.Router();

const SALES_TAX_RATE = 0.0825; // Texas sales tax 8.25%
const SHIPPING_FLAT_RATE = 8.99;

const getStripe = () => {
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

// POST /api/orders/create-payment-intent
router.post('/create-payment-intent', optionalAuth, async (req, res) => {
  try {
    const { items, deliveryMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }

    // Validate products and calculate totals from the database (don't trust client prices)
    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res.status(400).json({ message: 'One or more products not found.' });
    }

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    let subtotal = 0;
    for (const item of items) {
      const product = productMap[item.product];
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product} not found.` });
      }
      if (!product.inStock) {
        return res.status(400).json({ message: `${product.name} is currently out of stock.` });
      }
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: 'Each item must have a quantity of at least 1.' });
      }
      subtotal += product.price * item.quantity;
    }

    const shippingCost = deliveryMethod === 'shipping' ? SHIPPING_FLAT_RATE : 0;
    const tax = parseFloat(((subtotal + shippingCost) * SALES_TAX_RATE).toFixed(2));
    const total = parseFloat((subtotal + shippingCost + tax).toFixed(2));

    // Amount in cents for Stripe
    const amountInCents = Math.round(total * 100);

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        userId: req.user ? req.user._id.toString() : 'guest',
        deliveryMethod,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      breakdown: {
        subtotal,
        shippingCost,
        tax,
        total,
      },
    });
  } catch (error) {
    console.error('Create payment intent error:', error.message);
    res.status(500).json({ message: 'Server error creating payment intent.' });
  }
});

// POST /api/orders - Create order after successful payment
router.post(
  '/',
  optionalAuth,
  [
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.product').notEmpty().withMessage('Product ID is required for each item'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('deliveryMethod').isIn(['shipping', 'pickup']).withMessage('Delivery method must be shipping or pickup'),
    body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
    body('customerEmail').optional().isEmail().withMessage('Valid email is required for guest checkout'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
      }

      const { items, deliveryMethod, shippingAddress, paymentIntentId, pickupNote, customerEmail, customerName } = req.body;

      // Ensure we have user or customer details
      if (!req.user && (!customerEmail || !customerName)) {
        return res.status(400).json({ message: 'Customer email and name are required for guest checkout.' });
      }

      // Validate shipping address if shipping
      if (deliveryMethod === 'shipping') {
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
          return res.status(400).json({ message: 'Complete shipping address is required for shipping orders.' });
        }
      }

      // Verify payment was successful with Stripe
      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: 'Payment has not been completed.' });
      }

      // Validate products and calculate totals server-side
      const productIds = items.map((item) => item.product);
      const products = await Product.find({ _id: { $in: productIds } });

      if (products.length !== items.length) {
        return res.status(400).json({ message: 'One or more products not found.' });
      }

      const productMap = {};
      products.forEach((p) => {
        productMap[p._id.toString()] = p;
      });

      const orderItems = [];
      let subtotal = 0;

      for (const item of items) {
        const product = productMap[item.product];
        if (!product) {
          return res.status(400).json({ message: `Product ${item.product} not found.` });
        }
        if (!product.inStock) {
          return res.status(400).json({ message: `${product.name} is currently out of stock.` });
        }

        const lineTotal = product.price * item.quantity;
        subtotal += lineTotal;

        orderItems.push({
          product: product._id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
        });
      }

      const shippingCost = deliveryMethod === 'shipping' ? SHIPPING_FLAT_RATE : 0;
      const tax = parseFloat(((subtotal + shippingCost) * SALES_TAX_RATE).toFixed(2));
      const total = parseFloat((subtotal + shippingCost + tax).toFixed(2));

      const orderData = {
        items: orderItems,
        deliveryMethod,
        shippingAddress: deliveryMethod === 'shipping' ? shippingAddress : undefined,
        pickupNote: deliveryMethod === 'pickup' ? pickupNote : undefined,
        subtotal,
        shippingCost,
        tax,
        total,
        status: 'pending',
        paymentIntentId,
      };

      if (req.user) {
        orderData.user = req.user._id;
      } else {
        orderData.customerEmail = customerEmail;
        orderData.customerName = customerName;
      }

      const order = new Order(orderData);
      await order.save();

      const email = req.user ? req.user.email : customerEmail;
      const name = req.user ? req.user.name : customerName;

      // Send order confirmation email to customer (non-blocking)
      sendOrderConfirmationEmail(email, name, order);

      // Send order notification email to admin (non-blocking)
      sendOrderNotificationEmail(name, email, order);

      res.status(201).json({
        message: 'Order placed successfully.',
        order,
      });
    } catch (error) {
      console.error('Create order error:', error.message);
      res.status(500).json({ message: 'Server error creating order.' });
    }
  }
);

// GET /api/orders/admin/all - Get all orders (admin)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product', 'name image');
    res.json({ orders });
  } catch (error) {
    console.error('Admin get orders error:', error.message);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
});

// GET /api/orders/admin/search?q=HB-00001 - Search orders by order number (admin)
router.get('/admin/search', adminAuth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ orders: [] });

    const orders = await Order.find({
      $or: [
        { orderNumber: { $regex: q, $options: 'i' } },
        { 'user.email': { $regex: q, $options: 'i' } },
      ],
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product', 'name image');

    // Also search by user name/email since we can't query populated fields directly
    if (orders.length === 0) {
      const User = require('../models/User');
      const users = await User.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
        ],
      }).select('_id');
      const userIds = users.map(u => u._id);
      if (userIds.length > 0) {
        const userOrders = await Order.find({ user: { $in: userIds } })
          .sort({ createdAt: -1 })
          .populate('user', 'name email')
          .populate('items.product', 'name image');
        return res.json({ orders: userOrders });
      }
    }

    res.json({ orders });
  } catch (error) {
    console.error('Admin search orders error:', error.message);
    res.status(500).json({ message: 'Server error searching orders.' });
  }
});

// PUT /api/orders/admin/:id - Update order status (admin)
router.put('/admin/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ message: 'Order updated.', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating order.' });
  }
});

// DELETE /api/orders/admin/:id - Delete order (admin)
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ message: 'Order deleted.', order });
  } catch (error) {
    console.error('Admin delete order error:', error.message);
    res.status(500).json({ message: 'Server error deleting order.' });
  }
});

// GET /api/orders/admin/user/:userId - Get all orders for a specific user (admin)
router.get('/admin/user/:userId', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product', 'name image');
    res.json({ orders });
  } catch (error) {
    console.error('Admin get user orders error:', error.message);
    res.status(500).json({ message: 'Server error fetching user orders.' });
  }
});

// GET /api/orders - Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.product', 'name image'),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error.message);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('items.product', 'name image price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json({ order });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found.' });
    }
    console.error('Get order error:', error.message);
    res.status(500).json({ message: 'Server error fetching order.' });
  }
});

module.exports = router;
