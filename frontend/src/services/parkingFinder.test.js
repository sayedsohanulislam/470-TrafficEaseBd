import { formatParkingDistance, rankPublicParking, rankResidentialParking } from './parkingFinder';

test('ranks public facilities nearest first', () => {
  const locations = [
    { id: 1, name: 'Far', coords: [23.80, 90.50], ratePerHour: 20 },
    { id: 2, name: 'Near', coords: [23.80, 90.40], ratePerHour: 30 }
  ];
  expect(rankPublicParking(locations, [23.80, 90.401])[0].name).toBe('Near');
});

test('prioritizes a residential locality text match', () => {
  const areas = [
    { area: 'Uttara', listings: 10 },
    { area: 'Dhanmondi', listings: 20 }
  ];
  expect(rankResidentialParking(areas, [23.75, 90.39], 'Uttara')[0].area).toBe('Uttara');
});

test('formats walking-scale and city-scale distances clearly', () => {
  expect(formatParkingDistance(0.42)).toBe('420 m away');
  expect(formatParkingDistance(2.54)).toBe('2.5 km away');
  expect(formatParkingDistance(null)).toBe('Distance unavailable');
});
