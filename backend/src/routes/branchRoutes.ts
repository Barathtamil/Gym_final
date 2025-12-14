import { Router } from 'express';
import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branchController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getAllBranches);
router.get('/:id', authenticate, getBranchById);
router.post('/', authenticate, authorize('admin'), createBranch);
router.put('/:id', authenticate, authorize('admin'), updateBranch);
router.delete('/:id', authenticate, authorize('admin'), deleteBranch);

export default router;

