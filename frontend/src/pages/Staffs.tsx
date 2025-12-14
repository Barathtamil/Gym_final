import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, UserPlus, Shield, UserCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function Staffs() {
  const [staff, setStaff] = useState<User[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'staff' as 'admin' | 'staff',
    branchId: user?.branchId || '',
    mobileNumber: '',
  });

  useEffect(() => {
    loadStaff();
    loadBranches();
  }, []);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getStaff();
      setStaff(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load staff',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const data = await apiClient.getBranches();
      setBranches(data);
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mobileNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedStaff(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'staff',
      branchId: user?.branchId || '',
      mobileNumber: '',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (staffMember: User) => {
    setIsEditMode(true);
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      username: staffMember.username,
      password: '',
      role: staffMember.role as 'admin' | 'staff',
      branchId: staffMember.branchId,
      mobileNumber: staffMember.mobileNumber || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode && selectedStaff) {
        const updateData: any = {
          name: formData.name,
          role: formData.role,
          branchId: formData.branchId,
          mobileNumber: formData.mobileNumber,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        if (formData.username !== selectedStaff.username) {
          updateData.username = formData.username;
        }

        await apiClient.updateStaff(selectedStaff.id, updateData);
        toast({
          title: 'Success',
          description: 'Staff updated successfully',
        });
      } else {
        await apiClient.createStaff(formData);
        toast({
          title: 'Success',
          description: 'Staff created successfully',
        });
      }

      setIsFormOpen(false);
      loadStaff();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save staff',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this staff member?')) {
      return;
    }

    try {
      await apiClient.deleteStaff(id);
      toast({
        title: 'Success',
        description: 'Staff deactivated successfully',
      });
      loadStaff();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate staff',
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (staffMember: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            {staffMember.role === 'admin' ? (
              <Shield className="w-5 h-5 text-primary" />
            ) : (
              <UserCheck className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-semibold">{staffMember.name}</p>
            <p className="text-xs text-muted-foreground">@{staffMember.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (staffMember: User) => (
        <StatusBadge variant={staffMember.role === 'admin' ? 'info' : 'default'}>
          {staffMember.role.toUpperCase()}
        </StatusBadge>
      ),
    },
    {
      key: 'mobileNumber',
      header: 'Mobile',
      render: (staffMember: User) => staffMember.mobileNumber || '-',
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (staffMember: User) => (
        <StatusBadge variant={staffMember.isActive ? 'success' : 'danger'}>
          {staffMember.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (staffMember: User) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(staffMember)}
            className="h-8 w-8"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(staffMember.id)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display tracking-wide">Staff Management</h1>
            <p className="text-muted-foreground mt-1">Manage admin and staff accounts</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="btn-matrix">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit Staff' : 'Add New Staff'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      disabled={isEditMode}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {isEditMode ? '(leave blank to keep current)' : '*'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!isEditMode}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value as 'admin' | 'staff' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branchId">Branch *</Label>
                    <Select
                      value={formData.branchId}
                      onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-matrix">
                    {isEditMode ? 'Update' : 'Create'} Staff
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, username, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card border border-border/50"
        >
          <DataTable
            data={filteredStaff}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No staff members found"
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

