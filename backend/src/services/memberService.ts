import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { Member } from '../types/index.js';
import logger from '../utils/logger.js';

export class MemberService {
  async getAllMembers(filters?: {
    branchId?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<Member[]> {
    let query = `
      SELECT 
        m.*,
        p.name as planName,
        COALESCE(m.planAmount, p.amount, 0) as planAmount,
        COALESCE(m.paidAmount, 0) as paidAmount,
        DATEDIFF(m.planEndDate, CURDATE()) as daysLeft,
        (COALESCE(m.planAmount, p.amount, 0) - COALESCE(m.paidAmount, 0)) as balanceAmount
      FROM members m
      LEFT JOIN plans p ON m.planId = p.id
      WHERE m.deletedAt IS NULL
    `;
    const params: any[] = [];

    if (filters?.branchId) {
      query += ' AND m.branchId = ?';
      params.push(filters.branchId);
    }

    if (filters?.isActive !== undefined) {
      query += ' AND m.isActive = ?';
      params.push(filters.isActive ? 1 : 0);
    }

    if (filters?.search) {
      query += ' AND (m.fullName LIKE ? OR m.registrationNo LIKE ? OR m.phoneNumber LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY m.createdAt DESC';

    const [rows] = await pool.execute(query, params);
    return rows as Member[];
  }

  async getMemberById(id: string): Promise<Member | null> {
    const [rows] = await pool.execute(
      `SELECT 
        m.*,
        p.name as planName,
        COALESCE(m.planAmount, p.amount, 0) as planAmount,
        COALESCE(m.paidAmount, 0) as paidAmount,
        DATEDIFF(m.planEndDate, CURDATE()) as daysLeft,
        (COALESCE(m.planAmount, p.amount, 0) - COALESCE(m.paidAmount, 0)) as balanceAmount
      FROM members m
      LEFT JOIN plans p ON m.planId = p.id
      WHERE m.id = ? AND m.deletedAt IS NULL`,
      [id]
    );

    const members = rows as Member[];
    return members.length > 0 ? members[0] : null;
  }

  async getMemberByRegistrationNo(registrationNo: string): Promise<Member | null> {
    const [rows] = await pool.execute(
      `SELECT 
        m.*,
        p.name as planName,
        COALESCE(m.planAmount, p.amount, 0) as planAmount,
        COALESCE(m.paidAmount, 0) as paidAmount,
        DATEDIFF(m.planEndDate, CURDATE()) as daysLeft,
        (COALESCE(m.planAmount, p.amount, 0) - COALESCE(m.paidAmount, 0)) as balanceAmount
      FROM members m
      LEFT JOIN plans p ON m.planId = p.id
      WHERE m.registrationNo = ? AND m.deletedAt IS NULL`,
      [registrationNo]
    );

    const members = rows as Member[];
    return members.length > 0 ? members[0] : null;
  }

  async createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt' | 'planName' | 'daysLeft' | 'balanceAmount'>, createdBy?: string): Promise<Member> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const id = uuidv4();
      
      // Use provided registrationNo or generate one
      let registrationNo = (memberData as any).registrationNo;
      
      if (!registrationNo || (typeof registrationNo === 'string' && registrationNo.trim() === '')) {
        // Generate registration number if not provided
        registrationNo = await this.generateRegistrationNo(memberData.branchId);
      } else {
        // Check if registration number already exists
        const trimmedRegNo = typeof registrationNo === 'string' ? registrationNo.trim() : String(registrationNo).trim();
        const existing = await this.getMemberByRegistrationNo(trimmedRegNo);
        if (existing) {
          throw new Error('Registration number already exists');
        }
        registrationNo = trimmedRegNo;
      }

      const planAmount = (memberData as any).planAmount || 0;
      const paidAmount = (memberData as any).paidAmount || 0;

      // Insert member
      await connection.execute(
        `INSERT INTO members (
          id, registrationNo, fullName, dateOfBirth, age, phoneNumber, 
          batch, branchId, address, aadharNumber, bloodGroup, planId, weight, height, 
          gender, planStartDate, planEndDate, planAmount, paidAmount, isActive, profileImage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          typeof registrationNo === 'string' ? registrationNo.trim() : registrationNo,
          memberData.fullName,
          memberData.dateOfBirth,
          memberData.age,
          memberData.phoneNumber,
          memberData.batch,
          memberData.branchId,
          memberData.address,
          (memberData as any).aadharNumber || null,
          memberData.bloodGroup,
          memberData.planId,
          memberData.weight,
          memberData.height,
          memberData.gender,
          memberData.planStartDate,
          memberData.planEndDate,
          planAmount,
          paidAmount,
          memberData.isActive ? 1 : 0,
          (memberData as any).profileImage || null,
        ]
      );

      // Create payment entry if paidAmount > 0
      if (paidAmount > 0) {
        const paymentId = uuidv4();
        await connection.execute(
          `INSERT INTO payment_members (id, memberId, amount, paymentDate, paymentMethod, invoiceNo, remark, createdBy)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            paymentId,
            id,
            paidAmount,
            memberData.planStartDate,
            'cash',
            null,
            'Initial registration payment',
            createdBy || null,
          ]
        );
        logger.info(`Payment entry created for member registration: ${paymentId}`);
      }

      await connection.commit();

      logger.info(`Member created: ${registrationNo}`);
      return this.getMemberById(id) as Promise<Member>;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateMember(id: string, memberData: Partial<Member>): Promise<Member> {
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(memberData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    await pool.execute(
      `UPDATE members SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    logger.info(`Member updated: ${id}`);
    return this.getMemberById(id) as Promise<Member>;
  }

  async deleteMember(id: string): Promise<void> {
    await pool.execute('UPDATE members SET deletedAt = NOW() WHERE id = ?', [id]);
    logger.info(`Member soft deleted: ${id}`);
  }

  async renewMember(id: string, planId: string, paidAmount: number, createdBy?: string): Promise<Member> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get current member and plan details
      const member = await this.getMemberById(id);
      if (!member) {
        throw new Error('Member not found');
      }

      // Get plan details
      const [planRows] = await connection.execute('SELECT * FROM plans WHERE id = ? AND deletedAt IS NULL', [planId]);
      const plans = planRows as any[];
      if (plans.length === 0) {
        throw new Error('Plan not found');
      }

      const plan = plans[0];

      // Validate paid amount
      if (paidAmount > plan.amount) {
        throw new Error('Paid amount cannot be greater than plan amount');
      }

      // Calculate new end date from current end date (or today if expired)
      // Plan duration is stored in days (as per schema: duration INT NOT NULL COMMENT 'Duration in days')
      const currentEndDate = new Date(member.planEndDate);
      const today = new Date();
      const startDate = currentEndDate > today ? currentEndDate : today;
      const newEndDate = new Date(startDate);
      // Add the plan duration in days
      newEndDate.setDate(newEndDate.getDate() + plan.duration);

      // Update member with new plan, dates, plan amount, and paid amount
      await connection.execute(
        `UPDATE members 
         SET planId = ?, 
             planStartDate = ?, 
             planEndDate = ?,
             planAmount = ?,
             paidAmount = ?,
             isActive = 1
         WHERE id = ?`,
        [
          planId, 
          startDate.toISOString().split('T')[0], 
          newEndDate.toISOString().split('T')[0], 
          plan.amount,
          paidAmount,
          id
        ]
      );

      // Create payment entry if paidAmount > 0
      if (paidAmount > 0) {
        const paymentId = uuidv4();
        await connection.execute(
          `INSERT INTO payment_members (id, memberId, amount, paymentDate, paymentMethod, invoiceNo, remark, createdBy)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            paymentId,
            id,
            paidAmount,
            startDate.toISOString().split('T')[0],
            'cash',
            null,
            'Membership renewal payment',
            createdBy || null,
          ]
        );
        logger.info(`Payment entry created for member renewal: ${paymentId}`);
      }

      await connection.commit();

      logger.info(`Member renewed: ${id} with plan ${planId}, paid amount: ${paidAmount}`);
      return this.getMemberById(id) as Promise<Member>;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async generateRegistrationNo(branchId: string): Promise<string> {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM members WHERE branchId = ? AND deletedAt IS NULL',
      [branchId]
    );
    const count = (rows as any[])[0].count;
    return `MG${String(count + 1).padStart(4, '0')}`;
  }
}

export default new MemberService();

