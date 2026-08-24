const test = require('node:test');
const assert = require('node:assert/strict');
const { parseIqAirPayload } = require('../services/iqairService');

test('normalizes a current IQAir observation for the client', () => {
  const reading = parseIqAirPayload({
    data: { current: { pollution: { aqius: 92.6, p2: 35.1, ts: '2026-08-15T10:00:00.000Z' }, weather: { tp: 31 } } }
  });
  assert.deepEqual(reading, {
    us_aqi: 93,
    pm2_5: 35.1,
    temperature: 31,
    observedAt: '2026-08-15T10:00:00.000Z',
    source: 'IQAir official API',
    sourceUrl: 'https://www.iqair.com/air-quality-map/bangladesh/dhaka/dhaka'
  });
});

test('rejects an IQAir payload without a current AQI', () => {
  assert.throws(() => parseIqAirPayload({ data: {} }), /no current US AQI/);
});
