import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, CalendarCheck, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Attendance } from '@/types';
import apiClient from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AttendanceList() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadAttendance();
    loadAllMembers();
  }, [selectedDate]);

  const loadAttendance = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAttendanceList({
        date: selectedDate,
        branchId: user?.branchId,
      });
      setAttendance(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load attendance',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllMembers = async () => {
    try {
      const members = await apiClient.getMembers({ branchId: user?.branchId, isActive: true });
      setAllMembers(members || []);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  // Create a map of members who have attendance
  const attendanceMap = new Map(attendance.map(a => [a.memberId, a]));
  
  // Combine all members with their attendance status
  const attendanceWithStatus = allMembers.map(member => {
    const att = attendanceMap.get(member.id);
    return {
      ...member,
      id: att?.id || member.id,
      memberId: member.id,
      memberName: member.fullName,
      registrationNo: member.registrationNo,
      date: selectedDate,
      checkInTime: att?.checkInTime || '-',
      batch: member.batch,
      isPresent: !!att,
    };
  });

  const filteredAttendance = attendanceWithStatus.filter((record) => {
    const matchesSearch =
      record.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.registrationNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = batchFilter === 'all' || record.batch === batchFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'present' && record.isPresent) ||
      (statusFilter === 'absent' && !record.isPresent);
    return matchesSearch && matchesBatch && matchesStatus;
  });

  const columns = [
    {
      key: 'registrationNo',
      header: 'Reg. No',
      render: (record: any) => (
        <a
          href={`/members/${record.memberId}`}
          className="text-primary hover:underline font-semibold cursor-pointer"
        >
          {record.registrationNo}
        </a>
      ),
    },
    { key: 'memberName', header: 'Member Name' },
    {
      key: 'batch',
      header: 'Batch',
      render: (record: any) => (
        <StatusBadge variant={record.batch === 'morning' ? 'info' : 'default'}>
          {record.batch}
        </StatusBadge>
      ),
    },
    { key: 'checkInTime', header: 'Check-in Time' },
    {
      key: 'isPresent',
      header: 'Status',
      render: (record: any) => (
        <StatusBadge variant={record.isPresent ? 'success' : 'danger'} pulse={record.isPresent}>
          {record.isPresent ? 'Present' : 'Absent'}
        </StatusBadge>
      ),
    },
  ];

  const handleExport = async () => {
    try {
      toast({
        title: 'Exporting...',
        description: 'Your Excel file is being prepared.',
      });
      
      const blob = await apiClient.exportAttendance({ 
        startDate: selectedDate, 
        endDate: selectedDate,
        branchId: user?.branchId 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_${selectedDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: 'Attendance list has been exported successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to export attendance',
        variant: 'destructive',
      });
    }
  };

  const presentCount = filteredAttendance.filter((r) => r.isPresent).length;
  const absentCount = filteredAttendance.filter((r) => !r.isPresent).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-display tracking-wide text-foreground">ATTENDANCE</h1>
            <p className="text-muted-foreground mt-1">Track daily member attendance</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-input"
            />
            <Button variant="outline" onClick={handleExport} className="hover:bg-accent/20">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display">{filteredAttendance.length}</p>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-display text-success">{presentCount}</p>
              <p className="text-sm text-muted-foreground">Present Today</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-display text-destructive">{absentCount}</p>
              <p className="text-sm text-muted-foreground">Absent Today</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or registration number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input"
            />
          </div>
          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger className="w-full md:w-40 bg-input">
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Batches</SelectItem>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 bg-input">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Data Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              data={filteredAttendance}
              columns={columns}
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAttendance.length / 10)}
              onPageChange={setCurrentPage}
              emptyMessage="No attendance records found for selected date."
            />
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
