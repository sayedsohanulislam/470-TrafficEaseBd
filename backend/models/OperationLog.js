const mongoose = require('mongoose');

const operationLogSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Dispatch', 'Alert', 'Incident', 'Signal', 'Planning', 'System'],
    required: true
  },
  action: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['Queued', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Completed'
  },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: { type: String, trim: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

operationLogSchema.index({ createdAt: -1, category: 1 });

module.exports = mongoose.model('OperationLog', operationLogSchema);
