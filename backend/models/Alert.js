const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  area: { type: String, required: true, trim: true },
  severity: { type: String, enum: ['Info', 'Warning', 'Critical'], default: 'Info' },
  active: { type: Boolean, default: true },
  expiresAt: { type: Date }
}, { timestamps: true });

alertSchema.index({ active: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
