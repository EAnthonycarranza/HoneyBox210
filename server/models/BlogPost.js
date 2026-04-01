const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters'],
  },
  image: {
    type: String,
    default: '',
  },
  author: {
    type: String,
    default: 'Mari',
  },
  published: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

blogPostSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

blogPostSchema.index({ published: 1, createdAt: -1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
