import { Request, Response, NextFunction } from 'express';
import statisticsService from '../services/statisticsService.js';
import { AuthRequest } from '../middleware/auth.js';
import logger from '../utils/logger.js';

export const getStatistics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { year, month, startDate, endDate } = req.query;
    const branchId = req.user?.branchId || req.query.branchId as string;
    
    const filters: any = {};
    if (year) filters.year = year as string;
    if (month) filters.month = month as string;
    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;
    if (branchId) filters.branchId = branchId;

    const stats = await statisticsService.getStatistics(filters);
    res.json(stats);
  } catch (error) {
    logger.error('Get statistics error:', error);
    next(error);
  }
};

