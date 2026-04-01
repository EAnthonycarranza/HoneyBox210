const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendContactEmail, sendContactConfirmationEmail } = require('../utils/email');

const router = express.Router();

// POST /api/contact - Send contact form email
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 5000 })
      .withMessage('Message cannot exceed 5000 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
      }

      const { name, email, message } = req.body;

      const sent = await sendContactEmail(name, email, message);

      // Send confirmation email to the user
      if (sent) {
        await sendContactConfirmationEmail(email, name);
        res.json({
          message: 'Thank you for reaching out! Mari will get back to you as soon as possible.',
        });
      } else {
        res.status(500).json({
          message: 'Unable to send your message at this time. Please try again later or email us directly.',
        });
      }
    } catch (error) {
      console.error('Contact form error:', error.message);
      res.status(500).json({ message: 'Server error processing contact form.' });
    }
  }
);

module.exports = router;
