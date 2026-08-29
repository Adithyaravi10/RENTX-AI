import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const awardLoyaltyAndEco = async (userId, amount, vehicle) => {
  const loyaltyPoints = Math.floor(amount / 10);
  let ecoBonus = 0;
  if (vehicle.fuelType === 'ELECTRIC') ecoBonus = 10;
  else if (vehicle.category === 'BIKE' || vehicle.category === 'SCOOTER') ecoBonus = 5;

  await prisma.user.update({
    where: { id: userId },
    data: {
      loyaltyPoints: { increment: loyaltyPoints },
      ...(ecoBonus > 0 && { ecoScore: { increment: ecoBonus } }),
    },
  });
};

export const createOrder = async (req, res, next) => {
  try {
    const { bookingId, method = 'UPI' } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: true },
    });

    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.userId !== req.user.id) throw new AppError('Access denied', 403);

    const amountInPaise = Math.round(booking.totalPrice * 100);
    const razorpay = getRazorpay();

    let razorpayOrderId = `order_sim_${Date.now()}`;

    if (razorpay) {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: booking.id,
      });
      razorpayOrderId = order.id;
    }

    const payment = await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        userId: req.user.id,
        amount: booking.totalPrice,
        method,
        razorpayOrderId,
        status: 'PENDING',
      },
      update: { razorpayOrderId, method, status: 'PENDING' },
    });

    res.json({
      success: true,
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_simulated',
      payment,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const razorpay = getRazorpay();
    let verified = !razorpay;

    if (razorpay && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');
      verified = expectedSignature === razorpay_signature;
    }

    if (!verified) throw new AppError('Payment verification failed', 400);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: true },
    });

    if (!booking) throw new AppError('Booking not found', 404);

    const payment = await prisma.payment.update({
      where: { bookingId },
      data: {
        status: 'SUCCESS',
        transactionId: razorpay_payment_id || `txn_sim_${Date.now()}`,
      },
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    await prisma.vehicle.update({
      where: { id: booking.vehicleId },
      data: { isAvailable: false },
    });

    await awardLoyaltyAndEco(req.user.id, booking.totalPrice, booking.vehicle);

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        message: `Payment of ₹${booking.totalPrice} successful! Your ${booking.vehicle.name} is booked.`,
        type: 'payment',
      },
    });

    res.json({ success: true, payment, booking: updatedBooking });
  } catch (error) {
    next(error);
  }
};

export const walletPay = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: true },
    });

    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.userId !== req.user.id) throw new AppError('Access denied', 403);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.walletBalance < booking.totalPrice) {
      throw new AppError('Insufficient wallet balance');
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { walletBalance: { decrement: booking.totalPrice } },
    });

    const payment = await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        userId: req.user.id,
        amount: booking.totalPrice,
        method: 'WALLET',
        status: 'SUCCESS',
        transactionId: `wallet_${Date.now()}`,
      },
      update: { status: 'SUCCESS', method: 'WALLET', transactionId: `wallet_${Date.now()}` },
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    await prisma.vehicle.update({
      where: { id: booking.vehicleId },
      data: { isAvailable: false },
    });

    await awardLoyaltyAndEco(req.user.id, booking.totalPrice, booking.vehicle);

    res.json({ success: true, payment, booking: updatedBooking });
  } catch (error) {
    next(error);
  }
};

export const processRefund = async (req, res, next) => {
  try {
    const { paymentId, amount } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) throw new AppError('Payment not found', 404);

    const refundAmount = amount || payment.amount;

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'REFUNDED' },
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: { walletBalance: { increment: refundAmount } },
      }),
    ]);

    res.json({ success: true, message: 'Refund processed to wallet', amount: refundAmount });
  } catch (error) {
    next(error);
  }
};

export const getMyPayments = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      include: { booking: { include: { vehicle: { select: { name: true, brand: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};

export const addWalletFunds = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) throw new AppError('Valid amount required');

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { walletBalance: { increment: amount } },
      select: { walletBalance: true },
    });

    res.json({ success: true, walletBalance: user.walletBalance });
  } catch (error) {
    next(error);
  }
};
