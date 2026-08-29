const FESTIVAL_DATES = [
  { month: 0, day: 26 },
  { month: 7, day: 15 },
  { month: 9, day: 2 },
  { month: 10, day: 1 },
  { month: 11, day: 25 },
];

export const isPeakHour = (date = new Date()) => {
  const hour = date.getHours();
  return (hour >= 8 && hour < 10) || (hour >= 17 && hour < 20);
};

export const isFestivalDay = (date = new Date()) => {
  const month = date.getMonth();
  const day = date.getDate();
  return FESTIVAL_DATES.some((f) => f.month === month && f.day === day);
};

export const calculateSurgeMultiplier = async (prisma, date = new Date()) => {
  const multipliers = [];
  let reason = [];

  if (isPeakHour(date)) {
    multipliers.push(1.5);
    reason.push('peak_hours');
  }

  if (isFestivalDay(date)) {
    multipliers.push(1.3);
    reason.push('festival');
  }

  const totalVehicles = await prisma.vehicle.count({
    where: { isDeleted: false, isAvailable: true },
  });

  const activeBookings = await prisma.booking.count({
    where: {
      status: { in: ['CONFIRMED', 'ACTIVE'] },
      startTime: { lte: date },
      endTime: { gte: date },
    },
  });

  if (totalVehicles > 0 && activeBookings / totalVehicles > 0.8) {
    multipliers.push(1.8);
    reason.push('high_demand');
  }

  if (multipliers.length === 0) {
    return { multiplier: 1.0, reasons: [] };
  }

  const combined = multipliers.reduce((acc, m) => acc * m, 1);
  const capped = Math.min(combined, 2.5);

  return {
    multiplier: Math.round(capped * 100) / 100,
    reasons: reason,
    isPeak: isPeakHour(date),
    isFestival: isFestivalDay(date),
  };
};

export const calculateBookingPrice = (pricePerHour, hours, surgeMultiplier = 1) => {
  const base = pricePerHour * hours;
  const total = base * surgeMultiplier;
  return {
    basePrice: Math.round(base * 100) / 100,
    surgeMultiplier,
    totalPrice: Math.round(total * 100) / 100,
    hours,
  };
};
