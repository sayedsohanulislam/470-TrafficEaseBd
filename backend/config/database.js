const mongoose = require('mongoose');

const seedDatabase = async () => {
  const Incident = require('../models/Incident');
  const Vehicle = require('../models/Vehicle');
  const Alert = require('../models/Alert');
  const ParkingLot = require('../models/ParkingLot');
  const TrafficSignal = require('../models/TrafficSignal');
  const TransitRoute = require('../models/TransitRoute');
  const OperationLog = require('../models/OperationLog');
  const mockDb = require('../data/mockDatabase');

  const seeds = [
    [Incident, mockDb.incidents],
    [Vehicle, mockDb.vehicles],
    [Alert, mockDb.alerts],
    [ParkingLot, mockDb.parking],
    [TrafficSignal, mockDb.signals],
    [TransitRoute, mockDb.transit],
    [OperationLog, mockDb.operations]
  ];

  for (const [Model, items] of seeds) {
    if ((await Model.countDocuments()) === 0) {
      await Model.insertMany(items.map(({ _id, ...rest }) => rest));
    }
  }
};

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trafficease_bd', {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB Connected');
    await seedDatabase();
    return true;
  } catch (error) {
    console.warn(`MongoDB unavailable; using in-memory fallback where supported: ${error.message}`);
    return false;
  }
};

module.exports = { connectDatabase, seedDatabase };
