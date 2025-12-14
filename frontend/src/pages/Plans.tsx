import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download, Edit, Trash2, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plan } from '@/types';

// Mock plans data
const mockPlans: Plan[] = [
  {
    id: '1',
    name: 'Premium Monthly',
    duration: 1,
    amount: 2500,
    branches: ['Main Branch', 'Downtown'],
    createdAt: '2024-01-01',
    createdBy: 'Admin',
    updatedAt: '2024-12-01',
    updatedBy: 'Admin',
  },
  {
    id: '2',
    name: 'Quarterly Plan',
    duration: 3,
    amount: 6500,
    branches: ['All'],
    createdAt: '2024-01-01',
    createdBy: 'Admin',
    updatedAt: '2024-11-15',
    updatedBy: 'Admin',
  },
  {
    id: '3',
    name: 'Annual Plan',
    duration: 12,
    amount: 22000,
    branches: ['Main Branch'],
    createdAt: '2024-01-01',
    createdBy: 'Admin',
    updatedAt: '2024-10-20',
    updatedBy: 'Admin',
  },
  {
    id: '4',
    name: 'Student Special',
    duration: 1,
    amount: 1800,
    branches: ['Downtown'],
    createdAt: '2024-06-01',
    createdBy: 'Admin',
    updatedAt: '2024-06-01',
    updatedBy: 'Admin',
  },
];

export default function Plans() {
  const [plans] = useState<Plan[]>(mockPlans);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.duration.toString().includes(searchQuery)
  );

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
      render: (plan: Plan) => (
        <div className="flex flex-wrap gap-1">
          {plan.branches.map((branch, i) => (
            <span key={i} className="px-2 py-1 text-xs bg-muted rounded-full">
              {branch}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (plan: Plan) => (
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
        description: 'Plans list has been exported successfully.',
      });
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
                <Button className="btn-matrix">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">NEW PLAN</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast({ title: 'Plan Added!', description: 'New plan has been created successfully.' });
                    setIsFormOpen(false);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Plan Name</Label>
                    <Input placeholder="e.g., Premium Monthly" className="bg-input" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration (Months)</Label>
                      <Input type="number" placeholder="1" className="bg-input" />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (₹)</Label>
                      <Input type="number" placeholder="2500" className="bg-input" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="btn-matrix">
                      Create Plan
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
          <DataTable
            data={filteredPlans}
            columns={columns}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredPlans.length / 10)}
            onPageChange={setCurrentPage}
            emptyMessage="No plans found. Create your first plan!"
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
