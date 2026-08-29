import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.use(verifyToken, requireRole('ADMIN', 'FLEET_MANAGER'));

router.get('/stats', adminController.getDashboardStats);
router.get('/revenue', adminController.getRevenueChart);
router.get('/heatmap', adminController.getBookingHeatmap);
router.get('/vehicle-usage', adminController.getVehicleUsage);
router.get('/fraud-alerts', adminController.getFraudAlerts);
router.get('/customers', adminController.getCustomerAnalytics);
router.get('/users', adminController.getAllUsers);

export default router;
