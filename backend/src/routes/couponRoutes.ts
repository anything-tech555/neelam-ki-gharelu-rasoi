import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/storage';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { Coupon } from '../types/shared';

export const couponRouter = Router();

// GET active coupons for customers
couponRouter.get('/', (_req, res: Response) => {
  const coupons = db.get('coupons') || [];
  const active = coupons.filter(c => c.isActive && new Date(c.expiryDate).getTime() > Date.now());
  return res.json({ success: true, count: active.length, coupons: active });
});

// VALIDATE COUPON (Customer Cart)
couponRouter.post('/validate', (req, res: Response) => {
  const { code, cartSubtotal } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required.' });
  }

  const subtotal = Number(cartSubtotal) || 0;
  const coupons = db.get('coupons') || [];
  const coupon = coupons.find(c => c.code.toUpperCase() === String(code).toUpperCase().trim());

  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
  }

  if (!coupon.isActive) {
    return res.status(400).json({ success: false, message: 'This coupon is no longer active.' });
  }

  if (new Date(coupon.expiryDate).getTime() < Date.now()) {
    return res.status(400).json({ success: false, message: 'This coupon has expired.' });
  }

  if (coupon.usageCount >= coupon.usageLimit) {
    return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached.' });
  }

  if (subtotal < coupon.minOrderAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount of ₹${coupon.minOrderAmount} required for coupon ${coupon.code}.`
    });
  }

  let discountAmount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    const rawDiscount = Math.round((subtotal * coupon.discountValue) / 100);
    discountAmount = coupon.maxDiscountAmount ? Math.min(rawDiscount, coupon.maxDiscountAmount) : rawDiscount;
  } else {
    discountAmount = coupon.discountValue;
  }

  return res.json({
    success: true,
    message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount}.`,
    coupon,
    discountAmount
  });
});

// ADMIN: GET all coupons
couponRouter.get('/all', authenticateToken, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const coupons = db.get('coupons') || [];
  return res.json({ success: true, count: coupons.length, coupons });
});

// ADMIN: Create coupon
couponRouter.post('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, isFirstOrderOnly, expiryDate, usageLimit } = req.body;

  if (!code || !discountType || discountValue === undefined) {
    return res.status(400).json({ success: false, message: 'Code, discount type, and value are required.' });
  }

  const existing = (db.get('coupons') || []).find(c => c.code.toUpperCase() === String(code).toUpperCase().trim());
  if (existing) {
    return res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
  }

  const newCoupon: Coupon = {
    id: `cpn-${uuidv4().substring(0, 8)}`,
    code: String(code).toUpperCase().trim(),
    description: description ? description.trim() : `${discountValue}${discountType === 'PERCENTAGE' ? '%' : '₹'} off`,
    discountType: discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount) || 0,
    maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
    isFirstOrderOnly: Boolean(isFirstOrderOnly),
    expiryDate: expiryDate || new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
    usageLimit: Number(usageLimit) || 500,
    usageCount: 0,
    isActive: true
  };

  db.mutate(data => {
    data.coupons.push(newCoupon);
  });

  return res.status(201).json({ success: true, message: 'Coupon created.', coupon: newCoupon });
});

// ADMIN: Update coupon
couponRouter.put('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const couponId = req.params.id;
  const updates = req.body;

  let updated: Coupon | null = null;

  db.mutate(data => {
    const idx = data.coupons.findIndex(c => c.id === couponId);
    if (idx !== -1) {
      data.coupons[idx] = {
        ...data.coupons[idx],
        ...updates
      };
      updated = data.coupons[idx];
    }
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Coupon not found.' });
  }

  return res.json({ success: true, message: 'Coupon updated.', coupon: updated });
});

// ADMIN: Delete coupon
couponRouter.delete('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const couponId = req.params.id;

  db.mutate(data => {
    data.coupons = data.coupons.filter(c => c.id !== couponId);
  });

  return res.json({ success: true, message: 'Coupon deleted.' });
});
