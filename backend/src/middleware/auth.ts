import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config';
import { db } from '../db/storage';
import { UserRole } from '../types/shared';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please login.' });
  }

  jwt.verify(token, CONFIG.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
    }
    req.user = decoded as AuthUserPayload;
    next();
  });
};

export const optionalAuthenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, CONFIG.JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded as AuthUserPayload;
    }
    next();
  });
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin credentials required for this action.' });
  }

  // Cross check with DB to ensure role wasn't revoked
  const users = db.get('users');
  const user = users.find(u => u.id === req.user?.id);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin access denied.' });
  }

  next();
};
