import { Request, Response, NextFunction } from 'express';
import memberService from '../services/memberService.js';
import logger from '../utils/logger.js';

export const getAllMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { branchId, isActive, search } = req.query;
    const filters: any = {};

    if (branchId) filters.branchId = branchId as string;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (search) filters.search = search as string;

    const members = await memberService.getAllMembers(filters);
    res.json(members);
  } catch (error) {
    logger.error('Get members error:', error);
    next(error);
  }
};

export const getMemberById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const member = await memberService.getMemberById(id);

    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    res.json(member);
  } catch (error) {
    logger.error('Get member error:', error);
    next(error);
  }
};

export const getMemberByRegistrationNo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { registrationNo } = req.params;
    const member = await memberService.getMemberByRegistrationNo(registrationNo);

    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    res.json(member);
  } catch (error) {
    logger.error('Get member by registration error:', error);
    next(error);
  }
};

export const createMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const member = await memberService.createMember(req.body);
    res.status(201).json(member);
  } catch (error) {
    logger.error('Create member error:', error);
    next(error);
  }
};

export const updateMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const member = await memberService.updateMember(id, req.body);
    res.json(member);
  } catch (error) {
    logger.error('Update member error:', error);
    next(error);
  }
};

export const deleteMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await memberService.deleteMember(id);
    res.json({ message: 'Member deactivated successfully' });
  } catch (error) {
    logger.error('Delete member error:', error);
    next(error);
  }
};

