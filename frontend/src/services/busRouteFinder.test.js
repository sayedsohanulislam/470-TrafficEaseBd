import {
  findBusJourneys,
  getBusStopSuggestions,
  normalizeBusStop,
  resolveBusStop
} from './busRouteFinder';
import { dhakaBusRoutes } from '../data/dhakaBusRoutes';

const routes = [
  { id: 1, name: 'Green Line', stops: ['Mirpur 10', 'Farmgate', 'Shahbag', 'Motijheel'] },
  { id: 2, name: 'City Link', stops: ['Uttara', 'Airport', 'Farmgate'] },
  { id: 3, name: 'Eastern', stops: ['Farmgate', 'Motijheel', 'Gulistan', 'Jatrabari'] }
];

test('normalizes punctuation and spacing', () => {
  expect(normalizeBusStop('  Mirpur-10 ')).toBe('mirpur 10');
});

test('ranks exact and prefix stop suggestions first', () => {
  expect(getBusStopSuggestions(routes, 'Farm')[0]).toBe('Farmgate');
  expect(resolveBusStop(routes, 'Shahbagh')).toBe('Shahbag');
});

test('finds a direct bus in either direction', () => {
  const outbound = findBusJourneys(routes, 'Mirpur 10', 'Motijheel');
  const inbound = findBusJourneys(routes, 'Motijheel', 'Mirpur 10');
  expect(outbound.direct[0].journeyStops).toEqual(['Mirpur 10', 'Farmgate', 'Shahbag', 'Motijheel']);
  expect(inbound.direct[0].journeyStops).toEqual(['Motijheel', 'Shahbag', 'Farmgate', 'Mirpur 10']);
});

test('builds a one-transfer journey when no direct bus exists', () => {
  const result = findBusJourneys(routes, 'Uttara', 'Jatrabari');
  expect(result.direct).toHaveLength(0);
  expect(result.transfers[0].interchange).toBe('Farmgate');
  expect(result.transfers[0].firstRoute.name).toBe('City Link');
  expect(result.transfers[0].secondRoute.name).toBe('Eastern');
});

test('returns a clear error for an unknown stop', () => {
  const result = findBusJourneys(routes, 'Unknown Place', 'Motijheel');
  expect(result.error).toBe('Choose a valid starting stop.');
});

test('loads the full public route index and answers a common Dhaka trip', () => {
  expect(dhakaBusRoutes).toHaveLength(184);
  const result = findBusJourneys(dhakaBusRoutes, 'Mirpur 10', 'Motijheel');
  expect(result.error).toBeNull();
  expect(result.direct.length + result.transfers.length).toBeGreaterThan(0);
});
