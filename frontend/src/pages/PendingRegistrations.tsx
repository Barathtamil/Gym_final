import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Eye, Loader2, UserPlus, Calendar, Phone, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface PendingRegistration {
  id: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  phoneNumber: string;
  batch: 'morning' | 'evening';
  branchId: string;
  branchName?: string;
  address?: string;
  aadharNumber?: string;
  bloodGroup?: string;
  weight?: number;
  height?: number;
  gender: 'male' | 'female' | 'other';
  profileImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function PendingRegistrations() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<PendingRegistration | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [approvalData, setApprovalData] = useState({
    planId: '',
    planStartDate: new Date().toISOString().split('T')[0],
    planEndDate: '',
    planAmount: 0,
    paidAmount: 0,
    registrationNo: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [registrationsData, plansData, branchesData] = await Promise.all([
        apiClient.getPendingRegistrations({ status: 'pending' }),
        apiClient.getPlans(),
        apiClient.getBranches(),
      ]);

      // Enrich registrations with branch names
      const enrichedRegistrations = (registrationsData || []).map((reg: any) => ({
        ...reg,
        branchName: branchesData.find((b: any) => b.id === reg.branchId)?.name || 'Unknown',
      }));

      setRegistrations(enrichedRegistrations);
      setPlans(plansData || []);
      setBranches(branchesData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load pending registrations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (registration: PendingRegistration) => {
    setSelectedRegistration(registration);
    setIsViewDialogOpen(true);
  };

  const handleApproveClick = (registration: PendingRegistration) => {
    setSelectedRegistration(registration);
    setApprovalData({
      planId: '',
      planStartDate: new Date().toISOString().split('T')[0],
      planEndDate: '',
      planAmount: 0,
      paidAmount: 0,
      registrationNo: '',
    });
    setIsApproveDialogOpen(true);
  };

  const handlePlanChange = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      const startDate = new Date(approvalData.planStartDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.duration);
      setApprovalData({
        ...approvalData,
        planId,
        planAmount: plan.amount,
        planEndDate: endDate.toISOString().split('T')[0],
      });
    }
  };

  const handleApprove = async () => {
    if (!selectedRegistration) return;

    if (!approvalData.planId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a plan',
        variant: 'destructive',
      });
      return;
    }

    if (!approvalData.planStartDate || !approvalData.planEndDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select plan dates',
        variant: 'destructive',
      });
      return;
    }

    if (approvalData.planAmount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Plan amount must be greater than zero',
        variant: 'destructive',
      });
      return;
    }

    if (approvalData.paidAmount < 0 || approvalData.paidAmount > approvalData.planAmount) {
      toast({
        title: 'Validation Error',
        description: 'Paid amount must be between 0 and plan amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiClient.approvePendingRegistration(selectedRegistration.id, approvalData);
      toast({
        title: 'Success',
        description: 'Member registration approved and member created successfully',
      });
      setIsApproveDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve registration',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this registration?')) return;

    try {
      await apiClient.rejectPendingRegistration(id);
      toast({
        title: 'Success',
        description: 'Registration rejected successfully',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject registration',
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Name',
      render: (registration: PendingRegistration) => (
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">{registration.fullName}</span>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      header: 'Phone',
      render: (registration: PendingRegistration) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span>{registration.phoneNumber}</span>
        </div>
      ),
    },
    {
      key: 'branchName',
      header: 'Branch',
      render: (registration: PendingRegistration) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{registration.branchName || 'Unknown'}</span>
        </div>
      ),
    },
    {
      key: 'batch',
      header: 'Batch',
      render: (registration: PendingRegistration) => (
        <Badge variant={registration.batch === 'morning' ? 'default' : 'secondary'}>
          {registration.batch}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (registration: PendingRegistration) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(registration.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (registration: PendingRegistration) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(registration)}
            className="hover:bg-primary/10"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleApproveClick(registration)}
            className="hover:bg-success/10 hover:text-success"
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReject(registration.id)}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-display tracking-wide text-foreground">PENDING REGISTRATIONS</h1>
          <p className="text-muted-foreground mt-1">Review and approve new member registrations</p>
        </motion.div>

        <Card className="glass-card p-6">
          {registrations.length > 0 ? (
            <DataTable
              data={registrations}
              columns={columns}
              currentPage={1}
              totalPages={Math.ceil(registrations.length / 10)}
              onPageChange={() => {}}
              emptyMessage="No pending registrations found"
            />
          ) : (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending registrations</p>
            </div>
          )}
        </Card>

        {/* View Registration Dialog */}
        {selectedRegistration && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">REGISTRATION DETAILS</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p className="font-semibold">{selectedRegistration.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone Number</Label>
                    <p className="font-semibold">{selectedRegistration.phoneNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date of Birth</Label>
                    <p className="font-semibold">{new Date(selectedRegistration.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Age</Label>
                    <p className="font-semibold">{selectedRegistration.age} years</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Gender</Label>
                    <p className="font-semibold capitalize">{selectedRegistration.gender}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Blood Group</Label>
                    <p className="font-semibold">{selectedRegistration.bloodGroup}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Batch</Label>
                    <Badge variant={selectedRegistration.batch === 'morning' ? 'default' : 'secondary'}>
                      {selectedRegistration.batch}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Branch</Label>
                    <p className="font-semibold">{selectedRegistration.branchName || 'Unknown'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Weight</Label>
                    <p className="font-semibold">{selectedRegistration.weight} kg</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Height</Label>
                    <p className="font-semibold">{selectedRegistration.height} cm</p>
                  </div>
                  {selectedRegistration.aadharNumber && (
                    <div>
                      <Label className="text-muted-foreground">Aadhar Number</Label>
                      <p className="font-semibold">{selectedRegistration.aadharNumber}</p>
                    </div>
                  )}
                  {selectedRegistration.address && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Address</Label>
                      <p className="font-semibold">{selectedRegistration.address}</p>
                    </div>
                  )}
                </div>
                {selectedRegistration.profileImage && (
                  <div>
                    <Label className="text-muted-foreground">Profile Image</Label>
                    <div className="mt-2">
                      <img
                        src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${selectedRegistration.profileImage}`}
                        alt={selectedRegistration.fullName}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Approve Registration Dialog */}
        {selectedRegistration && (
          <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">APPROVE REGISTRATION</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Member Name</p>
                  <p className="font-semibold">{selectedRegistration.fullName}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plan *</Label>
                    <Select value={approvalData.planId} onValueChange={handlePlanChange}>
                      <SelectTrigger className="bg-input">
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} - ₹{plan.amount} ({plan.duration} days)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Registration No (Optional)</Label>
                    <Input
                      value={approvalData.registrationNo}
                      onChange={(e) => setApprovalData({ ...approvalData, registrationNo: e.target.value.toUpperCase() })}
                      placeholder="0001"
                      className="bg-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plan Start Date *</Label>
                    <Input
                      type="date"
                      value={approvalData.planStartDate}
                      onChange={(e) => {
                        const startDate = e.target.value;
                        const plan = plans.find((p) => p.id === approvalData.planId);
                        let endDate = '';
                        if (plan && startDate) {
                          const end = new Date(startDate);
                          end.setDate(end.getDate() + plan.duration);
                          endDate = end.toISOString().split('T')[0];
                        }
                        setApprovalData({ ...approvalData, planStartDate: startDate, planEndDate: endDate });
                      }}
                      className="bg-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plan End Date *</Label>
                    <Input
                      type="date"
                      value={approvalData.planEndDate}
                      onChange={(e) => setApprovalData({ ...approvalData, planEndDate: e.target.value })}
                      className="bg-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plan Amount (₹) *</Label>
                    <Input
                      type="number"
                      value={approvalData.planAmount}
                      onChange={(e) => setApprovalData({ ...approvalData, planAmount: parseFloat(e.target.value) || 0 })}
                      className="bg-input"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Paid Amount (₹) *</Label>
                    <Input
                      type="number"
                      value={approvalData.paidAmount}
                      onChange={(e) => setApprovalData({ ...approvalData, paidAmount: parseFloat(e.target.value) || 0 })}
                      className="bg-input"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleApprove} className="btn-matrix">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Create Member
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}

