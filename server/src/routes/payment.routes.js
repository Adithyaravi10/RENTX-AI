import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.post('/create-order', verifyToken, paymentController.createOrder);
router.post('/verify', verifyToken, paymentController.verifyPayment);
router.post('/wallet-pay', verifyToken, paymentController.walletPay);
router.post('/refund', verifyToken, requireRole('ADMIN'), paymentController.processRefund);
router.post('/wallet/add', verifyToken, paymentController.addWalletFunds);
router.get('/my', verifyToken, paymentController.getMyPayments);

export default router;
