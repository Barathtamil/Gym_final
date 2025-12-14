import { Request, Response, NextFunction } from 'express';
import branchService from '../services/branchService.js';
import logger from '../utils/logger.js';

export const getAllBranches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const branches = await branchService.getAllBranches();
    res.json(branches);
  } catch (error) {
    logger.error('Get branches error:', error);
    next(error);
  }
};

export const getBranchById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const branch = await branchService.getBranchById(id);

    if (!branch) {
      res.status(404).json({ error: 'Branch not found' });
      return;
    }

    res.json(branch);
  } catch (error) {
    logger.error('Get branch error:', error);
    next(error);
  }
};

export const createBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const branch = await branchService.createBranch(req.body);
    res.status(201).json(branch);
  } catch (error) {
    logger.error('Create branch error:', error);
    next(error);
  }
};

export const updateBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const branch = await branchService.updateBranch(id, req.body);
    res.json(branch);
  } catch (error) {
    logger.error('Update branch error:', error);
    next(error);
  }
};

export const deleteBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await branchService.deleteBranch(id);
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    logger.error('Delete branch error:', error);
    next(error);
  }
};

