import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const startIoTSimulator = (io) => {
  console.log('[IoT] Simulator started — running every 10 seconds');

  cron.schedule('*/10 * * * * *', async () => {
    try {
      const vehicles = await prisma.vehicle.findMany({
        where: { isDeleted: false },
      });

      for (const vehicle of vehicles) {
        const latDrift = (Math.random() - 0.5) * 0.001;
        const lngDrift = (Math.random() - 0.5) * 0.001;
        const newLat = vehicle.locationLat + latDrift;
        const newLng = vehicle.locationLng + lngDrift;
        const speed = Math.random() * 60 + 10;

        const updateData = {
          locationLat: newLat,
          locationLng: newLng,
        };

        if (vehicle.fuelType === 'ELECTRIC' && vehicle.batteryLevel !== null) {
          updateData.batteryLevel = Math.max(
            0,
            vehicle.batteryLevel - (Math.random() * 0.2 + 0.1)
          );
        } else if (vehicle.fuelLevel !== null) {
          updateData.fuelLevel = Math.max(0, vehicle.fuelLevel - (Math.random() * 0.2 + 0.1));
        }

        if (Math.random() < 0.05) {
          updateData.engineStatus = 'WARNING';
        } else if (vehicle.engineStatus === 'WARNING' && Math.random() < 0.3) {
          updateData.engineStatus = 'OK';
        }

        const updated = await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: updateData,
        });

        await prisma.gPSLog.create({
          data: {
            vehicleId: vehicle.id,
            lat: newLat,
            lng: newLng,
            speed,
          },
        });

        if (io) {
          io.emit('vehicle:update', {
            vehicleId: vehicle.id,
            lat: newLat,
            lng: newLng,
            speed,
            battery: updated.batteryLevel,
            fuel: updated.fuelLevel,
            healthScore: updated.healthScore,
            engineStatus: updated.engineStatus,
          });

          if (updated.batteryLevel !== null && updated.batteryLevel < 15) {
            io.to('admin').emit('alert:low-battery', {
              vehicleId: vehicle.id,
              name: vehicle.name,
              batteryLevel: updated.batteryLevel,
            });
          }

          if (updated.healthScore < 30) {
            io.to('admin').emit('alert:maintenance', {
              vehicleId: vehicle.id,
              name: vehicle.name,
              healthScore: updated.healthScore,
            });
          }
        }
      }
    } catch (err) {
      console.error('[IoT] Simulator error:', err.message);
    }
  });
};
