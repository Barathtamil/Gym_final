import { Router } from 'express';
import {
  getAllPendingRegistrations,
  getPendingRegistrationById,
  createPendingRegistration,
  approvePendingRegistration,
  rejectPendingRegistration,
  deletePendingRegistration,
} from '../controllers/pendingMemberController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadProfileImage } from '../utils/upload.js';

const router = Router();

// Public route for submitting registration (no auth required) - must be before other routes
router.post('/', uploadProfileImage.single('profileImage'), createPendingRegistration);

// Admin/Staff routes - must come after public routes
router.get('/', authenticate, authorize('admin', 'staff'), getAllPendingRegistrations);
router.post('/:id/approve', authenticate, authorize('admin', 'staff'), approvePendingRegistration);
router.post('/:id/reject', authenticate, authorize('admin', 'staff'), rejectPendingRegistration);
router.get('/:id', authenticate, authorize('admin', 'staff'), getPendingRegistrationById);
router.delete('/:id', authenticate, authorize('admin', 'staff'), deletePendingRegistration);

export default router;

