import pool from '../config/database.js';
import { DashboardStats } from '../types/dashboard.js';

export class StatisticsService {
  async getStatistics(filters?: {
    year?: string;
    month?: string;
    startDate?: string;
    endDate?: string;
    branchId?: string;
  }): Promise<DashboardStats> {
    const branchFilter = filters?.branchId ? 'AND branchId = ?' : '';
    const params: any[] = filters?.branchId ? [filters.branchId] : [];

    // Total active members (current, not filtered by date)
    const [activeMembers] = await pool.execute(
      `SELECT COUNT(*) as count FROM members WHERE isActive = 1 ${branchFilter}`,
      params
    );
    const totalActiveMembers = (activeMembers as any[])[0].count;

    // Expired memberships (current)
    const [expired] = await pool.execute(
      `SELECT COUNT(*) as count FROM members WHERE isActive = 1 AND planEndDate < CURDATE() ${branchFilter}`,
      params
    );
    const expiredMemberships = (expired as any[])[0].count;

    // Build date filters for trends
    let attendanceDateFilter = '';
    let attendanceDateParams: any[] = [];

    if (filters?.year && filters?.month) {
      attendanceDateFilter = `WHERE YEAR(date) = ? AND MONTH(date) = ?`;
      attendanceDateParams = [parseInt(filters.year), parseInt(filters.month)];
    } else if (filters?.year) {
      attendanceDateFilter = `WHERE YEAR(date) = ?`;
      attendanceDateParams = [parseInt(filters.year)];
    } else if (filters?.startDate && filters?.endDate) {
      attendanceDateFilter = `WHERE DATE(date) >= ? AND DATE(date) <= ?`;
      attendanceDateParams = [filters.startDate, filters.endDate];
    } else {
      attendanceDateFilter = `WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    }

    if (filters?.branchId) {
      attendanceDateFilter += ' AND memberId IN (SELECT id FROM members WHERE branchId = ?)';
      attendanceDateParams.push(filters.branchId);
    }

    // Total attendance (within date range)
    const [totalAtt] = await pool.execute(
      `SELECT COUNT(*) as count FROM attendance ${attendanceDateFilter}`,
      attendanceDateParams
    );
    const totalAttendance = (totalAtt as any[])[0].count;

    // Revenue date filter
    let revenueDateFilter = '';
    let revenueDateParams: any[] = [];

    if (filters?.year && filters?.month) {
      revenueDateFilter = `WHERE YEAR(paymentDate) = ? AND MONTH(paymentDate) = ?`;
      revenueDateParams = [parseInt(filters.year), parseInt(filters.month)];
    } else if (filters?.year) {
      revenueDateFilter = `WHERE YEAR(paymentDate) = ?`;
      revenueDateParams = [parseInt(filters.year)];
    } else if (filters?.startDate && filters?.endDate) {
      revenueDateFilter = `WHERE DATE(paymentDate) >= ? AND DATE(paymentDate) <= ?`;
      revenueDateParams = [filters.startDate, filters.endDate];
    } else {
      revenueDateFilter = `WHERE paymentDate >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`;
    }

    if (filters?.branchId) {
      revenueDateFilter += ' AND memberId IN (SELECT id FROM members WHERE branchId = ?)';
      revenueDateParams.push(filters.branchId);
    }

    // Total revenue (within date range)
    const [revenue] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payment_members ${revenueDateFilter}`,
      revenueDateParams
    );
    const totalRevenue = parseFloat((revenue as any[])[0].total || 0);

    // Membership growth
    let growthDateFilter = '';
    let growthDateParams: any[] = [];

    if (filters?.year && filters?.month) {
      growthDateFilter = `WHERE YEAR(createdAt) = ? AND MONTH(createdAt) = ?`;
      growthDateParams = [parseInt(filters.year), parseInt(filters.month)];
    } else if (filters?.year) {
      growthDateFilter = `WHERE YEAR(createdAt) = ?`;
      growthDateParams = [parseInt(filters.year)];
    } else if (filters?.startDate && filters?.endDate) {
      growthDateFilter = `WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ?`;
      growthDateParams = [filters.startDate, filters.endDate];
    } else {
      growthDateFilter = `WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`;
    }

    if (branchFilter) {
      growthDateFilter += ` ${branchFilter}`;
      growthDateParams.push(...params);
    }

    const [growth] = await pool.execute(
      `SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as count
      FROM members
      ${growthDateFilter}
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC`,
      growthDateParams
    );

    // Attendance trend
    const [attendance] = await pool.execute(
      `SELECT 
        DATE(date) as date,
        COUNT(*) as count
      FROM attendance
      ${attendanceDateFilter}
      GROUP BY DATE(date)
      ORDER BY date ASC`,
      attendanceDateParams
    );

    // Revenue by month
    let revenueByMonthDateFilter = '';
    let revenueByMonthDateParams: any[] = [];

    if (filters?.year && filters?.month) {
      revenueByMonthDateFilter = `WHERE YEAR(paymentDate) = ? AND MONTH(paymentDate) = ?`;
      revenueByMonthDateParams = [parseInt(filters.year), parseInt(filters.month)];
    } else if (filters?.year) {
      revenueByMonthDateFilter = `WHERE YEAR(paymentDate) = ?`;
      revenueByMonthDateParams = [parseInt(filters.year)];
    } else if (filters?.startDate && filters?.endDate) {
      revenueByMonthDateFilter = `WHERE DATE(paymentDate) >= ? AND DATE(paymentDate) <= ?`;
      revenueByMonthDateParams = [filters.startDate, filters.endDate];
    } else {
      revenueByMonthDateFilter = `WHERE paymentDate >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`;
    }

    if (filters?.branchId) {
      revenueByMonthDateFilter += ' AND memberId IN (SELECT id FROM members WHERE branchId = ?)';
      revenueByMonthDateParams.push(filters.branchId);
    }

    const [revenueByMonth] = await pool.execute(
      `SELECT 
        DATE_FORMAT(paymentDate, '%Y-%m') as month,
        COALESCE(SUM(amount), 0) as amount
      FROM payment_members
      ${revenueByMonthDateFilter}
      GROUP BY DATE_FORMAT(paymentDate, '%Y-%m')
      ORDER BY month ASC`,
      revenueByMonthDateParams
    );

    return {
      totalActiveMembers,
      expiredMemberships,
      todayAttendance: totalAttendance,
      monthlyRevenue: totalRevenue,
      totalAttendance,
      totalRevenue,
      membershipGrowth: (growth as any[]).map((g) => ({
        month: g.month,
        count: g.count,
      })),
      attendanceTrend: (attendance as any[]).map((a) => {
        try {
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

export default new StatisticsService();
