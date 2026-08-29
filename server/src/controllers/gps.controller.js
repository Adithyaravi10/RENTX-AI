import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLiveVehicles = async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        brand: true,
        category: true,
        locationLat: true,
        locationLng: true,
        isAvailable: true,
        batteryLevel: true,
        fuelLevel: true,
        healthScore: true,
        engineStatus: true,
        fuelType: true,
      },
    });

    const activeBookings = await prisma.booking.findMany({
      where: { status: { in: ['CONFIRMED', 'ACTIVE'] } },
      select: { vehicleId: true, userId: true, id: true },
    });

    const bookingMap = Object.fromEntries(activeBookings.map((b) => [b.vehicleId, b]));

    const liveData = vehicles.map((v) => ({
      ...v,
      status: !v.isAvailable
        ? 'booked'
        : v.engineStatus === 'WARNING'
          ? 'maintenance'
          : 'available',
      activeBooking: bookingMap[v.id] || null,
    }));

    res.json({ success: true, vehicles: liveData });
  } catch (error) {
    next(error);
  }
};

export const getVehicleTrack = async (req, res, next) => {
  try {
    const logs = await prisma.gPSLog.findMany({
      where: { vehicleId: req.params.vehicleId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    res.json({ success: true, logs: logs.reverse() });
  } catch (error) {
    next(error);
  }
};
