import { Request, Response, NextFunction } from 'express';
import { PendingMemberService } from '../services/pendingMemberService.js';
import logger from '../utils/logger.js';

const pendingMemberService = new PendingMemberService();

export const getAllPendingRegistrations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const branchId = (req as any).user?.branchId;
    const status = req.query.status as string | undefined;
    
    const registrations = await pendingMemberService.getAllPendingRegistrations({
      branchId,
      status,
    });
    res.json(registrations);
  } catch (error) {
    logger.error('Get pending registrations error:', error);
    next(error);
  }
};

export const getPendingRegistrationById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const registration = await pendingMemberService.getPendingRegistrationById(id);
    
    if (!registration) {
      res.status(404).json({ error: 'Pending registration not found' });
      return;
    }
    
    res.json(registration);
  } catch (error) {
    logger.error('Get pending registration error:', error);
    next(error);
  }
};

export const createPendingRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const registrationData = {
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      age: parseInt(req.body.age) || 0,
      phoneNumber: req.body.phoneNumber,
      batch: req.body.batch,
      branchId: req.body.branchId,
      address: req.body.address || '',
      aadharNumber: req.body.aadharNumber || '',
      bloodGroup: req.body.bloodGroup || '',
      weight: req.body.weight ? parseFloat(req.body.weight) : null,
      height: req.body.height ? parseFloat(req.body.height) : null,
      gender: req.body.gender,
      profileImage: (req as any).file ? `/uploads/profiles/${(req as any).file.filename}` : null,
    };

    const registration = await pendingMemberService.createPendingRegistration(registrationData);
    res.status(201).json(registration);
  } catch (error) {
    logger.error('Create pending registration error:', error);
    next(error);
  }
};

export const approvePendingRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const approvalData = {
      planId: req.body.planId,
      planStartDate: req.body.planStartDate,
      planEndDate: req.body.planEndDate,
      planAmount: parseFloat(req.body.planAmount),
      paidAmount: parseFloat(req.body.paidAmount),
      registrationNo: req.body.registrationNo || undefined,
    };

    const userId = (req as any).user?.userId;
    const member = await pendingMemberService.approvePendingRegistration(id, approvalData, userId);
    res.json(member);
  } catch (error) {
    logger.error('Approve pending registration error:', error);
    next(error);
  }
};

export const rejectPendingRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await pendingMemberService.rejectPendingRegistration(id);
    res.json({ message: 'Registration rejected successfully' });
  } catch (error) {
    logger.error('Reject pending registration error:', error);
    next(error);
  }
};

export const deletePendingRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await pendingMemberService.deletePendingRegistration(id);
    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    logger.error('Delete pending registration error:', error);
    next(error);
  }
};

