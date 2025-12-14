import { Router } from 'express';
import {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'staff'), getAllExpenses);
router.get('/:id', authenticate, authorize('admin', 'staff'), getExpenseById);
router.post('/', authenticate, authorize('admin', 'staff'), createExpense);
router.put('/:id', authenticate, authorize('admin', 'staff'), updateExpense);
router.delete('/:id', authenticate, authorize('admin'), deleteExpense);

export default router;

