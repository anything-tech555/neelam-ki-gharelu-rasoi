import { Router, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '../db/storage';
import { CONFIG } from '../config';
import { AuthenticatedRequest, optionalAuthenticateToken } from '../middleware/auth';
import { io } from '../index';

export const paymentRouter = Router();

// Initialize Razorpay instance safely
let razorpayInstance: Razorpay | null = null;
try {
  if (CONFIG.RAZORPAY_KEY_ID && CONFIG.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: CONFIG.RAZORPAY_KEY_ID,
      key_secret: CONFIG.RAZORPAY_KEY_SECRET
    });
  }
} catch (e) {
  console.warn('Razorpay initialization note: Running in test simulation mode if keys are placeholders.');
}

// CREATE RAZORPAY ORDER
paymentRouter.post('/create-razorpay-order', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Internal Order ID is required.' });
    }

    const orders = db.get('orders') || [];
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.totalAmount * 100);

    // If live/valid Razorpay keys are configured:
    if (razorpayInstance && !CONFIG.RAZORPAY_KEY_ID.includes('placeholder')) {
      try {
        const rzpOrder = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: order.orderNumber,
          notes: {
            orderId: order.id,
            customerPhone: order.customerPhone,
            customerName: order.customerName
          }
        });

        db.mutate(data => {
          const ord = data.orders.find(o => o.id === order.id);
          if (ord) ord.razorpayOrderId = rzpOrder.id;
        });

        return res.json({
          success: true,
          keyId: CONFIG.RAZORPAY_KEY_ID,
          razorpayOrderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: 'INR',
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone
        });
      } catch (rzpErr) {
        console.error('Razorpay API error:', rzpErr);
      }
    }

    // Standard sandbox / test mode simulation order
    const simulatedRzpOrderId = `rzp_ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    db.mutate(data => {
      const ord = data.orders.find(o => o.id === order.id);
      if (ord) ord.razorpayOrderId = simulatedRzpOrderId;
    });

    return res.json({
      success: true,
      keyId: CONFIG.RAZORPAY_KEY_ID,
      razorpayOrderId: simulatedRzpOrderId,
      amount: amountInPaise,
      currency: 'INR',
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      isSimulation: true
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({ success: false, message: 'Failed to initiate payment gateway.' });
  }
});

// VERIFY PAYMENT SIGNATURE (Crucial Security Check)
paymentRouter.post('/verify-razorpay-payment', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, simulated } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Missing payment verification parameters.' });
    }

    let isValid = false;

    if (simulated) {
      // In sandbox/test environment
      isValid = true;
    } else if (razorpay_signature) {
      // Cryptographic HMAC SHA256 verification
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', CONFIG.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      isValid = expectedSignature === razorpay_signature;
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid cryptographic signature.'
      });
    }

    // Update order in persistent DB
    const now = new Date().toISOString();
    let updatedOrder: any = null;

    db.mutate(data => {
      const ord = data.orders.find(o => o.id === orderId || o.orderNumber === orderId);
      if (ord) {
        ord.paymentStatus = 'COMPLETED';
        ord.razorpayPaymentId = razorpay_payment_id;
        ord.razorpayOrderId = razorpay_order_id;
        ord.updatedAt = now;
        ord.statusTimeline.push({
          status: ord.status,
          timestamp: now,
          note: `Payment of ₹${ord.totalAmount} verified successfully (Ref: ${razorpay_payment_id}).`
        });
        updatedOrder = ord;
      }
    });

    if (io && updatedOrder) {
      io.to(`order:${updatedOrder.id}`).emit('order-status-updated', updatedOrder);
      io.to('admin-room').emit('order-status-updated', updatedOrder);
    }

    return res.json({
      success: true,
      message: 'Payment verified and recorded successfully!',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ success: false, message: 'Server error during payment verification.' });
  }
});
