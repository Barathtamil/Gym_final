import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Download, Edit, Trash2, RefreshCw, Phone, MapPin, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Member } from '@/types';
import apiClient from '@/lib/api';
import { useAuth } from '@/context/AuthContext';


export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pendingBalanceOnly, setPendingBalanceOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [memberToRenew, setMemberToRenew] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
    loadBranches();
    loadPlans();
  }, []);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getMembers({ branchId: user?.branchId });
      setMembers(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const data = await apiClient.getBranches();
      setBranches(data || []);
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const data = await apiClient.getPlans();
      setPlans(data || []);
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

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
      render: (member: Member) => {
        // Calculate balance from stored values: planAmount - paidAmount
        const planAmount = member.planAmount || 0;
        const paidAmount = member.paidAmount || 0;
        const balance = planAmount - paidAmount;
        return (
          <span className={balance > 0 ? 'text-warning font-semibold' : 'text-muted-foreground'}>
            ₹{balance.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (member: Member) => (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-secondary/20 hover:text-secondary"
                  onClick={() => handleEdit(member)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Member</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-destructive/20 hover:text-destructive"
                  onClick={() => handleDeleteClick(member)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Member</p>
              </TooltipContent>
            </Tooltip>
            {member.daysLeft <= 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-success/20 hover:text-success"
                    onClick={() => handleRenewClick(member)}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Renew Membership</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
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

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      await apiClient.deleteMember(memberToDelete.id);
      toast({
        title: 'Success',
        description: 'Member deleted successfully',
      });
      loadMembers();
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete member',
        variant: 'destructive',
      });
    }
  };

  const handleRenewClick = (member: Member) => {
    setMemberToRenew(member);
    setRenewDialogOpen(true);
  };

  const handleRenew = async (planId: string, durationMonths: number) => {
    if (!memberToRenew) return;
    try {
      await apiClient.renewMember(memberToRenew.id, planId, durationMonths);
      toast({
        title: 'Success',
        description: 'Member renewed successfully',
      });
      loadMembers();
      setRenewDialogOpen(false);
      setMemberToRenew(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to renew member',
        variant: 'destructive',
      });
    }
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
                  <DialogTitle className="text-2xl font-display">
                    {isEditMode ? 'EDIT MEMBER' : 'NEW MEMBER REGISTRATION'}
                  </DialogTitle>
                </DialogHeader>
                <MemberForm
                  onClose={() => {
                    setIsFormOpen(false);
                    setIsEditMode(false);
                    setSelectedMember(null);
                    loadMembers();
                  }}
                  branches={branches}
                  plans={plans}
                  member={isEditMode ? selectedMember : null}
                />
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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              data={filteredMembers}
              columns={columns}
              currentPage={currentPage}
              totalPages={Math.ceil(filteredMembers.length / 10)}
              onPageChange={setCurrentPage}
              rowClassName={getRowClassName}
              emptyMessage="No members found. Add your first member!"
            />
          )}
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-border max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-display text-foreground">Delete Member</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground pt-2">
                Are you sure you want to delete <span className="font-semibold text-foreground">{memberToDelete?.fullName}</span>? 
                <br />
                <span className="text-destructive mt-2 block">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel className="bg-input hover:bg-accent/20 border-border">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Renew Dialog */}
        <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Renew Membership</DialogTitle>
            </DialogHeader>
            {memberToRenew && (
              <RenewMemberForm
                member={memberToRenew}
                plans={plans}
                onClose={() => {
                  setRenewDialogOpen(false);
                  setMemberToRenew(null);
                }}
                onRenew={handleRenew}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function MemberForm({ onClose, branches, plans, member }: { onClose: () => void; branches: any[]; plans: any[]; member?: Member | null }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditMode = !!member;
  const [dob, setDob] = useState(member?.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '');
  const [age, setAge] = useState<number | null>(member?.age || null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(member?.profileImage || null);
  const [formData, setFormData] = useState({
    registrationNo: member?.registrationNo || '',
    fullName: member?.fullName || '',
    dateOfBirth: member?.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
    phoneNumber: member?.phoneNumber || '',
    batch: (member?.batch || 'morning') as 'morning' | 'evening',
    branchId: member?.branchId || user?.branchId || '',
    address: member?.address || '',
    bloodGroup: member?.bloodGroup || '',
    planId: member?.planId || '',
    weight: member?.weight?.toString() || '',
    height: member?.height?.toString() || '',
    gender: (member?.gender || 'male') as 'male' | 'female' | 'other',
    planStartDate: member?.planStartDate ? new Date(member.planStartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    planEndDate: member?.planEndDate ? new Date(member.planEndDate).toISOString().split('T')[0] : '',
    planAmount: member?.planAmount || 0,
    paidAmount: member?.paidAmount || 0,
  });

  const handleDobChange = (value: string) => {
    setDob(value);
    setFormData({ ...formData, dateOfBirth: value });
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

  const handlePlanChange = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      const startDate = new Date(formData.planStartDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + plan.duration);
      setFormData({
        ...formData,
        planId,
        planAmount: plan.amount,
        planEndDate: endDate.toISOString().split('T')[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: All fields required except profile image
    if (!formData.registrationNo || formData.registrationNo.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please enter registration number',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.fullName || formData.fullName.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please enter full name',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.dateOfBirth) {
      toast({
        title: 'Validation Error',
        description: 'Please select date of birth',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please enter phone number',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.address || formData.address.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please enter address',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.bloodGroup || formData.bloodGroup.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please select blood group',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.planId || formData.planId.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please select plan',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.planStartDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select plan start date',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.planEndDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select plan end date',
        variant: 'destructive',
      });
      return;
    }

    // Validation: Weight, Height, Plan Amount, Paid Amount should not be zero
    const weightValue = formData.weight ? parseFloat(formData.weight) : 0;
    if (!formData.weight || weightValue <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid weight (greater than zero)',
        variant: 'destructive',
      });
      return;
    }

    const heightValue = formData.height ? parseFloat(formData.height) : 0;
    if (!formData.height || heightValue <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid height (greater than zero)',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.planAmount || formData.planAmount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid plan amount (greater than zero)',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.paidAmount || formData.paidAmount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid paid amount (greater than zero)',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEditMode && member) {
        await apiClient.updateMemberWithImage(member.id, {
          ...formData,
          age: age || 0,
          weight: weightValue,
          height: heightValue,
          planAmount: formData.planAmount,
          paidAmount: formData.paidAmount,
        }, profileImage);
        toast({
          title: 'Member Updated!',
          description: 'Member has been updated successfully.',
        });
      } else {
        await apiClient.createMemberWithImage({
          ...formData,
          age: age || 0,
          weight: weightValue,
          height: heightValue,
          planAmount: formData.planAmount,
          paidAmount: formData.paidAmount,
        }, profileImage);
        toast({
          title: 'Member Added!',
          description: 'New member has been registered successfully.',
        });
      }
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEditMode ? 'update' : 'register'} member`,
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image Upload - Full Width */}
      <ImageUpload
        value={profileImage || existingImageUrl || null}
        onChange={(file) => {
          setProfileImage(file);
          if (file) {
            setExistingImageUrl(null);
          }
        }}
        label="Profile Picture"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Registration No</Label>
          <Input
            value={formData.registrationNo}
            onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
            placeholder="MG005"
            className="bg-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="John Doe"
            className="bg-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Input
            type="date"
            value={dob}
            onChange={(e) => handleDobChange(e.target.value)}
            className="bg-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Age (Auto-calculated)</Label>
          <Input value={age !== null ? `${age} years` : ''} readOnly className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="9876543210"
            className="bg-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Batch</Label>
          <Select
            value={formData.batch}
            onValueChange={(value) => setFormData({ ...formData, batch: value as 'morning' | 'evening' })}
          >
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
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value as any })}
          >
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
          <Select
            value={formData.bloodGroup}
            onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
          >
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
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main Street"
            className="bg-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Weight (kg)</Label>
          <Input
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            placeholder="70"
            className="bg-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Height (cm)</Label>
          <Input
            type="number"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            placeholder="175"
            className="bg-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Plan</Label>
          <Select value={formData.planId} onValueChange={handlePlanChange}>
            <SelectTrigger className="bg-input">
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} - ₹{plan.amount.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Plan Start Date</Label>
          <Input
            type="date"
            value={formData.planStartDate}
            onChange={(e) => {
              const startDate = e.target.value;
              if (formData.planId) {
                const plan = plans.find((p) => p.id === formData.planId);
                if (plan) {
                  const endDate = new Date(startDate);
                  endDate.setMonth(endDate.getMonth() + plan.duration);
                  setFormData({
                    ...formData,
                    planStartDate: startDate,
                    planEndDate: endDate.toISOString().split('T')[0],
                  });
                }
              } else {
                setFormData({ ...formData, planStartDate: startDate });
              }
            }}
            className="bg-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Plan End Date</Label>
          <Input
            type="date"
            value={formData.planEndDate}
            readOnly
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label>Plan Amount (₹)</Label>
          <Input
            type="number"
            value={formData.planAmount}
            onChange={(e) => setFormData({ ...formData, planAmount: parseFloat(e.target.value) || 0 })}
            placeholder="2500"
            className="bg-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Paid Amount (₹)</Label>
          <Input
            type="number"
            value={formData.paidAmount}
            onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) || 0 })}
            placeholder="2500"
            className="bg-input"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="btn-matrix">
          {isEditMode ? 'Update Member' : 'Register Member'}
        </Button>
      </div>
    </form>
  );
}

function RenewMemberForm({ member, plans, onClose, onRenew }: { member: Member; plans: any[]; onClose: () => void; onRenew: (planId: string, durationMonths: number) => void }) {
  const [selectedPlanId, setSelectedPlanId] = useState(member.planId || '');
  const [durationMonths, setDurationMonths] = useState(1);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlanId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a plan',
        variant: 'destructive',
      });
      return;
    }

    if (durationMonths <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Duration must be greater than zero',
        variant: 'destructive',
      });
      return;
    }

    onRenew(selectedPlanId, durationMonths);
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Member</Label>
        <Input value={member.fullName} readOnly className="bg-muted" />
      </div>
      <div className="space-y-2">
        <Label>Select Plan</Label>
        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
          <SelectTrigger className="bg-input">
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name} - ₹{plan.amount.toLocaleString()} ({plan.duration} months)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Duration (Months)</Label>
        <Input
          type="number"
          value={durationMonths}
          onChange={(e) => setDurationMonths(parseInt(e.target.value) || 1)}
          min="1"
          className="bg-input"
        />
      </div>
      {selectedPlan && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Plan: <span className="font-semibold text-foreground">{selectedPlan.name}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Amount: <span className="font-semibold text-foreground">₹{selectedPlan.amount.toLocaleString()}</span>
          </p>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="btn-matrix">
          Renew Membership
        </Button>
      </div>
    </form>
  );
}
