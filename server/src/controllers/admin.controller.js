import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalRevenue,
      activeBookings,
      vehiclesOnRoad,
      newUsersToday,
      totalUsers,
      totalVehicles,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.booking.count({ where: { status: { in: ['CONFIRMED', 'ACTIVE'] } } }),
      prisma.booking.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { createdAt: { gte: today }, role: 'USER' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.vehicle.count({ where: { isDeleted: false } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue: totalRevenue._sum.amount || 0,
        activeBookings,
        vehiclesOnRoad,
        newUsersToday,
        totalUsers,
        totalVehicles,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueChart = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const payments = await prisma.payment.findMany({
      where: { status: 'SUCCESS', createdAt: { gte: thirtyDaysAgo } },
      select: { amount: true, createdAt: true },
    });

    const dailyRevenue = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyRevenue[key] = 0;
    }

    payments.forEach((p) => {
      const key = new Date(p.createdAt).toISOString().split('T')[0];
      if (dailyRevenue[key] !== undefined) dailyRevenue[key] += p.amount;
    });

    const chartData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date: date.slice(5),
      revenue: Math.round(revenue),
    }));

    res.json({ success: true, chartData });
  } catch (error) {
    next(error);
  }
};

export const getBookingHeatmap = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
    });

    const heatmap = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        heatmap.push({ day: days[d], hour: h, count: 0 });
      }
    }

    bookings.forEach((b) => {
      const date = new Date(b.createdAt);
      const dayIndex = date.getDay();
      const hour = date.getHours();
      const cell = heatmap.find((c) => c.day === days[dayIndex] && c.hour === hour);
      if (cell) cell.count++;
    });

    res.json({ success: true, heatmap });
  } catch (error) {
    next(error);
  }
};

export const getVehicleUsage = async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isDeleted: false },
      include: { _count: { select: { bookings: true } } },
      orderBy: { bookings: { _count: 'desc' } },
      take: 10,
    });

    const chartData = vehicles.map((v) => ({
      name: v.name.length > 15 ? v.name.slice(0, 15) + '...' : v.name,
      bookings: v._count.bookings,
    }));

    res.json({ success: true, chartData });
  } catch (error) {
    next(error);
  }
};

export const getFraudAlerts = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usersWithManyBookings = await prisma.booking.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: today } },
      _count: { id: true },
      having: { id: { _count: { gt: 3 } } },
    });

    const allUsers = await prisma.user.findMany({
      where: { role: 'USER' },
      include: {
        bookings: { select: { status: true } },
      },
    });

    const highCancelUsers = allUsers
      .filter((u) => {
        if (u.bookings.length < 3) return false;
        const cancelled = u.bookings.filter((b) => b.status === 'CANCELLED').length;
        return cancelled / u.bookings.length > 0.7;
      })
      .map((u) => ({
        userId: u.id,
        name: u.name,
        email: u.email,
        cancelRate: Math.round(
          (u.bookings.filter((b) => b.status === 'CANCELLED').length / u.bookings.length) * 100
        ),
        flag: 'high_cancel_rate',
      }));

    const alerts = [];

    for (const item of usersWithManyBookings) {
      const user = await prisma.user.findUnique({ where: { id: item.userId } });
      alerts.push({
        userId: item.userId,
        name: user?.name,
        email: user?.email,
        bookingsToday: item._count.id,
        flag: 'excessive_bookings',
      });
    }

    res.json({ success: true, alerts: [...alerts, ...highCancelUsers] });
  } catch (error) {
    next(error);
  }
};

export const getCustomerAnalytics = async (req, res, next) => {
  try {
    const topSpenders = await prisma.payment.groupBy({
      by: ['userId'],
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    });

    const users = await Promise.all(
      topSpenders.map(async (item) => {
        const user = await prisma.user.findUnique({
          where: { id: item.userId },
          select: { id: true, name: true, email: true, ecoScore: true },
        });
        return { ...user, totalSpent: item._sum.amount };
      })
    );

    const vehicleRatings = await prisma.review.groupBy({
      by: ['vehicleId'],
      _avg: { rating: true },
      _count: { id: true },
    });

    const ratingsWithVehicle = await Promise.all(
      vehicleRatings.map(async (r) => {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: r.vehicleId },
          select: { name: true, brand: true },
        });
        return {
          vehicle: vehicle?.name,
          avgRating: Math.round((r._avg.rating || 0) * 10) / 10,
          reviewCount: r._count.id,
        };
      })
    );

    res.json({
      success: true,
      topSpenders: users,
      vehicleRatings: ratingsWithVehicle.sort((a, b) => b.avgRating - a.avgRating).slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        walletBalance: true,
        ecoScore: true,
        createdAt: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const triggerSOS = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;

    const sosEvent = await prisma.sOSEvent.create({
      data: {
        userId: req.user.id,
        lat: lat || 12.9716,
        lng: lng || 77.5946,
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('sos:alert', {
        userId: req.user.id,
        userName: req.user.name,
        lat: sosEvent.lat,
        lng: sosEvent.lng,
        timestamp: sosEvent.createdAt,
      });
    }

    const hospitals = [
      { name: 'Manipal Hospital', lat: 12.9987, lng: 77.592, distance: '1.2 km' },
      { name: 'Fortis Hospital', lat: 12.9352, lng: 77.6245, distance: '2.1 km' },
      { name: 'Apollo Hospital', lat: 12.9698, lng: 77.75, distance: '3.5 km' },
    ];

    res.json({ success: true, sosEvent, hospitals });
  } catch (error) {
    next(error);
  }
};
