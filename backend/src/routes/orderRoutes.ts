import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/storage';
import { authenticateToken, requireAdmin, optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth';
import {
  Order,
  OrderItem,
  OrderStatus,
  ORDER_STATUS_DETAILS,
  PaymentMethod,
  PaymentStatus,
  NotificationItem
} from '../types/shared';
import { io } from '../index';

export const orderRouter = Router();

// Helper to generate human-readable Order Number (e.g., NKG-2026-1048)
const generateOrderNumber = (): string => {
  const randomFour = Math.floor(1000 + Math.random() * 9000);
  return `NKG-${new Date().getFullYear()}-${randomFour}`;
};

// CREATE NEW ORDER (Public / Customer)
orderRouter.post('/', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      items,
      paymentMethod,
      couponCode
    } = req.body;

    if (!customerName || !customerPhone || !deliveryAddress?.address || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name, 10-digit mobile number, delivery address, and ordered dishes are required.'
      });
    }

    if (!/^\d{10}$/.test(customerPhone.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
    }

    const settings = db.get('settings');

    // Check if store is open or paused
    if (!settings.isOpen || settings.isPaused) {
      return res.status(400).json({
        success: false,
        message: settings.pauseMessage || 'Neelam Ki Gharelu Rasoi is currently not accepting new orders. Please check back shortly!'
      });
    }

    const allFoodItems = db.get('foodItems') || [];
    let subtotal = 0;
    let maxPrepTime = settings.defaultPrepTimeMinutes || 25;
    const validatedItems: OrderItem[] = [];

    // Rigorous server-side price validation
    for (const reqItem of items) {
      const food = allFoodItems.find(f => f.id === reqItem.foodItemId);
      if (!food) {
        return res.status(400).json({ success: false, message: `Dish with ID ${reqItem.foodItemId} is not recognized.` });
      }
      if (!food.isAvailable) {
        return res.status(400).json({ success: false, message: `Sorry, "${food.name}" is currently sold out.` });
      }

      const qty = Math.max(1, parseInt(reqItem.quantity, 10) || 1);
      const unitPrice = food.discountPrice !== undefined ? food.discountPrice : food.price;
      const itemTotal = unitPrice * qty;

      subtotal += itemTotal;
      if (food.prepTimeMinutes && food.prepTimeMinutes > maxPrepTime) {
        maxPrepTime = food.prepTimeMinutes;
      }

      validatedItems.push({
        foodItemId: food.id,
        name: food.name,
        hindiName: food.hindiName,
        price: unitPrice,
        quantity: qty,
        itemTotal,
        imageUrl: food.imageUrl
      });
    }

    // Minimum order validation
    if (subtotal < (settings.minOrderAmount || 50)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${settings.minOrderAmount || 50}. Please add more items to your cart.`
      });
    }

    // Coupon Validation
    let discountAmount = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (couponCode) {
      const coupons = db.get('coupons') || [];
      const coupon = coupons.find(c => c.code.toUpperCase() === String(couponCode).toUpperCase().trim() && c.isActive);

      if (coupon) {
        const isExpired = new Date(coupon.expiryDate).getTime() < Date.now();
        const limitReached = coupon.usageCount >= coupon.usageLimit;
        const meetsMin = subtotal >= coupon.minOrderAmount;

        if (!isExpired && !limitReached && meetsMin) {
          if (coupon.discountType === 'PERCENTAGE') {
            const rawDiscount = Math.round((subtotal * coupon.discountValue) / 100);
            discountAmount = coupon.maxDiscountAmount ? Math.min(rawDiscount, coupon.maxDiscountAmount) : rawDiscount;
          } else {
            discountAmount = coupon.discountValue;
          }
          appliedCouponCode = coupon.code;

          // Increment coupon usage
          db.mutate(data => {
            const c = data.coupons.find(cp => cp.id === coupon.id);
            if (c) c.usageCount += 1;
          });
        }
      }
    }

    // Delivery charge calculation:
    // If within 5 km (or subtotal >= freeDeliveryThreshold) => FREE Delivery (₹0).
    // If above 5 km => ₹30.
    const maxFreeRadiusKm = settings.freeDeliveryRadiusKm !== undefined ? settings.freeDeliveryRadiusKm : 5;
    const distanceKm = deliveryAddress.distanceKm !== undefined ? Number(deliveryAddress.distanceKm) : 3;
    let deliveryCharge = 0;

    if (subtotal >= (settings.freeDeliveryThreshold || 299)) {
      deliveryCharge = 0;
    } else if (distanceKm <= maxFreeRadiusKm) {
      deliveryCharge = 0; // FREE within 5 km for any order including under 100 rupees (₹65, ₹70, etc.)
    } else {
      deliveryCharge = settings.deliveryChargeAboveRadius !== undefined ? settings.deliveryChargeAboveRadius : (settings.deliveryCharge || 30);
    }

    const totalAmount = Math.max(0, subtotal + deliveryCharge - discountAmount);
    const orderCreatedAt = new Date().toISOString();
    const deliveryEstimatedMinutes = settings.defaultDeliveryTimeMinutes || 30;
    const totalEstMinutes = maxPrepTime + deliveryEstimatedMinutes;
    const estDeliveryTime = new Date(Date.now() + totalEstMinutes * 60 * 1000).toISOString();

    const selectedPaymentMethod: PaymentMethod = (paymentMethod as PaymentMethod) || 'COD';
    const initialPaymentStatus: PaymentStatus = selectedPaymentMethod === 'COD' ? 'PENDING' : 'PENDING';

    const orderId = `ord-${uuidv4()}`;
    const orderNumber = generateOrderNumber();

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: req.user?.id || `guest-${uuidv4().substring(0, 6)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: {
        address: deliveryAddress.address.trim(),
        landmark: deliveryAddress.landmark ? deliveryAddress.landmark.trim() : undefined,
        distanceKm,
        areaName: deliveryAddress.areaName ? deliveryAddress.areaName.trim() : (distanceKm <= maxFreeRadiusKm ? 'Within 5 km (Free Delivery)' : 'Above 5 km (₹30 Delivery Fee)'),
        deliveryInstructions: deliveryAddress.deliveryInstructions ? deliveryAddress.deliveryInstructions.trim() : undefined
      },
      items: validatedItems,
      subtotal,
      deliveryCharge,
      discountAmount,
      couponCode: appliedCouponCode,
      totalAmount,
      paymentMethod: selectedPaymentMethod,
      paymentStatus: initialPaymentStatus,
      status: 'ORDER_PLACED',
      statusTimeline: [
        {
          status: 'ORDER_PLACED',
          timestamp: orderCreatedAt,
          note: 'Order successfully placed by customer.'
        }
      ],
      prepTimeEstimatedMinutes: maxPrepTime,
      deliveryTimeEstimatedMinutes: deliveryEstimatedMinutes,
      estimatedDeliveryTime: estDeliveryTime,
      createdAt: orderCreatedAt,
      updatedAt: orderCreatedAt
    };

    // Save order in persistent DB
    db.mutate(data => {
      data.orders.unshift(newOrder);

      // Create Admin Notification
      const adminNotif: NotificationItem = {
        id: `notif-${uuidv4().substring(0, 8)}`,
        recipientId: 'admin',
        title: `New Order: ${orderNumber}`,
        hindiTitle: `नया ऑर्डर: ${orderNumber}`,
        message: `${customerName} ordered ${validatedItems.length} items (₹${totalAmount}) via ${selectedPaymentMethod}.`,
        hindiMessage: `${customerName} ने ₹${totalAmount} का ऑर्डर दिया (${selectedPaymentMethod})।`,
        type: 'order',
        orderId: newOrder.id,
        isRead: false,
        createdAt: orderCreatedAt
      };
      data.notifications.unshift(adminNotif);
    });

    // Broadcast Real-time event to Admin Room
    if (io) {
      io.to('admin-room').emit('new-order', {
        order: newOrder,
        notification: {
          title: `New Order ${orderNumber}`,
          body: `₹${totalAmount} from ${customerName}`
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Server failed to process your order.' });
  }
});

// GET Customer's Orders
orderRouter.get('/my-orders', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const userPhone = req.user?.phone;

  const orders = db.get('orders') || [];
  // Match either customerId or user's verified phone
  const userOrders = orders.filter(o => o.customerId === userId || (userPhone && o.customerPhone === userPhone));

  return res.json({ success: true, count: userOrders.length, orders: userOrders });
});

// GET Single Order by ID or Order Number
orderRouter.get('/:id', (req, res: Response) => {
  const identifier = req.params.id;
  const orders = db.get('orders') || [];
  const order = orders.find(o => o.id === identifier || o.orderNumber === identifier);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  return res.json({ success: true, order });
});

// ADMIN: GET all orders with optional status/date filter
orderRouter.get('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { status, search, date } = req.query;
  let orders = db.get('orders') || [];

  if (status) {
    orders = orders.filter(o => o.status === status);
  }

  if (date) {
    const targetDate = String(date).substring(0, 10);
    orders = orders.filter(o => o.createdAt.startsWith(targetDate));
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    orders = orders.filter(
      o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.deliveryAddress.address.toLowerCase().includes(q)
    );
  }

  return res.json({ success: true, count: orders.length, orders });
});

// ADMIN: Update Order Status
orderRouter.patch('/:id/status', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status, note, prepTimeMinutes, deliveryTimeMinutes } = req.body;

    if (!status || !ORDER_STATUS_DETAILS[status as OrderStatus]) {
      return res.status(400).json({ success: false, message: 'Valid order status is required.' });
    }

    const targetStatus = status as OrderStatus;
    const now = new Date().toISOString();
    let updatedOrder: Order | null = null;

    db.mutate(data => {
      const o = data.orders.find(ord => ord.id === orderId || ord.orderNumber === orderId);
      if (o) {
        o.status = targetStatus;
        o.updatedAt = now;

        if (prepTimeMinutes !== undefined) {
          o.prepTimeEstimatedMinutes = Number(prepTimeMinutes);
        }
        if (deliveryTimeMinutes !== undefined) {
          o.deliveryTimeEstimatedMinutes = Number(deliveryTimeMinutes);
        }

        // Specific timestamps
        if (targetStatus === 'FOOD_READY') {
          o.actualPreparationCompletedAt = now;
        } else if (targetStatus === 'OUT_FOR_DELIVERY') {
          o.deliveryDepartureAt = now;
        } else if (targetStatus === 'DELIVERED') {
          o.deliveredAt = now;
          if (o.paymentMethod === 'COD') {
            o.paymentStatus = 'COMPLETED';
          }
        }

        // Recalculate estimated delivery time if modified
        if (prepTimeMinutes !== undefined || deliveryTimeMinutes !== undefined) {
          const totalMins = o.prepTimeEstimatedMinutes + o.deliveryTimeEstimatedMinutes;
          o.estimatedDeliveryTime = new Date(new Date(o.createdAt).getTime() + totalMins * 60 * 1000).toISOString();
        }

        o.statusTimeline.push({
          status: targetStatus,
          timestamp: now,
          note: note || `Status updated to ${ORDER_STATUS_DETAILS[targetStatus].label}.`
        });

        // Add Customer Notification
        data.notifications.unshift({
          id: `notif-${uuidv4().substring(0, 8)}`,
          recipientId: o.customerId,
          title: `Order Update: ${ORDER_STATUS_DETAILS[targetStatus].label}`,
          hindiTitle: `ऑर्डर अपडेट: ${ORDER_STATUS_DETAILS[targetStatus].hindiLabel}`,
          message: `Your order #${o.orderNumber} is now ${ORDER_STATUS_DETAILS[targetStatus].label.toLowerCase()}.`,
          hindiMessage: `आपका ऑर्डर #${o.orderNumber} ${ORDER_STATUS_DETAILS[targetStatus].hindiLabel}।`,
          type: 'status',
          orderId: o.id,
          isRead: false,
          createdAt: now
        });

        updatedOrder = o;
      }
    });

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Emit live status update to customer room AND admin room
    if (io && updatedOrder) {
      const orderData: Order = updatedOrder;
      io.to(`order:${orderData.id}`).emit('order-status-updated', orderData);
      io.to('admin-room').emit('order-status-updated', orderData);
    }

    return res.json({
      success: true,
      message: `Order status set to ${ORDER_STATUS_DETAILS[targetStatus].label}`,
      order: updatedOrder
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

// CANCEL ORDER (Customer or Admin)
orderRouter.patch('/:id/cancel', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;
    const isAdmin = req.user?.role === 'admin';
    const now = new Date().toISOString();

    let cancelledOrder: Order | null = null;
    let cancelError: string | null = null;

    db.mutate(data => {
      const o = data.orders.find(ord => ord.id === orderId || ord.orderNumber === orderId);
      if (!o) {
        cancelError = 'Order not found.';
        return;
      }

      if (o.status === 'CANCELLED') {
        cancelError = 'This order has already been cancelled.';
        return;
      }

      if (o.status === 'DELIVERED') {
        cancelError = 'Cannot cancel an order that has already been delivered.';
        return;
      }

      // Customer cancellation rule: within 30 minutes and not out for delivery
      if (!isAdmin) {
        if (o.status === 'OUT_FOR_DELIVERY') {
          cancelError = 'Cannot cancel order because it is already out for delivery with our delivery partner.';
          return;
        }

        const elapsedMs = Date.now() - new Date(o.createdAt).getTime();
        const thirtyMinutesMs = 30 * 60 * 1000;
        if (elapsedMs > thirtyMinutesMs) {
          cancelError = 'Cancellation window expired (30 minutes from order placement).';
          return;
        }
      }

      o.status = 'CANCELLED';
      o.cancellationReason = reason || (isAdmin ? 'Cancelled by restaurant management' : 'Cancelled by customer');
      o.updatedAt = now;
      o.statusTimeline.push({
        status: 'CANCELLED',
        timestamp: now,
        note: `Order cancelled. Reason: ${o.cancellationReason}`
      });

      cancelledOrder = o;
    });

    if (cancelError) {
      return res.status(400).json({ success: false, message: cancelError });
    }

    if (io && cancelledOrder) {
      const orderData: Order = cancelledOrder;
      io.to(`order:${orderData.id}`).emit('order-status-updated', orderData);
      io.to('admin-room').emit('order-status-updated', orderData);
    }

    return res.json({ success: true, message: 'Order successfully cancelled.', order: cancelledOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  }
});
