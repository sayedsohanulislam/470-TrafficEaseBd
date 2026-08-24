const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { demoLoginUser } = require('../controllers/authController');
const { verifyToken } = require('../services/tokenService');

const invoke = async (body) => {
  let statusCode = 200;
  let payload;
  const res = {
    status(code) { statusCode = code; return this; },
    json(value) { payload = value; return value; }
  };
  await demoLoginUser({ body }, res);
  return { statusCode, payload };
};

test('one-tap demo login creates valid sessions for every project role', async () => {
  assert.notEqual(mongoose.connection.readyState, 1);
  for (const role of ['Commuter', 'Driver', 'Authority', 'Admin']) {
    const result = await invoke({ role });
    assert.equal(result.statusCode, 200);
    assert.equal(result.payload.role, role);
    assert.equal(result.payload.demo, true);
    assert.equal(verifyToken(result.payload.token).id, result.payload._id);
  }
});

test('demo login rejects unknown roles', async () => {
  const result = await invoke({ role: 'Superuser' });
  assert.equal(result.statusCode, 400);
  assert.match(result.payload.message, /Choose Commuter/);
});
