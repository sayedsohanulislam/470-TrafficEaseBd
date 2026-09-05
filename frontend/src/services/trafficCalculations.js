export const congestionClass = (value) => {
  if (value >= 80) return 'danger';
  if (value >= 60) return 'warning';
  return 'success';
};

export const enrichTraffic = (traffic, canonicalFeatures) => ({
  ...traffic,
  featureModules: (traffic.featureModules || canonicalFeatures).map((feature) => ({
    ...canonicalFeatures.find((item) => item.id === feature.id),
    ...feature
  }))
});

export const estimateQueue = (vehicleCount, spacingMeters = 5.5) => ({
  meters: Math.round(Number(vehicleCount) * spacingMeters),
  clearanceSeconds: Math.round(Number(vehicleCount) * 1.8)
});

export const adaptiveSignalPlan = (load) => ({
  greenSeconds: Math.round(30 + (Number(load) / 100) * 60),
  clearanceSeconds: 6,
  improvementPercent: Math.round(Number(load) / 4.5)
});

export const weatherRiskScore = (rainfall) => Math.min(100, Math.round(20 + Number(rainfall) * 0.9));

export const etaComparison = (distanceKm) => {
  const distance = Number(distanceKm);
  return {
    car: Math.round(distance * 3.5),
    metro: Math.round(distance * 1.5 + 5),
    bus: Math.round(distance * 4.2)
  };
};
