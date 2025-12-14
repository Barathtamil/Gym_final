import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { User } from '../types/index.js';
import logger from '../utils/logger.js';

export class StaffService {
  async getAllStaff(branchId?: string): Promise<User[]> {
    let query = "SELECT id, name, username, role, branchId, mobileNumber, isActive, createdAt, updatedAt FROM users WHERE role IN ('admin', 'staff')";
    const params: any[] = [];

    if (branchId) {
      query += ' AND branchId = ?';
      params.push(branchId);
    }

    query += ' ORDER BY createdAt DESC';

    const [rows] = await pool.execute(query, params);
    return rows as User[];
  }

  async getStaffById(id: string): Promise<User | null> {
    const [rows] = await pool.execute(
      "SELECT id, name, username, role, branchId, mobileNumber, isActive, createdAt, updatedAt FROM users WHERE id = ? AND role IN ('admin', 'staff')",
      [id]
    );

    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  async createStaff(staffData: {
    name: string;
    username: string;
    password: string;
    role: 'admin' | 'staff';
    branchId: string;
    mobileNumber?: string;
  }): Promise<Omit<User, 'password'>> {
    // Check if username already exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [staffData.username]
    );

    if ((existing as any[]).length > 0) {
      throw new Error('Username already exists');
    }

    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(staffData.password, 10);

    await pool.execute(
      'INSERT INTO users (id, name, username, password, role, branchId, mobileNumber, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        staffData.name,
        staffData.username,
        hashedPassword,
        staffData.role,
        staffData.branchId,
        staffData.mobileNumber || null,
        1,
      ]
    );

    logger.info(`Staff created: ${staffData.username}`);
    const staff = await this.getStaffById(id);
    return staff as Omit<User, 'password'>;
  }

  async updateStaff(id: string, staffData: {
    name?: string;
    username?: string;
    password?: string;
    role?: 'admin' | 'staff';
    branchId?: string;
    mobileNumber?: string;
    isActive?: boolean;
  }): Promise<Omit<User, 'password'>> {
    const updates: string[] = [];
    const values: any[] = [];

    if (staffData.name) {
      updates.push('name = ?');
      values.push(staffData.name);
    }
    if (staffData.username) {
      // Check if username already exists (excluding current user)
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [staffData.username, id]
      );
      if ((existing as any[]).length > 0) {
        throw new Error('Username already exists');
      }
      updates.push('username = ?');
      values.push(staffData.username);
    }
    if (staffData.password) {
      const hashedPassword = await bcrypt.hash(staffData.password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    if (staffData.role) {
      updates.push('role = ?');
      values.push(staffData.role);
    }
    if (staffData.branchId) {
      updates.push('branchId = ?');
      values.push(staffData.branchId);
    }
    if (staffData.mobileNumber !== undefined) {
      updates.push('mobileNumber = ?');
      values.push(staffData.mobileNumber);
    }
    if (staffData.isActive !== undefined) {
      updates.push('isActive = ?');
      values.push(staffData.isActive ? 1 : 0);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    logger.info(`Staff updated: ${id}`);
    return this.getStaffById(id) as Promise<Omit<User, 'password'>>;
  }

  async deleteStaff(id: string): Promise<void> {
    await pool.execute('UPDATE users SET isActive = 0 WHERE id = ?', [id]);
    logger.info(`Staff deactivated: ${id}`);
  }
}

export default new StaffService();

