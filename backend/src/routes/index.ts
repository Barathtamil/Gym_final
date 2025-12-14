import { Router } from 'express';
import authRoutes from './authRoutes.js';
import memberRoutes from './memberRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import { upload, uploadLogo, getActiveLogo } from '../controllers/logoController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/dashboard', dashboardRoutes);

// Logo routes
router.post('/logo', authenticate, authorize('admin'), upload.single('logo'), uploadLogo);
router.get('/logo', getActiveLogo);

export default router;

