import { Router } from 'express';
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/planController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getAllPlans);
router.get('/:id', authenticate, getPlanById);
router.post('/', authenticate, authorize('admin'), createPlan);
router.put('/:id', authenticate, authorize('admin'), updatePlan);
router.delete('/:id', authenticate, authorize('admin'), deletePlan);

export default router;

