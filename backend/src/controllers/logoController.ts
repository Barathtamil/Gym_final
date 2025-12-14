import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import logger from '../utils/logger.js';
import { AuthRequest } from '../middleware/auth.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/logo/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${uuidv4()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880'), // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadLogo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Deactivate all existing logos
    await pool.execute('UPDATE logo_settings SET isActive = 0');

    // Insert new logo
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO logo_settings (id, filename, path, isActive, uploadedBy) VALUES (?, ?, ?, ?, ?)',
      [
        id,
        req.file.filename,
        `/uploads/logo/${req.file.filename}`,
        1,
        req.user?.userId,
      ]
    );

    logger.info(`Logo uploaded by user ${req.user?.userId}`);
    res.json({
      message: 'Logo uploaded successfully',
      logo: {
        id,
        filename: req.file.filename,
        path: `/uploads/logo/${req.file.filename}`,
      },
    });
  } catch (error) {
    logger.error('Upload logo error:', error);
    next(error);
  }
};

export const getActiveLogo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM logo_settings WHERE isActive = 1 ORDER BY uploadedAt DESC LIMIT 1'
    );

    const logos = rows as any[];
    if (logos.length === 0) {
      res.status(404).json({ error: 'No active logo found' });
      return;
    }

    res.json(logos[0]);
  } catch (error) {
    logger.error('Get logo error:', error);
    next(error);
  }
};

