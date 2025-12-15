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
        p.amount as planAmount,
        DATEDIFF(m.planEndDate, CURDATE()) as daysLeft,
        (p.amount - COALESCE(SUM(pm.amount), 0)) as balanceAmount
      FROM members m
      LEFT JOIN plans p ON m.planId = p.id
      LEFT JOIN payment_members pm ON m.id = pm.memberId
      WHERE 1=1
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

    query += ' GROUP BY m.id ORDER BY m.createdAt DESC';

    const [rows] = await pool.execute(query, params);
    return rows as Member[];
  }

  async getMemberById(id: string): Promise<Member | null> {
    const [rows] = await pool.execute(
      `SELECT 
        m.*,
        p.name as planName,
        p.amount as planAmount,
        DATEDIFF(m.planEndDate, CURDATE()) as daysLeft,
        (p.amount - COALESCE(SUM(pm.amount), 0)) as balanceAmount
      FROM members m
      LEFT JOIN plans p ON m.planId = p.id
      LEFT JOIN payment_members pm ON m.id = pm.memberId
      WHERE m.id = ?
      GROUP BY m.id`,
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
        p.amount as planAmount,
        DATEDIFF(m.planEndDate, CURDATE()) as daysLeft,
        (p.amount - COALESCE(SUM(pm.amount), 0)) as balanceAmount
      FROM members m
      LEFT JOIN plans p ON m.planId = p.id
      LEFT JOIN payment_members pm ON m.id = pm.memberId
      WHERE m.registrationNo = ?
      GROUP BY m.id`,
      [registrationNo]
    );

    const members = rows as Member[];
    return members.length > 0 ? members[0] : null;
  }

  async createMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt' | 'planName' | 'daysLeft' | 'balanceAmount'>): Promise<Member> {
    const id = uuidv4();
    const registrationNo = await this.generateRegistrationNo(memberData.branchId);

    await pool.execute(
      `INSERT INTO members (
        id, registrationNo, fullName, dateOfBirth, age, phoneNumber, 
        batch, branchId, address, bloodGroup, planId, weight, height, 
        gender, planStartDate, planEndDate, isActive, profileImage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        registrationNo,
        memberData.fullName,
        memberData.dateOfBirth,
        memberData.age,
        memberData.phoneNumber,
        memberData.batch,
        memberData.branchId,
        memberData.address,
        memberData.bloodGroup,
        memberData.planId,
        memberData.weight,
        memberData.height,
        memberData.gender,
        memberData.planStartDate,
        memberData.planEndDate,
        memberData.isActive ? 1 : 0,
        (memberData as any).profileImage || null,
      ]
    );

    logger.info(`Member created: ${registrationNo}`);
    return this.getMemberById(id) as Promise<Member>;
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
    await pool.execute('UPDATE members SET isActive = 0 WHERE id = ?', [id]);
    logger.info(`Member deactivated: ${id}`);
  }

  private async generateRegistrationNo(branchId: string): Promise<string> {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM members WHERE branchId = ?',
      [branchId]
    );
    const count = (rows as any[])[0].count;
    return `MG${String(count + 1).padStart(4, '0')}`;
  }
}

export default new MemberService();

