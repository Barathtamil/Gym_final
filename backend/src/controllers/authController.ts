import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService.js';
import logger from '../utils/logger.js';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const result = await authService.login(username, password);
    res.json(result);
  } catch (error) {
    logger.error('Login error:', error);
    if (error instanceof Error && error.message === 'Invalid credentials') {
      res.status(401).json({ error: 'Invalid username or password' });
    } else {
      next(error);
    }
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (error) {
    logger.error('Refresh token error:', error);
    if (error instanceof Error && error.message === 'Invalid refresh token') {
      res.status(401).json({ error: 'Invalid refresh token' });
    } else {
      next(error);
    }
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    await authService.logout(refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

