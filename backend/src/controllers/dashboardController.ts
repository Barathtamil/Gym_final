import { Request, Response, NextFunction } from 'express';
import dashboardService from '../services/dashboardService.js';
import { AuthRequest } from '../middleware/auth.js';
import logger from '../utils/logger.js';

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const branchId = req.user?.branchId || req.query.branchId as string;
    const stats = await dashboardService.getDashboardStats(branchId);
    res.json(stats);
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    next(error);
  }
};

