import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendOTPEmail } from '../utils/emailService.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

const generateTokens = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  return { token, refreshToken };
};

const setTokenCookies = (res, token, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 60 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const sanitizeUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Name, email and password are required');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409);

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    console.log(`[OTP Simulation] Register OTP for ${email}: ${otp}`);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone },
    });

    await sendOTPEmail(email, otp);

    await prisma.notification.create({
      data: {
        userId: user.id,
        message: 'Welcome to RentX AI! Complete your profile to start booking.',
        type: 'welcome',
      },
    });

    const { token, refreshToken } = generateTokens(user.id);
    setTokenCookies(res, token, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful. OTP sent to console (simulated).',
      token,
      refreshToken,
      user: sanitizeUser(user),
      otpSimulated: otp,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw new AppError('Email and password are required');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const { token, refreshToken } = generateTokens(user.id);
    setTokenCookies(res, token, refreshToken);

    res.json({
      success: true,
      token,
      refreshToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) throw new AppError('Refresh token required', 401);

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) throw new AppError('User not found', 401);

    const { token, refreshToken: newRefresh } = generateTokens(user.id);
    setTokenCookies(res, token, newRefresh);

    res.json({ success: true, token, refreshToken: newRefresh, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};
