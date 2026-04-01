const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const { createShipment, purchaseLabel, validateAddress } = require('../utils/shippo');
const Order = require('../models/Order');

const router = express.Router();

/**
 * POST /api/shipping/rates
 * Get shipping rates for an order or a temporary cart
 */
router.post('/rates', auth, async (req, res) => {
  try {
    const { address, items } = req.body;

    if (!address || !items || items.length === 0) {
      return res.status(400).json({ message: 'Address and items are required.' });
    }

    const shipment = await createShipment(address, items);
    
    // Filter out rates that might be invalid or not needed
    // In 2.x, rates might be under shipment.rates
    if (!shipment.rates || !Array.isArray(shipment.rates)) {
      return res.status(500).json({ message: 'No shipping rates found for this shipment.' });
    }

    const rates = shipment.rates.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));

    res.json({
      shipmentId: shipment.objectId,
      rates: rates.map(rate => ({
        id: rate.objectId,
        provider: rate.provider,
        servicelevel: rate.servicelevel?.name || 'Standard',
        amount: rate.amount,
        currency: rate.currency,
        estimated_days: rate.estimatedDays,
        duration_terms: rate.durationTerms
      }))
    });
  } catch (error) {
    console.error('Get Rates Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve shipping rates.' });
  }
});

/**
 * POST /api/shipping/label/:orderId
 * Create a shipping label for an existing order (Admin only)
 */
router.post('/label/:orderId', adminAuth, async (req, res) => {
  try {
    const { rateId } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.deliveryMethod !== 'shipping') {
      return res.status(400).json({ message: 'This order is not for shipping.' });
    }

    if (!rateId) {
      return res.status(400).json({ message: 'Rate ID is required to purchase a label.' });
    }

    const transaction = await purchaseLabel(rateId);

    if (transaction.status === 'SUCCESS') {
      // Update order with shipping info
      order.status = 'shipped';
      order.trackingNumber = transaction.trackingNumber;
      order.labelUrl = transaction.labelUrl;
      order.shippingRateId = rateId;
      
      await order.save();

      res.json({
        message: 'Shipping label created successfully.',
        trackingNumber: transaction.trackingNumber,
        labelUrl: transaction.labelUrl,
        trackingUrl: transaction.trackingUrlProvider
      });
    } else {
      res.status(400).json({ 
        message: 'Failed to purchase shipping label.', 
        errors: transaction.messages 
      });
    }
  } catch (error) {
    console.error('Create Label Error:', error.message);
    res.status(500).json({ message: 'Failed to create shipping label.' });
  }
});

/**
 * POST /api/shipping/validate-address
 * Validate an address before checkout
 */
router.post('/validate-address', auth, async (req, res) => {
  try {
    const { address } = req.body;
    const result = await validateAddress(address);

    // In 2.x, validation results structure might have changed
    const isValid = result.validationResults?.isValid;

    if (isValid) {
      res.json({ isValid: true, address: result });
    } else {
      res.json({ 
        isValid: false, 
        messages: result.validationResults?.messages?.map(m => m.text) || ['Invalid address'] 
      });
    }
  } catch (error) {
    console.error('Validate Address Error:', error.message);
    res.status(500).json({ message: 'Failed to validate address.' });
  }
});

module.exports = router;
