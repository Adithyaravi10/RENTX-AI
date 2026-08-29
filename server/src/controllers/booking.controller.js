import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { calculateSurgeMultiplier, calculateBookingPrice } from '../utils/surgeCalculator.js';
import { generateInvoicePDF, generateAgreementPDF } from '../utils/pdfGenerator.js';
import { sendBookingConfirmation } from '../utils/emailService.js';

const prisma = new PrismaClient();

const checkAvailability = async (vehicleId, startTime, endTime, excludeBookingId) => {
  const conflicts = await prisma.booking.findFirst({
    where: {
      vehicleId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
      OR: [
        { startTime: { lte: startTime }, endTime: { gt: startTime } },
        { startTime: { lt: endTime }, endTime: { gte: endTime } },
        { startTime: { gte: startTime }, endTime: { lte: endTime } },
      ],
    },
  });
  return !conflicts;
};

export const createBooking = async (req, res, next) => {
  try {
    const { vehicleId, startTime, endTime, pickupLat, pickupLng, dropLat, dropLng, signatureData } =
      req.body;

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, isDeleted: false, isAvailable: true },
    });

    if (!vehicle) throw new AppError('Vehicle not available', 400);

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) throw new AppError('End time must be after start time');

    const available = await checkAvailability(vehicleId, start, end);
    if (!available) throw new AppError('Vehicle is booked for selected time slot', 409);

    const hours = (end - start) / (1000 * 60 * 60);
    const { multiplier } = await calculateSurgeMultiplier(prisma, start);
    const pricing = calculateBookingPrice(vehicle.pricePerHour, hours, multiplier);

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        vehicleId,
        startTime: start,
        endTime: end,
        pickupLat: pickupLat || vehicle.locationLat,
        pickupLng: pickupLng || vehicle.locationLng,
        dropLat,
        dropLng,
        totalPrice: pricing.totalPrice,
        surgeMultiplier: multiplier,
        signatureData,
        status: 'PENDING',
      },
      include: { vehicle: true, user: true },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        message: `Booking created for ${vehicle.name}. Complete payment to confirm.`,
        type: 'booking',
      },
    });

    res.status(201).json({ success: true, booking, pricing });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        vehicle: true,
        payment: true,
        trip: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true, payment: true, trip: true, user: { select: { name: true, email: true } } },
    });

    if (!booking) throw new AppError('Booking not found', 404);

    if (booking.userId !== req.user.id && req.user.role === 'USER') {
      throw new AppError('Access denied', 403);
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { payment: true },
    });

    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.userId !== req.user.id) throw new AppError('Access denied', 403);
    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      throw new AppError('Cannot cancel this booking');
    }

    const hoursUntilStart = (new Date(booking.startTime) - new Date()) / (1000 * 60 * 60);
    let refundPercent = 0;
    if (hoursUntilStart > 24) refundPercent = 100;
    else if (hoursUntilStart > 2) refundPercent = 50;

    const refundAmount = (booking.totalPrice * refundPercent) / 100;

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    if (refundAmount > 0 && booking.payment?.status === 'SUCCESS') {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { walletBalance: { increment: refundAmount } },
      });

      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: { status: refundPercent === 100 ? 'REFUNDED' : 'SUCCESS' },
      });
    }

    await prisma.vehicle.update({
      where: { id: booking.vehicleId },
      data: { isAvailable: true },
    });

    res.json({
      success: true,
      booking: updated,
      refund: { percent: refundPercent, amount: refundAmount },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, userId, vehicleId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (vehicleId) where.vehicleId = vehicleId;

    const bookings = await prisma.booking.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, vehicle: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

export const completeBooking = async (req, res, next) => {
  try {
    const { distanceKm = 10, drivingScore = 85 } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true, user: true },
    });

    if (!booking) throw new AppError('Booking not found', 404);

    const durationMin = Math.round((new Date(booking.endTime) - new Date(booking.startTime)) / 60000);

    let co2Saved = 0;
    const vehicle = booking.vehicle;
    if (vehicle.fuelType === 'ELECTRIC') co2Saved = distanceKm * 0.21;
    else if (vehicle.category === 'BIKE' || vehicle.category === 'SCOOTER')
      co2Saved = distanceKm * 0.08;
    else co2Saved = distanceKm * 0.12;

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED' },
    });

    const trip = await prisma.trip.create({
      data: {
        bookingId: booking.id,
        userId: booking.userId,
        distanceKm,
        co2Saved,
        drivingScore,
        durationMin,
      },
    });

    await prisma.vehicle.update({
      where: { id: booking.vehicleId },
      data: { isAvailable: true, odometer: { increment: distanceKm } },
    });

    let ecoBonus = 2;
    if (vehicle.fuelType === 'ELECTRIC') ecoBonus = 10;
    else if (vehicle.category === 'BIKE' || vehicle.category === 'SCOOTER') ecoBonus = 5;

    await prisma.user.update({
      where: { id: booking.userId },
      data: { ecoScore: { increment: ecoBonus } },
    });

    await sendBookingConfirmation(booking.user, updatedBooking, vehicle);

    res.json({ success: true, booking: updatedBooking, trip });
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { user: true, vehicle: true, payment: true },
    });

    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.userId !== req.user.id && !['ADMIN', 'FLEET_MANAGER'].includes(req.user.role)) {
      throw new AppError('Access denied', 403);
    }

    const pdf = await generateInvoicePDF(booking, booking.user, booking.vehicle, booking.payment);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${booking.id}.pdf`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
};

export const getAgreement = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { user: true, vehicle: true },
    });

    if (!booking) throw new AppError('Booking not found', 404);

    const pdf = await generateAgreementPDF(
      booking,
      booking.user,
      booking.vehicle,
      booking.signatureData
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=agreement-${booking.id}.pdf`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
};

export const saveSignature = async (req, res, next) => {
  try {
    const { signatureData } = req.body;
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { signatureData },
    });
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};
