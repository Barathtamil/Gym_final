export interface DashboardStats {
  totalActiveMembers: number;
  expiredMemberships: number;
  todayAttendance: number;
  monthlyRevenue: number;
  totalAttendance?: number;
  totalRevenue?: number;
  membershipGrowth: Array<{ month: string; count: number }>;
  attendanceTrend: Array<{ date: string; count: number }>;
  revenueByMonth: Array<{ month: string; amount: number }>;
}

