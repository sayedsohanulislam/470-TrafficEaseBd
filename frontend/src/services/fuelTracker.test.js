import {
  cleanFuelStationName,
  formatFuelReportAge,
  getDisplayedFuelPrice,
  normalizeFuelStation,
  rankFuelStations
} from './fuelTracker';

test('removes Bangla duplicate text from station names', () => {
  expect(cleanFuelStationName('Padma Filling Station পদ্মা ফিলিং স্টেশন')).toBe('Padma Filling Station');
});

test('normalizes source station status and fuel information', () => {
  const station = normalizeFuelStation({
    id: 1,
    name: 'Test Station',
    area: 'Banani',
    lat: 23.79,
    lng: 90.40,
    fuels: ['Octane', 'CNG'],
    status: 'some',
    total_reports: 3
  });
  expect(station.fuels).toEqual(['Octane']);
  expect(station.status).toBe('some');
  expect(station.totalReports).toBe(3);
});

test('ranks nearby matching stations first', () => {
  const stations = [
    { id: 1, name: 'Far Diesel', area: 'Dhaka', coords: [23.9, 90.5], fuels: ['Diesel'], status: 'unknown' },
    { id: 2, name: 'Near Diesel', area: 'Dhaka', coords: [23.8, 90.4], fuels: ['Diesel'], status: 'unknown' }
  ];
  expect(rankFuelStations(stations, { originCoords: [23.801, 90.401], fuel: 'Diesel' })[0].name).toBe('Near Diesel');
});

test('uses a reported price before the supplied official reference price', () => {
  expect(getDisplayedFuelPrice({ reportedPrice: 125, reportedFuelType: 'Octane', fuels: ['Octane'] }).reported).toBe(true);
  expect(getDisplayedFuelPrice({ reportedPrice: null, fuels: ['Diesel'] })).toEqual({ amount: 100, fuel: 'Diesel', reported: false });
});

test('formats report freshness', () => {
  const now = new Date('2026-08-14T12:00:00Z').getTime();
  expect(formatFuelReportAge('2026-08-14T11:35:00Z', now)).toBe('Reported 25 min ago');
  expect(formatFuelReportAge(null, now)).toBe('No community report yet');
});
