const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Incident = require('../models/Incident');
const Alert = require('../models/Alert');
const ParkingLot = require('../models/ParkingLot');
const TrafficSignal = require('../models/TrafficSignal');
const TransitRoute = require('../models/TransitRoute');
const mockDb = require('../data/mockDatabase');

exports.getSummary = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(mockDb.getSummaryData());
    }

    const [
      incidents,
      vehicles,
      activeAlerts,
      parking,
      signals,
      transitRoutes
    ] = await Promise.all([
      Incident.countDocuments({ status: { $ne: 'Resolved' } }),
      Vehicle.countDocuments(),
      Alert.countDocuments({ active: true }),
      ParkingLot.aggregate([{ $group: { _id: null, spaces: { $sum: '$availableSpaces' } } }]),
      TrafficSignal.countDocuments(),
      TransitRoute.countDocuments({ status: 'Active' })
    ]);

    res.json({
      incidents,
      vehicles,
      activeAlerts,
      parkingSpaces: parking[0]?.spaces || 0,
      signals,
      transitRoutes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
