import { Router } from 'express';
import {
  getAllMembers,
  getMemberById,
  getMemberByRegistrationNo,
  createMember,
  updateMember,
  deleteMember,
  renewMember,
} from '../controllers/memberController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadProfileImage } from '../utils/upload.js';

const router = Router();

router.get('/search/:registrationNo', authenticate, getMemberByRegistrationNo);
router.get('/:id', authenticate, getMemberById);
router.get('/', authenticate, getAllMembers);
router.post('/', authenticate, authorize('admin', 'staff'), uploadProfileImage.single('profileImage'), createMember);
router.put('/:id', authenticate, authorize('admin', 'staff'), uploadProfileImage.single('profileImage'), updateMember);
router.post('/:id/renew', authenticate, authorize('admin', 'staff'), renewMember);
router.delete('/:id', authenticate, authorize('admin'), deleteMember);

export default router;

