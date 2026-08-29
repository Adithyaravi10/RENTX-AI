import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        aadhaarVerified: true,
        licenseNumber: true,
        licenseImageUrl: true,
        walletBalance: true,
        ecoScore: true,
        loyaltyPoints: true,
        emergencyContact: true,
        createdAt: true,
        _count: { select: { bookings: true, trips: true } },
      },
    });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, licenseNumber, emergencyContact } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(licenseNumber && { licenseNumber }),
        ...(emergencyContact && { emergencyContact }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        licenseNumber: true,
        emergencyContact: true,
        walletBalance: true,
        ecoScore: true,
        loyaltyPoints: true,
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const uploadLicense = async (req, res, next) => {
  try {
    if (!req.file && !req.body.imageUrl) {
      throw new AppError('License image required');
    }

    const imageUrl = req.file?.path || req.body.imageUrl;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { licenseImageUrl: imageUrl },
      select: { id: true, licenseImageUrl: true, licenseNumber: true },
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      orderBy: { ecoScore: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        ecoScore: true,
        loyaltyPoints: true,
        _count: { select: { trips: true } },
      },
    });

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      ...u,
    }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    next(error);
  }
};

export const getAchievements = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const trips = await prisma.trip.count({ where: { userId } });
    const evBookings = await prisma.booking.count({
      where: {
        userId,
        status: 'COMPLETED',
        vehicle: { fuelType: 'ELECTRIC' },
      },
    });

    const totalCo2 = await prisma.trip.aggregate({
      where: { userId },
      _sum: { co2Saved: true },
    });

    const achievements = [
      { id: 'first_ride', name: 'First Ride', unlocked: trips >= 1, icon: '🚗' },
      { id: 'ev_explorer', name: 'EV Explorer', unlocked: evBookings >= 1, icon: '⚡' },
      { id: 'ten_trips', name: '10 Trips', unlocked: trips >= 10, icon: '🏆' },
      {
        id: 'carbon_saver',
        name: 'Carbon Saver',
        unlocked: (totalCo2._sum.co2Saved || 0) >= 50,
        icon: '🌱',
      },
      { id: 'loyal', name: 'Loyal Member', unlocked: req.user.loyaltyPoints >= 100, icon: '⭐' },
    ];

    res.json({ success: true, achievements });
  } catch (error) {
    next(error);
  }
};

export const getCarbonStats = async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const totalCo2 = trips.reduce((sum, t) => sum + t.co2Saved, 0);
    const treesEquivalent = totalCo2 / 21;

    const monthlyData = {};
    trips.forEach((t) => {
      const month = new Date(t.createdAt).toLocaleString('en-IN', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + t.co2Saved;
    });

    res.json({
      success: true,
      totalCo2Saved: Math.round(totalCo2 * 100) / 100,
      treesEquivalent: Math.round(treesEquivalent * 10) / 10,
      tripCount: trips.length,
      monthlyTrend: Object.entries(monthlyData).map(([month, co2]) => ({ month, co2 })),
      averagePetrolUser: 120,
    });
  } catch (error) {
    next(error);
  }
};
