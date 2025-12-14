-- Matrix Gym Management System Database Schema
-- Run this script to create the complete database structure

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS matrix_gym;
-- USE matrix_gym;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'member') NOT NULL,
  branchId VARCHAR(36),
  mobileNumber VARCHAR(20),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_branchId (branchId)
);

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdBy VARCHAR(36),
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  duration INT NOT NULL COMMENT 'Duration in days',
  amount DECIMAL(10, 2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdBy VARCHAR(36),
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updatedBy VARCHAR(36),
  INDEX idx_name (name)
);

-- Plan-Branch mapping table
CREATE TABLE IF NOT EXISTS plan_branches (
  planId VARCHAR(36),
  branchId VARCHAR(36),
  PRIMARY KEY (planId, branchId),
  FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE,
  FOREIGN KEY (branchId) REFERENCES branches(id) ON DELETE CASCADE
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id VARCHAR(36) PRIMARY KEY,
  registrationNo VARCHAR(50) UNIQUE NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  dateOfBirth DATE NOT NULL,
  age INT NOT NULL,
  phoneNumber VARCHAR(20) NOT NULL,
  batch ENUM('morning', 'evening') NOT NULL,
  branchId VARCHAR(36) NOT NULL,
  address TEXT,
  bloodGroup VARCHAR(10),
  planId VARCHAR(36) NOT NULL,
  weight DECIMAL(5, 2),
  height DECIMAL(5, 2),
  gender ENUM('male', 'female', 'other') NOT NULL,
  planStartDate DATE NOT NULL,
  planEndDate DATE NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_registrationNo (registrationNo),
  INDEX idx_branchId (branchId),
  INDEX idx_planId (planId),
  INDEX idx_isActive (isActive),
  FOREIGN KEY (branchId) REFERENCES branches(id),
  FOREIGN KEY (planId) REFERENCES plans(id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(36) PRIMARY KEY,
  memberId VARCHAR(36) NOT NULL,
  memberName VARCHAR(255) NOT NULL,
  registrationNo VARCHAR(50) NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checkInTime VARCHAR(20) NOT NULL,
  batch ENUM('morning', 'evening') NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_memberId (memberId),
  INDEX idx_date (date),
  INDEX idx_registrationNo (registrationNo),
  FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE
);

-- Payment Members table
CREATE TABLE IF NOT EXISTS payment_members (
  id VARCHAR(36) PRIMARY KEY,
  memberId VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paymentDate DATE NOT NULL,
  paymentMethod VARCHAR(50),
  invoiceNo VARCHAR(100),
  remark TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdBy VARCHAR(36),
  INDEX idx_memberId (memberId),
  INDEX idx_paymentDate (paymentDate),
  FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(36) PRIMARY KEY,
  date DATE NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  remark TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdBy VARCHAR(36),
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updatedBy VARCHAR(36),
  INDEX idx_date (date)
);

-- Enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  date DATE NOT NULL,
  phoneNumber VARCHAR(20),
  followUpDate DATE,
  status ENUM('pending', 'contacted', 'converted', 'closed') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_date (date)
);

-- Refresh Tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  token TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_token (token(255)),
  INDEX idx_expiresAt (expiresAt),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Logo settings table
CREATE TABLE IF NOT EXISTS logo_settings (
  id VARCHAR(36) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  path VARCHAR(500) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  uploadedBy VARCHAR(36),
  uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_isActive (isActive)
);

