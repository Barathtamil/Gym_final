import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Download, Edit, Trash2, RefreshCw, Phone, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Member } from '@/types';

// Mock members data
const mockMembers: Member[] = [
  {
    id: '1',
    registrationNo: 'MG001',
    fullName: 'Alex Johnson',
    dateOfBirth: '1995-05-15',
    age: 29,
    phoneNumber: '9876543210',
    batch: 'morning',
    branchId: '1',
    address: '123 Main Street',
    bloodGroup: 'O+',
    planId: '1',
    planName: 'Premium Monthly',
    planAmount: 2500,
    paidAmount: 2500,
    weight: 75,
    height: 175,
    gender: 'male',
    planStartDate: '2024-12-01',
    planEndDate: '2025-01-01',
    daysLeft: 19,
    balanceAmount: 0,
    isActive: true,
  },
  {
    id: '2',
    registrationNo: 'MG002',
    fullName: 'Sarah Williams',
    dateOfBirth: '1998-08-22',
    age: 26,
    phoneNumber: '9876543211',
    batch: 'evening',
    branchId: '1',
    address: '456 Oak Avenue',
    bloodGroup: 'A+',
    planId: '2',
    planName: 'Quarterly Plan',
    planAmount: 6500,
    paidAmount: 5000,
    weight: 58,
    height: 165,
    gender: 'female',
    planStartDate: '2024-11-15',
    planEndDate: '2025-02-15',
    daysLeft: 64,
    balanceAmount: 1500,
    isActive: true,
  },
  {
    id: '3',
    registrationNo: 'MG003',
    fullName: 'Mike Chen',
    dateOfBirth: '1992-03-10',
    age: 32,
    phoneNumber: '9876543212',
    batch: 'morning',
    branchId: '1',
    address: '789 Pine Road',
    bloodGroup: 'B+',
    planId: '1',
    planName: 'Premium Monthly',
    planAmount: 2500,
    paidAmount: 2500,
    weight: 82,
    height: 180,
    gender: 'male',
    planStartDate: '2024-12-10',
    planEndDate: '2024-12-15',
    daysLeft: 2,
    balanceAmount: 0,
    isActive: true,
  },
  {
    id: '4',
    registrationNo: 'MG004',
    fullName: 'Emma Davis',
    dateOfBirth: '1996-11-28',
    age: 28,
    phoneNumber: '9876543213',
    batch: 'evening',
    branchId: '1',
    address: '321 Elm Street',
    bloodGroup: 'AB+',
    planId: '3',
    planName: 'Annual Plan',
    planAmount: 22000,
    paidAmount: 22000,
    weight: 62,
    height: 168,
    gender: 'female',
    planStartDate: '2024-01-01',
    planEndDate: '2024-12-10',
    daysLeft: -3,
    balanceAmount: 0,
    isActive: false,
  },
];

export default function Members() {
  const [members] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pendingBalanceOnly, setPendingBalanceOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.registrationNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && member.isActive) ||
      (statusFilter === 'inactive' && !member.isActive);
    const matchesBalance = !pendingBalanceOnly || member.balanceAmount > 0;
    return matchesSearch && matchesStatus && matchesBalance;
  });

  const columns = [
    { key: 'registrationNo', header: 'Reg. No' },
    {
      key: 'fullName',
      header: 'Name',
      render: (member: Member) => (
        <div>
          <p className="font-semibold">{member.fullName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Phone className="w-3 h-3" />
            {member.phoneNumber}
          </div>
        </div>
      ),
    },
    { key: 'age', header: 'Age' },
    {
      key: 'batch',
      header: 'Batch',
      render: (member: Member) => (
        <StatusBadge variant={member.batch === 'morning' ? 'info' : 'default'}>
          {member.batch}
        </StatusBadge>
      ),
    },
    {
      key: 'daysLeft',
      header: 'Days Left',
      render: (member: Member) => (
        <span
          className={cn(
            'font-semibold',
            member.daysLeft <= 0 ? 'text-destructive' : member.daysLeft <= 3 ? 'text-warning' : 'text-success'
          )}
        >
          {member.daysLeft <= 0 ? 'Expired' : `${member.daysLeft} days`}
        </span>
      ),
    },
    {
      key: 'balanceAmount',
      header: 'Balance',
      render: (member: Member) => (
        <span className={member.balanceAmount > 0 ? 'text-warning font-semibold' : 'text-muted-foreground'}>
          ₹{member.balanceAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (member: Member) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-secondary/20 hover:text-secondary">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-destructive/20 hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-success/20 hover:text-success">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const getRowClassName = (member: Member) => {
    if (member.daysLeft <= 0) return 'row-danger';
    if (member.daysLeft <= 3) return 'row-warning';
    return '';
  };

  const handleExport = () => {
    toast({
      title: 'Exporting...',
      description: 'Your Excel file is being prepared.',
    });
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: 'Members list has been exported successfully.',
      });
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-display tracking-wide text-foreground">MEMBERS</h1>
            <p className="text-muted-foreground mt-1">Manage gym members and their subscriptions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Button variant="outline" onClick={handleExport} className="hover:bg-accent/20">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="btn-matrix">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">NEW MEMBER REGISTRATION</DialogTitle>
                </DialogHeader>
                <MemberForm onClose={() => setIsFormOpen(false)} />
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 bg-input">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 px-3 py-2 bg-input rounded-lg">
            <Checkbox
              id="pendingBalance"
              checked={pendingBalanceOnly}
              onCheckedChange={(checked) => setPendingBalanceOnly(checked as boolean)}
            />
            <Label htmlFor="pendingBalance" className="text-sm cursor-pointer">
              Pending Balance Only
            </Label>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <DataTable
            data={filteredMembers}
            columns={columns}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredMembers.length / 10)}
            onPageChange={setCurrentPage}
            rowClassName={getRowClassName}
            emptyMessage="No members found. Add your first member!"
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function MemberForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number | null>(null);

  const handleDobChange = (value: string) => {
    setDob(value);
    if (value) {
      const birthDate = new Date(value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Member Added!',
      description: 'New member has been registered successfully.',
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Registration No</Label>
          <Input placeholder="MG005" className="bg-input" />
        </div>
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input placeholder="John Doe" className="bg-input" />
        </div>
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Input type="date" value={dob} onChange={(e) => handleDobChange(e.target.value)} className="bg-input" />
        </div>
        <div className="space-y-2">
          <Label>Age (Auto-calculated)</Label>
          <Input value={age !== null ? `${age} years` : ''} readOnly className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input placeholder="9876543210" className="bg-input" />
        </div>
        <div className="space-y-2">
          <Label>Batch</Label>
          <Select defaultValue="morning">
            <SelectTrigger className="bg-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select defaultValue="male">
            <SelectTrigger className="bg-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Blood Group</Label>
          <Select>
            <SelectTrigger className="bg-input">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Address</Label>
          <Input placeholder="123 Main Street" className="bg-input" />
        </div>
        <div className="space-y-2">
          <Label>Weight (kg)</Label>
          <Input type="number" placeholder="70" className="bg-input" />
        </div>
        <div className="space-y-2">
          <Label>Height (cm)</Label>
          <Input type="number" placeholder="175" className="bg-input" />
        </div>
        <div className="space-y-2">
          <Label>Plan</Label>
          <Select>
            <SelectTrigger className="bg-input">
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="1">Premium Monthly - ₹2,500</SelectItem>
              <SelectItem value="2">Quarterly Plan - ₹6,500</SelectItem>
              <SelectItem value="3">Annual Plan - ₹22,000</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Plan Start Date</Label>
          <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-input" />
        </div>
        <div className="space-y-2">
          <Label>Plan Amount (₹)</Label>
          <Input type="number" placeholder="2500" className="bg-input" />
        </div>
        <div className="space-y-2">
          <Label>Paid Amount (₹)</Label>
          <Input type="number" placeholder="2500" className="bg-input" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="btn-matrix">
          Register Member
        </Button>
      </div>
    </form>
  );
}
