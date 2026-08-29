import { Router } from 'express';
import * as chargingController from '../controllers/charging.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', chargingController.getStations);
router.get('/analytics', chargingController.getUsageAnalytics);
router.post('/book', verifyToken, chargingController.bookSlot);

export default router;
