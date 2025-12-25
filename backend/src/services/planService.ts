import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { Plan } from '../types/index.js';
import logger from '../utils/logger.js';

export class PlanService {
  async getAllPlans(): Promise<Plan[]> {
    const [rows] = await pool.execute(`
      SELECT p.*, GROUP_CONCAT(pb.branchId) as branches
      FROM plans p
      LEFT JOIN plan_branches pb ON p.id = pb.planId
      WHERE p.deletedAt IS NULL
      GROUP BY p.id
      ORDER BY p.createdAt DESC
    `);

    const plans = rows as any[];
    return plans.map((plan) => ({
      ...plan,
      branches: plan.branches ? plan.branches.split(',') : [],
    })) as Plan[];
  }

  async getPlanById(id: string): Promise<Plan | null> {
    const [rows] = await pool.execute(
      `SELECT p.*, GROUP_CONCAT(pb.branchId) as branches
       FROM plans p
       LEFT JOIN plan_branches pb ON p.id = pb.planId
       WHERE p.id = ? AND p.deletedAt IS NULL
       GROUP BY p.id`,
      [id]
    );

    const plans = rows as any[];
    if (plans.length === 0) return null;

    const plan = plans[0];
    return {
      ...plan,
      branches: plan.branches ? plan.branches.split(',') : [],
    } as Plan;
  }

  async createPlan(planData: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plan> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO plans (id, name, duration, amount, createdBy) VALUES (?, ?, ?, ?, ?)',
      [id, planData.name, planData.duration, planData.amount, planData.createdBy]
    );

    // Link branches
    if (planData.branches && planData.branches.length > 0) {
      const values = planData.branches.map((branchId) => [id, branchId]);
      await pool.query(
        `INSERT INTO plan_branches (planId, branchId) VALUES ${values.map(() => '(?, ?)').join(', ')}`,
        values.flat()
      );
    }

    logger.info(`Plan created: ${planData.name}`);
    return this.getPlanById(id) as Promise<Plan>;
  }

  async updatePlan(id: string, planData: Partial<Plan>): Promise<Plan> {
    const updates: string[] = [];
    const values: any[] = [];

    if (planData.name) {
      updates.push('name = ?');
      values.push(planData.name);
    }
    if (planData.duration !== undefined) {
      updates.push('duration = ?');
      values.push(planData.duration);
    }
    if (planData.amount !== undefined) {
      updates.push('amount = ?');
      values.push(planData.amount);
    }
    if (planData.updatedBy) {
      updates.push('updatedBy = ?');
      values.push(planData.updatedBy);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.execute(`UPDATE plans SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    // Update branches if provided
    if (planData.branches) {
      await pool.execute('DELETE FROM plan_branches WHERE planId = ?', [id]);
      if (planData.branches.length > 0) {
        const branchValues = planData.branches.map((branchId) => [id, branchId]);
        await pool.query(
          `INSERT INTO plan_branches (planId, branchId) VALUES ${branchValues.map(() => '(?, ?)').join(', ')}`,
          branchValues.flat()
        );
      }
    }

    logger.info(`Plan updated: ${id}`);
    return this.getPlanById(id) as Promise<Plan>;
  }

  async deletePlan(id: string): Promise<void> {
    await pool.execute('UPDATE plans SET deletedAt = NOW() WHERE id = ?', [id]);
    logger.info(`Plan soft deleted: ${id}`);
  }
}

export default new PlanService();

