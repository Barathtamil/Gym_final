import bcrypt from 'bcryptjs';
import pool from '../src/config/database.js';
import logger from '../src/utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  try {
    // Create default branch
    const branchId = uuidv4();
    await pool.execute(
      'INSERT INTO branches (id, name, location, createdBy) VALUES (?, ?, ?, ?)',
      [branchId, 'Main Branch', 'Main Street, City', uuidv4()]
    );

    // Create default admin user
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.execute(
      `INSERT INTO users (id, name, username, password, role, branchId, mobileNumber, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, 'Admin User', 'admin', hashedPassword, 'admin', branchId, '9876543210', 1]
    );

    // Create default staff user
    const staffId = uuidv4();
    const staffPassword = await bcrypt.hash('staff123', 10);
    await pool.execute(
      `INSERT INTO users (id, name, username, password, role, branchId, mobileNumber, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [staffId, 'Staff User', 'staff', staffPassword, 'staff', branchId, '9876543211', 1]
    );

    // Create default member user
    const memberId = uuidv4();
    const memberPassword = await bcrypt.hash('member123', 10);
    await pool.execute(
      `INSERT INTO users (id, name, username, password, role, branchId, mobileNumber, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [memberId, 'Member User', 'member', memberPassword, 'member', branchId, '9876543212', 1]
    );

    // Create default plan
    const planId = uuidv4();
    await pool.execute(
      `INSERT INTO plans (id, name, duration, amount, createdBy)
       VALUES (?, ?, ?, ?, ?)`,
      [planId, 'Premium Monthly', 30, 2000.00, adminId]
    );

    // Link plan to branch
    await pool.execute(
      'INSERT INTO plan_branches (planId, branchId) VALUES (?, ?)',
      [planId, branchId]
    );

    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error('Seed error:', error);
    throw error;
  }
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Seed failed:', error);
    process.exit(1);
  });

