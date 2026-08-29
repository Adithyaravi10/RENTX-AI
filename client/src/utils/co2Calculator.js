export const calculateCo2Saved = (distanceKm, fuelType, category) => {
  if (fuelType === 'ELECTRIC') return distanceKm * 0.21;
  if (category === 'BIKE' || category === 'SCOOTER') return distanceKm * 0.08;
  return distanceKm * 0.12;
};

export const treesEquivalent = (co2Kg) => {
  return Math.round((co2Kg / 21) * 10) / 10;
};

export const getEcoLabel = (co2Kg) => {
  if (co2Kg >= 50) return 'Carbon Hero';
  if (co2Kg >= 20) return 'Green Commuter';
  if (co2Kg >= 5) return 'Eco Starter';
  return 'Getting Started';
};
