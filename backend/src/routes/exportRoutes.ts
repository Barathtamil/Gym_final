import { Router } from 'express';
import {
  exportMembers,
  exportExpenses,
  exportEnquiries,
  exportPlans,
  exportBranches,
  exportAttendance,
  exportStaff,
  exportStatistics,
} from '../controllers/exportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/members', authenticate, authorize('admin', 'staff'), exportMembers);
router.get('/expenses', authenticate, authorize('admin', 'staff'), exportExpenses);
router.get('/enquiries', authenticate, authorize('admin', 'staff'), exportEnquiries);
router.get('/plans', authenticate, authorize('admin', 'staff'), exportPlans);
router.get('/branches', authenticate, authorize('admin', 'staff'), exportBranches);
router.get('/attendance', authenticate, authorize('admin', 'staff'), exportAttendance);
router.get('/staff', authenticate, authorize('admin', 'staff'), exportStaff);
router.get('/statistics', authenticate, authorize('admin', 'staff'), exportStatistics);

export default router;

