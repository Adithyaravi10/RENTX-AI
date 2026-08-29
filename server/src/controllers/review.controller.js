import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export const createReview = async (req, res, next) => {
  try {
    const { vehicleId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5');
    }

    const review = await prisma.review.create({
      data: { userId: req.user.id, vehicleId, rating, comment },
      include: { user: { select: { name: true } } },
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

export const getVehicleReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { vehicleId: req.params.vehicleId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating =
      reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    res.json({ success: true, reviews, avgRating });
  } catch (error) {
    next(error);
  }
};
