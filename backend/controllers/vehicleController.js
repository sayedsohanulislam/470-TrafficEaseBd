const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const mockDb = require('../data/mockDatabase');

const buildVehiclePayload = (body) => {
  const payload = { ...body };
  if (Array.isArray(body.coordinates)) {
    payload.currentLocation = { type: 'Point', coordinates: body.coordinates.map(Number) };
  }
  return payload;
};

exports.getVehicles = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      let items = [...mockDb.vehicles];
      if (req.query.type) items = items.filter(v => v.type === req.query.type);
      if (req.query.status) items = items.filter(v => v.status === req.query.status);
      items = items.slice(0, limit);
      return res.json({ count: items.length, items });
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const items = await Vehicle.find(filter)
      .sort({ lastUpdated: -1 })
      .limit(limit)
      .populate('driver', 'name phone role');

    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const vehicle = mockDb.vehicles.find(v => v._id === req.params.id);
      if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
      return res.json(vehicle);
    }

    const vehicle = await Vehicle.findById(req.params.id).populate('driver', 'name phone role');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    return res.json(vehicle);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const payload = buildVehiclePayload(req.body);

    if (mongoose.connection.readyState !== 1) {
      const newVeh = {
        _id: 'mock-veh-' + (mockDb.vehicles.length + 1),
        ...payload,
        lastUpdated: Date.now()
      };
      mockDb.vehicles.unshift(newVeh);
      return res.status(201).json(newVeh);
    }

    const vehicle = await Vehicle.create(payload);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const payload = buildVehiclePayload(req.body);

    if (mongoose.connection.readyState !== 1) {
      const index = mockDb.vehicles.findIndex(v => v._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Vehicle not found' });
      mockDb.vehicles[index] = { ...mockDb.vehicles[index], ...payload, lastUpdated: Date.now() };
      return res.json(mockDb.vehicles[index]);
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { ...payload, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    return res.json(vehicle);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const index = mockDb.vehicles.findIndex(v => v._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Vehicle not found' });
      mockDb.vehicles.splice(index, 1);
      return res.json({ message: 'Vehicle deleted' });
    }

    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    return res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getVehicleStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // Mock stats
      return res.json([
        { _id: { type: 'Ambulance', status: 'Active' }, count: 1 },
        { _id: { type: 'Police Patrol', status: 'Active' }, count: 1 },
        { _id: { type: 'Fire Truck', status: 'Standby' }, count: 1 }
      ]);
    }

    const stats = await Vehicle.aggregate([
      { $group: { _id: { type: '$type', status: '$status' }, count: { $sum: 1 } } },
      { $sort: { '_id.type': 1 } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
