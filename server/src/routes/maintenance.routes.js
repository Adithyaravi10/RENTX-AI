import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenance.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/due', verifyToken, requireRole('ADMIN', 'FLEET_MANAGER'), maintenanceController.getMaintenanceDue);
router.get('/', verifyToken, requireRole('ADMIN', 'FLEET_MANAGER'), maintenanceController.getMaintenanceLogs);
router.post('/', verifyToken, requireRole('ADMIN', 'FLEET_MANAGER'), maintenanceController.createMaintenanceLog);

export default router;
