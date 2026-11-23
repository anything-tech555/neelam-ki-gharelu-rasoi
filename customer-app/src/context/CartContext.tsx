import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, RestaurantSettings } from '../types/shared';
import { INITIAL_SETTINGS } from '../data/initialData';
import { api } from '../services/api';

export interface CartItem {
  id: string;
  name: string;
  hindiName?: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: FoodItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  deliveryDistanceKm: number;
  setDeliveryDistanceKm: (km: number) => void;
  deliveryCharge: number;
  discountAmount: number;
  appliedCoupon: string | null;
  couponMessage: string | null;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  totalAmount: number;
  restaurantSettings: RestaurantSettings | null;
  refreshSettings: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nkg_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() => localStorage.getItem('nkg_coupon'));
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number>(3); // Default 3km (within 5km free zone)
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>(INITIAL_SETTINGS);

  const refreshSettings = async () => {
    try {
      const res = await api.get('/api/settings').catch(() => null);
      if (res?.success && res.settings) {
        setRestaurantSettings(res.settings);
      }
    } catch (e) {
      console.warn('Could not reach backend / using initial restaurant settings:', e);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem('nkg_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: FoodItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      const priceToUse = item.discountPrice !== undefined ? item.discountPrice : item.price;
      if (existing) {
        return prev.map(i => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          hindiName: item.hindiName,
          price: priceToUse,
          quantity: 1,
          imageUrl: item.imageUrl
        }
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.id === itemId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponMessage(null);
    localStorage.removeItem('nkg_cart');
    localStorage.removeItem('nkg_coupon');
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Delivery charge logic:
  // If subtotal >= freeDeliveryThreshold (299) -> FREE (0)
  // If deliveryDistanceKm <= freeDeliveryRadiusKm (5) -> FREE (0), even for orders under 100 (e.g. 65, 70)!
  // If deliveryDistanceKm > 5 km -> deliveryChargeAboveRadius (30)
  const freeThreshold = restaurantSettings?.freeDeliveryThreshold ?? 299;
  const freeKmRadius = restaurantSettings?.freeDeliveryRadiusKm ?? 5;
  const feeAboveRadius = restaurantSettings?.deliveryChargeAboveRadius ?? 30;

  const isFreeByDistance = deliveryDistanceKm <= freeKmRadius;
  const isFreeBySubtotal = subtotal >= freeThreshold;
  const deliveryCharge = subtotal === 0 || isFreeByDistance || isFreeBySubtotal ? 0 : feeAboveRadius;

  const applyCouponCode = async (code: string): Promise<boolean> => {
    try {
      const res = await api.post('/api/coupons/validate', {
        code,
        cartSubtotal: subtotal
      });

      if (res.success) {
        setAppliedCoupon(res.coupon.code);
        setDiscountAmount(res.discountAmount);
        setCouponMessage(res.message);
        localStorage.setItem('nkg_coupon', res.coupon.code);
        return true;
      } else {
        setCouponMessage(res.message || 'Invalid coupon');
        return false;
      }
    } catch (err: any) {
      setCouponMessage(err.message || 'Failed to apply coupon');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponMessage(null);
    localStorage.removeItem('nkg_coupon');
  };

  const totalAmount = Math.max(0, subtotal + deliveryCharge - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        deliveryDistanceKm,
        setDeliveryDistanceKm,
        deliveryCharge,
        discountAmount,
        appliedCoupon,
        couponMessage,
        applyCouponCode,
        removeCoupon,
        totalAmount,
        restaurantSettings,
        refreshSettings
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
