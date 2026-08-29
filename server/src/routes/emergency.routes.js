import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/sos', verifyToken, adminController.triggerSOS);

export default router;
