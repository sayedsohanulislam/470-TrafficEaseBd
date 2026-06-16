const IQAIR_DHAKA_MAP_URL = 'https://www.iqair.com/air-quality-map/bangladesh/dhaka/dhaka';

const numberOrNull = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);

const parseIqAirPayload = (payload) => {
  const pollution = payload?.data?.current?.pollution;
  const weather = payload?.data?.current?.weather;
  const aqi = numberOrNull(pollution?.aqius);
  if (aqi === null) throw new Error('IQAir returned no current US AQI reading.');

  return {
    us_aqi: Math.round(aqi),
    pm2_5: numberOrNull(pollution?.p2),
    temperature: numberOrNull(weather?.tp),
    observedAt: pollution?.ts || null,
    source: 'IQAir official API',
    sourceUrl: IQAIR_DHAKA_MAP_URL
  };
};

const getIqAirReading = async ({ latitude, longitude, apiKey }) => {
  const url = new URL('https://api.airvisual.com/v2/nearest_city');
  url.searchParams.set('lat', latitude);
  url.searchParams.set('lon', longitude);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'TrafficEase-BD/1.0' }
  });
  if (!response.ok) throw new Error(`IQAir API request failed (${response.status}).`);
  return parseIqAirPayload(await response.json());
};

module.exports = { IQAIR_DHAKA_MAP_URL, getIqAirReading, parseIqAirPayload };
