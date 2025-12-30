import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, UserMinus, CalendarCheck, DollarSign, TrendingUp, TrendingDown, Loader2, Filter, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KpiCard } from '@/components/ui/kpi-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import apiClient from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-border">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.name === 'Revenue' 
              ? `₹${entry.value.toLocaleString()}` 
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'year' | 'month' | 'range'>('year');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Generate years list (current year and 2 years back)
  const years = Array.from({ length: 3 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return year.toString();
  });

  // Generate months list
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (user) {
      const defaultBranch = user.role === 'admin' ? 'all' : (user.branchId || 'all');
      if (branchFilter === 'all' && defaultBranch !== 'all') {
        setBranchFilter(defaultBranch);
      }
    }
  }, [user]);

  useEffect(() => {
    // Load statistics on mount and when filters change
    // Only auto-load for year and month filters, not for date range
    if (filterType !== 'range') {
      loadStatistics();
    } else {
      // For date range, load default dashboard stats initially
      if (!dateFrom && !dateTo) {
        loadDashboard();
      }
    }
  }, [filterType, selectedYear, selectedMonth, branchFilter]);

  const loadBranches = async () => {
    try {
      const data = await apiClient.getBranches();
      setBranches(data || []);
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const branchId = branchFilter && branchFilter !== 'all' ? branchFilter : undefined;
      const data = await apiClient.getDashboardStats(branchId);
      setStats(data);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      let filters: any = {};
      
      if (branchFilter && branchFilter !== 'all') {
        filters.branchId = branchFilter;
      }
      
      if (filterType === 'year') {
        filters.year = selectedYear;
      } else if (filterType === 'month') {
        filters.year = selectedYear;
        filters.month = selectedMonth;
      } else if (filterType === 'range') {
        if (dateFrom) filters.startDate = dateFrom;
        if (dateTo) filters.endDate = dateTo;
      }
      // Branch filter is already handled above
      
      const data = await apiClient.getStatistics(filters);
      setStats(data);
    } catch (error) {
      console.error('Statistics error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load statistics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      toast({
        title: 'Exporting...',
        description: 'Your statistics report is being prepared.',
      });
      
      let filters: any = {};
      if (filterType === 'year') {
        filters.year = selectedYear;
      } else if (filterType === 'month') {
        filters.year = selectedYear;
        filters.month = selectedMonth;
      } else if (filterType === 'range') {
        if (dateFrom) filters.startDate = dateFrom;
        if (dateTo) filters.endDate = dateTo;
      }
      
      const blob = await apiClient.exportStatistics(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = filterType === 'year' 
        ? `statistics_${selectedYear}.xlsx`
        : filterType === 'month'
        ? `statistics_${selectedYear}_${selectedMonth}.xlsx`
        : `statistics_${dateFrom}_to_${dateTo}.xlsx`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: 'Statistics report has been exported successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to export statistics',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !stats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Format data for charts - ensure we have data or provide defaults
  const membershipGrowth = stats.membershipGrowth && stats.membershipGrowth.length > 0
    ? stats.membershipGrowth.map((g: any) => ({
        month: g.month ? new Date(g.month + '-01').toLocaleDateString('en-US', { month: 'short' }) : '',
        count: Number(g.count) || 0,
      }))
    : [
        { month: 'Jul', count: 0 },
        { month: 'Aug', count: 0 },
        { month: 'Sep', count: 0 },
        { month: 'Oct', count: 0 },
        { month: 'Nov', count: 0 },
        { month: 'Dec', count: 0 },
      ];

  const attendanceTrend = stats.attendanceTrend && Array.isArray(stats.attendanceTrend) && stats.attendanceTrend.length > 0
    ? stats.attendanceTrend.map((a: any) => {
        try {
          const dateStr = a.date || '';
          const date = dateStr ? new Date(dateStr) : new Date();
          if (isNaN(date.getTime())) {
            return { date: '', count: 0 };
          }
          return {
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            count: Number(a.count) || 0,
          };
        } catch {
          return { date: '', count: 0 };
        }
      }).filter((item: any) => item.date !== '')
    : [
        { date: 'Mon', count: 0 },
        { date: 'Tue', count: 0 },
        { date: 'Wed', count: 0 },
        { date: 'Thu', count: 0 },
        { date: 'Fri', count: 0 },
        { date: 'Sat', count: 0 },
        { date: 'Sun', count: 0 },
      ];

  const revenueByMonth = stats.revenueByMonth && Array.isArray(stats.revenueByMonth) && stats.revenueByMonth.length > 0
    ? stats.revenueByMonth.map((r: any) => {
        try {
          const monthStr = r.month || '';
          const monthDate = monthStr ? new Date(monthStr + '-01') : new Date();
          return {
            month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
            amount: Number(r.amount) || 0,
          };
        } catch {
          return { month: '', amount: 0 };
        }
      })
    : [
        { month: 'Jul', amount: 0 },
        { month: 'Aug', amount: 0 },
        { month: 'Sep', amount: 0 },
        { month: 'Oct', amount: 0 },
        { month: 'Nov', amount: 0 },
        { month: 'Dec', amount: 0 },
      ];

  const membershipStatus = [
    { name: 'Active', value: stats.totalActiveMembers || 0, color: 'hsl(145, 80%, 45%)' },
    { name: 'Expiring Soon', value: Math.floor((stats.totalActiveMembers || 0) * 0.15), color: 'hsl(35, 100%, 50%)' },
    { name: 'Expired', value: stats.expiredMemberships || 0, color: 'hsl(0, 84%, 60%)' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-display tracking-wide text-foreground">DASHBOARD</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your gym overview.</p>
          </div>
          <Button onClick={handleExport} variant="outline" className="hover:bg-accent/20">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Filter By:</span>
            </div>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-full md:w-40 bg-input">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {user?.role === 'admin' && <SelectItem value="all">All Branches</SelectItem>}
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-32 bg-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="range">Date Range</SelectItem>
              </SelectContent>
            </Select>

            {filterType === 'year' && (
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32 bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filterType === 'month' && (
              <>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32 bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40 bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {filterType === 'range' && (
              <>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 bg-input border border-border rounded-md text-sm"
                  placeholder="From Date"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 bg-input border border-border rounded-md text-sm"
                  placeholder="To Date"
                />
                <Button
                  onClick={loadStatistics}
                  className="bg-primary hover:bg-primary/90"
                >
                  Apply Filter
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${user?.role === 'admin' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
          <KpiCard
            title="Total Active Members"
            value={stats.totalActiveMembers || 0}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
            variant="primary"
            delay={0}
          />
          <KpiCard
            title="Expired Memberships"
            value={stats.expiredMemberships || 0}
            icon={UserMinus}
            trend={{ value: 8, isPositive: false }}
            variant="default"
            delay={0.1}
          />
          <KpiCard
            title="Today's Attendance"
            value={stats.todayAttendance || 0}
            icon={CalendarCheck}
            trend={{ value: 5, isPositive: true }}
            variant="secondary"
            delay={0.2}
          />
          {user?.role === 'admin' && (
            <KpiCard
              title="Monthly Revenue"
              value={stats.monthlyRevenue || 0}
              icon={DollarSign}
              prefix="₹"
              trend={{ value: 24, isPositive: true }}
              variant="accent"
              delay={0.3}
            />
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Membership Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => navigate('/statistics/membership-growth')}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display tracking-wide">Membership Growth</h3>
              <div className="flex items-center gap-2 text-success text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Last 6 Months</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={membershipGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Members"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary-foreground))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Weekly Attendance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => navigate('/statistics/attendance-trend')}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display tracking-wide">Attendance Trend</h3>
              <div className="flex items-center gap-2 text-secondary text-sm">
                <CalendarCheck className="w-4 h-4" />
                <span>Last 7 Days</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="Attendance"
                  fill="hsl(var(--secondary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Revenue by Month - Admin Only */}
          {user?.role === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6 cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => navigate('/statistics/revenue-trend')}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display tracking-wide">Revenue Trend</h3>
                <div className="flex items-center gap-2 text-accent text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Last 6 Months</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="amount" 
                    name="Revenue"
                    fill="hsl(var(--accent))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Membership Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: user?.role === 'admin' ? 0.7 : 0.6 }}
            className={`glass-card p-6 cursor-pointer hover:bg-accent/5 transition-colors ${user?.role !== 'admin' ? 'lg:col-span-2' : ''}`}
            onClick={() => navigate('/statistics/membership-status')}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display tracking-wide">Membership Status</h3>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="w-4 h-4" />
                <span>All Members</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={membershipStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {membershipStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`grid grid-cols-2 ${user?.role === 'admin' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}
        >
          {[
            { label: 'Morning Batch', value: Math.floor((stats.todayAttendance || 0) * 0.6), trend: 'up' },
            { label: 'Evening Batch', value: Math.floor((stats.todayAttendance || 0) * 0.4), trend: 'up' },
            { label: 'New This Month', value: membershipGrowth[membershipGrowth.length - 1]?.count || 0, trend: 'up' },
            ...(user?.role === 'admin' ? [{ label: 'Renewals Due', value: stats.expiredMemberships || 0, trend: 'down' as const }] : []),
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="glass-card p-4 text-center"
            >
              <p className="text-2xl font-display text-foreground mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <div className={`flex items-center justify-center gap-1 mt-2 text-xs ${
                stat.trend === 'up' ? 'text-success' : 'text-warning'
              }`}>
                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{stat.trend === 'up' ? 'Increasing' : 'Attention'}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
