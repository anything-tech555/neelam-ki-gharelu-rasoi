import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, AlertCircle, ShoppingBag, MapPin, Phone, ChefHat, Bike, Star, Send } from 'lucide-react';
import { Order, OrderStatus, ORDER_STATUS_DETAILS } from '../types/shared';
import { socket, api } from '../services/api';
import { localDatabase } from '../services/localDatabase';
import { useLanguage } from '../context/LanguageContext';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdated: (updated: Order) => void;
  onOpenReview: (order: Order) => void;
}

const ORDER_STEPS: OrderStatus[] = [
  'ORDER_PLACED',
  'ORDER_CONFIRMED',
  'PREPARATION_STARTED',
  'BEING_PREPARED',
  'FOOD_READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  order: initialOrder,
  onOrderUpdated,
  onOpenReview
}) => {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [cancelTimeLeft, setCancelTimeLeft] = useState<number>(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const { lang, t } = useLanguage();

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  // Synchronize order changes (from admin or backend)
  useEffect(() => {
    if (!order?.id || !isOpen) return;

    // 1. Socket.IO sync if online
    socket.emit('join-order-room', order.id);
    const handleSocketUpdate = (updatedOrder: Order) => {
      if (updatedOrder.id === order.id) {
        setOrder(updatedOrder);
        onOrderUpdated(updatedOrder);
      }
    };
    socket.on('order-status-updated', handleSocketUpdate);

    // 2. Local Database sync (BroadcastChannel & storage)
    const unsubscribe = localDatabase.subscribe(event => {
      if (event.type === 'ORDER_UPDATED' && event.payload?.id === order.id) {
        setOrder(event.payload);
        onOrderUpdated(event.payload);
      }
    });

    return () => {
      socket.off('order-status-updated', handleSocketUpdate);
      unsubscribe();
    };
  }, [order?.id, isOpen]);

  // Live Countdown Calculations
  useEffect(() => {
    if (!order) return;

    const tick = () => {
      // 1. Delivery Countdown
      if (order.estimatedDeliveryTime && order.status !== 'DELIVERED' && order.status !== 'CANCELLED') {
        const diffMs = new Date(order.estimatedDeliveryTime).getTime() - Date.now();
        if (diffMs > 0) {
          const totalSecs = Math.floor(diffMs / 1000);
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          setTimeLeftStr(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
        } else {
          setTimeLeftStr('Arriving any moment');
        }
      } else {
        setTimeLeftStr('');
      }

      // 2. Cancellation 30m window countdown
      const orderAt = new Date(order.createdAt).getTime();
      const elapsed = Date.now() - orderAt;
      const thirtyMins = 30 * 60 * 1000;
      const left = Math.max(0, thirtyMins - elapsed);
      setCancelTimeLeft(left);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [order]);

  if (!isOpen || !order) return null;

  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const currentStepIndex = ORDER_STATUS_DETAILS[order.status]?.stepIndex ?? 0;
  const canCancel = !isCancelled && !isDelivered && order.status !== 'OUT_FOR_DELIVERY' && cancelTimeLeft > 0;

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const updated = localDatabase.updateOrderStatus(order.id, 'CANCELLED');
      if (updated) {
        setOrder(updated);
        onOrderUpdated(updated);
      }
      await api.patch(`/api/orders/${order.id}/cancel`, {
        reason: 'Customer requested cancellation via app'
      }).catch(() => {});
      setCancelConfirm(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSendWhatsAppConfirmation = () => {
    const itemsList = order.items.map(i => `• ${i.name} x${i.quantity} (₹${i.itemTotal})`).join('\n');
    const msg = `*Order Confirmation - Neelam Ki Gharelu Rasoi*\n-----------------------------------\n*Order ID:* #${order.orderNumber}\n*Customer:* ${order.customerName}\n*Phone:* ${order.customerPhone}\n*Address:* ${order.deliveryAddress.address}${order.deliveryAddress.landmark ? ` (Landmark: ${order.deliveryAddress.landmark})` : ''}\n*Zone:* ${order.deliveryAddress.areaName || 'Moradabad'}\n\n*Dishes:*\n${itemsList}\n\n*Total:* ₹${order.totalAmount} (${order.paymentMethod})\n*Status:* ${order.status.replace(/_/g, ' ')}\n-----------------------------------\nThank you for homemade delicious food!`;
    window.open(`https://wa.me/919997433379?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const formatCancelTime = (ms: number) => {
    const mins = Math.floor(ms / (60 * 1000));
    const secs = Math.floor((ms % (60 * 1000)) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-rasoi-green text-white p-4 flex items-center justify-between shadow shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm bg-white/20 px-2.5 py-0.5 rounded-full text-rasoi-gold">
                #{order.orderNumber}
              </span>
              <span className="veg-badge !w-3 !h-3"></span>
            </div>
            <h3 className="font-heading font-extrabold text-lg mt-1 text-white">
              {lang === 'hi' ? 'लाइव ऑर्डर ट्रैकिंग' : 'Live Order Tracking'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Status Highlight Banner */}
          <div
            className={`p-4 rounded-2xl text-center space-y-1 shadow-sm ${
              isCancelled
                ? 'bg-red-50 border border-red-200 text-red-800'
                : isDelivered
                ? 'bg-green-50 border border-green-200 text-green-900'
                : 'bg-rasoi-lightGreen border border-rasoi-green/30 text-rasoi-green'
            }`}
          >
            <p className="text-xs uppercase font-extrabold tracking-wider">
              {lang === 'hi' ? 'वर्तमान स्थिति' : 'Current Status'}
            </p>
            <h2 className="font-heading font-extrabold text-2xl">
              {lang === 'hi'
                ? ORDER_STATUS_DETAILS[order.status]?.hindiLabel || order.status
                : ORDER_STATUS_DETAILS[order.status]?.label || order.status}
            </h2>

            {/* Countdown Display */}
            {!isCancelled && !isDelivered && timeLeftStr && (
              <div className="pt-2 flex flex-col items-center">
                <div className="flex items-center gap-1.5 font-mono font-bold text-base text-gray-900 bg-white/80 px-3 py-1 rounded-full shadow-inner border border-gray-200">
                  <Clock className="w-4 h-4 text-rasoi-green" />
                  <span>Est. Arrival: {timeLeftStr}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 italic">
                  * Estimated delivery time from Moradabad kitchen
                </p>
              </div>
            )}
          </div>

          {/* 8-Step Timeline */}
          {!isCancelled && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200/70">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-600">
                Order Progress Timeline
              </h4>
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-200"></div>

                {ORDER_STEPS.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;
                  const stepDetail = ORDER_STATUS_DETAILS[step];

                  return (
                    <div key={step} className="relative flex items-start gap-3">
                      <div
                        className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-rasoi-green text-white ring-4 ring-emerald-100'
                            : 'bg-gray-200 text-gray-500'
                        } ${isCurrent ? 'animate-bounce' : ''}`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>

                      <div>
                        <p className={`font-heading font-bold text-xs ${isCurrent ? 'text-rasoi-green text-sm' : isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                          {lang === 'hi' ? stepDetail?.hindiLabel : stepDetail?.label}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {isCurrent ? 'Current stage' : isDone ? 'Completed' : 'Upcoming'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Send Copy to WhatsApp */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-emerald-950">WhatsApp Kitchen Connect</p>
              <p className="text-[11px] text-emerald-700">Need to update delivery instructions? Chat with kitchen.</p>
            </div>
            <button
              onClick={handleSendWhatsAppConfirmation}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* Delivery Address & Contact */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-gray-900">
              <MapPin className="w-3.5 h-3.5 text-rasoi-green" />
              <span>Delivery To: {order.customerName} ({order.customerPhone})</span>
            </div>
            <p className="pl-5 text-gray-600">
              {order.deliveryAddress.address}
              {order.deliveryAddress.landmark && ` • Landmark: ${order.deliveryAddress.landmark}`}
            </p>
            {order.deliveryAddress.deliveryInstructions && (
              <p className="pl-5 text-gray-500 italic">
                Note: "{order.deliveryAddress.deliveryInstructions}"
              </p>
            )}
          </div>

          {/* Ordered Dishes List */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-rasoi-green" />
              Ordered Items ({order.items.length})
            </h4>
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
              {order.items.map((item, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="veg-badge !w-3 !h-3"></span>
                    <span className="font-medium text-gray-900">
                      {item.quantity} × {item.name}
                    </span>
                  </div>
                  <span className="font-heading font-bold text-gray-800">
                    ₹{item.itemTotal}
                  </span>
                </div>
              ))}
              <div className="p-2.5 bg-gray-50 flex items-center justify-between font-heading font-extrabold text-sm text-gray-900">
                <span>Total Amount ({order.paymentMethod}):</span>
                <span className="text-rasoi-green">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Cancellation Control within 30 minutes */}
          {canCancel && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Free cancellation available for: <strong>{formatCancelTime(cancelTimeLeft)}</strong>
                </span>
              </div>

              {cancelConfirm ? (
                <div className="pt-1 flex items-center gap-2">
                  <span className="font-bold text-red-700">Are you sure?</span>
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="px-3 py-1 rounded bg-rasoi-red text-white font-bold text-xs hover:bg-red-700"
                  >
                    {isCancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                  </button>
                  <button
                    onClick={() => setCancelConfirm(false)}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-800 text-xs font-semibold"
                  >
                    No, Keep Order
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCancelConfirm(true)}
                  className="text-xs text-rasoi-red hover:underline font-bold"
                >
                  Cancel this Order
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
