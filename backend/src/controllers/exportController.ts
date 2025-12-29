import { Request, Response, NextFunction } from 'express';
import memberService from '../services/memberService.js';
import expenseService from '../services/expenseService.js';
import enquiryService from '../services/enquiryService.js';
import planService from '../services/planService.js';
import branchService from '../services/branchService.js';
import attendanceService from '../services/attendanceService.js';
import staffService from '../services/staffService.js';
import logger from '../utils/logger.js';

// Import xlsx - using default import for ES modules
// @ts-ignore - xlsx types may not be perfect for ES modules
import XLSX from 'xlsx';

export const exportMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const members = await memberService.getAllMembers();
    
    // Format data for export
    const formattedMembers = members.map(member => ({
      'Registration No': member.registrationNo || '',
      'Full Name': member.fullName || '',
      'Phone Number': member.phoneNumber || '',
      'Batch': member.batch || '',
      'Plan Name': member.planName || 'N/A',
      'Plan Amount': typeof member.planAmount === 'number' ? member.planAmount : parseFloat(member.planAmount as any) || 0,
      'Paid Amount': typeof member.paidAmount === 'number' ? member.paidAmount : parseFloat(member.paidAmount as any) || 0,
      'Plan Start Date': member.planStartDate ? new Date(member.planStartDate).toLocaleDateString() : '',
      'Plan End Date': member.planEndDate ? new Date(member.planEndDate).toLocaleDateString() : '',
      'Days Left': member.daysLeft || 0,
      'Status': member.isActive ? 'Active' : 'Inactive',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedMembers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=members_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } catch (error) {
    logger.error('Export members error:', error);
    next(error);
  }
};

export const exportExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const filters: any = {};
    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;

    const expenses = await expenseService.getAllExpenses(filters);
    
    const formattedExpenses = expenses.map(expense => ({
      'Date': expense.date ? new Date(expense.date).toLocaleDateString() : '',
      'Expense Name': expense.name || '',
      'Amount': typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount as any) || 0,
      'Remark': expense.remark || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedExpenses);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } catch (error) {
    logger.error('Export expenses error:', error);
    next(error);
  }
};

export const exportEnquiries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query;
    const filters: any = {};
    if (status) filters.status = status as string;

    const enquiries = await enquiryService.getAllEnquiries(filters);
    
    const formattedEnquiries = enquiries.map(enquiry => ({
      'Name': enquiry.name || '',
      'Phone Number': enquiry.phoneNumber || '',
      'Address': enquiry.address || '',
      'Enquiry Date': enquiry.date ? new Date(enquiry.date).toLocaleDateString() : '',
      'Follow-up Date': enquiry.followUpDate ? new Date(enquiry.followUpDate).toLocaleDateString() : '',
      'Status': enquiry.status || '',
      'Remark': (enquiry as any).remark || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedEnquiries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiries');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=enquiries_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } catch (error) {
    logger.error('Export enquiries error:', error);
    next(error);
  }
};

export const exportPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const plans = await planService.getAllPlans();
    
    const formattedPlans = plans.map(plan => ({
      'Plan Name': plan.name || '',
      'Duration (Days)': plan.duration || 0,
      'Amount': typeof plan.amount === 'number' ? plan.amount : parseFloat(plan.amount as any) || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedPlans);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plans');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=plans_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } catch (error) {
    logger.error('Export plans error:', error);
    next(error);
  }
};

export const exportBranches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const branches = await branchService.getAllBranches();
    
    const formattedBranches = branches.map(branch => ({
      'Branch Name': branch.name || '',
      'Location': branch.location || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedBranches);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Branches');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=branches_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } catch (error) {
    logger.error('Export branches error:', error);
    next(error);
  }
};

export const exportAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate, branchId } = req.query;
    
    // If both startDate and endDate are provided and same, use date filter
    // Otherwise, we'll need to get all records and filter in memory or modify service
    const filters: any = {};
    if (startDate && endDate && startDate === endDate) {
      filters.date = startDate as string;
    }
    if (branchId) filters.branchId = branchId as string;

    let attendance = await attendanceService.getAttendanceList(filters);
    
    // Filter by date range if startDate and endDate are different
    if (startDate && endDate && startDate !== endDate) {
      attendance = attendance.filter(record => {
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        return recordDate >= (startDate as string) && recordDate <= (endDate as string);
      });
    }
    
    const formattedAttendance = attendance.map(record => ({
      'Date': record.date ? new Date(record.date).toLocaleDateString() : '',
      'Member Name': record.memberName || '',
      'Registration No': record.registrationNo || '',
      'Check-in Time': record.checkInTime || '',
      'Batch': record.batch || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedAttendance);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } catch (error) {
    logger.error('Export attendance error:', error);
    next(error);
  }
};

export const exportStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { branchId } = req.query;
    const staff = await staffService.getAllStaff(branchId as string);
    
    const formattedStaff = staff.map(member => ({
      'Name': member.name || '',
      'Username': member.username || '',
      'Role': member.role ? member.role.toUpperCase() : '',
      'Mobile Number': member.mobileNumber || '',
      'Status': member.isActive ? 'Active' : 'Inactive',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedStaff);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=staff_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } catch (error) {
    logger.error('Export staff error:', error);
    next(error);
  }
};

