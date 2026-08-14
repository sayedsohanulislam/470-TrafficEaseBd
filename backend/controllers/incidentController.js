const mongoose = require('mongoose');
const Incident = require('../models/Incident');
const mockDb = require('../data/mockDatabase');

const buildLocation = (body) => {
  if (Array.isArray(body.coordinates)) {
    return { type: 'Point', coordinates: body.coordinates.map(Number) };
  }
  if (body.location?.coordinates) {
    return body.location;
  }
  return undefined;
};

exports.getIncidents = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      let items = [...mockDb.incidents];
      if (req.query.status) items = items.filter(i => i.status === req.query.status);
      if (req.query.type) items = items.filter(i => i.type === req.query.type);
      if (req.query.severity) items = items.filter(i => i.severity === req.query.severity);
      items = items.slice(0, limit);
      return res.json({ count: items.length, items });
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.severity) filter.severity = req.query.severity;

    const items = await Incident.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('reportedBy', 'name role');

    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIncidentById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const incident = mockDb.incidents.find(i => i._id === req.params.id);
      if (!incident) return res.status(404).json({ message: 'Incident not found' });
      return res.json(incident);
    }

    const incident = await Incident.findById(req.params.id).populate('reportedBy', 'name role');
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    return res.json(incident);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createIncident = async (req, res) => {
  try {
    const location = buildLocation(req.body);
    
    if (mongoose.connection.readyState !== 1) {
      const newInc = {
        _id: 'mock-inc-' + (mockDb.incidents.length + 1),
        title: req.body.title,
        type: req.body.type,
        severity: req.body.severity || 'Medium',
        status: 'Open',
        locationName: req.body.locationName,
        location: location || { type: 'Point', coordinates: [90.4125, 23.8103] },
        coordinates: req.body.coordinates || [90.4125, 23.8103],
        description: req.body.description,
        createdAt: new Date().toISOString()
      };
      mockDb.incidents.unshift(newInc);
      return res.status(201).json(newInc);
    }

    const incident = await Incident.create({
      ...req.body,
      location,
      reportedBy: req.user?._id
    });
    res.status(201).json(incident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateIncident = async (req, res) => {
  try {
    const payload = { ...req.body };
    const location = buildLocation(req.body);
    if (location) payload.location = location;

    if (mongoose.connection.readyState !== 1) {
      const index = mockDb.incidents.findIndex(i => i._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Incident not found' });
      mockDb.incidents[index] = { ...mockDb.incidents[index], ...payload };
      return res.json(mockDb.incidents[index]);
    }

    const incident = await Incident.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    return res.json(incident);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteIncident = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const index = mockDb.incidents.findIndex(i => i._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Incident not found' });
      mockDb.incidents.splice(index, 1);
      return res.json({ message: 'Incident deleted' });
    }

    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    return res.json({ message: 'Incident deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
