export type UserRole = 'admin' | 'staff' | 'member';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  branchId: string;
  mobileNumber: string;
  isActive: boolean;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  createdAt: Date;
  createdBy: string;
}

export interface Plan {
  id: string;
  name: string;
  duration: number;
  amount: number;
  branches: string[];
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface Member {
  id: string;
  registrationNo: string;
  fullName: string;
  dateOfBirth: Date;
  age: number;
  phoneNumber: string;
  batch: 'morning' | 'evening';
  branchId: string;
  address: string;
  bloodGroup: string;
  planId: string;
  planName: string;
  planAmount: number;
  paidAmount: number;
  weight: number | null;
  height: number | null;
  gender: 'male' | 'female' | 'other';
  planStartDate: Date;
  planEndDate: Date;
  daysLeft: number;
  balanceAmount: number;
  isActive: boolean;
  profileImage?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Attendance {
  id: string;
  memberId: string;
  memberName: string;
  registrationNo: string;
  date: Date;
  checkInTime: string;
  batch: 'morning' | 'evening';
  createdAt?: Date;
}

export interface Expense {
  id: string;
  date: Date;
  name: string;
  amount: number;
  remark: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface Enquiry {
  id: string;
  name: string;
  address: string;
  date: Date;
  phoneNumber: string;
  followUpDate: Date;
  status: 'pending' | 'contacted' | 'converted' | 'closed';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
  branchId: string;
}

