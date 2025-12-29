import { Router } from 'express';
import { getStatistics } from '../controllers/statisticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('admin', 'staff'), getStatistics);

export default router;

