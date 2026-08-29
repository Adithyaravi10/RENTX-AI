import { Router } from 'express';
import * as gpsController from '../controllers/gps.controller.js';

const router = Router();

router.get('/live', gpsController.getLiveVehicles);
router.get('/track/:vehicleId', gpsController.getVehicleTrack);

export default router;
