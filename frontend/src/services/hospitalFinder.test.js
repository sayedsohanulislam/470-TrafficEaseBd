import {
  buildHospitalDirectory,
  formatHospitalDistance,
  normalizeHospitalPhone,
  rankHospitals
} from './hospitalFinder';

const mapped = [{ id: 1, name: 'Apollo Hospitals Dhaka', coords: [23.81, 90.42], area: 'Bashundhara', type: 'General', phone: '10678', specialization: 'Multi-specialty', emergency: true }];
const network = [{ id: 43, hospitalName: 'Evercare Hospital Dhaka', category: 'Hospital', area: 'Bashundhara', location: 'Plot 81', phoneNumber: '1708127491', hasGopFacility: true, opdDiscountMaxPercentage: 0.2 }];

test('formats Bangladeshi mobile numbers from the source directory', () => {
  expect(normalizeHospitalPhone('1708127491')).toBe('01708127491');
  expect(normalizeHospitalPhone('10678')).toBe('10678');
});

test('merges an Akij network record into an existing mapped facility', () => {
  const facilities = buildHospitalDirectory(mapped, network);
  expect(facilities).toHaveLength(1);
  expect(facilities[0]).toMatchObject({ name: 'Evercare Hospital Dhaka', akijNetwork: true, phone: '01708127491', opdDiscount: 20 });
});

test('ranks the nearest matching facility first and filters diagnostics', () => {
  const facilities = [
    { id: 'h', name: 'Hospital', category: 'Hospital', coords: [23.81, 90.41], akijNetwork: true },
    { id: 'd', name: 'Diagnostic', category: 'Diagnostic centre', coords: [23.70, 90.40], akijNetwork: true }
  ];
  expect(rankHospitals(facilities, { originCoords: [23.80, 90.41], filter: 'Hospitals' }).map((item) => item.id)).toEqual(['h']);
  expect(rankHospitals(facilities, { originCoords: [23.71, 90.40] })[0].id).toBe('d');
});

test('formats short and kilometre distances clearly', () => {
  expect(formatHospitalDistance(0.42)).toBe('420 m away');
  expect(formatHospitalDistance(2.36)).toBe('2.4 km away');
});
