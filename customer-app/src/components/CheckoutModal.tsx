import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, User as UserIcon, CreditCard, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
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

    try {
      // 1. Create order on the backend
      const orderPayload = {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        deliveryAddress: {
          address: address.trim(),
          landmark: landmark ? landmark.trim() : undefined,
          distanceKm: deliveryDistanceKm,
          areaName: deliveryDistanceKm <= 5 ? 'Within 5 km (Free Delivery)' : 'Above 5 km (₹30 Delivery Fee)',
          deliveryInstructions: instructions ? instructions.trim() : undefined
        },
        items: cart.map(i => ({
          foodItemId: i.id,
          quantity: i.quantity
        })),
        paymentMethod,
        couponCode: appliedCoupon || undefined
      };

      const res = await api.post('/api/orders', orderPayload);

      if (!res.success || !res.order) {
        throw new Error(res.message || 'Failed to place order');
      }

      const createdOrder: Order = res.order;

      // 2. Handle Online Payment if selected
      if (paymentMethod === 'RAZORPAY' || paymentMethod === 'UPI' || paymentMethod === 'CARD') {
        try {
          const rzpRes = await api.post('/api/payment/create-razorpay-order', {
            orderId: createdOrder.id
          });

          if (rzpRes.success) {
            // Check if Razorpay JS SDK is loaded and keys are ready
            if (window.Razorpay && rzpRes.keyId && !rzpRes.keyId.includes('placeholder')) {
              const options = {
                key: rzpRes.keyId,
                amount: rzpRes.amount,
                currency: 'INR',
                name: 'Neelam Ki Gharelu Rasoi',
                description: `Payment for Order #${createdOrder.orderNumber}`,
                order_id: rzpRes.razorpayOrderId,
                prefill: {
                  name: createdOrder.customerName,
                  contact: createdOrder.customerPhone
                },
                theme: { color: '#1F4D3A' },
                handler: async (response: any) => {
                  try {
                    const verifyRes = await api.post('/api/payment/verify-razorpay-payment', {
                      orderId: createdOrder.id,
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature
                    });
                    finishOrder(verifyRes.order || createdOrder);
                  } catch (vErr: any) {
                    console.error('Signature verification error:', vErr);
                    finishOrder(createdOrder);
                  }
                },
                modal: {
                  ondismiss: () => {
                    finishOrder(createdOrder);
                  }
                }
              };
              const rzp = new window.Razorpay(options);
              rzp.open();
              return;
            } else {
              // Sandbox / Test Mode simulation
              await api.post('/api/payment/verify-razorpay-payment', {
                orderId: createdOrder.id,
                razorpay_order_id: rzpRes.razorpayOrderId,
                razorpay_payment_id: `pay_test_${Date.now()}`,
                simulated: true
              });
            }
          }
        } catch (paymentErr) {
          console.warn('Payment gateway fallback:', paymentErr);
        }
      }

      finishOrder(createdOrder);
    } catch (err: any) {
      console.warn('Order submission fallback to WhatsApp:', err);
      const itemsList = cart.map(i => `• ${i.name} x${i.quantity} (₹${i.price * i.quantity})`).join('\n');
      const whatsappMsg = `*New Food Order - Neelam Ki Gharelu Rasoi*\n-----------------------------------\n*Customer:* ${name.trim()}\n*Phone:* ${phone.trim()}\n*Address:* ${address.trim()}${landmark ? ` (Landmark: ${landmark.trim()})` : ''}\n*Zone:* ${deliveryDistanceKm <= 5 ? 'Within 5 km (FREE Delivery)' : 'Above 5 km (₹30 Fee)'}\n\n*Ordered Dishes:*\n${itemsList}\n\n*Subtotal:* ₹${subtotal}\n*Delivery Fee:* ₹${deliveryCharge}\n*Total Payable:* ₹${totalAmount}\n*Payment Method:* ${paymentMethod}\n${instructions ? `*Special Instructions:* ${instructions.trim()}\n` : ''}\n-----------------------------------\nPlease accept and deliver my order!`;

      if (window.confirm('Server is unreachable. Would you like to send this order directly via WhatsApp to Neelam Ki Gharelu Rasoi (+91 9997433379)?')) {
        window.open(`https://wa.me/919997433379?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
        clearCart();
        setIsSubmitting(false);
        onClose();
        return;
      }
      setErrorMessage(err.message || 'Could not process order. Please call 9997433379 or 8272072057.');
      setIsSubmitting(false);
    }
  };

  const finishOrder = (order: Order) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    clearCart();
    setIsSubmitting(false);
    onClose();
    onOrderSuccess(order);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-rasoi-green text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-lg flex items-center gap-2">
              <span>Delivery & Payment</span>
              <span className="veg-badge !w-3 !h-3"></span>
            </h3>
            <p className="text-xs text-rasoi-gold font-medium">
              Neelam Ki Gharelu Rasoi • Moradabad
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmitOrder} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          {/* User Saved Address shortcut if available */}
          {user && user.addresses && user.addresses.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Saved Addresses
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {user.addresses.map((addr) => (
                  <button
                    type="button"
                    key={addr.id}
                    onClick={() => {
                      setAddress(addr.address);
                      if (addr.landmark) setLandmark(addr.landmark);
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      address === addr.address
                        ? 'border-rasoi-green bg-rasoi-lightGreen text-rasoi-green'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-rasoi-green" />
                    <span>{addr.tag}: {addr.address.substring(0, 24)}...</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('name')} *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('phone')} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10 digit mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t('deliveryAddress')} (Moradabad) *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <textarea
                required
                rows={2}
                placeholder="House/Flat number, building name, street, area, Moradabad"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
              />
            </div>
          </div>

          {/* Delivery Distance / Area Selector */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-800">
                Delivery Area Distance (from Panchsheel Apt, Kanth Rd)
              </label>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${deliveryDistanceKm <= 5 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
                {deliveryDistanceKm <= 5 ? 'FREE Delivery' : '+₹30 Delivery Fee'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div
                onClick={() => setDeliveryDistanceKm(3)}
                className={`p-2.5 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                  deliveryDistanceKm <= 5
                    ? 'border-rasoi-green bg-rasoi-lightGreen text-rasoi-green shadow-sm'
                    : 'border-gray-200 hover:bg-white text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Within 5 km</span>
                  <span className="text-[10px] bg-green-200 text-green-900 font-extrabold px-1.5 py-0.5 rounded">FREE</span>
                </div>
                <p className="text-[10px] text-gray-600 mt-1 leading-snug">
                  Kanth Rd, Civil Lines, Ram Ganga Vihar, Ashiyana, Harthala, MDA
                </p>
              </div>

              <div
                onClick={() => setDeliveryDistanceKm(7)}
                className={`p-2.5 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                  deliveryDistanceKm > 5
                    ? 'border-rasoi-green bg-rasoi-lightGreen text-rasoi-green shadow-sm'
                    : 'border-gray-200 hover:bg-white text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Above 5 km</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded">₹30 FEE</span>
                </div>
                <p className="text-[10px] text-gray-600 mt-1 leading-snug">
                  Delhi Rd, Sambhal Rd, Majhola, Line Par, Railway Station, Pakbara
                </p>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 italic">
              * Free delivery applies on all orders within 5 km (even on orders under ₹100 like ₹65 or ₹70)!
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
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-3 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-rasoi-green bg-rasoi-lightGreen text-rasoi-green shadow-sm'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <CreditCard className="w-5 h-5 text-rasoi-gold" />
                  {paymentMethod === 'RAZORPAY' && <CheckCircle2 className="w-4 h-4 text-rasoi-green" />}
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
              100% Secure Checkout
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Confirming Order...' : `${t('placeOrder')} (₹${totalAmount})`}
          </button>
        </form>
      </div>
    </div>
  );
};
