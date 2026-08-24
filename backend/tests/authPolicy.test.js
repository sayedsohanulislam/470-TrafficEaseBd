const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeEmail, validateRegistration } = require('../services/authPolicy');

test('normalizes email addresses', () => {
  assert.equal(normalizeEmail('  User@Example.COM '), 'user@example.com');
});

test('accepts safe public registration roles', () => {
  const result = validateRegistration({
    name: 'Dhaka Commuter',
    email: 'commuter@example.com',
    password: 'SecurePass1',
    role: 'Commuter'
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.value.role, 'Commuter');
});

test('rejects self-registration as privileged roles', () => {
  const result = validateRegistration({
    name: 'Unexpected Admin',
    email: 'admin@example.com',
    password: 'SecurePass1',
    role: 'Admin'
  });
  assert.match(result.errors.join(' '), /limited to Commuter and Driver/);
});

test('rejects weak or malformed registration data', () => {
  const result = validateRegistration({ name: 'A', email: 'invalid', password: 'short' });
  assert.equal(result.errors.length, 3);
});
