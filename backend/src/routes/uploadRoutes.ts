import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '../config';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

export const uploadRouter = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, CONFIG.UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `food-${Date.now()}-${uuidv4().substring(0, 6)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const mimeCheck = allowed.test(file.mimetype);
    const extCheck = allowed.test(path.extname(file.originalname).toLowerCase());
    if (mimeCheck && extCheck) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, and WebP image files are allowed.'));
  }
});

// Admin upload endpoint
uploadRouter.post(
  '/',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const host = req.get('host') || `localhost:${CONFIG.PORT}`;
    const protocol = req.protocol || 'http';
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    return res.json({
      success: true,
      message: 'Image uploaded successfully.',
      imageUrl,
      filename: req.file.filename
    });
  }
);
