import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import logger from '../utils/logger.js';

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod?: string;
  invoiceNo?: string;
  remark?: string;
  createdAt: Date;
  createdBy?: string;
}

export class PaymentService {
  async createPayment(data: {
    memberId: string;
    amount: number;
    paymentDate?: string;
    paymentMethod?: string;
    invoiceNo?: string;
    remark?: string;
    createdBy?: string;
    paymentType?: 'registration' | 'renewal' | 'balance';
  }): Promise<Payment> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const paymentId = uuidv4();
      const paymentDate = data.paymentDate || new Date().toISOString().split('T')[0];

      // Insert payment record
      await connection.execute(
        `INSERT INTO payment_members (id, memberId, amount, paymentDate, paymentMethod, invoiceNo, remark, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          paymentId,
          data.memberId,
          data.amount,
          paymentDate,
          data.paymentMethod || null,
          data.invoiceNo || null,
          data.remark || null,
          data.createdBy || null,
        ]
      );

      // Update member's paidAmount
      await connection.execute(
        'UPDATE members SET paidAmount = paidAmount + ? WHERE id = ?',
        [data.amount, data.memberId]
      );

      await connection.commit();

      logger.info(
        `Payment created: ${paymentId} for member ${data.memberId}, amount: ${data.amount}, type: ${data.paymentType || 'balance'}`
      );

      const payment = await this.getPaymentById(paymentId);
      if (!payment) {
        throw new Error('Failed to retrieve created payment');
      }
      return payment;
    } catch (error) {
      await connection.rollback();
      logger.error('Create payment error:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    const [rows] = await pool.execute('SELECT * FROM payment_members WHERE id = ?', [id]);
    const payments = rows as Payment[];
    return payments.length > 0 ? payments[0] : null;
  }

  async getPaymentsByMemberId(memberId: string): Promise<Payment[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM payment_members WHERE memberId = ? ORDER BY paymentDate DESC, createdAt DESC',
      [memberId]
    );
    return rows as Payment[];
  }

  async getAllPayments(filters?: {
    memberId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Payment[]> {
    let query = 'SELECT * FROM payment_members WHERE 1=1';
    const params: any[] = [];

    if (filters?.memberId) {
      query += ' AND memberId = ?';
      params.push(filters.memberId);
    }

    if (filters?.startDate) {
      query += ' AND paymentDate >= ?';
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ' AND paymentDate <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY paymentDate DESC, createdAt DESC';

    const [rows] = await pool.execute(query, params);
    return rows as Payment[];
  }
}

export default new PaymentService();

