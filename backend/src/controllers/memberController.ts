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
    // Extract member data from form fields (multer middleware already processed the file)
    const memberData = {
      registrationNo: req.body.registrationNo || undefined,
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      age: parseInt(req.body.age) || 0,
      phoneNumber: req.body.phoneNumber,
      batch: req.body.batch,
      branchId: req.body.branchId,
      address: req.body.address || '',
      bloodGroup: req.body.bloodGroup || '',
      planId: req.body.planId,
      weight: req.body.weight ? parseFloat(req.body.weight) : null,
      height: req.body.height ? parseFloat(req.body.height) : null,
      gender: req.body.gender,
      planStartDate: req.body.planStartDate,
      planEndDate: req.body.planEndDate,
      planAmount: req.body.planAmount ? parseFloat(req.body.planAmount) : 0,
      paidAmount: req.body.paidAmount ? parseFloat(req.body.paidAmount) : 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : true,
      profileImage: (req as any).file ? `/uploads/profiles/${(req as any).file.filename}` : null,
    };

    const member = await memberService.createMember(memberData);
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
    const memberData: any = { ...req.body };
    
    // Handle profile image if uploaded
    if ((req as any).file) {
      memberData.profileImage = `/uploads/profiles/${(req as any).file.filename}`;
    }
    
    // Parse numeric fields
    if (memberData.age) memberData.age = parseInt(memberData.age);
    if (memberData.weight) memberData.weight = parseFloat(memberData.weight);
    if (memberData.height) memberData.height = parseFloat(memberData.height);
    if (memberData.planAmount) memberData.planAmount = parseFloat(memberData.planAmount);
    if (memberData.paidAmount) memberData.paidAmount = parseFloat(memberData.paidAmount);
    if (memberData.isActive !== undefined) {
      memberData.isActive = memberData.isActive === 'true' || memberData.isActive === true;
    }
    
    const member = await memberService.updateMember(id, memberData);
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

export const renewMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { planId, paidAmount } = req.body;
    
    if (!planId) {
      res.status(400).json({ error: 'Plan ID is required' });
      return;
    }

    const paidAmountNum = paidAmount !== undefined ? parseFloat(paidAmount) : 0;
    if (paidAmountNum < 0) {
      res.status(400).json({ error: 'Paid amount cannot be negative' });
      return;
    }

    const member = await memberService.renewMember(id, planId, paidAmountNum);
    res.json(member);
  } catch (error) {
    logger.error('Renew member error:', error);
    next(error);
  }
};

