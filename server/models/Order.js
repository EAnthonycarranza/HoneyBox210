const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
}, { _id: false });

// Counter schema for auto-incrementing order numbers
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  customerEmail: {
    type: String,
    required: function() { return !this.user; }
  },
  customerName: {
    type: String,
    required: function() { return !this.user; }
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function (items) {
        return items.length > 0;
      },
      message: 'Order must contain at least one item',
    },
  },
  deliveryMethod: {
    type: String,
    required: true,
    enum: {
      values: ['shipping', 'pickup'],
      message: 'Delivery method must be either shipping or pickup',
    },
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
  },
  pickupNote: {
    type: String,
    maxlength: 500,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'ready-for-pickup', 'cancelled'],
    default: 'pending',
  },
  trackingNumber: {
    type: String,
  },
  labelUrl: {
    type: String,
  },
  shippingRateId: {
    type: String,
  },
  paymentIntentId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to auto-generate order number
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'orderNumber',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.orderNumber = `HB-${String(counter.seq).padStart(5, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
