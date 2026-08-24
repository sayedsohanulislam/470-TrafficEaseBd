const test = require('node:test');
const assert = require('node:assert/strict');
const { signToken, verifyToken } = require('../services/tokenService');

test('signs and verifies development JWTs', () => {
  const token = signToken('mock-user-1');
  assert.equal(verifyToken(token).id, 'mock-user-1');
});
