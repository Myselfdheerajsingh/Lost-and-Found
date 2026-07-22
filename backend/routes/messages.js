const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// GET /api/messages/conversations — all conversations for current user
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Get latest message per conversation
    const convos = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', lastMessage: { $first: '$$ROOT' } } },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    // Populate sender/receiver
    const populated = await Message.populate(convos.map((c) => c.lastMessage), [
      { path: 'sender', select: 'name avatar' },
      { path: 'receiver', select: 'name avatar' },
      { path: 'item', select: 'title type' },
    ]);

    // Count unread
    const unread = await Message.countDocuments({ receiver: req.user._id, read: false });

    res.json({ success: true, data: populated, unread });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/messages/:conversationId — messages in a conversation
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { conversationId: req.params.conversationId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/messages — send a message
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, itemId, text } = req.body;
    if (!receiverId || !text) {
      return res.status(400).json({ success: false, message: 'Receiver and text are required' });
    }

    // Generate stable conversation ID (sorted user IDs)
    const ids = [req.user._id.toString(), receiverId].sort();
    const conversationId = itemId ? `${ids[0]}_${ids[1]}_${itemId}` : `${ids[0]}_${ids[1]}`;

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      receiver: receiverId,
      item: itemId || undefined,
      text,
    });

    await message.populate('sender', 'name avatar');

    res.status(201).json({ success: true, data: message, conversationId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
