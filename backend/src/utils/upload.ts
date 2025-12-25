import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Profile image storage configuration
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use absolute path to ensure correct file location
    const uploadPath = resolve(__dirname, '../../uploads/profiles/');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uuidv4()}${ext}`);
  },
});

export const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880'), // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  },
});


