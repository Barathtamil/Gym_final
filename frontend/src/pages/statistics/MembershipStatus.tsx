import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
} from 'recharts';
import apiClient from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-border">
        <p className="text-sm font-semibold text-foreground">{payload[0].name}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          Count: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function MembershipStatus() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'year' | 'range'>('year');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return year.toString();
  });

  useEffect(() => {
    // Only auto-load for year filter, not for date range
    if (filterType === 'year') {
      loadData();
    }
  }, [filterType, selectedYear]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      let filters: any = {};
      
      if (filterType === 'year') {
        filters.year = selectedYear;
      } else if (filterType === 'range') {
        if (dateFrom) filters.startDate = dateFrom;
        if (dateTo) filters.endDate = dateTo;
      }
      if (user?.branchId) filters.branchId = user.branchId;

      const stats = await apiClient.getStatistics(filters);
      const formattedData = [
        { name: 'Active', value: stats.totalActiveMembers || 0, color: 'hsl(145, 80%, 45%)' },
        { name: 'Expiring Soon', value: Math.floor((stats.totalActiveMembers || 0) * 0.15), color: 'hsl(35, 100%, 50%)' },
        { name: 'Expired', value: stats.expiredMemberships || 0, color: 'hsl(0, 84%, 60%)' },
      ];
      setData(formattedData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load membership status data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-accent/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-display tracking-wide text-foreground">MEMBERSHIP STATUS</h1>
              <p className="text-muted-foreground mt-1">View membership status distribution</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex flex-wrap items-center gap-4">
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-32 bg-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year">Year</SelectItem>
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
                  onClick={loadData}
                  className="bg-primary hover:bg-primary/90"
                >
                  Apply Filter
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display tracking-wide">Membership Status</h3>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Users className="w-4 h-4" />
              <span>{filterType === 'year' ? selectedYear : 'Selected Range'}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={500}>
            {data.length > 0 && data.some(d => d.value > 0) ? (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={150}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
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
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available for the selected period
              </div>
            )}
          </ResponsiveContainer>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

