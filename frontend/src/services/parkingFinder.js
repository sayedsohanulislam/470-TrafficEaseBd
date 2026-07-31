import { findKnownLocation, straightLineDistanceKm } from './routePlanner';

const AREA_COORDINATES = {
  'Aftab Nagar': [23.7621, 90.4312],
  'Azampur': [23.8647, 90.4007],
  'Banani Dohs': [23.8063, 90.3974],
  'Banasree': [23.7634, 90.4348],
  'Basabo': [23.7412, 90.4301],
  'Elephant Road': [23.7389, 90.3872],
  'Eskaton': [23.7422, 90.4038],
  'Gandaria': [23.7018, 90.4262],
  'Green Road': [23.7479, 90.3861],
  'Hatirpool': [23.7394, 90.3915],
  'Hazaribag': [23.7342, 90.3615],
  'Jigatola': [23.7382, 90.3731],
  'Kakrail': [23.7387, 90.4081],
  'Kalabagan': [23.7458, 90.3822],
  'Kallyanpur': [23.7791, 90.3604],
  'Khilkhet': [23.8295, 90.4203],
  'Lalbag': [23.7190, 90.3880],
  'Lalmatia': [23.7585, 90.3653],
  'Laxmibazar': [23.7171, 90.4111],
  'Malibagh': [23.7517, 90.4135],
  'Middle Badda': [23.7763, 90.4254],
  'Mirpur Dohs': [23.8372, 90.3662],
  'Mogbazar': [23.7494, 90.4033],
  'Mohakhali Dohs': [23.7900, 90.3930],
  'Niketan': [23.7697, 90.4154],
  'Nikunja': [23.8272, 90.4191],
  'Panthapath': [23.7518, 90.3857],
  'Poribagh': [23.7427, 90.3992],
  'Puran Dhaka': [23.7135, 90.4010],
  'Rajarbag': [23.7384, 90.4173],
  'Ramna': [23.7370, 90.4074],
  'Shahjadpur': [23.7904, 90.4252],
  'Shahjahanpur': [23.7392, 90.4219],
  'Shantinagar': [23.7391, 90.4115],
  'Shyamoli': [23.7730, 90.3654],
  'Siddheswari': [23.7441, 90.4102],
  'Tikatoli': [23.7182, 90.4215],
  'Wari': [23.7165, 90.4172]
};

const normalizeArea = (value = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export const getParkingAreaCoordinates = (area) => {
  const known = findKnownLocation(area);
  if (known) return known.coords;
  const direct = AREA_COORDINATES[area];
  if (direct) return direct;
  const key = Object.keys(AREA_COORDINATES).find((candidate) => normalizeArea(candidate) === normalizeArea(area));
  return key ? AREA_COORDINATES[key] : null;
};

export const rankPublicParking = (locations, originCoords) => locations
  .map((parking) => ({
    ...parking,
    kind: 'public',
    distanceKm: originCoords ? straightLineDistanceKm(originCoords, parking.coords) : null
  }))
  .sort((left, right) => {
    if (left.distanceKm === null) return left.name.localeCompare(right.name);
    return left.distanceKm - right.distanceKm || left.ratePerHour - right.ratePerHour;
  });

export const rankResidentialParking = (areas, originCoords, searchText = '') => {
  const normalizedQuery = normalizeArea(searchText);
  return areas
    .map((area) => {
      const coords = getParkingAreaCoordinates(area.area);
      const textMatch = normalizedQuery && (
        normalizeArea(area.area).includes(normalizedQuery) || normalizedQuery.includes(normalizeArea(area.area))
      );
      return {
        ...area,
        kind: 'residential',
        coords,
        textMatch: Boolean(textMatch),
        distanceKm: originCoords && coords ? straightLineDistanceKm(originCoords, coords) : null
      };
    })
    .filter((area) => area.coords || area.textMatch)
    .sort((left, right) => {
      if (left.textMatch !== right.textMatch) return left.textMatch ? -1 : 1;
      if (left.distanceKm !== null && right.distanceKm !== null) return left.distanceKm - right.distanceKm;
      if (left.distanceKm !== null) return -1;
      if (right.distanceKm !== null) return 1;
      return right.listings - left.listings;
    });
};

export const formatParkingDistance = (distanceKm) => {
  if (!Number.isFinite(distanceKm)) return 'Distance unavailable';
  if (distanceKm < 1) return `${Math.max(10, Math.round(distanceKm * 1000 / 10) * 10)} m away`;
  return `${distanceKm.toFixed(1)} km away`;
};

