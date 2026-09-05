import {
  adaptiveSignalPlan,
  congestionClass,
  estimateQueue,
  etaComparison,
  weatherRiskScore
} from './trafficCalculations';

describe('traffic calculation services', () => {
  test('classifies congestion thresholds', () => {
    expect(congestionClass(59)).toBe('success');
    expect(congestionClass(60)).toBe('warning');
    expect(congestionClass(80)).toBe('danger');
  });

  test('estimates queue length and clearance', () => {
    expect(estimateQueue(60)).toEqual({ meters: 330, clearanceSeconds: 108 });
  });

  test('builds bounded traffic plans', () => {
    expect(adaptiveSignalPlan(50)).toEqual({ greenSeconds: 60, clearanceSeconds: 6, improvementPercent: 11 });
    expect(weatherRiskScore(200)).toBe(100);
  });

  test('compares multimodal ETAs', () => {
    expect(etaComparison(10)).toEqual({ car: 35, metro: 20, bus: 42 });
  });
});
