import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { jwtConfig } from '../config/jwt.js';
import { User, JwtPayload, RefreshToken } from '../types/index.js';
import logger from '../utils/logger.js';

export class AuthService {
  async login(username: string, password: string): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND isActive = 1',
      [username]
    );

    const users = rows as User[];
    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      branchId: user.branchId,
    };

    const accessToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    } as jwt.SignOptions);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await pool.execute(
      'INSERT INTO refresh_tokens (id, userId, token, expiresAt) VALUES (?, ?, ?, ?)',
      [uuidv4(), user.id, refreshToken, expiresAt]
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User ${username} logged in successfully`);

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as JwtPayload;

      // Check if token exists in database
      const [rows] = await pool.execute(
        'SELECT * FROM refresh_tokens WHERE token = ? AND expiresAt > NOW()',
        [refreshToken]
      );

      const tokens = rows as RefreshToken[];
      if (tokens.length === 0) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const payload: JwtPayload = {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
        branchId: decoded.branchId,
      };

      const newAccessToken = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
      } as jwt.SignOptions);

      const newRefreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
        expiresIn: jwtConfig.refreshExpiresIn,
      } as jwt.SignOptions);

      // Update refresh token in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await pool.execute(
        'UPDATE refresh_tokens SET token = ?, expiresAt = ? WHERE token = ?',
        [newRefreshToken, expiresAt, refreshToken]
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    logger.info('User logged out successfully');
  }

  async logoutAll(userId: string): Promise<void> {
    await pool.execute('DELETE FROM refresh_tokens WHERE userId = ?', [userId]);
    logger.info(`All sessions logged out for user ${userId}`);
  }
}

export default new AuthService();

