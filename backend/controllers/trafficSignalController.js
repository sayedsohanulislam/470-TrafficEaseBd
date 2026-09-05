const mongoose = require('mongoose');
const TrafficSignal = require('../models/TrafficSignal');
const mockDb = require('../data/mockDatabase');

const buildPayload = (body) => {
  const payload = { ...body };
  if (Array.isArray(body.coordinates)) {
    payload.location = { type: 'Point', coordinates: body.coordinates.map(Number) };
  }
  if (body.status || body.congestionLevel || body.cycleSeconds) {
    payload.lastSynced = Date.now();
  }
  return payload;
};

exports.getSignals = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      let items = [...mockDb.signals];
      if (req.query.status) items = items.filter((item) => item.status === req.query.status);
      return res.json({ count: items.length, items });
    }
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const items = await TrafficSignal.find(filter).sort({ updatedAt: -1 }).limit(100);
    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSignal = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const signal = { _id: `mock-sig-${mockDb.signals.length + 1}`, ...buildPayload(req.body) };
      mockDb.signals.unshift(signal);
      return res.status(201).json(signal);
    }
    const signal = await TrafficSignal.create(buildPayload(req.body));
    res.status(201).json(signal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSignal = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const index = mockDb.signals.findIndex((item) => item._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Traffic signal not found' });
      mockDb.signals[index] = { ...mockDb.signals[index], ...buildPayload(req.body) };
      return res.json(mockDb.signals[index]);
    }
    const signal = await TrafficSignal.findByIdAndUpdate(req.params.id, buildPayload(req.body), {
      new: true,
      runValidators: true
    });
    if (!signal) return res.status(404).json({ message: 'Traffic signal not found' });
    return res.json(signal);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteSignal = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const index = mockDb.signals.findIndex((item) => item._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Traffic signal not found' });
      mockDb.signals.splice(index, 1);
      return res.json({ message: 'Traffic signal deleted' });
    }
    const signal = await TrafficSignal.findByIdAndDelete(req.params.id);
    if (!signal) return res.status(404).json({ message: 'Traffic signal not found' });
    return res.json({ message: 'Traffic signal deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
