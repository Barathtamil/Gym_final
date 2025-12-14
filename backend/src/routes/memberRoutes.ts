import { Router } from 'express';
import {
  getAllMembers,
  getMemberById,
  getMemberByRegistrationNo,
  createMember,
  updateMember,
  deleteMember,
} from '../controllers/memberController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/search/:registrationNo', authenticate, getMemberByRegistrationNo);
router.get('/:id', authenticate, getMemberById);
router.get('/', authenticate, getAllMembers);
router.post('/', authenticate, authorize('admin', 'staff'), createMember);
router.put('/:id', authenticate, authorize('admin', 'staff'), updateMember);
router.delete('/:id', authenticate, authorize('admin'), deleteMember);

export default router;

