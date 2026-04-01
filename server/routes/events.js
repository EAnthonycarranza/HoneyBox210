const express = require('express');
const Event = require('../models/Event');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/events - List published events (public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ published: true }).sort({ date: -1 });
    res.json({ events });
  } catch (error) {
    console.error('List events error:', error.message);
    res.status(500).json({ message: 'Server error fetching events.' });
  }
});

// GET /api/events/all - List all events (admin)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching events.' });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ event });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Event not found.' });
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/events - Create event (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, description, image, date, endDate, location, published } = req.body;
    const event = new Event({ title, description, image, date, endDate, location, published });
    await event.save();
    res.status(201).json({ message: 'Event created.', event });
  } catch (error) {
    console.error('Create event error:', error.message);
    res.status(500).json({ message: 'Server error creating event.' });
  }
});

// PUT /api/events/:id - Update event (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event updated.', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating event.' });
  }
});

// DELETE /api/events/:id - Delete event (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting event.' });
  }
});

module.exports = router;
