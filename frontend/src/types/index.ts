export type UserRole = 'admin' | 'staff' | 'member';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  branchId: string;
  mobileNumber: string;
  isActive: boolean;
  deletedAt?: string | null;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  createdBy: string;
  deletedAt?: string | null;
}

export interface Plan {
  id: string;
  name: string;
  duration: number;
  amount: number;
  branches: string[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt?: string | null;
}

export interface Member {
  id: string;
  registrationNo: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  phoneNumber: string;
  batch: 'morning' | 'evening';
  branchId: string;
  address: string;
  aadharNumber?: string | null;
  bloodGroup: string;
  planId: string;
  planName: string;
  planAmount: number;
  paidAmount: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other';
  planStartDate: string;
  planEndDate: string;
  daysLeft: number;
  balanceAmount: number;
  isActive: boolean;
  profileImage?: string | null;
  deletedAt?: string | null;
}

export interface Attendance {
  id: string;
  memberId: string;
  memberName: string;
  registrationNo: string;
  date: string;
  checkInTime: string;
  batch: 'morning' | 'evening';
}

export interface Expense {
  id: string;
  date: string;
  name: string;
  amount: number;
  remark: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt?: string | null;
}

export interface Enquiry {
  id: string;
  name: string;
  address: string;
  date: string;
  phoneNumber: string;
  followUpDate: string;
  status: 'pending' | 'contacted' | 'converted' | 'closed';
  deletedAt?: string | null;
}

export interface DashboardStats {
  totalActiveMembers: number;
  expiredMemberships: number;
  todayAttendance: number;
  monthlyRevenue: number;
  membershipGrowth: { month: string; count: number }[];
  attendanceTrend: { date: string; count: number }[];
  revenueByMonth: { month: string; amount: number }[];
}
