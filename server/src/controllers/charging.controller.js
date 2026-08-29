import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const getStations = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    let stations = await prisma.chargingStation.findMany();

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      stations = stations
        .map((s) => ({
          ...s,
          distance: haversineDistance(userLat, userLng, s.lat, s.lng),
        }))
        .sort((a, b) => a.distance - b.distance);
    }

    res.json({ success: true, stations });
  } catch (error) {
    next(error);
  }
};

export const bookSlot = async (req, res, next) => {
  try {
    const { stationId } = req.body;

    const station = await prisma.chargingStation.findUnique({ where: { id: stationId } });
    if (!station) throw new AppError('Station not found', 404);
    if (station.availableSlots <= 0) throw new AppError('No slots available', 400);

    const updated = await prisma.chargingStation.update({
      where: { id: stationId },
      data: { availableSlots: { decrement: 1 } },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        message: `Charging slot booked at ${station.name}`,
        type: 'charging',
      },
    });

    res.json({ success: true, station: updated });
  } catch (error) {
    next(error);
  }
};

export const getUsageAnalytics = async (req, res, next) => {
  try {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      usage: Math.floor(Math.random() * 15) + (hour >= 8 && hour <= 20 ? 10 : 2),
    }));

    res.json({ success: true, hourlyData });
  } catch (error) {
    next(error);
  }
};
