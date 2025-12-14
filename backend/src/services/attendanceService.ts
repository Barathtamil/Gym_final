import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { Attendance } from '../types/index.js';
import logger from '../utils/logger.js';

export class AttendanceService {
  async markAttendance(memberId: string, batch: 'morning' | 'evening'): Promise<Attendance> {
    // Check if already marked today
    const today = new Date().toISOString().split('T')[0];
    const [existing] = await pool.execute(
      'SELECT * FROM attendance WHERE memberId = ? AND DATE(date) = ?',
      [memberId, today]
    );

    if ((existing as Attendance[]).length > 0) {
      throw new Error('Attendance already marked for today');
    }

    // Get member details
    const [memberRows] = await pool.execute(
      'SELECT registrationNo, fullName FROM members WHERE id = ?',
      [memberId]
    );

    const members = memberRows as any[];
    if (members.length === 0) {
      throw new Error('Member not found');
    }

    const member = members[0];
    const checkInTime = new Date().toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    });

    const id = uuidv4();
    await pool.execute(
      `INSERT INTO attendance (id, memberId, memberName, registrationNo, date, checkInTime, batch)
       VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
      [id, memberId, member.fullName, member.registrationNo, checkInTime, batch]
    );

    logger.info(`Attendance marked for member ${member.registrationNo}`);
    return this.getAttendanceById(id) as Promise<Attendance>;
  }

  async getAttendanceById(id: string): Promise<Attendance | null> {
    const [rows] = await pool.execute('SELECT * FROM attendance WHERE id = ?', [id]);
    const attendances = rows as Attendance[];
    return attendances.length > 0 ? attendances[0] : null;
  }

  async getAttendanceList(filters?: {
    date?: string;
    batch?: 'morning' | 'evening';
    memberId?: string;
    branchId?: string;
  }): Promise<Attendance[]> {
    let query = `
      SELECT a.* 
      FROM attendance a
      LEFT JOIN members m ON a.memberId = m.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.date) {
      query += ' AND DATE(a.date) = ?';
      params.push(filters.date);
    }

    if (filters?.batch) {
      query += ' AND a.batch = ?';
      params.push(filters.batch);
    }

    if (filters?.memberId) {
      query += ' AND a.memberId = ?';
      params.push(filters.memberId);
    }

    if (filters?.branchId) {
      query += ' AND m.branchId = ?';
      params.push(filters.branchId);
    }

    query += ' ORDER BY a.date DESC, a.checkInTime DESC';

    const [rows] = await pool.execute(query, params);
    return rows as Attendance[];
  }

  async getTodayAttendance(branchId?: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    let query = 'SELECT COUNT(*) as count FROM attendance WHERE DATE(date) = ?';
    const params: any[] = [today];

    if (branchId) {
      query += ' AND memberId IN (SELECT id FROM members WHERE branchId = ?)';
      params.push(branchId);
    }

    const [rows] = await pool.execute(query, params);
    return (rows as any[])[0].count;
  }
}

export default new AttendanceService();

