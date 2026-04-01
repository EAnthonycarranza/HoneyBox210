const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  image: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  endDate: {
    type: Date,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  published: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

eventSchema.index({ published: 1, date: -1 });

module.exports = mongoose.model('Event', eventSchema);
