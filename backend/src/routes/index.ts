import { Router } from 'express';
import authRoutes from './authRoutes.js';
import memberRoutes from './memberRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import planRoutes from './planRoutes.js';
import branchRoutes from './branchRoutes.js';
import expenseRoutes from './expenseRoutes.js';
import enquiryRoutes from './enquiryRoutes.js';
import staffRoutes from './staffRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import pendingMemberRoutes from './pendingMemberRoutes.js';
import { upload, uploadLogo, getActiveLogo } from '../controllers/logoController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/plans', planRoutes);
router.use('/branches', branchRoutes);
router.use('/expenses', expenseRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/staff', staffRoutes);
router.use('/payments', paymentRoutes);
router.use('/pending-members', pendingMemberRoutes);

// Logo routes
router.post('/logo', authenticate, authorize('admin'), upload.single('logo'), uploadLogo);
router.get('/logo', getActiveLogo);

export default router;

