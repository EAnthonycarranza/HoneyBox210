const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  caption: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
