const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['Congestion', 'Accident', 'Roadwork', 'Flooding', 'Signal Failure', 'Other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'Investigating', 'Resolved', 'Rejected'],
    default: 'Open'
  },
  locationName: { type: String, required: true, trim: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [90.4125, 23.8103] }
  },
  description: { type: String, trim: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAuthority: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

incidentSchema.index({ location: '2dsphere' });
incidentSchema.index({ status: 1, severity: 1, createdAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
