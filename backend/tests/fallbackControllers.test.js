const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const parkingController = require('../controllers/parkingController');
const signalController = require('../controllers/trafficSignalController');
const transitController = require('../controllers/transitRouteController');
const operationController = require('../controllers/operationController');
const { findUserForToken } = require('../services/userResolver');

const invoke = async (handler, req = { query: {}, params: {}, body: {} }) => {
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
  await handler(req, res);
  return { statusCode, payload };
};

test('all read controllers return mock data while MongoDB is disconnected', async () => {
  assert.notEqual(mongoose.connection.readyState, 1);
  const parking = await invoke(parkingController.getParkingLots);
  const signals = await invoke(signalController.getSignals);
  const transit = await invoke(transitController.getTransitRoutes);

  assert.equal(parking.statusCode, 200);
  assert.ok(parking.payload.items.length > 0);
  assert.equal(signals.statusCode, 200);
  assert.ok(signals.payload.items.length > 0);
  assert.equal(transit.statusCode, 200);
  assert.ok(transit.payload.items.length > 0);
});

test('mock JWT identities resolve without querying MongoDB ObjectIds', async () => {
  const user = await findUserForToken('mock-user-1');
  assert.equal(user.role, 'Authority');
  assert.equal('password' in user, false);
});

test('protected operation records persist in the mock repository', async () => {
  const created = await invoke(operationController.createOperation, {
    query: {},
    params: {},
    user: { _id: 'mock-user-1', name: 'Authority Tester', role: 'Authority' },
    body: { category: 'Dispatch', action: 'Dispatch test unit', status: 'In Progress' }
  });
  assert.equal(created.statusCode, 201);
  const listed = await invoke(operationController.getOperations, { query: { limit: 10 }, params: {}, body: {} });
  assert.equal(listed.payload.items[0].action, 'Dispatch test unit');
});
