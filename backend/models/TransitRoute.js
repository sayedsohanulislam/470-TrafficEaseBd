const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coordinates: { type: [Number], default: [90.4125, 23.8103] },
  sequence: { type: Number, default: 0 }
}, { _id: false });

const transitRouteSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mode: { type: String, enum: ['Bus', 'Metro', 'Train', 'Launch'], default: 'Bus' },
  origin: { type: String, required: true, trim: true },
  destination: { type: String, required: true, trim: true },
  stops: [stopSchema],
  schedule: { type: String, default: 'Every 20 minutes' },
  fare: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['Active', 'Delayed', 'Suspended'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('TransitRoute', transitRouteSchema);
