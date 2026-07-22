const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// GET /api/items — list with filters + search + pagination
router.get('/', async (req, res) => {
  try {
    const { type, category, status, q, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (q) filter.$text = { $search: q };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('postedBy', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Item.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/items/:id — single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('postedBy', 'name email avatar phone');

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/items — create item (auth required)
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { title, type, category, description, address, lat, lng, date, contactEmail, contactPhone } = req.body;
    const images = req.files?.map((f) => f.path) || [];

    const item = await Item.create({
      title, type, category, description,
      location: { address, coordinates: { lat: lat ? parseFloat(lat) : null, lng: lng ? parseFloat(lng) : null } },
      date: new Date(date),
      images,
      contactEmail: contactEmail || req.user.email,
      contactPhone,
      postedBy: req.user._id,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { itemsPosted: 1 } });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/items/:id — update item (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/items/:id/resolve — mark resolved
router.patch('/:id/resolve', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    item.status = 'resolved';
    await item.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { itemsResolved: 1 } });

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/items/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await item.deleteOne();
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/items/user/:userId — items by user
router.get('/user/:userId', async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;