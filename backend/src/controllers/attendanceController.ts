import { Request, Response, NextFunction } from 'express';
import attendanceService from '../services/attendanceService.js';
import logger from '../utils/logger.js';

export const markAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { memberId, batch } = req.body;

    if (!memberId || !batch) {
      res.status(400).json({ error: 'Member ID and batch are required' });
      return;
    }

    const attendance = await attendanceService.markAttendance(memberId, batch);
    res.status(201).json(attendance);
  } catch (error) {
    logger.error('Mark attendance error:', error);
    if (error instanceof Error && error.message === 'Attendance already marked for today') {
      res.status(400).json({ error: error.message });
    } else if (error instanceof Error && error.message === 'Member not found') {
      res.status(404).json({ error: error.message });
    } else {
      next(error);
    }
  }
};

export const getAttendanceList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { date, batch, memberId, branchId } = req.query;
    const filters: any = {};

    if (date) filters.date = date as string;
    if (batch) filters.batch = batch as 'morning' | 'evening';
    if (memberId) filters.memberId = memberId as string;
    if (branchId) filters.branchId = branchId as string;

    const attendance = await attendanceService.getAttendanceList(filters);
    res.json(attendance);
  } catch (error) {
    logger.error('Get attendance list error:', error);
    next(error);
  }
};

export const getTodayAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { branchId } = req.query;
    const count = await attendanceService.getTodayAttendance(branchId as string);
    res.json({ count });
  } catch (error) {
    logger.error('Get today attendance error:', error);
    next(error);
  }
};

