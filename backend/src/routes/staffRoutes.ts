import { Router } from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('admin'), getAllStaff);
router.get('/:id', authenticate, authorize('admin'), getStaffById);
router.post('/', authenticate, authorize('admin'), createStaff);
router.put('/:id', authenticate, authorize('admin'), updateStaff);
router.delete('/:id', authenticate, authorize('admin'), deleteStaff);

export default router;

