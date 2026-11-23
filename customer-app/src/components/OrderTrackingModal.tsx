import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, AlertCircle, ShoppingBag, MapPin, Phone, ChefHat, Bike, Star } from 'lucide-react';
import { Order, OrderStatus, ORDER_STATUS_DETAILS } from '../types/shared';
import { socket, api } from '../services/api';
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

  // Join Socket.IO order room for real-time updates
  useEffect(() => {
    if (!order?.id || !isOpen) return;

    socket.emit('join-order-room', order.id);

    const handleUpdate = (updatedOrder: Order) => {
      if (updatedOrder.id === order.id) {
        setOrder(updatedOrder);
        onOrderUpdated(updatedOrder);
      }
    };

    socket.on('order-status-updated', handleUpdate);

    // Also poll every 10 seconds as a fallback
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/orders/${order.id}`);
        if (res.success && res.order) {
          setOrder(res.order);
          onOrderUpdated(res.order);
        }
      } catch (e) {
        // quiet fallback
      }
    }, 10000);

    return () => {
      socket.off('order-status-updated', handleUpdate);
      clearInterval(interval);
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
      const res = await api.patch(`/api/orders/${order.id}/cancel`, {
        reason: 'Customer requested cancellation via app'
      });
      if (res.success && res.order) {
        setOrder(res.order);
        onOrderUpdated(res.order);
        setCancelConfirm(false);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatCancelTime = (ms: number) => {
    const mins = Math.floor(ms / (60 * 1000));
    const secs = Math.floor((ms % (60 * 1000)) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-rasoi-green text-white p-4 flex items-center justify-between shadow">
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
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
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
                  *Delivery times are real-time estimates, not guarantees.
                </p>
              </div>
            )}

            {isDelivered && (
              <p className="text-xs text-green-800 font-medium pt-1">
                Food safely delivered hot to your doorstep. Shuddh Shakahari Dhanyavaad!
              </p>
            )}

            {isCancelled && (
              <p className="text-xs text-red-700 font-medium pt-1">
                {order.cancellationReason || 'Order was cancelled.'}
              </p>
            )}
          </div>

          {/* Stepper Timeline (Visual 8-step pipeline) */}
          {!isCancelled && (
            <div className="space-y-3 py-1">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-500">
                Preparation & Delivery Journey
              </h4>
              <div className="space-y-3">
                {ORDER_STEPS.map((step, idx) => {
                  const details = ORDER_STATUS_DETAILS[step];
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  // Find timestamp from timeline if recorded
                  const timelineEntry = order.statusTimeline?.find(t => t.status === step);

                  return (
                    <div key={step} className="flex items-start gap-3 relative">
                      {/* Vertical line between steps */}
                      {idx < ORDER_STEPS.length - 1 && (
                        <div
                          className={`absolute left-[13px] top-[26px] bottom-[-14px] w-0.5 ${
                            currentStepIndex > idx ? 'bg-rasoi-green' : 'bg-gray-200'
                          }`}
                        />
                      )}

                      {/* Step Circle Indicator */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                          isDone
                            ? isCurrent
                              ? 'bg-rasoi-gold text-rasoi-dark ring-4 ring-rasoi-gold/30'
                              : 'bg-rasoi-green text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                      </div>

                      {/* Step Text & Time */}
                      <div className="flex-1 min-w-0 pt-0.5 flex items-baseline justify-between">
                        <div>
                          <p className={`text-xs sm:text-sm font-heading font-bold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                            {lang === 'hi' ? details.hindiLabel : details.label}
                          </p>
                          {timelineEntry?.note && (
                            <p className="text-[11px] text-gray-500 font-normal">
                              {timelineEntry.note}
                            </p>
                          )}
                        </div>

                        {timelineEntry?.timestamp && (
                          <span className="text-[11px] text-gray-400 font-mono shrink-0 ml-2">
                            {new Date(timelineEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review prompt when delivered */}
          {isDelivered && (
            <div className="p-4 rounded-xl bg-rasoi-goldLight border border-rasoi-gold/40 flex items-center justify-between gap-3">
              <div>
                <h5 className="font-heading font-bold text-sm text-rasoi-dark">
                  How was your homemade food?
                </h5>
                <p className="text-xs text-rasoi-mut">
                  Rate Neelam Ji’s cooking and share your feedback!
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenReview(order);
                }}
                className="px-4 py-2 rounded-lg bg-rasoi-green text-white font-heading font-bold text-xs flex items-center gap-1.5 hover:bg-rasoi-dark shadow-sm transition-all"
              >
                <Star className="w-3.5 h-3.5 fill-rasoi-gold text-rasoi-gold" />
                {t('rateFood')}
              </button>
            </div>
          )}

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
