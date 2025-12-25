import { Router } from 'express';
import {
  createPayment,
  getPaymentsByMemberId,
  getAllPayments,
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, authorize('admin', 'staff'), createPayment);
router.get('/member/:memberId', authenticate, authorize('admin', 'staff'), getPaymentsByMemberId);
router.get('/', authenticate, authorize('admin', 'staff'), getAllPayments);

export default router;

