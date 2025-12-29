import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import logger from '../utils/logger.js';
import { MemberService } from './memberService.js';

export interface PendingMemberRegistration {
  id: string;
  fullName: string;
  dateOfBirth: Date;
  age: number;
  phoneNumber: string;
  batch: 'morning' | 'evening';
  branchId: string;
  address?: string;
  aadharNumber?: string;
  bloodGroup?: string;
  weight?: number;
  height?: number;
  gender: 'male' | 'female' | 'other';
  profileImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

export class PendingMemberService {
  async getAllPendingRegistrations(filters?: { branchId?: string; status?: string }): Promise<PendingMemberRegistration[]> {
    let query = 'SELECT * FROM pending_member_registrations WHERE 1=1';
    const params: any[] = [];

    if (filters?.branchId) {
      query += ' AND branchId = ?';
      params.push(filters.branchId);
    }

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    } else {
      // Default to pending if no status filter
      query += ' AND status = ?';
      params.push('pending');
    }

    query += ' ORDER BY createdAt DESC';

    const [rows] = await pool.execute(query, params);
    return rows as PendingMemberRegistration[];
  }

  async getPendingRegistrationById(id: string): Promise<PendingMemberRegistration | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM pending_member_registrations WHERE id = ?',
      [id]
    );
    const registrations = rows as PendingMemberRegistration[];
    return registrations.length > 0 ? registrations[0] : null;
  }

  async createPendingRegistration(registrationData: Omit<PendingMemberRegistration, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<PendingMemberRegistration> {
    const id = uuidv4();
    
    await pool.execute(
      `INSERT INTO pending_member_registrations (
        id, fullName, dateOfBirth, age, phoneNumber, batch, branchId, address,
        aadharNumber, bloodGroup, weight, height, gender, profileImage, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        registrationData.fullName,
        registrationData.dateOfBirth,
        registrationData.age,
        registrationData.phoneNumber,
        registrationData.batch,
        registrationData.branchId,
        registrationData.address || null,
        registrationData.aadharNumber || null,
        registrationData.bloodGroup || null,
        registrationData.weight || null,
        registrationData.height || null,
        registrationData.gender,
        registrationData.profileImage || null,
        'pending',
      ]
    );

    logger.info(`Pending member registration created: ${registrationData.fullName}`);
    return this.getPendingRegistrationById(id) as Promise<PendingMemberRegistration>;
  }

  async approvePendingRegistration(
    id: string,
    approvalData: {
      planId: string;
      planStartDate: string;
      planEndDate: string;
      planAmount: number;
      paidAmount: number;
      registrationNo?: string;
    },
    createdBy?: string
  ): Promise<any> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get pending registration
      const pendingRegistration = await this.getPendingRegistrationById(id);
      if (!pendingRegistration) {
        throw new Error('Pending registration not found');
      }

      if (pendingRegistration.status !== 'pending') {
        throw new Error('Registration has already been processed');
      }

      // Create member using MemberService
      const memberService = new MemberService();
      const memberData = {
        registrationNo: approvalData.registrationNo || undefined,
        fullName: pendingRegistration.fullName,
        dateOfBirth: pendingRegistration.dateOfBirth,
        age: pendingRegistration.age,
        phoneNumber: pendingRegistration.phoneNumber,
        batch: pendingRegistration.batch,
        branchId: pendingRegistration.branchId,
        address: pendingRegistration.address || '',
        aadharNumber: pendingRegistration.aadharNumber || '',
        bloodGroup: pendingRegistration.bloodGroup || '',
        planId: approvalData.planId,
        weight: pendingRegistration.weight || 0,
        height: pendingRegistration.height || 0,
        gender: pendingRegistration.gender,
        planStartDate: approvalData.planStartDate,
        planEndDate: approvalData.planEndDate,
        isActive: true,
        profileImage: pendingRegistration.profileImage || null,
      };

      const member = await memberService.createMember(
        {
          ...memberData,
          planAmount: approvalData.planAmount,
          paidAmount: approvalData.paidAmount,
        } as any,
        createdBy
      );

      // Update pending registration status
      await connection.execute(
        'UPDATE pending_member_registrations SET status = ? WHERE id = ?',
        ['approved', id]
      );

      await connection.commit();
      logger.info(`Pending registration approved and member created: ${member.id}`);
      return member;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async rejectPendingRegistration(id: string): Promise<void> {
    await pool.execute(
      'UPDATE pending_member_registrations SET status = ? WHERE id = ?',
      ['rejected', id]
    );
    logger.info(`Pending registration rejected: ${id}`);
  }

  async deletePendingRegistration(id: string): Promise<void> {
    await pool.execute(
      'DELETE FROM pending_member_registrations WHERE id = ?',
      [id]
    );
    logger.info(`Pending registration deleted: ${id}`);
  }
}

