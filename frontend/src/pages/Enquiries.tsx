import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download, Edit, Trash2, Phone, Calendar, MessageCircle, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Enquiry } from '@/types';
import apiClient from '@/lib/api';

const statusVariants: Record<string, 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',
  contacted: 'info',
  converted: 'success',
  closed: 'danger',
};

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<Enquiry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    followUpDate: '',
    status: 'pending' as 'pending' | 'contacted' | 'converted' | 'closed',
    remark: '',
  });

  useEffect(() => {
    loadEnquiries();
  }, [statusFilter]);

  const loadEnquiries = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      const data = await apiClient.getEnquiries(filters);
      setEnquiries(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load enquiries',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEnquiries = enquiries.filter(
    (enquiry) =>
      enquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.phoneNumber?.includes(searchQuery)
  );

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedEnquiry(null);
    setFormData({
      name: '',
      phoneNumber: '',
      address: '',
      date: new Date().toISOString().split('T')[0],
      followUpDate: '',
      status: 'pending',
      remark: '',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (enquiry: Enquiry) => {
    setIsEditMode(true);
    setSelectedEnquiry(enquiry);
    setFormData({
      name: enquiry.name,
      phoneNumber: enquiry.phoneNumber || '',
      address: enquiry.address || '',
      date: enquiry.date,
      followUpDate: enquiry.followUpDate || '',
      status: enquiry.status,
      remark: (enquiry as any).remark || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation with toast
    if (!formData.name || formData.name.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please enter name',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.date) {
      toast({
        title: 'Validation Error',
        description: 'Please select enquiry date',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      if (isEditMode && selectedEnquiry) {
        await apiClient.updateEnquiry(selectedEnquiry.id, formData);
        toast({ title: 'Success', description: 'Enquiry updated successfully' });
      } else {
        await apiClient.createEnquiry(formData);
        toast({ title: 'Success', description: 'Enquiry created successfully' });
      }
      setIsFormOpen(false);
      loadEnquiries();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save enquiry',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (enquiry: Enquiry) => {
    setEnquiryToDelete(enquiry);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!enquiryToDelete) return;
    try {
      await apiClient.deleteEnquiry(enquiryToDelete.id);
      toast({ title: 'Success', description: 'Enquiry deleted successfully' });
      loadEnquiries();
      setDeleteDialogOpen(false);
      setEnquiryToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete enquiry',
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (enquiry: Enquiry) => (
        <div>
          <p className="font-semibold">{enquiry.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Phone className="w-3 h-3" />
            {enquiry.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (enquiry: Enquiry) => (
        <span className="text-muted-foreground text-sm">{enquiry.address}</span>
      ),
    },
    {
      key: 'date',
      header: 'Enquiry Date',
      render: (enquiry: Enquiry) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(enquiry.date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'followUpDate',
      header: 'Follow-up',
      render: (enquiry: Enquiry) => {
        const isOverdue = enquiry.followUpDate && new Date(enquiry.followUpDate) < new Date() && enquiry.status === 'pending';
        return (
          <div className={`flex items-center gap-2 ${isOverdue ? 'text-destructive' : ''}`}>
            <MessageCircle className="w-4 h-4" />
            <span>{enquiry.followUpDate ? new Date(enquiry.followUpDate).toLocaleDateString() : '-'}</span>
            {isOverdue && <span className="text-xs">(Overdue)</span>}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (enquiry: Enquiry) => (
        <StatusBadge variant={statusVariants[enquiry.status]}>
          {enquiry.status}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (enquiry: Enquiry) => (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(enquiry)}
                  className="hover:bg-secondary/20 hover:text-secondary"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Enquiry</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(enquiry)}
                  className="hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Enquiry</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
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
        description: 'Enquiries list has been exported successfully.',
      });
    }, 2000);
  };

  const statusCounts = {
    pending: enquiries.filter((e) => e.status === 'pending').length,
    contacted: enquiries.filter((e) => e.status === 'contacted').length,
    converted: enquiries.filter((e) => e.status === 'converted').length,
    closed: enquiries.filter((e) => e.status === 'closed').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-display tracking-wide text-foreground">ENQUIRIES</h1>
            <p className="text-muted-foreground mt-1">Track and manage prospect enquiries</p>
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
                <Button onClick={handleCreate} className="btn-matrix">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Enquiry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">
                    {isEditMode ? 'EDIT ENQUIRY' : 'NEW ENQUIRY'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., John Doe"
                      className="bg-input"
                    />
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
                    <Label>Address</Label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter address..."
                      className="bg-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Enquiry Date</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="bg-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Follow-up Date</Label>
                      <Input
                        type="date"
                        value={formData.followUpDate}
                        onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                        className="bg-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Remark</Label>
                    <Textarea
                      value={formData.remark}
                      onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                      placeholder="Enter any remarks or notes..."
                      rows={3}
                      className="bg-input"
                    />
                  </div>
                  {isEditMode && (
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                      >
                        <SelectTrigger className="bg-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="btn-matrix">
                      {isEditMode ? 'Update' : 'Add'} Enquiry
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Pending', count: statusCounts.pending, color: 'warning' },
            { label: 'Contacted', count: statusCounts.contacted, color: 'secondary' },
            { label: 'Converted', count: statusCounts.converted, color: 'success' },
            { label: 'Closed', count: statusCounts.closed, color: 'destructive' },
          ].map((stat, index) => (
            <div key={index} className="glass-card p-4 text-center">
              <p className={`text-3xl font-display text-${stat.color}`}>{stat.count}</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 flex gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-input">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
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
              data={filteredEnquiries}
              columns={columns}
              currentPage={currentPage}
              totalPages={Math.ceil(filteredEnquiries.length / 10)}
              onPageChange={setCurrentPage}
              emptyMessage="No enquiries found. Add your first enquiry!"
            />
          )}
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-border max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-display text-foreground">Delete Enquiry</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground pt-2">
                Are you sure you want to delete <span className="font-semibold text-foreground">{enquiryToDelete?.name}</span>? 
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
      </div>
    </DashboardLayout>
  );
}
