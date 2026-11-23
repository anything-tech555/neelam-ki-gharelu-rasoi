import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedToCheckout }) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryCharge,
    discountAmount,
    appliedCoupon,
    couponMessage,
    applyCouponCode,
    removeCoupon,
    totalAmount,
    restaurantSettings
  } = useCart();

  const { lang, t } = useLanguage();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isOpen) return null;

  const freeThreshold = restaurantSettings?.freeDeliveryThreshold || 299;
  const amountNeededForFreeDelivery = Math.max(0, freeThreshold - subtotal);
  const minOrderAmount = restaurantSettings?.minOrderAmount || 50;
  const isBelowMin = subtotal < minOrderAmount;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await applyCouponCode(couponInput.trim());
    setCouponLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-rasoi-green text-white flex items-center justify-between shadow">
            <div>
              <h2 className="font-heading font-bold text-lg leading-tight flex items-center gap-2">
                <span>{t('cartTitle')}</span>
                <span className="veg-badge !w-3 !h-3"></span>
              </h2>
              <p className="text-xs text-rasoi-gold font-medium mt-0.5">
                Neelam Ki Gharelu Rasoi • Moradabad
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery progress incentive */}
          {subtotal > 0 && (
            <div className="bg-emerald-50 border-b border-emerald-200 p-2.5 px-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-medium">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  🎉 <strong>FREE Delivery within 5 km</strong> on all orders (even ₹65 or ₹70)! {amountNeededForFreeDelivery > 0 ? `Add ₹${amountNeededForFreeDelivery} more for free delivery citywide.` : 'Unlocked citywide free delivery!'}
                </span>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-rasoi-cream border-2 border-dashed border-rasoi-green/40 flex items-center justify-center mx-auto text-rasoi-green">
                  <span className="veg-badge !w-6 !h-6"></span>
                </div>
                <h3 className="font-heading font-bold text-gray-800 text-lg">
                  {t('cartEmpty')}
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Browse our authentic homemade curries, thalis, and parathas to start ordering!
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 rounded-full bg-rasoi-green text-white font-heading font-semibold text-sm hover:bg-rasoi-dark shadow-sm transition-all"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs text-gray-500">
                  <span>{cart.length} distinct item{cart.length > 1 ? 's' : ''}</span>
                  <button
                    onClick={clearCart}
                    className="text-rasoi-red hover:underline flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear all
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-rasoi-cream/60 border border-rasoi-line/70"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-bold text-sm text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">₹{item.price} each</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-rasoi-green text-white rounded-md text-xs shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-rasoi-dark rounded-l-md"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-rasoi-dark rounded-r-md"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-heading font-bold text-sm text-gray-900 w-12 text-right">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Coupon Code Input */}
                <div className="pt-2">
                  <div className="border border-dashed border-rasoi-gold/60 rounded-xl p-3 bg-rasoi-goldLight/50">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-rasoi-goldDark" />
                        {t('haveCoupon')}
                      </span>
                      {appliedCoupon && (
                        <span className="text-green-700 font-mono">APPLIED</span>
                      )}
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-green-200">
                        <div>
                          <span className="font-mono font-bold text-xs text-rasoi-green">{appliedCoupon}</span>
                          <span className="text-xs text-green-700 ml-2 font-medium">Saved ₹{discountAmount}</span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-xs text-rasoi-red hover:underline font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. SWAGAT50"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="flex-1 px-3 py-1.5 text-xs uppercase font-mono rounded-lg border border-gray-300 focus:outline-none focus:border-rasoi-green"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponInput.trim()}
                          className="px-4 py-1.5 rounded-lg bg-rasoi-green text-white text-xs font-heading font-bold hover:bg-rasoi-dark disabled:opacity-50 transition-colors"
                        >
                          {couponLoading ? '...' : t('applyCoupon')}
                        </button>
                      </div>
                    )}

                    {couponMessage && (
                      <p className={`text-[11px] mt-1.5 font-medium ${appliedCoupon ? 'text-green-700' : 'text-rasoi-red'}`}>
                        {couponMessage}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs text-gray-600">
                  <h4 className="font-heading font-bold text-gray-800 text-sm mb-2">
                    {t('billDetails')}
                  </h4>
                  <div className="flex justify-between">
                    <span>{t('subtotal')}</span>
                    <span className="font-medium text-gray-800">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('deliveryFee')}</span>
                    {deliveryCharge === 0 ? (
                      <span className="font-bold text-green-700">FREE (within 5 km)</span>
                    ) : (
                      <span className="font-medium text-gray-800">₹{deliveryCharge} (above 5 km)</span>
                    )}
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-700 font-medium">
                      <span>{t('couponDiscount')}</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-heading font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                    <span>{t('toPay')}</span>
                    <span className="text-rasoi-green text-base">₹{totalAmount}</span>
                  </div>
                </div>

                {/* Cancellation Policy Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 text-amber-900 text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong>Cancellation Rule:</strong> {t('cancellationRule')}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Bar */}
          {cart.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2">
              {isBelowMin && (
                <p className="text-xs text-rasoi-red text-center font-semibold">
                  Minimum order amount is ₹{minOrderAmount}. Please add ₹{minOrderAmount - subtotal} more.
                </p>
              )}
              <button
                onClick={onProceedToCheckout}
                disabled={isBelowMin}
                className="w-full py-3.5 px-4 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-between"
              >
                <span>{t('checkout')}</span>
                <span className="flex items-center gap-1.5">
                  ₹{totalAmount}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
