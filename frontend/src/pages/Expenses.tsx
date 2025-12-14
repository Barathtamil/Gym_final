import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download, Edit, Trash2, Receipt, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Expense } from '@/types';

// Mock expenses data
const mockExpenses: Expense[] = [
  {
    id: '1',
    date: '2024-12-13',
    name: 'Electricity Bill',
    amount: 15000,
    remark: 'December month electricity charges',
    createdAt: '2024-12-13',
    createdBy: 'Admin',
    updatedAt: '2024-12-13',
    updatedBy: 'Admin',
  },
  {
    id: '2',
    date: '2024-12-12',
    name: 'Equipment Maintenance',
    amount: 8500,
    remark: 'Treadmill and cross trainer servicing',
    createdAt: '2024-12-12',
    createdBy: 'Staff',
    updatedAt: '2024-12-12',
    updatedBy: 'Staff',
  },
  {
    id: '3',
    date: '2024-12-10',
    name: 'Cleaning Supplies',
    amount: 2500,
    remark: 'Monthly cleaning materials',
    createdAt: '2024-12-10',
    createdBy: 'Staff',
    updatedAt: '2024-12-10',
    updatedBy: 'Staff',
  },
  {
    id: '4',
    date: '2024-12-08',
    name: 'Water Bill',
    amount: 3200,
    remark: 'December water charges',
    createdAt: '2024-12-08',
    createdBy: 'Admin',
    updatedAt: '2024-12-08',
    updatedBy: 'Admin',
  },
];

export default function Expenses() {
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDateFrom = !dateFrom || expense.date >= dateFrom;
    const matchesDateTo = !dateTo || expense.date <= dateTo;
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-secondary/20 hover:text-secondary">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-destructive/20 hover:text-destructive">
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
        description: 'Expenses list has been exported successfully.',
      });
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
                <Button className="btn-matrix">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">NEW EXPENSE</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast({ title: 'Expense Added!', description: 'New expense has been recorded successfully.' });
                    setIsFormOpen(false);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Expense Date</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>Expense Name</Label>
                    <Input placeholder="e.g., Electricity Bill" className="bg-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input type="number" placeholder="5000" className="bg-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>Remark</Label>
                    <Textarea placeholder="Add any notes..." className="bg-input" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="btn-matrix">
                      Add Expense
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
              <p className="text-4xl font-display text-warning">₹{totalExpenses.toLocaleString()}</p>
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
          <DataTable
            data={filteredExpenses}
            columns={columns}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredExpenses.length / 10)}
            onPageChange={setCurrentPage}
            emptyMessage="No expenses found. Add your first expense!"
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
