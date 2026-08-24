const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const incidentController = require('../controllers/incidentController');
const mockDb = require('../data/mockDatabase');
const { allowRoles } = require('../middleware/authMiddleware');

const invoke = async (handler, req = {}) => {
  let statusCode = 200;
  let payload;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      payload = value;
      return value;
    }
  };
  await handler({ query: {}, params: {}, body: {}, ...req }, res);
  return { statusCode, payload };
};

test('commuter reports stay private until an admin approves them', async () => {
  assert.notEqual(mongoose.connection.readyState, 1);
  const commuter = { _id: 'workflow-commuter', name: 'Workflow Commuter', role: 'Commuter' };
  const admin = { _id: 'mock-user-admin', name: 'TrafficEase Administrator', role: 'Admin' };

  const created = await invoke(incidentController.createIncident, {
    user: commuter,
    body: {
      title: 'Workflow test incident',
      type: 'Accident',
      severity: 'High',
      locationName: 'Test Road, Dhaka',
      coordinates: [90.4125, 23.8103],
      description: 'Created by an automated workflow test.'
    }
  });

  assert.equal(created.statusCode, 201);
  assert.equal(created.payload.approvalStatus, 'Pending');
  assert.equal(created.payload.reportedBy.role, 'Commuter');

  const publicBeforeApproval = await invoke(incidentController.getIncidents, { query: { limit: 100 } });
  assert.equal(publicBeforeApproval.payload.items.some((item) => item._id === created.payload._id), false);

  const ownReports = await invoke(incidentController.getIncidents, {
    user: commuter,
    query: { limit: 100, mine: 'true' }
  });
  assert.equal(ownReports.payload.items.some((item) => item._id === created.payload._id), true);

  const adminQueue = await invoke(incidentController.getIncidents, {
    user: admin,
    query: { limit: 100, moderation: 'all' }
  });
  assert.equal(adminQueue.payload.items.some((item) => item._id === created.payload._id), true);

  const approved = await invoke(incidentController.approveIncident, {
    user: admin,
    params: { id: created.payload._id }
  });
  assert.equal(approved.statusCode, 200);
  assert.equal(approved.payload.approvalStatus, 'Approved');

  const publicAfterApproval = await invoke(incidentController.getIncidents, { query: { limit: 100 } });
  assert.equal(publicAfterApproval.payload.items.some((item) => item._id === created.payload._id), true);

  const index = mockDb.incidents.findIndex((item) => item._id === created.payload._id);
  if (index >= 0) mockDb.incidents.splice(index, 1);
});

test('authority status updates cannot approve a pending report', async () => {
  const pending = {
    _id: 'workflow-pending-authority-test',
    title: 'Pending authority test',
    type: 'Congestion',
    severity: 'Medium',
    status: 'Open',
    approvalStatus: 'Pending',
    locationName: 'Dhaka',
    location: { type: 'Point', coordinates: [90.4, 23.8] },
    reportedBy: { _id: 'workflow-driver', name: 'Workflow Driver', role: 'Driver' }
  };
  mockDb.incidents.unshift(pending);

  const updated = await invoke(incidentController.updateIncident, {
    user: { _id: 'mock-user-1', role: 'Authority' },
    params: { id: pending._id },
    body: { status: 'Investigating', approvalStatus: 'Approved' }
  });
  assert.equal(updated.statusCode, 200);
  assert.equal(updated.payload.status, 'Investigating');
  assert.equal(updated.payload.approvalStatus, 'Pending');

  mockDb.incidents.splice(mockDb.incidents.findIndex((item) => item._id === pending._id), 1);
});

test('admin-only middleware rejects authority approval or deletion access', () => {
  let statusCode = 200;
  let nextCalled = false;
  const res = {
    status(code) { statusCode = code; return this; },
    json() { return this; }
  };
  allowRoles('Admin')({ user: { role: 'Authority' } }, res, () => { nextCalled = true; });
  assert.equal(statusCode, 403);
  assert.equal(nextCalled, false);
});
