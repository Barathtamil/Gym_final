import { Request, Response, NextFunction } from 'express';
import planService from '../services/planService.js';
import logger from '../utils/logger.js';

export const getAllPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const plans = await planService.getAllPlans();
    res.json(plans);
  } catch (error) {
    logger.error('Get plans error:', error);
    next(error);
  }
};

export const getPlanById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await planService.getPlanById(id);

    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    res.json(plan);
  } catch (error) {
    logger.error('Get plan error:', error);
    next(error);
  }
};

export const createPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const plan = await planService.createPlan(req.body);
    res.status(201).json(plan);
  } catch (error) {
    logger.error('Create plan error:', error);
    next(error);
  }
};

export const updatePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await planService.updatePlan(id, req.body);
    res.json(plan);
  } catch (error) {
    logger.error('Update plan error:', error);
    next(error);
  }
};

export const deletePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await planService.deletePlan(id);
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    logger.error('Delete plan error:', error);
    next(error);
  }
};

