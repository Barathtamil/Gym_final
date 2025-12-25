import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  DollarSign,
  RefreshCw,
  Calendar,
  Phone,
  MapPin,
  User,
  CreditCard,
  CalendarCheck,
  Receipt,
  Loader2,
  Mail,
  FileText,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Member, Attendance, Plan } from '@/types';
import apiClient from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { MemberForm, PaymentForm, RenewMemberForm } from './Members';

interface Payment {
  id: string;
  memberId: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  invoiceNo?: string;
  remark?: string;
  createdAt: string;
  createdBy?: string;
}

export default function MemberView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [member, setMember] = useState<Member | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadMemberData();
    }
  }, [id]);

  const loadMemberData = async () => {
    try {
      setIsLoading(true);
      const [memberData, attendanceData, paymentData, plansData, branchesData] = await Promise.all([
        apiClient.getMemberById(id!),
        apiClient.getAttendanceList({ memberId: id! }),
        apiClient.getPaymentsByMemberId(id!),
        apiClient.getPlans(),
        apiClient.getBranches(),
      ]);

      setMember(memberData);
      setAttendances(attendanceData || []);
      setPayments(paymentData || []);
      setPlans(plansData || []);
      setBranches(branchesData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load member data',
        variant: 'destructive',
      });
      navigate('/members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handlePayment = () => {
    setIsPaymentOpen(true);
  };

  const handleRenew = () => {
    setIsRenewOpen(true);
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
    loadMemberData();
  };

  const handlePaymentClose = () => {
    setIsPaymentOpen(false);
    loadMemberData();
  };

  const handleRenewClose = () => {
    setIsRenewOpen(false);
    loadMemberData();
  };

  const handlePaymentSubmit = async (amount: number) => {
    if (!member) return;
    try {
      await apiClient.createPayment({
        memberId: member.id,
        amount,
        paymentType: 'balance',
      });
      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });
      handlePaymentClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record payment',
        variant: 'destructive',
      });
    }
  };

  const handleRenewSubmit = async (planId: string, paidAmount: number) => {
    if (!member) return;
    try {
      await apiClient.renewMember(member.id, planId, paidAmount);
      toast({
        title: 'Success',
        description: 'Member renewed successfully',
      });
      handleRenewClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to renew member',
        variant: 'destructive',
      });
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

  if (!member) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-muted-foreground mb-4">Member not found</p>
          <Button onClick={() => navigate('/members')}>Back to Members</Button>
        </div>
      </DashboardLayout>
    );
  }

  // Ensure amounts are numbers
  const planAmount = typeof member.planAmount === 'string' ? parseFloat(member.planAmount) : (member.planAmount || 0);
  const paidAmount = typeof member.paidAmount === 'string' ? parseFloat(member.paidAmount) : (member.paidAmount || 0);
  const balance = planAmount - paidAmount;
  
  // Calculate total paid from payment records (fallback to member's paidAmount if no records)
  const totalPaidFromPayments = payments.reduce((sum, p) => {
    const amount = typeof p.amount === 'string' ? parseFloat(p.amount) : (p.amount || 0);
    return sum + amount;
  }, 0);
  
  // Use the higher of paidAmount or totalPaidFromPayments (in case of data inconsistency)
  const totalPaid = Math.max(paidAmount, totalPaidFromPayments);
  const totalAttendance = attendances.length;

  const attendanceColumns = [
    {
      key: 'date',
      header: 'Date',
      render: (attendance: Attendance) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(attendance.date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'checkInTime',
      header: 'Check-in Time',
      render: (attendance: Attendance) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{attendance.checkInTime}</span>
        </div>
      ),
    },
    {
      key: 'batch',
      header: 'Batch',
      render: (attendance: Attendance) => (
        <Badge variant={attendance.batch === 'morning' ? 'default' : 'secondary'}>
          {attendance.batch}
        </Badge>
      ),
    },
  ];

  const paymentColumns = [
    {
      key: 'paymentDate',
      header: 'Date',
      render: (payment: Payment) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (payment: Payment) => {
        const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount || 0;
        return <span className="font-semibold text-success">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>;
      },
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (payment: Payment) => (
        <Badge variant="outline">{payment.paymentMethod || 'Cash'}</Badge>
      ),
    },
    {
      key: 'remark',
      header: 'Remark',
      render: (payment: Payment) => (
        <span className="text-sm text-muted-foreground">{payment.remark || '-'}</span>
      ),
    },
  ];

  const memberImageUrl = member.profileImage
    ? member.profileImage.startsWith('http')
      ? member.profileImage
      : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${member.profileImage}`
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/members')}
            className="hover:bg-accent/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-display tracking-wide text-foreground">MEMBER PROFILE</h1>
            <p className="text-muted-foreground mt-1">Complete member information and history</p>
          </div>
        </div>

        {/* Member Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {memberImageUrl ? (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
                  <img
                    src={memberImageUrl}
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&background=random`;
                    }}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/20">
                  <User className="w-16 h-16 text-primary" />
                </div>
              )}
            </div>

            {/* Member Details */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-2xl font-display text-foreground mb-2">{member.fullName}</h2>
                <p className="text-muted-foreground mb-4">Registration: {member.registrationNo}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{member.phoneNumber}</span>
                  </div>
                  {member.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span>{member.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant={member.isActive ? 'default' : 'secondary'}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant={member.batch === 'morning' ? 'default' : 'outline'}>
                      {member.batch} Batch
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Age</p>
                    <p className="text-lg font-semibold">{member.age} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Gender</p>
                    <p className="text-lg font-semibold capitalize">{member.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Blood Group</p>
                    <p className="text-lg font-semibold">{member.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Weight/Height</p>
                    <p className="text-lg font-semibold">{member.weight}kg / {member.height}cm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Plan Amount</p>
                <p className="text-2xl font-display text-foreground">₹{planAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Total Paid</p>
                <p className="text-2xl font-display text-success">
                  ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                {payments.length > 0 ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    ({payments.length} payment{payments.length !== 1 ? 's' : ''})
                  </p>
                ) : paidAmount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    (No payment records found)
                  </p>
                )}
              </div>
              <Receipt className="w-8 h-8 text-success" />
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Balance</p>
                <p className={cn(
                  "text-2xl font-display",
                  balance > 0 ? "text-warning" : "text-success"
                )}>
                  ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className={cn(
                "w-8 h-8",
                balance > 0 ? "text-warning" : "text-success"
              )} />
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Total Attendance</p>
                <p className="text-2xl font-display text-primary">{totalAttendance}</p>
              </div>
              <CalendarCheck className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleEdit} className="btn-matrix">
            <Edit className="w-4 h-4 mr-2" />
            Edit Member
          </Button>
          {balance > 0 && (
            <Button onClick={handlePayment} variant="outline" className="hover:bg-success/20 hover:text-success">
              <DollarSign className="w-4 h-4 mr-2" />
              Pay Balance (₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
            </Button>
          )}
          {member.daysLeft <= 0 && (
            <Button onClick={handleRenew} variant="outline" className="hover:bg-primary/20 hover:text-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Renew Membership
            </Button>
          )}
        </div>

        {/* Current Plan Info */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display text-foreground">Current Plan</h3>
            <Badge variant={member.daysLeft > 0 ? 'default' : 'destructive'}>
              {member.daysLeft > 0 ? `${member.daysLeft} days left` : 'Expired'}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Plan Name</p>
              <p className="text-lg font-semibold">{member.planName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="text-lg font-semibold">{new Date(member.planStartDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="text-lg font-semibold">{new Date(member.planEndDate).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>

        {/* Tabs for History */}
        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList className="glass-card">
            <TabsTrigger value="attendance">
              <CalendarCheck className="w-4 h-4 mr-2" />
              Attendance ({totalAttendance})
            </TabsTrigger>
            <TabsTrigger value="payments">
              <Receipt className="w-4 h-4 mr-2" />
              Payments ({payments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <Card className="glass-card p-6">
              {attendances.length > 0 ? (
                <DataTable
                  data={attendances}
                  columns={attendanceColumns}
                  currentPage={1}
                  totalPages={Math.ceil(attendances.length / 10)}
                  onPageChange={() => {}}
                  emptyMessage="No attendance records found"
                />
              ) : (
                <div className="text-center py-12">
                  <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No attendance records found</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="glass-card p-6">
              {payments.length > 0 ? (
                <DataTable
                  data={payments}
                  columns={paymentColumns}
                  currentPage={1}
                  totalPages={Math.ceil(payments.length / 10)}
                  onPageChange={() => {}}
                  emptyMessage="No payment records found"
                />
              ) : (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payment records found</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        {isEditOpen && member && (
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">EDIT MEMBER</DialogTitle>
              </DialogHeader>
              <MemberForm
                onClose={handleEditClose}
                branches={branches}
                plans={plans}
                member={member}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Payment Dialog */}
        {isPaymentOpen && member && (
          <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
              </DialogHeader>
              <PaymentForm
                member={member}
                onClose={handlePaymentClose}
                onPay={handlePaymentSubmit}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Renew Dialog */}
        {isRenewOpen && member && (
          <Dialog open={isRenewOpen} onOpenChange={setIsRenewOpen}>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Renew Membership</DialogTitle>
              </DialogHeader>
              <RenewMemberForm
                member={member}
                plans={plans}
                onClose={handleRenewClose}
                onRenew={handleRenewSubmit}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}

