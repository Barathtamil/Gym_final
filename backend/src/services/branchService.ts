import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { Branch } from '../types/index.js';
import logger from '../utils/logger.js';

export class BranchService {
  async getAllBranches(): Promise<Branch[]> {
    const [rows] = await pool.execute('SELECT * FROM branches ORDER BY createdAt DESC');
    return rows as Branch[];
  }

  async getBranchById(id: string): Promise<Branch | null> {
    const [rows] = await pool.execute('SELECT * FROM branches WHERE id = ?', [id]);
    const branches = rows as Branch[];
    return branches.length > 0 ? branches[0] : null;
  }

  async createBranch(branchData: Omit<Branch, 'id' | 'createdAt'>): Promise<Branch> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO branches (id, name, location, createdBy) VALUES (?, ?, ?, ?)',
      [id, branchData.name, branchData.location, branchData.createdBy]
    );

    logger.info(`Branch created: ${branchData.name}`);
    return this.getBranchById(id) as Promise<Branch>;
  }

  async updateBranch(id: string, branchData: Partial<Branch>): Promise<Branch> {
    const updates: string[] = [];
    const values: any[] = [];

    if (branchData.name) {
      updates.push('name = ?');
      values.push(branchData.name);
    }
    if (branchData.location) {
      updates.push('location = ?');
      values.push(branchData.location);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.execute(`UPDATE branches SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    logger.info(`Branch updated: ${id}`);
    return this.getBranchById(id) as Promise<Branch>;
  }

  async deleteBranch(id: string): Promise<void> {
    await pool.execute('DELETE FROM branches WHERE id = ?', [id]);
    logger.info(`Branch deleted: ${id}`);
  }
}

export default new BranchService();

