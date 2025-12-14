import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download, Edit, Trash2, Phone, Calendar, MessageCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Enquiry } from '@/types';

// Mock enquiries data
const mockEnquiries: Enquiry[] = [
  {
    id: '1',
    name: 'David Wilson',
    address: '567 Oak Lane, Suburb',
    date: '2024-12-13',
    phoneNumber: '9876543220',
    followUpDate: '2024-12-15',
    status: 'pending',
  },
  {
    id: '2',
    name: 'Jennifer Lee',
    address: '890 Pine Street, Downtown',
    date: '2024-12-12',
    phoneNumber: '9876543221',
    followUpDate: '2024-12-14',
    status: 'contacted',
  },
  {
    id: '3',
    name: 'Robert Brown',
    address: '234 Maple Drive, Uptown',
    date: '2024-12-10',
    phoneNumber: '9876543222',
    followUpDate: '2024-12-13',
    status: 'converted',
  },
  {
    id: '4',
    name: 'Emily Davis',
    address: '456 Elm Road, City Center',
    date: '2024-12-08',
    phoneNumber: '9876543223',
    followUpDate: '2024-12-11',
    status: 'closed',
  },
];

const statusVariants: Record<string, 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',
  contacted: 'info',
  converted: 'success',
  closed: 'danger',
};

export default function Enquiries() {
  const [enquiries] = useState<Enquiry[]>(mockEnquiries);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const filteredEnquiries = enquiries.filter(
    (enquiry) =>
      enquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.phoneNumber.includes(searchQuery)
  );

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
        const isOverdue = new Date(enquiry.followUpDate) < new Date() && enquiry.status === 'pending';
        return (
          <div className={`flex items-center gap-2 ${isOverdue ? 'text-destructive' : ''}`}>
            <MessageCircle className="w-4 h-4" />
            <span>{new Date(enquiry.followUpDate).toLocaleDateString()}</span>
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
        description: 'Enquiries list has been exported successfully.',
      });
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
                <Button className="btn-matrix">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Enquiry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">NEW ENQUIRY</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast({ title: 'Enquiry Added!', description: 'New enquiry has been recorded successfully.' });
                    setIsFormOpen(false);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input placeholder="e.g., John Doe" className="bg-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input placeholder="9876543210" className="bg-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea placeholder="Enter address..." className="bg-input" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Enquiry Date</Label>
                      <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-input" />
                    </div>
                    <div className="space-y-2">
                      <Label>Follow-up Date</Label>
                      <Input type="date" className="bg-input" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="btn-matrix">
                      Add Enquiry
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
            { label: 'Pending', count: enquiries.filter((e) => e.status === 'pending').length, color: 'warning' },
            { label: 'Contacted', count: enquiries.filter((e) => e.status === 'contacted').length, color: 'secondary' },
            { label: 'Converted', count: enquiries.filter((e) => e.status === 'converted').length, color: 'success' },
            { label: 'Closed', count: enquiries.filter((e) => e.status === 'closed').length, color: 'destructive' },
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
          className="glass-card p-4"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input"
            />
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <DataTable
            data={filteredEnquiries}
            columns={columns}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredEnquiries.length / 10)}
            onPageChange={setCurrentPage}
            emptyMessage="No enquiries found. Add your first enquiry!"
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
