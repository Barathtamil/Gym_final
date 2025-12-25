import { Request, Response, NextFunction } from 'express';
import paymentService from '../services/paymentService.js';
import { AuthRequest } from '../middleware/auth.js';
import logger from '../utils/logger.js';

export const createPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { memberId, amount, paymentDate, paymentMethod, invoiceNo, remark, paymentType } = req.body;

    if (!memberId || !amount) {
      res.status(400).json({ error: 'Member ID and amount are required' });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({ error: 'Amount must be greater than zero' });
      return;
    }

    const payment = await paymentService.createPayment({
      memberId,
      amount: parseFloat(amount),
      paymentDate,
      paymentMethod,
      invoiceNo,
      remark,
      createdBy: req.user?.userId,
      paymentType: paymentType || 'balance',
    });

    res.status(201).json(payment);
  } catch (error) {
    logger.error('Create payment error:', error);
    next(error);
  }
};

export const getPaymentsByMemberId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { memberId } = req.params;
    const payments = await paymentService.getPaymentsByMemberId(memberId);
    res.json(payments);
  } catch (error) {
    logger.error('Get payments error:', error);
    next(error);
  }
};

export const getAllPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { memberId, startDate, endDate } = req.query;
    const filters: any = {};

    if (memberId) filters.memberId = memberId as string;
    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;

    const payments = await paymentService.getAllPayments(filters);
    res.json(payments);
  } catch (error) {
    logger.error('Get all payments error:', error);
    next(error);
  }
};

