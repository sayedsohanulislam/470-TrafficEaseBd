const mongoose = require('mongoose');
const OperationLog = require('../models/OperationLog');
const mockDb = require('../data/mockDatabase');

exports.getOperations = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    if (mongoose.connection.readyState !== 1) {
      return res.json({ count: Math.min(limit, mockDb.operations.length), items: mockDb.operations.slice(0, limit) });
    }

    const items = await OperationLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actor', 'name role');
    return res.json({ count: items.length, items });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createOperation = async (req, res) => {
  try {
    const payload = {
      category: req.body.category,
      action: req.body.action,
      status: req.body.status || 'Completed',
      details: req.body.details || {},
      actor: req.user?._id,
      actorName: req.user?.name
    };

    if (mongoose.connection.readyState !== 1) {
      const operation = {
        _id: `mock-op-${mockDb.operations.length + 1}`,
        ...payload,
        actor: req.user?._id,
        createdAt: new Date().toISOString()
      };
      mockDb.operations.unshift(operation);
      return res.status(201).json(operation);
    }

    const operation = await OperationLog.create(payload);
    return res.status(201).json(operation);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
