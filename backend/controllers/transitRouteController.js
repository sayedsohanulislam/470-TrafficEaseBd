const mongoose = require('mongoose');
const TransitRoute = require('../models/TransitRoute');
const mockDb = require('../data/mockDatabase');

exports.getTransitRoutes = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      let items = [...mockDb.transit];
      if (req.query.mode) items = items.filter((item) => item.mode === req.query.mode);
      if (req.query.status) items = items.filter((item) => item.status === req.query.status);
      items.sort((a, b) => a.name.localeCompare(b.name));
      return res.json({ count: items.length, items });
    }
    const filter = {};
    if (req.query.mode) filter.mode = req.query.mode;
    if (req.query.status) filter.status = req.query.status;
    const items = await TransitRoute.find(filter).sort({ name: 1 }).limit(100);
    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTransitRoute = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const route = { _id: `mock-tr-${mockDb.transit.length + 1}`, ...req.body };
      mockDb.transit.unshift(route);
      return res.status(201).json(route);
    }
    const route = await TransitRoute.create(req.body);
    res.status(201).json(route);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTransitRoute = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const index = mockDb.transit.findIndex((item) => item._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Transit route not found' });
      mockDb.transit[index] = { ...mockDb.transit[index], ...req.body };
      return res.json(mockDb.transit[index]);
    }
    const route = await TransitRoute.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!route) return res.status(404).json({ message: 'Transit route not found' });
    return res.json(route);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteTransitRoute = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const index = mockDb.transit.findIndex((item) => item._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Transit route not found' });
      mockDb.transit.splice(index, 1);
      return res.json({ message: 'Transit route deleted' });
    }
    const route = await TransitRoute.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: 'Transit route not found' });
    return res.json({ message: 'Transit route deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
