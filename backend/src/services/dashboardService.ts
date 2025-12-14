import pool from '../config/database.js';
import { DashboardStats } from '../types/index.js';

export class DashboardService {
  async getDashboardStats(branchId?: string): Promise<DashboardStats> {
    const branchFilter = branchId ? 'AND branchId = ?' : '';
    const params = branchId ? [branchId] : [];

    // Total active members
    const [activeMembers] = await pool.execute(
      `SELECT COUNT(*) as count FROM members WHERE isActive = 1 ${branchFilter}`,
      params
    );
    const totalActiveMembers = (activeMembers as any[])[0].count;

    // Expired memberships
    const [expired] = await pool.execute(
      `SELECT COUNT(*) as count FROM members WHERE isActive = 1 AND planEndDate < CURDATE() ${branchFilter}`,
      params
    );
    const expiredMemberships = (expired as any[])[0].count;

    // Today's attendance
    const today = new Date().toISOString().split('T')[0];
    let todayQuery = 'SELECT COUNT(*) as count FROM attendance WHERE DATE(date) = ?';
    const todayParams: any[] = [today];
    if (branchId) {
      todayQuery += ' AND memberId IN (SELECT id FROM members WHERE branchId = ?)';
      todayParams.push(branchId);
    }
    const [todayAtt] = await pool.execute(todayQuery, todayParams);
    const todayAttendance = (todayAtt as any[])[0].count;

    // Monthly revenue
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    let revenueQuery = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payment_members
      WHERE MONTH(paymentDate) = ? AND YEAR(paymentDate) = ?
    `;
    const revenueParams: any[] = [currentMonth, currentYear];
    if (branchId) {
      revenueQuery += ' AND memberId IN (SELECT id FROM members WHERE branchId = ?)';
      revenueParams.push(branchId);
    }
    const [revenue] = await pool.execute(revenueQuery, revenueParams);
    const monthlyRevenue = parseFloat((revenue as any[])[0].total || 0);

    // Membership growth (last 6 months)
    const [growth] = await pool.execute(
      `SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as count
      FROM members
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      ${branchFilter}
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC`,
      params
    );

    // Attendance trend (last 7 days)
    const [attendance] = await pool.execute(
      `SELECT 
        DATE(date) as date,
        COUNT(*) as count
      FROM attendance
      WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ${branchId ? 'AND memberId IN (SELECT id FROM members WHERE branchId = ?)' : ''}
      GROUP BY DATE(date)
      ORDER BY date ASC`,
      params
    );

    // Revenue by month (last 6 months)
    const [revenueByMonth] = await pool.execute(
      `SELECT 
        DATE_FORMAT(paymentDate, '%Y-%m') as month,
        COALESCE(SUM(amount), 0) as amount
      FROM payment_members
      WHERE paymentDate >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      ${branchId ? 'AND memberId IN (SELECT id FROM members WHERE branchId = ?)' : ''}
      GROUP BY DATE_FORMAT(paymentDate, '%Y-%m')
      ORDER BY month ASC`,
      params
    );

    return {
      totalActiveMembers,
      expiredMemberships,
      todayAttendance,
      monthlyRevenue,
      membershipGrowth: (growth as any[]).map((g) => ({
        month: g.month,
        count: g.count,
      })),
      attendanceTrend: (attendance as any[]).map((a) => {
        try {
          // Handle date - could be Date object or string
          let dateValue: Date;
          if (a.date instanceof Date) {
            dateValue = a.date;
          } else if (typeof a.date === 'string') {
            dateValue = new Date(a.date);
          } else {
            dateValue = new Date();
          }
          return {
            date: dateValue.toISOString().split('T')[0],
            count: Number(a.count) || 0,
          };
        } catch (error) {
          return {
            date: new Date().toISOString().split('T')[0],
            count: Number(a.count) || 0,
          };
        }
      }),
      revenueByMonth: (revenueByMonth as any[]).map((r) => ({
        month: r.month,
        amount: parseFloat(r.amount || 0),
      })),
    };
  }
}

export default new DashboardService();

