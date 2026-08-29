import { Router } from 'express';
import * as vehicleController from '../controllers/vehicle.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/internal/available', vehicleController.getInternalVehicles);
router.get('/', optionalAuth, vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.get('/:id/gps', vehicleController.getVehicleGPS);
router.get('/:id/maintenance', vehicleController.getVehicleMaintenance);
router.post('/', verifyToken, requireRole('ADMIN', 'FLEET_MANAGER'), vehicleController.createVehicle);
router.put('/:id', verifyToken, requireRole('ADMIN', 'FLEET_MANAGER'), vehicleController.updateVehicle);
router.delete('/:id', verifyToken, requireRole('ADMIN'), vehicleController.deleteVehicle);

export default router;
