import {
  buildFallbackMetroSchedule,
  estimateMetroPositions,
  getMetroScheduleKind,
  getStationTimetable,
  parseScheduleTime
} from './metroTracker';

const stations = [
  { name: 'Uttara North', coords: [23.87, 90.37] },
  { name: 'Middle', coords: [23.80, 90.39] },
  { name: 'Motijheel', coords: [23.72, 90.41] }
];

describe('metro timetable estimator', () => {
  test('parses timetable values with second precision', () => {
    expect(parseScheduleTime('06:30:30')).toBe(390.5);
  });

  test('selects the Friday schedule using Dhaka time', () => {
    expect(getMetroScheduleKind(new Date('2026-08-14T10:00:00Z'))).toBe('friday');
  });

  test('interpolates active train positions between stations', () => {
    const schedule = {
      'Uttara North': { Motijheel: ['06:30:00'], 'Uttara North': ['07:00:00'] },
      Middle: { Motijheel: ['06:35:00'], 'Uttara North': ['06:55:00'] },
      Motijheel: { Motijheel: ['06:40:00'], 'Uttara North': ['06:50:00'] }
    };
    const trains = estimateMetroPositions(schedule, stations, 393);
    expect(trains).toHaveLength(1);
    expect(trains[0].directionId).toBe('south');
    expect(trains[0].nextStation).toBe('Middle');
    expect(trains[0].progress).toBe(60);
  });

  test('builds a usable offline fallback and station summary', () => {
    const schedule = buildFallbackMetroSchedule(stations.map((station) => station.name), 'weekday');
    const summary = getStationTimetable(schedule, stations[0], 390);
    expect(summary.southbound.first).toBe('06:30');
    expect(summary.southbound.next.length).toBeGreaterThan(0);
  });
});
