import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { Expense } from '../types/index.js';
import logger from '../utils/logger.js';

export class ExpenseService {
  async getAllExpenses(filters?: { startDate?: string; endDate?: string }): Promise<Expense[]> {
    let query = 'SELECT * FROM expenses WHERE deletedAt IS NULL';
    const params: any[] = [];

    if (filters?.startDate) {
      query += ' AND date >= ?';
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ' AND date <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY date DESC, createdAt DESC';

    const [rows] = await pool.execute(query, params);
    const expenses = rows as any[];
    // Convert amount from DECIMAL (string) to number
    return expenses.map(expense => ({
      ...expense,
      amount: parseFloat(expense.amount) || 0,
    })) as Expense[];
  }

  async getExpenseById(id: string): Promise<Expense | null> {
    const [rows] = await pool.execute('SELECT * FROM expenses WHERE id = ? AND deletedAt IS NULL', [id]);
    const expenses = rows as any[];
    if (expenses.length === 0) {
      return null;
    }
    // Convert amount from DECIMAL (string) to number
    return {
      ...expenses[0],
      amount: parseFloat(expenses[0].amount) || 0,
    } as Expense;
  }

  async createExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO expenses (id, date, name, amount, remark, createdBy) VALUES (?, ?, ?, ?, ?, ?)',
      [
        id,
        expenseData.date,
        expenseData.name,
        expenseData.amount,
        expenseData.remark,
        expenseData.createdBy,
      ]
    );

    logger.info(`Expense created: ${expenseData.name}`);
    return this.getExpenseById(id) as Promise<Expense>;
  }

  async updateExpense(id: string, expenseData: Partial<Expense>): Promise<Expense> {
    const updates: string[] = [];
    const values: any[] = [];

    if (expenseData.date) {
      updates.push('date = ?');
      values.push(expenseData.date);
    }
    if (expenseData.name) {
      updates.push('name = ?');
      values.push(expenseData.name);
    }
    if (expenseData.amount !== undefined) {
      updates.push('amount = ?');
      values.push(expenseData.amount);
    }
    if (expenseData.remark !== undefined) {
      updates.push('remark = ?');
      values.push(expenseData.remark);
    }
    if (expenseData.updatedBy) {
      updates.push('updatedBy = ?');
      values.push(expenseData.updatedBy);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.execute(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    logger.info(`Expense updated: ${id}`);
    return this.getExpenseById(id) as Promise<Expense>;
  }

  async deleteExpense(id: string): Promise<void> {
    await pool.execute('UPDATE expenses SET deletedAt = NOW() WHERE id = ?', [id]);
    logger.info(`Expense soft deleted: ${id}`);
  }
}

export default new ExpenseService();

