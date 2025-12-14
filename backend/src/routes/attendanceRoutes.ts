import { Router } from 'express';
import {
  markAttendance,
  getAttendanceList,
  getTodayAttendance,
} from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, markAttendance);
router.get('/today', authenticate, getTodayAttendance);
router.get('/', authenticate, authorize('admin', 'staff'), getAttendanceList);

export default router;

