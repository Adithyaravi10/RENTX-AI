import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.post('/license', verifyToken, userController.uploadLicense);
router.get('/leaderboard', userController.getLeaderboard);
router.get('/achievements', verifyToken, userController.getAchievements);
router.get('/carbon', verifyToken, userController.getCarbonStats);

export default router;
