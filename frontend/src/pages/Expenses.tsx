import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download, Edit, Trash2, Receipt, Calendar, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/ui/status-badge';
import { Expense } from '@/types';
import apiClient from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Helper function to get first day of current month
const getFirstDayOfMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Format as YYYY-MM-DD using local date
  const firstDay = new Date(year, month, 1);
  const yearStr = firstDay.getFullYear();
  const monthStr = String(firstDay.getMonth() + 1).padStart(2, '0');
  const dayStr = String(firstDay.getDate()).padStart(2, '0');
  return `${yearStr}-${monthStr}-${dayStr}`;
};

// Helper function to get last day of current month
const getLastDayOfMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Get last day by going to first day of next month and subtracting 1 day
  const lastDay = new Date(year, month + 1, 0);
  const yearStr = lastDay.getFullYear();
  const monthStr = String(lastDay.getMonth() + 1).padStart(2, '0');
  const dayStr = String(lastDay.getDate()).padStart(2, '0');
  return `${yearStr}-${monthStr}-${dayStr}`;
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState(getFirstDayOfMonth());
  const [dateTo, setDateTo] = useState(getLastDayOfMonth());
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [branchFilter, setBranchFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    amount: 0,
    remark: '',
  });

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (user) {
      const defaultBranch = user.role === 'admin' ? 'all' : (user.branchId || 'all');
      if (branchFilter === 'all' && defaultBranch !== 'all') {
        setBranchFilter(defaultBranch);
      }
    }
  }, [user]);

  useEffect(() => {
    loadExpenses();
  }, [dateFrom, dateTo, branchFilter]);

  const loadBranches = async () => {
    try {
      const data = await apiClient.getBranches();
      setBranches(data || []);
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (dateFrom) filters.startDate = dateFrom;
      if (dateTo) filters.endDate = dateTo;
      if (branchFilter && branchFilter !== 'all') {
        filters.branchId = branchFilter;
      }
      const data = await apiClient.getExpenses(filters);
      setExpenses(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load expenses',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDateFrom = !dateFrom || expense.date >= dateFrom;
    const matchesDateTo = !dateTo || expense.date <= dateTo;
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => {
    const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : Number(e.amount) || 0;
    return sum + amount;
  }, 0);

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedExpense(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      name: '',
      amount: 0,
      remark: '',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setIsEditMode(true);
    setSelectedExpense(expense);
    setFormData({
      date: expense.date,
      name: expense.name,
      amount: expense.amount,
      remark: expense.remark || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation with toast
    if (!formData.date) {
      toast({
        title: 'Validation Error',
        description: 'Please select expense date',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name || formData.name.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please enter expense name',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid amount (greater than zero)',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      if (isEditMode && selectedExpense) {
        await apiClient.updateExpense(selectedExpense.id, {
          ...formData,
          updatedBy: user?.id,
        });
        toast({ title: 'Success', description: 'Expense updated successfully' });
      } else {
        await apiClient.createExpense({
          ...formData,
          createdBy: user?.id || '',
        });
        toast({ title: 'Success', description: 'Expense created successfully' });
      }
      setIsFormOpen(false);
      loadExpenses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save expense',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await apiClient.deleteExpense(expenseToDelete.id);
      toast({ title: 'Success', description: 'Expense deleted successfully' });
      loadExpenses();
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete expense',
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (expense: Expense) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(expense.date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Expense Name',
      render: (expense: Expense) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-warning" />
          </div>
          <span className="font-semibold">{expense.name}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (expense: Expense) => (
        <span className="font-semibold text-warning">₹{expense.amount.toLocaleString()}</span>
      ),
    },
    {
      key: 'remark',
      header: 'Remark',
      render: (expense: Expense) => (
        <span className="text-muted-foreground text-sm truncate max-w-xs block">{expense.remark}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (expense: Expense) => (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(expense)}
                  className="hover:bg-secondary/20 hover:text-secondary"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Expense</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(expense)}
                  className="hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Expense</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  const handleExport = async () => {
    try {
      toast({
        title: 'Exporting...',
        description: 'Your Excel file is being prepared.',
      });
      
      const filters: any = { startDate: dateFrom, endDate: dateTo };
      if (branchFilter && branchFilter !== 'all') {
        filters.branchId = branchFilter;
      }
      const blob = await apiClient.exportExpenses(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: 'Expenses list has been exported successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to export expenses',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-display tracking-wide text-foreground">EXPENSES</h1>
            <p className="text-muted-foreground mt-1">Track and manage gym expenses</p>
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
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">
                    {isEditMode ? 'EDIT EXPENSE' : 'NEW EXPENSE'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Expense Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expense Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Electricity Bill"
                      className="bg-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="5000"
                      className="bg-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Remark</Label>
                    <Textarea
                      value={formData.remark}
                      onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                      placeholder="Add any notes..."
                      className="bg-input"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="btn-matrix">
                      {isEditMode ? 'Update' : 'Add'} Expense
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

        {/* Total Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Expenses</p>
              <p className="text-4xl font-display text-warning">
                ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-16 h-16 bg-warning/20 rounded-xl flex items-center justify-center">
              <Receipt className="w-8 h-8 text-warning" />
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
              placeholder="Search by expense name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input"
            />
          </div>
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-full md:w-40 bg-input">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {user?.role === 'admin' && <SelectItem value="all">All Branches</SelectItem>}
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">From:</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-input w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm whitespace-nowrap">To:</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-input w-40"
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
              data={filteredExpenses}
              columns={columns}
              currentPage={currentPage}
              totalPages={Math.ceil(filteredExpenses.length / 10)}
              onPageChange={setCurrentPage}
              emptyMessage="No expenses found. Add your first expense!"
            />
          )}
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-border max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-display text-foreground">Delete Expense</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground pt-2">
                Are you sure you want to delete <span className="font-semibold text-foreground">{expenseToDelete?.name}</span>? 
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
