const mongoose = require('mongoose');

const seedDatabase = async () => {
  const Incident = require('../models/Incident');
  const User = require('../models/User');
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
      const seedItems = items.map(({ _id, ...rest }) => {
        if (Model.modelName !== 'Incident') return rest;
        const { coordinates, reportedBy, approvedBy, ...incident } = rest;
        return incident;
      });
      await Model.insertMany(seedItems);
    }
  }

  // Existing incidents predate the approval workflow and were already public.
  await Incident.updateMany(
    { approvalStatus: { $exists: false } },
    { $set: { approvalStatus: 'Approved' } }
  );

  // Keep demo credentials local-only; production admins must be provisioned explicitly.
  if (process.env.NODE_ENV !== 'production') {
    const adminEmail = process.env.DEMO_ADMIN_EMAIL || 'admin@trafficease.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'TrafficEase Administrator',
        email: adminEmail,
        phone: '01700000000',
        password: process.env.DEMO_ADMIN_PASSWORD || 'password123',
        role: 'Admin'
      });
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
