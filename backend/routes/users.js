const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// GET /api/users/:id — public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/profile — update own profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, location, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, location, bio },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/avatar — upload avatar
router.put('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    );
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
