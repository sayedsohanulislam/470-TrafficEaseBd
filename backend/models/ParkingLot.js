const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  capacity: { type: Number, required: true, min: 0 },
  availableSpaces: { type: Number, required: true, min: 0 },
  ratePerHour: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['Open', 'Full', 'Closed', 'Maintenance'], default: 'Open' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [90.4125, 23.8103] }
  }
}, { timestamps: true });

parkingLotSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
