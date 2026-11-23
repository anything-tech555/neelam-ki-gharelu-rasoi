import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, User as UserIcon, CreditCard, Banknote, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { localDatabase } from '../services/localDatabase';
import { Order, PaymentMethod } from '../types/shared';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const {
    cart,
    subtotal,
    deliveryDistanceKm,
    setDeliveryDistanceKm,
    deliveryCharge,
    discountAmount,
    appliedCoupon,
    totalAmount,
    clearCart
  } = useCart();
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill from user profile
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
        setAddress(defaultAddr.address);
        if (defaultAddr.landmark) setLandmark(defaultAddr.landmark);
      }
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const finishOrder = (confirmedOrder: Order) => {
    // 1. Save in local synchronized database so admin and customer see it immediately
    localDatabase.addOrder(confirmedOrder);

    // 2. Clear cart
    clearCart();

    // 3. Play celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // 4. Close checkout modal and trigger tracking modal
    setIsSubmitting(false);
    onClose();
    onOrderSuccess(confirmedOrder);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please provide your complete delivery address in Moradabad.');
      return;
    }

    setIsSubmitting(true);

    const generatedOrderNumber = String(Math.floor(100000 + Math.random() * 900000));
    const orderId = `ord-${Date.now()}`;
    const prepMinutes = 20;
    const delMinutes = 25;
    const estDelivery = new Date(Date.now() + (prepMinutes + delMinutes) * 60000).toISOString();

    const createdOrder: Order = {
      id: orderId,
      orderNumber: generatedOrderNumber,
      customerId: user?.id || 'cust-guest',
      customerName: name.trim(),
      customerPhone: phone.trim(),
      deliveryAddress: {
        address: address.trim(),
        landmark: landmark ? landmark.trim() : undefined,
        distanceKm: deliveryDistanceKm,
        areaName: deliveryDistanceKm <= 5 ? 'Within 5 km (FREE Delivery)' : 'Above 5 km (₹30 Delivery Fee)',
        deliveryInstructions: instructions ? instructions.trim() : undefined
      },
      items: cart.map(i => ({
        foodItemId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        itemTotal: i.price * i.quantity
      })),
      subtotal,
      deliveryCharge,
      discountAmount,
      totalAmount,
      status: 'ORDER_PLACED',
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
      prepTimeEstimatedMinutes: prepMinutes,
      deliveryTimeEstimatedMinutes: delMinutes,
      estimatedDeliveryTime: estDelivery,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusTimeline: [
        {
          status: 'ORDER_PLACED',
          timestamp: new Date().toISOString(),
          note: 'Order placed by customer'
        }
      ]
    };

    // Try backend if online
    try {
      const res = await api.post('/api/orders', {
        customerName: createdOrder.customerName,
        customerPhone: createdOrder.customerPhone,
        deliveryAddress: createdOrder.deliveryAddress,
        items: cart.map(i => ({ foodItemId: i.id, quantity: i.quantity })),
        paymentMethod,
        couponCode: appliedCoupon || undefined
      }).catch(() => null);

      if (res?.success && res.order) {
        finishOrder(res.order);
        return;
      }
    } catch (e) {}

    // Instant local order creation (seamless on static/offline/app)
    finishOrder(createdOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-rasoi-green text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="veg-badge !w-4 !h-4"></span>
            <div>
              <h3 className="font-heading font-extrabold text-base leading-snug">
                {t('checkoutTitle')}
              </h3>
              <p className="text-[11px] text-rasoi-gold">
                Neelam Ki Gharelu Rasoi • Moradabad
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('yourName')} *
              </label>
              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('mobileNumber')} *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green font-mono"
                />
              </div>
            </div>
          </div>

          {/* Full Delivery Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t('fullAddress')} *
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <textarea
                required
                rows={2}
                placeholder="House / Flat No., Apartment, Colony, Moradabad"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
              />
            </div>
          </div>

          {/* Distance Selection & Free Delivery Rule */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rasoi-green" />
                <span>Delivery Distance from Kitchen:</span>
              </label>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${deliveryDistanceKm <= 5 ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-900'}`}>
                {deliveryDistanceKm <= 5 ? 'Within 5 km (FREE Delivery)' : 'Above 5 km (+₹30 Delivery Fee)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeliveryDistanceKm(3)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  deliveryDistanceKm <= 5
                    ? 'border-emerald-600 bg-white text-emerald-950 font-bold shadow-sm ring-1 ring-emerald-500'
                    : 'border-gray-200 bg-white/70 text-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Within 5 km</span>
                  <span className="text-xs font-black text-emerald-600 uppercase">FREE</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Panchsheel, Kanth Rd, Civil Lines, MDA Colony, Harthala
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryDistanceKm(7)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  deliveryDistanceKm > 5
                    ? 'border-emerald-600 bg-white text-emerald-950 font-bold shadow-sm ring-1 ring-emerald-500'
                    : 'border-gray-200 bg-white/70 text-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Above 5 km</span>
                  <span className="text-xs font-bold text-gray-700">₹30 Delivery</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Delhi Rd, Majhola, Sambhal Rd, Railway Station, Pakbara
                </p>
              </button>
            </div>
            <p className="text-[11px] text-gray-500 italic">
              * Free delivery applies on all orders within 5 km (even on ₹65 or ₹70 orders)!
            </p>
          </div>

          {/* Landmark & Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('landmark')}
              </label>
              <input
                type="text"
                placeholder="e.g. Near Panchsheel Gate"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('instructions')}
              </label>
              <input
                type="text"
                placeholder="e.g. Less spicy, ring bell"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-rasoi-green bg-rasoi-lightGreen text-rasoi-green shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Banknote className="w-5 h-5 text-rasoi-green" />
                  {paymentMethod === 'COD' && <CheckCircle2 className="w-4 h-4 text-rasoi-green" />}
                </div>
                <div>
                  <h5 className="font-heading font-bold text-xs">Cash on Delivery</h5>
                  <p className="text-[10px] text-gray-500">Pay cash upon hot food arrival</p>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'UPI' || paymentMethod === 'RAZORPAY'
                    ? 'border-rasoi-green bg-rasoi-lightGreen text-rasoi-green shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <CreditCard className="w-5 h-5 text-rasoi-gold" />
                  {(paymentMethod === 'UPI' || paymentMethod === 'RAZORPAY') && <CheckCircle2 className="w-4 h-4 text-rasoi-green" />}
                </div>
                <div>
                  <h5 className="font-heading font-bold text-xs">Online / UPI</h5>
                  <p className="text-[10px] text-gray-500">GPay, PhonePe, Paytm, Cards</p>
                </div>
              </div>
            </div>
          </div>

          {/* Total summary */}
          <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs border border-gray-200">
            <div>
              <span className="text-gray-500">Total Payable:</span>
              <span className="font-heading font-extrabold text-base text-rasoi-green ml-1.5">₹{totalAmount}</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-rasoi-green" />
              100% Pure Desi Ghee Food
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Confirming Order...' : `Confirm & Place Order (₹${totalAmount})`}
          </button>
        </form>
      </div>
    </div>
  );
};
