import { Request, Response, NextFunction } from 'express';
import expenseService from '../services/expenseService.js';
import logger from '../utils/logger.js';

export const getAllExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const filters: any = {};
    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;

    const expenses = await expenseService.getAllExpenses(filters);
    res.json(expenses);
  } catch (error) {
    logger.error('Get expenses error:', error);
    next(error);
  }
};

export const getExpenseById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await expenseService.getExpenseById(id);

    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    res.json(expense);
  } catch (error) {
    logger.error('Get expense error:', error);
    next(error);
  }
};

export const createExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const expense = await expenseService.createExpense(req.body);
    res.status(201).json(expense);
  } catch (error) {
    logger.error('Create expense error:', error);
    next(error);
  }
};

export const updateExpense = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await expenseService.updateExpense(id, req.body);
    res.json(expense);
  } catch (error) {
    logger.error('Update expense error:', error);
    next(error);
  }
};

export const deleteExpense = async (
  req: Request,
  res: Response, next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await expenseService.deleteExpense(id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    logger.error('Delete expense error:', error);
    next(error);
  }
};

