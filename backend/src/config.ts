import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'neelam-ki-gharelu-rasoi-secure-jwt-token-key-2026',
  JWT_EXPIRES_IN: '7d',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholderKey123',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secretKeyPlaceholder456',
  DATA_DIR: path.join(__dirname, '..', 'data'),
  UPLOADS_DIR: path.join(__dirname, '..', 'uploads'),
  FRONTEND_CUSTOMER_URL: process.env.FRONTEND_CUSTOMER_URL || 'http://localhost:5173',
  FRONTEND_ADMIN_URL: process.env.FRONTEND_ADMIN_URL || 'http://localhost:5174',
};
