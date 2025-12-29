import { Request, Response, NextFunction } from 'express';
import staffService from '../services/staffService.js';
import logger from '../utils/logger.js';

export const getAllStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { branchId } = req.query;
    const staff = await staffService.getAllStaff(branchId as string);
    res.json(staff);
  } catch (error) {
    logger.error('Get staff error:', error);
    next(error);
  }
};

export const getStaffById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const staff = await staffService.getStaffById(id);

    if (!staff) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }

    res.json(staff);
  } catch (error) {
    logger.error('Get staff error:', error);
    next(error);
  }
};

export const createStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, username, password, role, branchId, mobileNumber, aadharNumber, address } = req.body;

    if (!name || !username || !password || !role || !branchId) {
      res.status(400).json({ error: 'Name, username, password, role, and branchId are required' });
      return;
    }

    if (role !== 'admin' && role !== 'staff' && role !== 'member') {
      res.status(400).json({ error: 'Role must be admin, staff, or member' });
      return;
    }

    const staff = await staffService.createStaff({
      name,
      username,
      password,
      role,
      branchId,
      mobileNumber,
      aadharNumber,
      address,
    });

    res.status(201).json(staff);
  } catch (error) {
    logger.error('Create staff error:', error);
    if (error instanceof Error && error.message === 'Username already exists') {
      res.status(400).json({ error: error.message });
    } else {
      next(error);
    }
  }
};

export const updateStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (role && role !== 'admin' && role !== 'staff' && role !== 'member') {
      res.status(400).json({ error: 'Role must be admin, staff, or member' });
      return;
    }

    const staff = await staffService.updateStaff(id, req.body);
    res.json(staff);
  } catch (error) {
    logger.error('Update staff error:', error);
    if (error instanceof Error && error.message === 'Username already exists') {
      res.status(400).json({ error: error.message });
    } else {
      next(error);
    }
  }
};

export const deleteStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await staffService.deleteStaff(id);
    res.json({ message: 'Staff deactivated successfully' });
  } catch (error) {
    logger.error('Delete staff error:', error);
    next(error);
  }
};

