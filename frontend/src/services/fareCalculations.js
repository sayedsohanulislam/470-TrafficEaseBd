export const OFFICIAL_CNG_RATES = Object.freeze({
  minimumFare: 40,
  includedKm: 2,
  perAdditionalKm: 12,
  waitingPerMinute: 2
});

export const calculateCngFare = (distanceKm, waitingMinutes = 0) => {
  const safeDistanceKm = Math.max(0, Number(distanceKm) || 0);
  const safeWaitingMinutes = Math.max(0, Number(waitingMinutes) || 0);
  const additionalKm = Math.max(0, safeDistanceKm - OFFICIAL_CNG_RATES.includedKm);
  const distanceCharge = additionalKm * OFFICIAL_CNG_RATES.perAdditionalKm;
  const waitingCharge = safeWaitingMinutes * OFFICIAL_CNG_RATES.waitingPerMinute;

  return {
    distanceKm: safeDistanceKm,
    includedKm: OFFICIAL_CNG_RATES.includedKm,
    additionalKm,
    minimumFare: OFFICIAL_CNG_RATES.minimumFare,
    distanceCharge,
    waitingMinutes: safeWaitingMinutes,
    waitingCharge,
    total: Math.ceil(OFFICIAL_CNG_RATES.minimumFare + distanceCharge + waitingCharge)
  };
};
