import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, CalendarCheck, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Attendance } from '@/types';

// Mock attendance data
const mockAttendance: (Attendance & { isPresent: boolean })[] = [
  {
    id: '1',
    memberId: '1',
    memberName: 'Alex Johnson',
    registrationNo: 'MG001',
    date: '2024-12-13',
    checkInTime: '06:30 AM',
    batch: 'morning',
    isPresent: true,
  },
  {
    id: '2',
    memberId: '2',
    memberName: 'Sarah Williams',
    registrationNo: 'MG002',
    date: '2024-12-13',
    checkInTime: '05:45 PM',
    batch: 'evening',
    isPresent: true,
  },
  {
    id: '3',
    memberId: '3',
    memberName: 'Mike Chen',
    registrationNo: 'MG003',
    date: '2024-12-13',
    checkInTime: '-',
    batch: 'morning',
    isPresent: false,
  },
  {
    id: '4',
    memberId: '5',
    memberName: 'John Smith',
    registrationNo: 'MG005',
    date: '2024-12-13',
    checkInTime: '07:15 AM',
    batch: 'morning',
    isPresent: true,
  },
  {
    id: '5',
    memberId: '6',
    memberName: 'Lisa Brown',
    registrationNo: 'MG006',
    date: '2024-12-13',
    checkInTime: '-',
    batch: 'evening',
    isPresent: false,
  },
];

export default function AttendanceList() {
  const [attendance] = useState(mockAttendance);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const filteredAttendance = attendance.filter((record) => {
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
    { key: 'registrationNo', header: 'Reg. No' },
    { key: 'memberName', header: 'Member Name' },
    {
      key: 'batch',
      header: 'Batch',
      render: (record: typeof mockAttendance[0]) => (
        <StatusBadge variant={record.batch === 'morning' ? 'info' : 'default'}>
          {record.batch}
        </StatusBadge>
      ),
    },
    { key: 'checkInTime', header: 'Check-in Time' },
    {
      key: 'isPresent',
      header: 'Status',
      render: (record: typeof mockAttendance[0]) => (
        <StatusBadge variant={record.isPresent ? 'success' : 'danger'} pulse={record.isPresent}>
          {record.isPresent ? 'Present' : 'Absent'}
        </StatusBadge>
      ),
    },
  ];

  const handleExport = () => {
    toast({
      title: 'Exporting...',
      description: 'Your Excel file is being prepared.',
    });
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: 'Attendance list has been exported successfully.',
      });
    }, 2000);
  };

  const presentCount = filteredAttendance.filter((r) => r.isPresent).length;
  const absentCount = filteredAttendance.filter((r) => !r.isPresent).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-display tracking-wide text-foreground">ATTENDANCE</h1>
            <p className="text-muted-foreground mt-1">Track daily member attendance</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
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
              <p className="text-sm text-muted-foreground">Total Records</p>
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
          <DataTable
            data={filteredAttendance}
            columns={columns}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredAttendance.length / 10)}
            onPageChange={setCurrentPage}
            emptyMessage="No attendance records found for today."
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
