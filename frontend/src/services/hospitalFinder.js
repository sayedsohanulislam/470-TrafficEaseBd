import { straightLineDistanceKm } from './routePlanner';
import { getParkingAreaCoordinates } from './parkingFinder';

const HOSPITAL_AREA_COORDINATES = {
  Badda: [23.7804, 90.4258],
  Banani: [23.7934, 90.4045],
  Baridhara: [23.7997, 90.4237],
  Bashundhara: [23.8196, 90.4320],
  Dhanmondi: [23.7462, 90.3765],
  Doyaganj: [23.7107, 90.4254],
  Gandaria: [23.7018, 90.4262],
  'Green Road': [23.7479, 90.3861],
  Gulshan: [23.7808, 90.4168],
  Jatrabari: [23.7087, 90.4327],
  Kachukhet: [23.7934, 90.3898],
  Kakrail: [23.7387, 90.4081],
  Kalabagan: [23.7458, 90.3822],
  'Kallyanpur-Shyamoli': [23.7770, 90.3628],
  Keraniganj: [23.6983, 90.3671],
  Lalbagh: [23.7190, 90.3880],
  Malibagh: [23.7517, 90.4135],
  Mirpur: [23.8069, 90.3687],
  Moghbazar: [23.7494, 90.4033],
  Mohakhali: [23.7786, 90.4005],
  Mohammadpur: [23.7656, 90.3586],
  Motijheel: [23.7257, 90.4188],
  Mugda: [23.7418, 90.4285],
  Panthapath: [23.7518, 90.3857],
  'Rampura-Banasree': [23.7618, 90.4281],
  Savar: [23.8583, 90.2667],
  Siddheswari: [23.7441, 90.4102],
  Tikatuli: [23.7182, 90.4215],
  Uttara: [23.8672, 90.3885]
};

const GOVERNMENT_REGISTRY_NAMES = new Set([
  'dhaka medical college hospital dmch',
  'bsmmu hospital',
  'dhaka children hospital',
  'national institute of traumatology and orthopaedic rehabilitation',
  'mugda medical college hospital'
]);

export const cleanHospitalText = (value = '') => String(value)
  .replace(/â€“|â€”/g, '-')
  .replace(/â€‘/g, '-')
  .replace(/\s+/g, ' ')
  .trim();

export const normalizeHospitalName = (value = '') => {
  const normalized = cleanHospitalText(value)
    .toLowerCase()
    .replace(/apollo hospitals? dhaka/g, 'evercare hospital dhaka')
    .replace(/national orthopedic hospital/g, 'national institute of traumatology and orthopaedic rehabilitation')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(limited|ltd|pvt|private)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized;
};

export const normalizeHospitalPhone = (value) => {
  if (!value) return '';
  const raw = String(value).trim();
  if (/^1\d{9}$/.test(raw)) return `0${raw}`;
  return raw;
};

export const getHospitalAreaCoordinates = (area) => (
  getParkingAreaCoordinates(area) || HOSPITAL_AREA_COORDINATES[area] || null
);

const discountPercent = (value) => (
  Number.isFinite(Number(value)) && Number(value) > 0 ? Math.round(Number(value) * 100) : null
);

const curatedDisplayName = (name) => {
  if (/apollo hospitals? dhaka/i.test(name)) return 'Evercare Hospital Dhaka';
  if (/national orthopedic hospital/i.test(name)) return 'National Institute of Traumatology and Orthopaedic Rehabilitation (NITOR)';
  return name;
};

export const buildHospitalDirectory = (curatedFacilities, networkFacilities) => {
  const networkByName = new Map(networkFacilities.map((facility) => [normalizeHospitalName(facility.hospitalName), facility]));
  const matchedNetworkIds = new Set();

  const curated = curatedFacilities.map((facility) => {
    const displayName = curatedDisplayName(facility.name);
    const match = networkByName.get(normalizeHospitalName(displayName));
    if (match) matchedNetworkIds.add(match.id);
    const normalizedOriginal = normalizeHospitalName(facility.name);
    return {
      id: `mapped-${facility.id}`,
      name: displayName,
      coords: facility.coords,
      area: facility.area,
      address: match ? cleanHospitalText(match.location) : facility.area,
      category: facility.type === 'Specialized' ? 'Specialized hospital' : 'Hospital',
      specialization: facility.specialization,
      phone: normalizeHospitalPhone(match?.phoneNumber || facility.phone),
      email: match?.email || '',
      emergencyNoted: Boolean(facility.emergency),
      akijNetwork: Boolean(match),
      hasGopFacility: Boolean(match?.hasGopFacility),
      ipdDiscount: discountPercent(match?.ipdDiscountMaxPercentage),
      opdDiscount: discountPercent(match?.opdDiscountMaxPercentage),
      locationPrecision: 'mapped',
      registrySource: GOVERNMENT_REGISTRY_NAMES.has(normalizedOriginal) ? 'DGHS Facility Registry' : 'Local mapped directory'
    };
  });

  const network = networkFacilities
    .filter((facility) => !matchedNetworkIds.has(facility.id))
    .map((facility) => ({
      id: `akij-${facility.id}`,
      name: cleanHospitalText(facility.hospitalName),
      coords: getHospitalAreaCoordinates(facility.area),
      area: cleanHospitalText(facility.area),
      address: cleanHospitalText(facility.location),
      category: facility.category === 'Diagnostics' ? 'Diagnostic centre' : 'Hospital',
      specialization: facility.category === 'Diagnostics' ? 'Diagnostic services' : 'General hospital listing',
      phone: normalizeHospitalPhone(facility.phoneNumber),
      email: facility.email || '',
      emergencyNoted: false,
      akijNetwork: true,
      hasGopFacility: Boolean(facility.hasGopFacility),
      ipdDiscount: discountPercent(facility.ipdDiscountMaxPercentage),
      opdDiscount: discountPercent(facility.opdDiscountMaxPercentage),
      locationPrecision: 'area',
      registrySource: 'Akij Takaful network directory'
    }))
    .filter((facility) => facility.coords);

  return [...curated, ...network];
};

export const rankHospitals = (facilities, { originCoords, filter = 'All', query = '', networkOnly = false } = {}) => {
  const normalizedQuery = cleanHospitalText(query).toLowerCase();
  return facilities
    .filter((facility) => {
      if (networkOnly && !facility.akijNetwork) return false;
      if (filter === 'Hospitals' && facility.category === 'Diagnostic centre') return false;
      if (filter === 'Diagnostics' && facility.category !== 'Diagnostic centre') return false;
      if (filter === 'Specialized' && facility.category !== 'Specialized hospital') return false;
      if (filter === 'Emergency noted' && !facility.emergencyNoted) return false;
      if (!normalizedQuery) return true;
      return [facility.name, facility.area, facility.address, facility.specialization]
        .some((field) => String(field || '').toLowerCase().includes(normalizedQuery));
    })
    .map((facility) => ({
      ...facility,
      distanceKm: originCoords ? straightLineDistanceKm(originCoords, facility.coords) : null
    }))
    .sort((left, right) => {
      if (left.distanceKm !== null && right.distanceKm !== null) return left.distanceKm - right.distanceKm || left.name.localeCompare(right.name);
      if (left.distanceKm !== null) return -1;
      if (right.distanceKm !== null) return 1;
      return left.name.localeCompare(right.name);
    });
};

export const formatHospitalDistance = (distanceKm) => {
  if (!Number.isFinite(distanceKm)) return 'Choose a location to calculate distance';
  if (distanceKm < 1) return `${Math.max(10, Math.round(distanceKm * 1000 / 10) * 10)} m away`;
  return `${distanceKm.toFixed(1)} km away`;
};

export const hospitalMarkerColor = (facility) => {
  if (facility.category === 'Diagnostic centre') return '#8b5cf6';
  if (facility.category === 'Specialized hospital') return '#f59e0b';
  return '#ef4444';
};
