const express = require('express');
const multer = require('multer');
const GalleryImage = require('../models/GalleryImage');
const { adminAuth } = require('../middleware/auth');
const { uploadToGCS, uploadBase64ToGCS, deleteFromGCS } = require('../utils/gcs');

const router = express.Router();

// Configure multer for memory storage (buffer) - files go to GCS, not disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(file.originalname.split('.').pop().toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed.'));
  },
});

// GET /api/gallery - Public: get published images
router.get('/', async (req, res) => {
  try {
    const images = await GalleryImage.find({ published: true }).sort({ order: 1, createdAt: -1 });
    res.json({ images });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching gallery.' });
  }
});

// GET /api/gallery/all - Admin: get all images
router.get('/all', adminAuth, async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ order: 1, createdAt: -1 });
    res.json({ images });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching gallery.' });
  }
});

// POST /api/gallery/upload - Admin: upload image file to GCS
router.post('/upload', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided.' });

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const filename = `gallery/gallery-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
    const imageUrl = await uploadToGCS(req.file.buffer, filename, req.file.mimetype);

    res.json({ imageUrl });
  } catch (error) {
    console.error('Gallery upload error:', error.message);
    res.status(500).json({ message: 'Error uploading image.' });
  }
});

// POST /api/gallery/upload-cropped - Admin: upload cropped image (base64) to GCS
router.post('/upload-cropped', adminAuth, express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) return res.status(400).json({ message: 'No image data provided.' });

    const imageUrl = await uploadBase64ToGCS(imageData, 'gallery');
    res.json({ imageUrl });
  } catch (error) {
    console.error('Cropped upload error:', error.message);
    res.status(500).json({ message: 'Error saving cropped image.' });
  }
});

// POST /api/gallery - Admin: create gallery image entry
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, caption, imageUrl, order, published } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'Image URL is required.' });
    const image = new GalleryImage({ title, caption, imageUrl, order, published });
    await image.save();
    res.status(201).json({ message: 'Gallery image added.', image });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating gallery image.' });
  }
});

// PUT /api/gallery/:id - Admin: update gallery image
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!image) return res.status(404).json({ message: 'Image not found.' });
    res.json({ message: 'Image updated.', image });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating image.' });
  }
});

// DELETE /api/gallery/:id - Admin: delete gallery image
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found.' });
    // Delete from GCS if it's a GCS URL
    await deleteFromGCS(image.imageUrl);
    res.json({ message: 'Image deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting image.' });
  }
});

// GET /api/gallery/proxy-image - Proxy a GCS image to avoid CORS issues (for canvas cropping)
router.get('/proxy-image', adminAuth, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: 'URL parameter is required.' });

    // Only allow proxying our own GCS bucket URLs
    const allowedPrefix = `https://storage.googleapis.com/${require('../utils/gcs').BUCKET_NAME}/`;
    if (!url.startsWith(allowedPrefix)) {
      return res.status(403).json({ message: 'Only Honey Box 210 bucket images can be proxied.' });
    }

    const https = require('https');
    https.get(url, (proxyRes) => {
      res.set('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=3600');
      proxyRes.pipe(res);
    }).on('error', (err) => {
      console.error('Image proxy error:', err.message);
      res.status(500).json({ message: 'Failed to fetch image.' });
    });
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ message: 'Server error proxying image.' });
  }
});

module.exports = router;
