import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { Enquiry } from '../types/index.js';
import logger from '../utils/logger.js';

export class EnquiryService {
  async getAllEnquiries(filters?: { status?: string }): Promise<Enquiry[]> {
    let query = 'SELECT * FROM enquiries WHERE deletedAt IS NULL';
    const params: any[] = [];

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY date DESC, createdAt DESC';

    const [rows] = await pool.execute(query, params);
    return rows as Enquiry[];
  }

  async getEnquiryById(id: string): Promise<Enquiry | null> {
    const [rows] = await pool.execute('SELECT * FROM enquiries WHERE id = ? AND deletedAt IS NULL', [id]);
    const enquiries = rows as Enquiry[];
    return enquiries.length > 0 ? enquiries[0] : null;
  }

  async createEnquiry(enquiryData: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Enquiry> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO enquiries (id, name, address, date, phoneNumber, followUpDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        enquiryData.name,
        enquiryData.address,
        enquiryData.date,
        enquiryData.phoneNumber,
        enquiryData.followUpDate,
        enquiryData.status || 'pending',
      ]
    );

    logger.info(`Enquiry created: ${enquiryData.name}`);
    return this.getEnquiryById(id) as Promise<Enquiry>;
  }

  async updateEnquiry(id: string, enquiryData: Partial<Enquiry>): Promise<Enquiry> {
    const updates: string[] = [];
    const values: any[] = [];

    if (enquiryData.name) {
      updates.push('name = ?');
      values.push(enquiryData.name);
    }
    if (enquiryData.address !== undefined) {
      updates.push('address = ?');
      values.push(enquiryData.address);
    }
    if (enquiryData.date) {
      updates.push('date = ?');
      values.push(enquiryData.date);
    }
    if (enquiryData.phoneNumber) {
      updates.push('phoneNumber = ?');
      values.push(enquiryData.phoneNumber);
    }
    if (enquiryData.followUpDate) {
      updates.push('followUpDate = ?');
      values.push(enquiryData.followUpDate);
    }
    if (enquiryData.status) {
      updates.push('status = ?');
      values.push(enquiryData.status);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.execute(`UPDATE enquiries SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    logger.info(`Enquiry updated: ${id}`);
    return this.getEnquiryById(id) as Promise<Enquiry>;
  }

  async deleteEnquiry(id: string): Promise<void> {
    await pool.execute('UPDATE enquiries SET deletedAt = NOW() WHERE id = ?', [id]);
    logger.info(`Enquiry soft deleted: ${id}`);
  }
}

export default new EnquiryService();

