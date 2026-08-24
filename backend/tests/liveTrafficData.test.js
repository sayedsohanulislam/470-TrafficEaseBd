const test = require('node:test');
const assert = require('node:assert/strict');
const { featureModules, buildLiveTrafficState } = require('../data/liveTrafficData');

test('publishes exactly 30 unique non-authentication feature modules', () => {
  assert.equal(featureModules.length, 30);
  assert.equal(new Set(featureModules.map((feature) => feature.id)).size, 30);
  assert.equal(featureModules.some((feature) => /login|registration/i.test(feature.name)), false);
});

test('builds a complete live traffic snapshot', () => {
  const state = buildLiveTrafficState();
  assert.equal(state.city, 'Dhaka');
  assert.ok(state.corridors.length >= 5);
  assert.ok(state.averageCongestion >= 0 && state.averageCongestion <= 100);
  assert.equal(state.featureModules.length, 30);
});
