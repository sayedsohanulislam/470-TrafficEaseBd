const mongoose = require('mongoose');
const Incident = require('../models/Incident');
const mockDb = require('../data/mockDatabase');

const buildLocation = (body) => {
  const rawCoordinates = Array.isArray(body.coordinates)
    ? body.coordinates
    : body.location?.coordinates;
  if (!Array.isArray(rawCoordinates) || rawCoordinates.length !== 2) return undefined;

  const coordinates = rawCoordinates.map(Number);
  const [longitude, latitude] = coordinates;
  if (!coordinates.every(Number.isFinite)
    || longitude < -180 || longitude > 180
    || latitude < -90 || latitude > 90) return undefined;

  return { type: 'Point', coordinates };
};

const reporterId = (incident) => String(incident.reportedBy?._id || incident.reportedBy || '');
const isApprovedForPublic = (incident) => !incident.approvalStatus || incident.approvalStatus === 'Approved';
const isAdminModerationRequest = (req) => req.user?.role === 'Admin' && req.query.moderation === 'all';
const isOwnReportsRequest = (req) => Boolean(req.user && req.query.mine === 'true');

exports.getIncidents = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      let items = [...mockDb.incidents];
      if (isOwnReportsRequest(req)) {
        items = items.filter((incident) => reporterId(incident) === String(req.user._id));
      } else if (!isAdminModerationRequest(req)) {
        items = items.filter(isApprovedForPublic);
      }
      if (req.user?.role === 'Admin' && req.query.approvalStatus) {
        items = items.filter(i => (i.approvalStatus || 'Approved') === req.query.approvalStatus);
      }
      if (req.query.status) items = items.filter(i => i.status === req.query.status);
      if (req.query.type) items = items.filter(i => i.type === req.query.type);
      if (req.query.severity) items = items.filter(i => i.severity === req.query.severity);
      items = items.slice(0, limit);
      return res.json({ count: items.length, items });
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const filter = {};
    if (isOwnReportsRequest(req)) {
      filter.reportedBy = req.user._id;
    } else if (!isAdminModerationRequest(req)) {
      filter.$or = [{ approvalStatus: 'Approved' }, { approvalStatus: { $exists: false } }];
    }
    if (req.user?.role === 'Admin' && req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.severity) filter.severity = req.query.severity;

    const items = await Incident.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('reportedBy', 'name role')
      .lean();

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
      const canView = isApprovedForPublic(incident)
        || req.user?.role === 'Admin'
        || reporterId(incident) === String(req.user?._id || '');
      if (!canView) return res.status(404).json({ message: 'Incident not found' });
      return res.json(incident);
    }

    const incident = await Incident.findById(req.params.id).populate('reportedBy', 'name role').lean();
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    const canView = isApprovedForPublic(incident)
      || req.user?.role === 'Admin'
      || reporterId(incident) === String(req.user?._id || '');
    if (!canView) return res.status(404).json({ message: 'Incident not found' });
    return res.json(incident);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createIncident = async (req, res) => {
  try {
    if (!req.user || !['Commuter', 'Driver'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only signed-in commuters and drivers can report incidents' });
    }
    const location = buildLocation(req.body);
    if (!location) return res.status(400).json({ message: 'Pin the incident location on the map before submitting' });
    if (!String(req.body.title || '').trim() || !String(req.body.locationName || '').trim()) {
      return res.status(400).json({ message: 'Incident title and location name are required' });
    }
    
    if (mongoose.connection.readyState !== 1) {
      const newInc = {
        _id: 'mock-inc-' + (mockDb.incidents.length + 1),
        title: req.body.title,
        type: req.body.type,
        severity: req.body.severity || 'Medium',
        status: 'Open',
        approvalStatus: 'Pending',
        locationName: req.body.locationName,
        location,
        coordinates: location.coordinates,
        description: req.body.description,
        reportedBy: { _id: req.user._id, name: req.user.name, role: req.user.role },
        createdAt: new Date().toISOString()
      };
      mockDb.incidents.unshift(newInc);
      return res.status(201).json(newInc);
    }

    const incident = await Incident.create({
      ...req.body,
      location,
      coordinates: undefined,
      status: 'Open',
      approvalStatus: 'Pending',
      reportedBy: req.user._id,
      approvedBy: undefined,
      approvedAt: undefined
    });
    res.status(201).json(incident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateIncident = async (req, res) => {
  try {
    const allowedStatuses = ['Open', 'Investigating', 'Resolved', 'Rejected'];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: 'A valid incident status is required' });
    }
    const payload = { status: req.body.status };

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

exports.approveIncident = async (req, res) => {
  try {
    const approval = {
      approvalStatus: 'Approved',
      approvedBy: req.user._id,
      approvedAt: new Date()
    };

    if (mongoose.connection.readyState !== 1) {
      const index = mockDb.incidents.findIndex(i => i._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Incident not found' });
      mockDb.incidents[index] = {
        ...mockDb.incidents[index],
        ...approval,
        approvedBy: { _id: req.user._id, name: req.user.name, role: req.user.role },
        approvedAt: approval.approvedAt.toISOString()
      };
      return res.json(mockDb.incidents[index]);
    }

    const incident = await Incident.findByIdAndUpdate(req.params.id, approval, {
      new: true,
      runValidators: true
    }).populate('reportedBy', 'name role');
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
