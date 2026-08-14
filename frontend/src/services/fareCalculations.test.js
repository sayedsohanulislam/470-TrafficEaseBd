import { calculateCngFare, OFFICIAL_CNG_RATES } from './fareCalculations';

describe('calculateCngFare', () => {
  test('keeps journeys up to two kilometres at the minimum fare', () => {
    expect(calculateCngFare(0).total).toBe(40);
    expect(calculateCngFare(2).total).toBe(40);
  });

  test('charges Tk 12 for each kilometre after the first two', () => {
    const fare = calculateCngFare(5);
    expect(fare.additionalKm).toBe(3);
    expect(fare.distanceCharge).toBe(36);
    expect(fare.total).toBe(76);
  });

  test('adds Tk 2 for each waiting minute', () => {
    expect(calculateCngFare(5, 10).total).toBe(96);
  });

  test('clamps invalid negative inputs to zero', () => {
    const fare = calculateCngFare(-3, -8);
    expect(fare.distanceKm).toBe(0);
    expect(fare.waitingMinutes).toBe(0);
    expect(fare.total).toBe(OFFICIAL_CNG_RATES.minimumFare);
  });
});
