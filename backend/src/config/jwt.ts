import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-token-key-change-this-in-production',
  expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as string,
  refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string,
};

