const express = require('express');
const Quote = require('../models/Quote');
const { adminAuth } = require('../middleware/auth');
const { sendQuoteConfirmationEmail, sendQuoteNotificationEmail } = require('../utils/email');

const router = express.Router();

// POST /api/quotes - Submit a quote request (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, eventType, eventDate, eventLocation, guestCount, details } = req.body;
    if (!name || !email || !eventType || !eventDate || !eventLocation) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }
    const quote = new Quote({ name, email, phone, company, eventType, eventDate, eventLocation, guestCount, details });
    await quote.save();
    // Send confirmation email to the user
    await sendQuoteConfirmationEmail(email, name, eventType);
    // Notify admin about the new quote request
    await sendQuoteNotificationEmail({ name, email, phone, company, eventType, eventDate, eventLocation, guestCount, details });
    res.status(201).json({ message: 'Quote request submitted! We will be in touch soon.' });
  } catch (error) {
    console.error('Quote submission error:', error.message);
    res.status(500).json({ message: 'Server error submitting quote.' });
  }
});

// GET /api/quotes - List all quotes (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json({ quotes });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching quotes.' });
  }
});

// PUT /api/quotes/:id - Update quote status/notes (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!quote) return res.status(404).json({ message: 'Quote not found.' });
    res.json({ message: 'Quote updated.', quote });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating quote.' });
  }
});

// DELETE /api/quotes/:id - Delete quote (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const quote = await Quote.findByIdAndDelete(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quote not found.' });
    res.json({ message: 'Quote deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting quote.' });
  }
});

module.exports = router;
