import { Router } from 'express';
import {
  getAllEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
} from '../controllers/enquiryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'staff'), getAllEnquiries);
router.get('/:id', authenticate, authorize('admin', 'staff'), getEnquiryById);
router.post('/', authenticate, authorize('admin', 'staff'), createEnquiry);
router.put('/:id', authenticate, authorize('admin', 'staff'), updateEnquiry);
router.delete('/:id', authenticate, authorize('admin'), deleteEnquiry);

export default router;

