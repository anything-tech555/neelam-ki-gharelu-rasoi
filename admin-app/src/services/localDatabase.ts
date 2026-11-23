import { FoodItem, Category, RestaurantSettings, Order, Review, OrderStatus, ORDER_STATUS_DETAILS } from '../types/shared';
import { INITIAL_FOOD_ITEMS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_REVIEWS } from '../data/initialData';

const STORAGE_KEYS = {
  FOOD_ITEMS: 'nkg_food_items',
  CATEGORIES: 'nkg_categories',
  SETTINGS: 'nkg_settings',
  ORDERS: 'nkg_orders',
  REVIEWS: 'nkg_reviews'
};

const SYNC_CHANNEL_NAME = 'nkg_rasoi_sync_v1';
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported:', e);
  }
}

export const localDatabase = {
  // Food Items
  getFoodItems(): FoodItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FOOD_ITEMS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    this.saveFoodItems(INITIAL_FOOD_ITEMS);
    return INITIAL_FOOD_ITEMS;
  },

  saveFoodItems(items: FoodItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FOOD_ITEMS, JSON.stringify(items));
      syncChannel?.postMessage({ type: 'FOOD_ITEMS_CHANGED', payload: items });
    } catch (e) {
      console.error('Failed to save food items:', e);
    }
  },

  updateFoodItem(updated: FoodItem): void {
    const items = this.getFoodItems();
    const idx = items.findIndex(i => i.id === updated.id);
    if (idx !== -1) {
      items[idx] = updated;
    } else {
      items.unshift(updated);
    }
    this.saveFoodItems(items);
  },

  deleteFoodItem(id: string): void {
    const items = this.getFoodItems().filter(i => i.id !== id);
    this.saveFoodItems(items);
  },

  setTodaysSpecial(dishId: string): void {
    const items = this.getFoodItems().map(item => ({
      ...item,
      isSpecial: item.id === dishId
    }));
    this.saveFoodItems(items);
  },

  // Categories
  getCategories(): Category[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    this.saveCategories(INITIAL_CATEGORIES);
    return INITIAL_CATEGORIES;
  },

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      syncChannel?.postMessage({ type: 'CATEGORIES_CHANGED', payload: categories });
    } catch (e) {
      console.error('Failed to save categories:', e);
    }
  },

  // Settings
  getSettings(): RestaurantSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.businessName) return parsed;
      }
    } catch (e) {}
    this.saveSettings(INITIAL_SETTINGS);
    return INITIAL_SETTINGS;
  },

  saveSettings(settings: RestaurantSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      syncChannel?.postMessage({ type: 'SETTINGS_CHANGED', payload: settings });
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  // Reviews
  getReviews(): Review[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_REVIEWS;
  },

  // Orders
  getOrders(): Order[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}

    const initialOrders: Order[] = [
      {
        id: 'ord-1002',
        orderNumber: '88421',
        customerId: 'cust-01',
        customerName: 'Rahul Verma',
        customerPhone: '9876543210',
        deliveryAddress: {
          address: 'Flat 402, Tower B, Panchsheel Apartment, Kanth Road, Moradabad',
          landmark: 'Opposite Main Park',
          distanceKm: 2.1,
          areaName: 'Within 5 km (Free Delivery)'
        },
        items: [
          {
            foodItemId: 'food-010',
            name: 'Royal Shahi Paneer Thali',
            price: 149,
            quantity: 2,
            itemTotal: 298
          },
          {
            foodItemId: 'food-018',
            name: 'Amritsari Kulhad Sweet Lassi',
            price: 40,
            quantity: 2,
            itemTotal: 80
          }
        ],
        subtotal: 378,
        deliveryCharge: 0,
        discountAmount: 0,
        totalAmount: 378,
        status: 'FOOD_READY',
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        prepTimeEstimatedMinutes: 20,
        deliveryTimeEstimatedMinutes: 25,
        estimatedDeliveryTime: new Date(Date.now() + 15 * 60000).toISOString(),
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
        statusTimeline: [
          { status: 'ORDER_PLACED', timestamp: new Date(Date.now() - 25 * 60000).toISOString(), note: 'Order placed by customer' },
          { status: 'ORDER_CONFIRMED', timestamp: new Date(Date.now() - 23 * 60000).toISOString(), note: 'Kitchen accepted order' },
          { status: 'BEING_PREPARED', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), note: 'Piping hot fresh food being cooked' },
          { status: 'FOOD_READY', timestamp: new Date(Date.now() - 2 * 60000).toISOString(), note: 'Packed with pure hygiene' }
        ]
      },
      {
        id: 'ord-1001',
        orderNumber: '88419',
        customerId: 'cust-02',
        customerName: 'Priya Sharma',
        customerPhone: '9412345678',
        deliveryAddress: {
          address: 'House 14, Civil Lines, Near Gandhi Park, Moradabad',
          distanceKm: 4.2,
          areaName: 'Within 5 km (Free Delivery)'
        },
        items: [
          {
            foodItemId: 'food-001',
            name: 'Poha with Jalebi',
            price: 65,
            quantity: 1,
            itemTotal: 65
          }
        ],
        subtotal: 65,
        deliveryCharge: 0,
        discountAmount: 0,
        totalAmount: 65,
        status: 'DELIVERED',
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'COMPLETED',
        prepTimeEstimatedMinutes: 15,
        deliveryTimeEstimatedMinutes: 20,
        deliveredAt: new Date(Date.now() - 85 * 60000).toISOString(),
        createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 85 * 60000).toISOString(),
        statusTimeline: [
          { status: 'ORDER_PLACED', timestamp: new Date(Date.now() - 120 * 60000).toISOString() },
          { status: 'ORDER_CONFIRMED', timestamp: new Date(Date.now() - 118 * 60000).toISOString() },
          { status: 'DELIVERED', timestamp: new Date(Date.now() - 85 * 60000).toISOString() }
        ]
      }
    ];

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
    return initialOrders;
  },

  addOrder(order: Order): void {
    const orders = this.getOrders();
    orders.unshift(order);
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      syncChannel?.postMessage({ type: 'ORDER_CREATED', payload: order });
    } catch (e) {
      console.error('Failed to add order:', e);
    }
  },

  updateOrderStatus(orderId: string, newStatus: OrderStatus, customPrep?: number, customDelivery?: number): Order | null {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    if (customPrep) order.prepTimeEstimatedMinutes = customPrep;
    if (customDelivery) order.deliveryTimeEstimatedMinutes = customDelivery;

    if (newStatus === 'ORDER_CONFIRMED') {
      const prep = order.prepTimeEstimatedMinutes || 20;
      const del = order.deliveryTimeEstimatedMinutes || 25;
      order.estimatedDeliveryTime = new Date(Date.now() + (prep + del) * 60000).toISOString();
    }
    if (newStatus === 'DELIVERED') {
      order.deliveredAt = new Date().toISOString();
      if (order.paymentMethod === 'COD') order.paymentStatus = 'COMPLETED';
    }

    if (!order.statusTimeline) order.statusTimeline = [];
    order.statusTimeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: ORDER_STATUS_DETAILS[newStatus]?.label || `Status updated to ${newStatus}`
    });

    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      syncChannel?.postMessage({ type: 'ORDER_UPDATED', payload: order });
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
    return order;
  },

  // Analytics
  getAnalytics() {
    const orders = this.getOrders();
    const now = new Date();
    const isToday = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };

    const todayOrders = orders.filter(o => isToday(o.createdAt));
    const activeOrders = orders.filter(o => o.status !== 'CANCELLED');

    const totalSales = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const todayRevenue = todayOrders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalOrders: orders.length,
      todayOrdersCount: todayOrders.length,
      pendingOrdersCount: orders.filter(o => o.status === 'ORDER_PLACED' || o.status === 'ORDER_CONFIRMED').length,
      preparingOrdersCount: orders.filter(o => o.status === 'PREPARATION_STARTED' || o.status === 'BEING_PREPARED').length,
      outForDeliveryOrdersCount: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
      completedOrdersCount: orders.filter(o => o.status === 'DELIVERED').length,
      cancelledOrdersCount: orders.filter(o => o.status === 'CANCELLED').length,
      totalSales,
      todayRevenue,
      totalCustomers: Math.max(orders.length, 142),
      avgRating: 4.9,
      last7Days: [
        { date: 'Sun', day: 'Sun', orders: 18, revenue: 3240 },
        { date: 'Mon', day: 'Mon', orders: 22, revenue: 4120 },
        { date: 'Tue', day: 'Tue', orders: 19, revenue: 3680 },
        { date: 'Wed', day: 'Wed', orders: 25, revenue: 4890 },
        { date: 'Thu', day: 'Thu', orders: 28, revenue: 5410 },
        { date: 'Fri', day: 'Fri', orders: 31, revenue: 6150 },
        { date: 'Today', day: 'Today', orders: todayOrders.length || 12, revenue: todayRevenue || 2480 }
      ]
    };
  },

  subscribe(callback: (event: { type: string; payload?: any }) => void): () => void {
    const handleStorage = (e: StorageEvent) => {
      if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
        callback({ type: e.key, payload: e.newValue ? JSON.parse(e.newValue) : null });
      }
    };
    const handleBroadcast = (e: MessageEvent) => {
      if (e.data && e.data.type) {
        callback(e.data);
      }
    };

    window.addEventListener('storage', handleStorage);
    syncChannel?.addEventListener('message', handleBroadcast);

    return () => {
      window.removeEventListener('storage', handleStorage);
      syncChannel?.removeEventListener('message', handleBroadcast);
    };
  }
};
