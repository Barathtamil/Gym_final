import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download, Edit, Trash2, CreditCard, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Multiselect } from '@/components/ui/multiselect';
import { useToast } from '@/hooks/use-toast';
import { Plan } from '@/types';
import apiClient from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const hasInitializedBranches = useRef(false);

  const [formData, setFormData] = useState({
    name: '',
    duration: 1,
    amount: 0,
    branches: [] as string[],
  });

  useEffect(() => {
    loadPlans();
    loadBranches();
  }, []);

  // Pre-select all branches only once when creating a new plan and form first opens
  useEffect(() => {
    if (!isEditMode && isFormOpen && branches.length > 0 && !hasInitializedBranches.current) {
      const allBranchIds = branches.filter((b) => b && b.id).map((b) => b.id);
      if (allBranchIds.length > 0) {
        setFormData((prev) => ({ ...prev, branches: allBranchIds }));
        hasInitializedBranches.current = true;
      }
    }
    
    // Reset the ref when form closes or switches to edit mode
    if (!isFormOpen || isEditMode) {
      hasInitializedBranches.current = false;
    }
  }, [isFormOpen, branches.length, isEditMode]);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getPlans();
      setPlans(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load plans',
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

  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.duration.toString().includes(searchQuery)
  );

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedPlan(null);
    hasInitializedBranches.current = false; // Reset ref for new form
    setFormData({ name: '', duration: 1, amount: 0, branches: [] });
    setIsFormOpen(true);
  };

  const handleEdit = (plan: Plan) => {
    setIsEditMode(true);
    setSelectedPlan(plan);
    hasInitializedBranches.current = true; // Mark as initialized since we're loading existing data
    setFormData({
      name: plan.name,
      duration: plan.duration,
      amount: plan.amount,
      branches: plan.branches || [],
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one branch is selected
    if (!formData.branches || formData.branches.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one branch for this plan',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      if (isEditMode && selectedPlan) {
        await apiClient.updatePlan(selectedPlan.id, {
          ...formData,
          createdBy: user?.id,
          updatedBy: user?.id,
        });
        toast({ title: 'Success', description: 'Plan updated successfully' });
      } else {
        await apiClient.createPlan({
          ...formData,
          createdBy: user?.id || '',
        });
        toast({ title: 'Success', description: 'Plan created successfully' });
      }
      hasInitializedBranches.current = false;
      setIsFormOpen(false);
      loadPlans();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save plan',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await apiClient.deletePlan(id);
      toast({ title: 'Success', description: 'Plan deleted successfully' });
      loadPlans();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete plan',
        variant: 'destructive',
      });
    }
  };

  const handleBranchSelectionChange = (selectedBranchIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      branches: selectedBranchIds,
    }));
  };

  const columns = [
    {
      key: 'name',
      header: 'Plan Name',
      render: (plan: Plan) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold">{plan.name}</span>
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (plan: Plan) => (
        <span>{plan.duration} {plan.duration === 1 ? 'Month' : 'Months'}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (plan: Plan) => (
        <span className="font-semibold text-primary">₹{plan.amount.toLocaleString()}</span>
      ),
    },
    {
      key: 'branches',
      header: 'Branches',
      render: (plan: Plan) => {
        const branchNames = branches
          .filter((b) => (plan.branches || []).includes(b.id))
          .map((b) => b.name);
        return (
          <div className="flex flex-wrap gap-1">
            {branchNames.length > 0 ? (
              branchNames.map((name, i) => (
                <span key={i} className="px-2 py-1 text-xs bg-muted rounded-full">
                  {name}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">All Branches</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (plan: Plan) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(plan)}
            className="hover:bg-secondary/20 hover:text-secondary"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(plan.id)}
            className="hover:bg-destructive/20 hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
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
        description: 'Plans list has been exported successfully.',
      });
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-display tracking-wide text-foreground">PLANS</h1>
            <p className="text-muted-foreground mt-1">Manage membership plans and pricing</p>
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
                  Add Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">
                    {isEditMode ? 'EDIT PLAN' : 'NEW PLAN'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Plan Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Premium Monthly"
                      className="bg-input"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration (Months)</Label>
                      <Input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                        placeholder="1"
                        className="bg-input"
                        min="1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (₹)</Label>
                      <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="2500"
                        className="bg-input"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Available Branches</Label>
                    <Multiselect
                      options={branches
                        .filter((b) => b && b.id)
                        .map((branch) => ({
                          value: branch.id,
                          label: branch.name || 'Unnamed Branch',
                        }))}
                      selected={formData.branches}
                      onSelectionChange={handleBranchSelectionChange}
                      placeholder="Select branches..."
                      selectAllLabel="Select All Branches"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        hasInitializedBranches.current = false;
                        setIsFormOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="btn-matrix">
                      {isEditMode ? 'Update' : 'Create'} Plan
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by plan name or duration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input"
            />
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
              data={filteredPlans}
              columns={columns}
              currentPage={currentPage}
              totalPages={Math.ceil(filteredPlans.length / 10)}
              onPageChange={setCurrentPage}
              emptyMessage="No plans found. Create your first plan!"
            />
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
