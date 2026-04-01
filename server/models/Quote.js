const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['corporate', 'wedding', 'birthday', 'holiday', 'fundraiser', 'festival', 'other'],
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  eventLocation: {
    type: String,
    required: [true, 'Event location is required'],
  },
  guestCount: {
    type: String,
  },
  details: {
    type: String,
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'quoted', 'booked', 'declined'],
    default: 'new',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

quoteSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Quote', quoteSchema);
