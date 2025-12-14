import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import { JwtPayload } from '../types/index.js';
import logger from '../utils/logger.js';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by ${req.user.username} with role ${req.user.role}`);
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

