export const calculateHours = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.max(1, (end - start) / (1000 * 60 * 60));
};

export const calculateBasePrice = (pricePerHour, hours) => {
  return Math.round(pricePerHour * hours * 100) / 100;
};

export const calculateTotal = (basePrice, surgeMultiplier = 1) => {
  return Math.round(basePrice * surgeMultiplier * 100) / 100;
};

export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const isPeakHour = () => {
  const hour = new Date().getHours();
  return (hour >= 8 && hour < 10) || (hour >= 17 && hour < 20);
};

export const isFestivalDay = () => {
  const now = new Date();
  const festivals = [
    [0, 26], [7, 15], [9, 2], [10, 1], [11, 25],
  ];
  return festivals.some(([m, d]) => now.getMonth() === m && now.getDate() === d);
};
