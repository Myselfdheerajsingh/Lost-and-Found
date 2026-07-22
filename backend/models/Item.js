const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['lost', 'found'], required: true },
    category: {
      type: String,
      enum: ['Electronics', 'Pets', 'Wallet/IDs', 'Keys', 'Bags', 'Clothing', 'Other'],
      required: true,
    },
    description: { type: String, required: true },
    images: [{ type: String }],
    location: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    date: { type: Date, required: true },
    status: { type: String, enum: ['active', 'resolved'], default: 'active' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactEmail: { type: String },
    contactPhone: { type: String },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text search index
itemSchema.index({ title: 'text', description: 'text', 'location.address': 'text' });



module.exports = mongoose.model('Item', itemSchema);