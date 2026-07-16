import {
  findKnownLocation,
  formatRouteStep,
  googleDirectionsUrl,
  normalizeLocationName,
  straightLineDistanceKm
} from './routePlanner';

describe('route planner helpers', () => {
  test('matches common Dhaka place names without an external lookup', () => {
    expect(findKnownLocation('Mirpur 10, Dhaka')?.label).toBe('Mirpur 10');
    expect(findKnownLocation('Karwan Bazar')?.label).toBe('Kawran Bazar');
    expect(normalizeLocationName('  Gulshan-2, Bangladesh ')).toBe('gulshan 2');
  });

  test('builds a complete Google Maps directions link', () => {
    const url = new URL(googleDirectionsUrl({
      from: 'Mirpur 10',
      to: 'Motijheel',
      fromCoords: [23.8069, 90.3687],
      toCoords: [23.7257, 90.4188]
    }));
    expect(url.searchParams.get('api')).toBe('1');
    expect(url.searchParams.get('origin')).toBe('23.8069,90.3687');
    expect(url.searchParams.get('destination')).toBe('23.7257,90.4188');
  });

  test('formats clear directions and distance estimates', () => {
    const step = formatRouteStep({
      name: 'Begum Rokeya Avenue',
      distance: 850,
      duration: 180,
      maneuver: { type: 'turn', modifier: 'left' }
    }, 1, 4);
    expect(step).toEqual({
      instruction: 'Turn left onto Begum Rokeya Avenue',
      distanceMeters: 850,
      durationMin: 3
    });
    expect(straightLineDistanceKm([23.8069, 90.3687], [23.7257, 90.4188])).toBeGreaterThan(9);
  });
});
