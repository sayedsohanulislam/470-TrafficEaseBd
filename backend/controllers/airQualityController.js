const { IQAIR_DHAKA_MAP_URL, getIqAirReading } = require('../services/iqairService');

const CACHE_FOR_MS = 60 * 1000;
const cache = new Map();

const parseCoordinate = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

exports.getLiveAirQuality = async (req, res) => {
  const latitude = parseCoordinate(req.query.lat, 23.8103);
  const longitude = parseCoordinate(req.query.lng, 90.4125);
  const apiKey = process.env.IQAIR_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      message: 'IQAir API key is not configured.',
      sourceUrl: IQAIR_DHAKA_MAP_URL
    });
  }

  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.savedAt < CACHE_FOR_MS) return res.json({ ...cached.value, cached: true });

  try {
    const reading = await getIqAirReading({ latitude, longitude, apiKey });
    cache.set(cacheKey, { savedAt: Date.now(), value: reading });
    return res.json({ ...reading, cached: false });
  } catch (error) {
    return res.status(502).json({ message: error.message, sourceUrl: IQAIR_DHAKA_MAP_URL });
  }
};
