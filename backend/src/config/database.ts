import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'matrix_gym',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test database connection
pool
  .getConnection()
  .then((connection) => {
    logger.info('Database connected successfully');
    connection.release();
  })
  .catch((error) => {
    logger.error('Database connection failed:', error);
    process.exit(1);
  });

export default pool;

