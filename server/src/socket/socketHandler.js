import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    const { userId, role } = socket.handshake.auth;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    if (role === 'ADMIN' || role === 'FLEET_MANAGER') {
      socket.join('admin');
    }

    console.log(`[Socket] Connected: ${socket.id} | User: ${userId || 'guest'}`);

    socket.on('booking:start', async ({ bookingId, vehicleId }) => {
      socket.join(`track:${vehicleId}`);
      socket.emit('tracking:started', { bookingId, vehicleId });
    });

    socket.on('booking:stop', ({ vehicleId }) => {
      socket.leave(`track:${vehicleId}`);
    });

    socket.on('sos:trigger', async (data) => {
      const { lat, lng, userName } = data;
      io.to('admin').emit('sos:alert', {
        userId,
        userName: userName || 'Unknown',
        lat: lat || 12.9716,
        lng: lng || 77.5946,
        timestamp: new Date().toISOString(),
      });
      socket.emit('sos:sent', { success: true });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  setInterval(async () => {
    try {
      const vehicles = await prisma.vehicle.findMany({
        where: { isDeleted: false },
        select: {
          id: true,
          name: true,
          locationLat: true,
          locationLng: true,
          isAvailable: true,
          batteryLevel: true,
          fuelLevel: true,
          healthScore: true,
          engineStatus: true,
          category: true,
        },
      });

      const activeBookings = await prisma.booking.findMany({
        where: { status: { in: ['CONFIRMED', 'ACTIVE'] } },
        select: { vehicleId: true },
      });
      const bookedIds = new Set(activeBookings.map((b) => b.vehicleId));

      const liveVehicles = vehicles.map((v) => ({
        ...v,
        status: bookedIds.has(v.id)
          ? 'booked'
          : v.engineStatus === 'WARNING'
            ? 'maintenance'
            : 'available',
      }));

      io.emit('vehicles:live', liveVehicles);
    } catch (err) {
      console.error('[Socket] Live vehicles error:', err.message);
    }
  }, 5000);
};
