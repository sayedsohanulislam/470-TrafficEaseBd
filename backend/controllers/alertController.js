const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const mockDb = require('../data/mockDatabase');

exports.getAlerts = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      let items = [...mockDb.alerts];
      if (req.query.active !== undefined) {
        const isActive = req.query.active === 'true';
        items = items.filter(a => a.active === isActive);
      }
      if (req.query.severity) {
        items = items.filter(a => a.severity === req.query.severity);
      }
      return res.json({ count: items.length, items });
    }

    const filter = {};
    if (req.query.active !== undefined) filter.active = req.query.active === 'true';
    if (req.query.severity) filter.severity = req.query.severity;

    const items = await Alert.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAlert = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const newAlert = {
        _id: 'mock-al-' + (mockDb.alerts.length + 1),
        ...req.body,
        active: req.body.active !== false,
        createdAt: new Date().toISOString()
      };
      mockDb.alerts.unshift(newAlert);
      return res.status(201).json(newAlert);
    }

    const alert = await Alert.create(req.body);
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateAlert = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const index = mockDb.alerts.findIndex(a => a._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Alert not found' });
      mockDb.alerts[index] = { ...mockDb.alerts[index], ...req.body };
      return res.json(mockDb.alerts[index]);
    }

    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    return res.json(alert);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const index = mockDb.alerts.findIndex(a => a._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Alert not found' });
      mockDb.alerts.splice(index, 1);
      return res.json({ message: 'Alert deleted' });
    }

    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    return res.json({ message: 'Alert deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
