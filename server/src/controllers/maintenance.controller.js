import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export const getMaintenanceLogs = async (req, res, next) => {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      where: req.params.vehicleId ? { vehicleId: req.params.vehicleId } : {},
      include: { vehicle: { select: { name: true, brand: true } } },
      orderBy: { completedAt: 'desc' },
    });
    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

export const createMaintenanceLog = async (req, res, next) => {
  try {
    const { vehicleId, type, notes, nextDue } = req.body;

    const log = await prisma.maintenanceLog.create({
      data: {
        vehicleId,
        type,
        notes,
        nextDue: nextDue ? new Date(nextDue) : null,
        completedAt: new Date(),
      },
    });

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { lastServiced: new Date(), healthScore: 100, engineStatus: 'OK' },
    });

    res.status(201).json({ success: true, log });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceDue = async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        isDeleted: false,
        OR: [
          { healthScore: { lt: 40 } },
          { engineStatus: 'WARNING' },
          { lastServiced: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
        ],
      },
      include: { maintenanceLogs: { orderBy: { completedAt: 'desc' }, take: 1 } },
    });

    res.json({ success: true, vehicles });
  } catch (error) {
    next(error);
  }
};
