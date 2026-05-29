const mongoose = require('mongoose');

const trafficSignalSchema = new mongoose.Schema({
  intersection: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Normal', 'Adaptive', 'Manual', 'Fault'], default: 'Normal' },
  congestionLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  cycleSeconds: { type: Number, default: 90, min: 10 },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [90.4125, 23.8103] }
  },
  lastSynced: { type: Date, default: Date.now }
}, { timestamps: true });

trafficSignalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('TrafficSignal', trafficSignalSchema);
