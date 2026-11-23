export type UserRole = 'customer' | 'admin';

export interface SavedAddress {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  address: string;
  landmark?: string;
  distanceKm?: number;
  areaName?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  addresses: SavedAddress[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  hindiName: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  hindiName?: string;
  description: string;
  hindiDescription?: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  categoryName?: string;
  imageUrl: string;
  galleryImages?: string[];
  isVeg: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  isSpecial: boolean;
  prepTimeMinutes: number;
  rating: number;
  ratingCount: number;
  displayOrder: number;
  createdAt: string;
}

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'PREPARATION_STARTED'
  | 'BEING_PREPARED'
  | 'FOOD_READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export const ORDER_STATUS_DETAILS: Record<OrderStatus, { label: string; hindiLabel: string; stepIndex: number; color: string }> = {
  ORDER_PLACED: { label: 'Order Placed', hindiLabel: 'ऑर्डर प्राप्त हुआ', stepIndex: 0, color: '#3b82f6' },
  ORDER_CONFIRMED: { label: 'Order Confirmed', hindiLabel: 'ऑर्डर कन्फर्म हुआ', stepIndex: 1, color: '#10b981' },
  PREPARATION_STARTED: { label: 'Food Preparation Started', hindiLabel: 'खाना बनना शुरू हुआ', stepIndex: 2, color: '#f59e0b' },
  BEING_PREPARED: { label: 'Food Being Prepared', hindiLabel: 'खाना तैयार हो रहा है', stepIndex: 3, color: '#f97316' },
  FOOD_READY: { label: 'Food Ready', hindiLabel: 'खाना तैयार है', stepIndex: 4, color: '#8b5cf6' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', hindiLabel: 'डिलीवरी के लिए रवाना', stepIndex: 5, color: '#06b6d4' },
  DELIVERED: { label: 'Delivered', hindiLabel: 'सफलतापूर्वक डिलीवर हुआ', stepIndex: 6, color: '#1F4D3A' },
  CANCELLED: { label: 'Cancelled', hindiLabel: 'ऑर्डर रद्द', stepIndex: -1, color: '#ef4444' }
};

export type PaymentMethod = 'UPI' | 'RAZORPAY' | 'CARD' | 'COD';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  foodItemId: string;
  name: string;
  hindiName?: string;
  price: number;
  quantity: number;
  itemTotal: number;
  imageUrl?: string;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    address: string;
    landmark?: string;
    distanceKm?: number;
    areaName?: string;
    deliveryInstructions?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: OrderStatus;
  statusTimeline: OrderTimelineEntry[];
  prepTimeEstimatedMinutes: number;
  deliveryTimeEstimatedMinutes: number;
  estimatedDeliveryTime?: string;
  actualPreparationCompletedAt?: string;
  deliveryDepartureAt?: string;
  deliveredAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  reviewPhotos?: string[];
  adminReply?: string;
  adminReplyAt?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  isFirstOrderOnly: boolean;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export interface RestaurantSettings {
  businessName: string;
  hindiName: string;
  tagline: string;
  category: string;
  location: string;
  address: string;
  phone: string;
  secondaryPhone?: string;
  currency: string;
  isOpen: boolean;
  isPaused: boolean;
  pauseMessage?: string;
  openingTime: string;
  closingTime: string;
  defaultPrepTimeMinutes: number;
  defaultDeliveryTimeMinutes: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  minOrderAmount: number;
  freeDeliveryRadiusKm?: number;
  deliveryChargeAboveRadius?: number;
  announcementBanner?: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string; // 'admin' or user id
  title: string;
  hindiTitle?: string;
  message: string;
  hindiMessage?: string;
  type: 'order' | 'status' | 'payment' | 'review' | 'promo';
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}
