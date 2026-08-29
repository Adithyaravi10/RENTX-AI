import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', verifyToken, reviewController.createReview);
router.get('/vehicle/:vehicleId', reviewController.getVehicleReviews);

export default router;
