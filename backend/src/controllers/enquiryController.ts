import { Request, Response, NextFunction } from 'express';
import enquiryService from '../services/enquiryService.js';
import logger from '../utils/logger.js';

export const getAllEnquiries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query;
    const filters: any = {};
    if (status) filters.status = status as string;

    const enquiries = await enquiryService.getAllEnquiries(filters);
    res.json(enquiries);
  } catch (error) {
    logger.error('Get enquiries error:', error);
    next(error);
  }
};

export const getEnquiryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const enquiry = await enquiryService.getEnquiryById(id);

    if (!enquiry) {
      res.status(404).json({ error: 'Enquiry not found' });
      return;
    }

    res.json(enquiry);
  } catch (error) {
    logger.error('Get enquiry error:', error);
    next(error);
  }
};

export const createEnquiry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enquiry = await enquiryService.createEnquiry(req.body);
    res.status(201).json(enquiry);
  } catch (error) {
    logger.error('Create enquiry error:', error);
    next(error);
  }
};

export const updateEnquiry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const enquiry = await enquiryService.updateEnquiry(id, req.body);
    res.json(enquiry);
  } catch (error) {
    logger.error('Update enquiry error:', error);
    next(error);
  }
};

export const deleteEnquiry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await enquiryService.deleteEnquiry(id);
    res.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    logger.error('Delete enquiry error:', error);
    next(error);
  }
};

