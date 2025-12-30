import { Router } from 'express';
import { login, refreshToken, logout, changePassword } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/change-password', authenticate, authorize('admin', 'staff'), changePassword);

export default router;

