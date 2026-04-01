const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  image: {
    type: String,
    default: '/images/default-honey.jpg',
  },
  images: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['raw-honey', 'honeycomb', 'creamed-honey', 'infused-honey', 'gift-box', 'seasonal'],
    default: 'raw-honey',
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  weight: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.index({ category: 1 });
productSchema.index({ inStock: 1 });

module.exports = mongoose.model('Product', productSchema);
