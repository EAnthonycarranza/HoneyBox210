const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { adminAuth } = require('../middleware/auth');
const { uploadToGCS, deleteFromGCS } = require('../utils/gcs');

const router = express.Router();

// Multer memory storage for GCS uploads
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

// Default honey products for seeding
const defaultProducts = [
  {
    name: '1.5 oz. Infused Honey',
    description:
      '12 infused flavors to explore made with fresh organic fruits and 100% local, raw, organic honey harvested from rescued bees.\nLemon, Ginger, Strawberry, Pineapple, Cherry, Raspberry, Blueberry, Orange, Lavender, Apple, Cinnamon, Simple Honey',
    price: 6.0,
    image: '/images/1ozInfusedHoney.png',
    images: ['/images/1ozInfusedHoney.png'],
    category: 'infused-honey',
    weight: '1.5oz',
    inStock: true,
  },
  {
    name: '12oz. Honey',
    description:
      '100% local, raw, organic honey harvested from rescued bees.',
    price: 30.0,
    image: '/images/12ozHoney.png',
    images: ['/images/12ozHoney.png'],
    category: 'raw-honey',
    weight: '12oz',
    inStock: true,
  },
  {
    name: '3oz. Honey',
    description:
      '100% local, raw, organic honey harvested from rescued bees.',
    price: 12.0,
    image: '/images/3ozHoney.png',
    images: ['/images/3ozHoney.png'],
    category: 'raw-honey',
    weight: '3oz',
    inStock: true,
  },
  {
    name: '3oz. Honey Box',
    description:
      'Beautifully curated Honeybox, featuring 100% local, raw, organic honey harvested from rescued bees. Perfect for personal gifts, special occasions, promotional events, and corporate celebrations.',
    price: 20.0,
    image: '/images/3ozHoneyBox.png',
    images: ['/images/3ozHoneyBox.png', '/images/HoneyBox.png'],
    category: 'gift-box',
    weight: '3oz',
    inStock: true,
  },
];

// GET /api/products - List all products
router.get('/', async (req, res) => {
  try {
    const { category, inStock, all } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }
    if (inStock !== undefined) {
      filter.inStock = inStock === 'true';
    }
    if (all !== 'true') {
      filter.isVisible = true;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.error('List products error:', error.message);
    res.status(500).json({ message: 'Server error fetching products.' });
  }
});

// POST /api/products/upload-image - Admin: upload product image to GCS
router.post('/upload-image', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided.' });

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const filename = `products/product-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
    const imageUrl = await uploadToGCS(req.file.buffer, filename, req.file.mimetype);

    res.json({ imageUrl });
  } catch (error) {
    console.error('Product image upload error:', error.message);
    res.status(500).json({ message: 'Error uploading product image.' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ product });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found.' });
    }
    console.error('Get product error:', error.message);
    res.status(500).json({ message: 'Server error fetching product.' });
  }
});

// POST /api/products - Create product (admin only)
router.post(
  '/',
  adminAuth,
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').isIn(['raw-honey', 'honeycomb', 'creamed-honey', 'infused-honey', 'gift-box', 'seasonal'])
      .withMessage('Invalid category'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
      }

      const product = new Product(req.body);
      await product.save();

      res.status(201).json({ message: 'Product created.', product });
    } catch (error) {
      console.error('Create product error:', error.message);
      res.status(500).json({ message: 'Server error creating product.' });
    }
  }
);

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product updated.', product });
  } catch (error) {
    console.error('Update product error:', error.message);
    res.status(500).json({ message: 'Server error updating product.' });
  }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    // Delete GCS images if applicable
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        await deleteFromGCS(img);
      }
    }
    res.json({ message: 'Product deleted.' });
  } catch (error) {
    console.error('Delete product error:', error.message);
    res.status(500).json({ message: 'Server error deleting product.' });
  }
});

// POST /api/products/seed - Seed default products (clears existing and re-seeds)
router.post('/seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    const products = await Product.insertMany(defaultProducts);
    res.status(201).json({
      message: `Successfully seeded ${products.length} products.`,
      products,
    });
  } catch (error) {
    console.error('Seed products error:', error.message);
    res.status(500).json({ message: 'Server error seeding products.' });
  }
});

// Exported for CLI seeding via root package.json script
const seedProducts = async () => {
  try {
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} products. Skipping seed.`);
      process.exit(0);
    }

    const products = await Product.insertMany(defaultProducts);
    console.log(`Successfully seeded ${products.length} products.`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

router.seedProducts = seedProducts;
module.exports = router;
