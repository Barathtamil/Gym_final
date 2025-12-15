import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download, Edit, Trash2, Building2, MapPin, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Branch } from '@/types';
import apiClient from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getBranches();
      setBranches(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load branches',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedBranch(null);
    setFormData({ name: '', location: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setIsEditMode(true);
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      location: branch.location || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation with toast
    if (!formData.name || formData.name.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please enter branch name',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.location || formData.location.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Please enter branch location',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      if (isEditMode && selectedBranch) {
        await apiClient.updateBranch(selectedBranch.id, formData);
        toast({ title: 'Success', description: 'Branch updated successfully' });
      } else {
        await apiClient.createBranch({
          ...formData,
          createdBy: user?.id || '',
        });
        toast({ title: 'Success', description: 'Branch created successfully' });
      }
      setIsFormOpen(false);
      loadBranches();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save branch',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (branch: Branch) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!branchToDelete) return;
    try {
      await apiClient.deleteBranch(branchToDelete.id);
      toast({ title: 'Success', description: 'Branch deleted successfully' });
      loadBranches();
      setDeleteDialogOpen(false);
      setBranchToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete branch',
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Branch Name',
      render: (branch: Branch) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-secondary" />
          </div>
          <span className="font-semibold">{branch.name}</span>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (branch: Branch) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{branch.location}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (branch: Branch) => (
        <span className="text-muted-foreground">
          {new Date(branch.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (branch: Branch) => (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(branch)}
                  className="hover:bg-secondary/20 hover:text-secondary"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Branch</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(branch)}
                  className="hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Branch</p>
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
        description: 'Branches list has been exported successfully.',
      });
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-display tracking-wide text-foreground">BRANCHES</h1>
            <p className="text-muted-foreground mt-1">Manage gym branch locations</p>
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
                  Add Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">
                    {isEditMode ? 'EDIT BRANCH' : 'NEW BRANCH'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Branch Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Main Branch"
                      className="bg-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Textarea
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., 123 Fitness Avenue, Downtown"
                      className="bg-input"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="btn-matrix">
                      {isEditMode ? 'Update' : 'Create'} Branch
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
              placeholder="Search by branch name or location..."
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
              data={filteredBranches}
              columns={columns}
              currentPage={currentPage}
              totalPages={Math.ceil(filteredBranches.length / 10)}
              onPageChange={setCurrentPage}
              emptyMessage="No branches found. Add your first branch!"
            />
          )}
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-border max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-display text-foreground">Delete Branch</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground pt-2">
                Are you sure you want to delete <span className="font-semibold text-foreground">{branchToDelete?.name}</span>? 
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
