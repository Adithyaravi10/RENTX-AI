import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.post('/', verifyToken, bookingController.createBooking);
router.get('/my', verifyToken, bookingController.getMyBookings);
router.get('/', verifyToken, requireRole('ADMIN', 'FLEET_MANAGER'), bookingController.getAllBookings);
router.get('/:id', verifyToken, bookingController.getBookingById);
router.get('/:id/invoice', verifyToken, bookingController.getInvoice);
router.get('/:id/agreement', verifyToken, bookingController.getAgreement);
router.put('/:id/signature', verifyToken, bookingController.saveSignature);
router.put('/:id/cancel', verifyToken, bookingController.cancelBooking);
router.post('/:id/complete', verifyToken, requireRole('ADMIN', 'FLEET_MANAGER'), bookingController.completeBooking);

export default router;
