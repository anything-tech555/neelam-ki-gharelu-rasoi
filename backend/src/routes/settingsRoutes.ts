import { Router, Response } from 'express';
import { db } from '../db/storage';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { RestaurantSettings } from '../types/shared';

export const settingsRouter = Router();

// GET Restaurant Settings (Public)
settingsRouter.get('/', (_req, res: Response) => {
  const settings = db.get('settings');
  return res.json({ success: true, settings });
});

// ADMIN: Update Restaurant Settings
settingsRouter.put('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates: Partial<RestaurantSettings> = req.body;
    let updatedSettings: RestaurantSettings = db.get('settings');

    db.mutate(data => {
      data.settings = {
        ...data.settings,
        ...updates
      };
      updatedSettings = data.settings;
    });

    return res.json({ success: true, message: 'Restaurant settings updated successfully.', settings: updatedSettings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update restaurant settings.' });
  }
});

// ADMIN: Dashboard Analytics & Sales
settingsRouter.get('/analytics', authenticateToken, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = db.get('orders') || [];
    const users = db.get('users') || [];
    const reviews = db.get('reviews') || [];

    const todayStr = new Date().toISOString().substring(0, 10);
    const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr));

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'DELIVERED');
    const pendingOrders = orders.filter(o => o.status === 'ORDER_PLACED' || o.status === 'ORDER_CONFIRMED');
    const preparingOrders = orders.filter(o => o.status === 'PREPARATION_STARTED' || o.status === 'BEING_PREPARED' || o.status === 'FOOD_READY');
    const outForDeliveryOrders = orders.filter(o => o.status === 'OUT_FOR_DELIVERY');
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED');

    const totalSales = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const todayRevenue = todayOrders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalCustomers = users.filter(u => u.role === 'customer').length;

    // Calculate Average Rating
    const avgRating = reviews.length > 0
      ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
      : 4.9;

    // Last 7 days sales breakdown for charts
    const last7Days: { date: string; day: string; orders: number; revenue: number }[] = [];
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().substring(0, 10);
      const dayOrders = orders.filter(o => o.createdAt.startsWith(dStr) && o.status !== 'CANCELLED');
      const dayRev = dayOrders.reduce((s, o) => s + o.totalAmount, 0);

      last7Days.push({
        date: dStr,
        day: daysName[d.getDay()],
        orders: dayOrders.length,
        revenue: dayRev
      });
    }

    return res.json({
      success: true,
      analytics: {
        totalOrders,
        todayOrdersCount: todayOrders.length,
        pendingOrdersCount: pendingOrders.length,
        preparingOrdersCount: preparingOrders.length,
        outForDeliveryOrdersCount: outForDeliveryOrders.length,
        completedOrdersCount: completedOrders.length,
        cancelledOrdersCount: cancelledOrders.length,
        totalSales,
        todayRevenue,
        totalCustomers,
        avgRating,
        last7Days
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to compile analytics.' });
  }
});
