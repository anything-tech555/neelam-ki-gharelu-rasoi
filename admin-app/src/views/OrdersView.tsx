import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Bike,
  XCircle,
  Phone,
  MapPin,
  ChefHat,
  Sparkles,
  ShoppingBag,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Order, OrderStatus, ORDER_STATUS_DETAILS } from '../types/shared';
import { api, socket } from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';

interface OrdersViewProps {
  soundEnabled: boolean;
  onPendingCountChange: (fn: ((prev: number) => number) | number) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ soundEnabled, onPendingCountChange }) => {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Time adjustment modal state
  const [timeAdjustOrder, setTimeAdjustOrder] = useState<Order | null>(null);
  const [customPrepMinutes, setCustomPrepMinutes] = useState<number>(25);
  const [customDeliveryMinutes, setCustomDeliveryMinutes] = useState<number>(30);

  // Fetch orders
  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await api.get('/api/orders', token);
      if (res.success && res.orders) {
        setOrders(res.orders);
        const pending = res.orders.filter(
          (o: Order) => o.status === 'ORDER_PLACED' || o.status === 'ORDER_CONFIRMED'
        ).length;
        onPendingCountChange(pending);
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  // Real-time socket event listeners
  useEffect(() => {
    const handleNewOrder = (data: { order: Order }) => {
      setOrders(prev => [data.order, ...prev]);
      if (soundEnabled) {
        playOrderAlert();
      }
      onPendingCountChange((prev: number) => prev + 1);
    };

    const handleStatusUpdate = (updatedOrder: Order) => {
      setOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
    };

    socket.on('new-order', handleNewOrder);
    socket.on('order-status-updated', handleStatusUpdate);

    return () => {
      socket.off('new-order', handleNewOrder);
      socket.off('order-status-updated', handleStatusUpdate);
    };
  }, [soundEnabled]);

  const playOrderAlert = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Audio autoplay policy
    }
  };

  // Status transitions
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    setActionLoading(orderId);
    try {
      const res = await api.patch(
        `/api/orders/${orderId}/status`,
        { status, note },
        token
      );
      if (res.success && res.order) {
        setOrders(prev => prev.map(o => (o.id === orderId ? res.order : o)));
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update order status');
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt('Enter cancellation reason (e.g., Dish unavailable, Customer request):');
    if (!reason) return;

    setActionLoading(orderId);
    try {
      const res = await api.patch(
        `/api/orders/${orderId}/cancel`,
        { reason },
        token
      );
      if (res.success && res.order) {
        setOrders(prev => prev.map(o => (o.id === orderId ? res.order : o)));
      }
    } catch (e: any) {
      alert(e.message || 'Failed to cancel order');
    } finally {
      setActionLoading(null);
    }
  };

  // Adjust prep / delivery times
  const handleSaveTimes = async () => {
    if (!timeAdjustOrder) return;
    setActionLoading(timeAdjustOrder.id);
    try {
      const res = await api.patch(
        `/api/orders/${timeAdjustOrder.id}/status`,
        {
          status: timeAdjustOrder.status,
          prepTimeMinutes: customPrepMinutes,
          deliveryTimeMinutes: customDeliveryMinutes,
          note: `Prep time adjusted to ${customPrepMinutes}m, Delivery ${customDeliveryMinutes}m.`
        },
        token
      );
      if (res.success && res.order) {
        setOrders(prev => prev.map(o => (o.id === timeAdjustOrder.id ? res.order : o)));
        setTimeAdjustOrder(null);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to adjust times');
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    if (filterStatus && o.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      const matchAddr = o.deliveryAddress.address.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchPhone && !matchAddr) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900">
            Real-Time Order Stream
          </h2>
          <p className="text-xs text-gray-500">
            Incoming orders update instantly without page reload.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-rasoi-green bg-white"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setFilterStatus('')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full font-bold transition-all ${
            filterStatus === '' ? 'bg-rasoi-green text-white shadow-sm' : 'bg-white border text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Orders ({orders.length})
        </button>
        {(['ORDER_PLACED', 'ORDER_CONFIRMED', 'PREPARATION_STARTED', 'BEING_PREPARED', 'FOOD_READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(st => {
          const count = orders.filter(o => o.status === st).length;
          const details = ORDER_STATUS_DETAILS[st];
          return (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full font-bold transition-all ${
                filterStatus === st
                  ? 'bg-rasoi-green text-white shadow-sm'
                  : 'bg-white border text-gray-700 hover:bg-gray-50'
              }`}
            >
              {details.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-500">Connecting to live order stream...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300 p-8 space-y-2">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-heading font-bold text-base text-gray-800">No orders found</h3>
          <p className="text-xs text-gray-500">Orders placed by customers will appear here in real time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const statusDetails = ORDER_STATUS_DETAILS[ord.status];
            const isFreshPlaced = ord.status === 'ORDER_PLACED';

            return (
              <div
                key={ord.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-sm space-y-4 ${
                  isFreshPlaced ? 'border-amber-400 ring-2 ring-amber-200 flash-new-order' : 'border-gray-200'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-extrabold text-base text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                      #{ord.orderNumber}
                    </span>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                      style={{
                        backgroundColor: `${statusDetails?.color}18`,
                        color: statusDetails?.color
                      }}
                    >
                      {statusDetails?.label}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTimeAdjustOrder(ord);
                        setCustomPrepMinutes(ord.prepTimeEstimatedMinutes || 25);
                        setCustomDeliveryMinutes(ord.deliveryTimeEstimatedMinutes || 30);
                      }}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      ⏱️ Adjust Times ({ord.prepTimeEstimatedMinutes || 25}m + {ord.deliveryTimeEstimatedMinutes || 30}m)
                    </button>
                  </div>
                </div>

                {/* Customer & Address Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 bg-rasoi-cream/60 p-3 rounded-xl border border-rasoi-line/60">
                    <p className="font-heading font-bold text-gray-900 text-sm">{ord.customerName}</p>
                    <a href={`tel:${ord.customerPhone}`} className="flex items-center gap-1.5 text-rasoi-green font-bold hover:underline">
                      <Phone className="w-3.5 h-3.5" />
                      {ord.customerPhone}
                    </a>
                  </div>

                  <div className="space-y-1 bg-rasoi-cream/60 p-3 rounded-xl border border-rasoi-line/60">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rasoi-green shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-700 leading-snug">
                          {ord.deliveryAddress.address}
                          {ord.deliveryAddress.landmark && ` • Landmark: ${ord.deliveryAddress.landmark}`}
                        </p>
                        {ord.deliveryAddress.areaName && (
                          <div className="mt-1">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              (ord.deliveryAddress.distanceKm ?? 0) <= 5
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              📍 Zone: {ord.deliveryAddress.areaName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {ord.deliveryAddress.deliveryInstructions && (
                      <p className="text-amber-800 font-semibold pl-5 text-[11px]">
                        Note: "{ord.deliveryAddress.deliveryInstructions}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Breakdown Table */}
                <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 font-bold text-gray-600">
                      <tr>
                        <th className="p-2.5 pl-3">Dish Item</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Price</th>
                        <th className="p-2.5 pr-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ord.items.map((item, i) => (
                        <tr key={i}>
                          <td className="p-2.5 pl-3 font-medium text-gray-900 flex items-center gap-2">
                            <span className="veg-badge !w-3 !h-3"></span>
                            <span>{item.name} {item.hindiName ? `(${item.hindiName})` : ''}</span>
                          </td>
                          <td className="p-2.5 text-center font-bold text-gray-800">{item.quantity}</td>
                          <td className="p-2.5 text-right text-gray-600">₹{item.price}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-gray-900">₹{item.itemTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Bill Summary Strip */}
                  <div className="bg-gray-50 p-2.5 px-4 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-4 text-gray-600">
                      <span>Subtotal: ₹{ord.subtotal}</span>
                      <span>Delivery: ₹{ord.deliveryCharge}</span>
                      {ord.discountAmount > 0 && <span className="text-green-700">Coupon ({ord.couponCode}): -₹{ord.discountAmount}</span>}
                      <span>Payment: <strong className="text-gray-900 font-bold">{ord.paymentMethod}</strong> ({ord.paymentStatus})</span>
                    </div>
                    <div className="font-heading font-extrabold text-sm text-rasoi-green">
                      Total: ₹{ord.totalAmount}
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons (Synchronizes immediately with customer app!) */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {ord.status === 'ORDER_PLACED' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'ORDER_CONFIRMED', 'Kitchen accepted order.')}
                        disabled={actionLoading === ord.id}
                        className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept Order</span>
                      </button>
                      <button
                        onClick={() => handleCancelOrder(ord.id)}
                        disabled={actionLoading === ord.id}
                        className="px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-heading font-bold text-xs flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Order</span>
                      </button>
                    </>
                  )}

                  {ord.status === 'ORDER_CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'PREPARATION_STARTED', 'Cooking started in kitchen.')}
                      disabled={actionLoading === ord.id}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Start Preparing Food</span>
                    </button>
                  )}

                  {ord.status === 'PREPARATION_STARTED' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'BEING_PREPARED', 'Fresh food simmering.')}
                      disabled={actionLoading === ord.id}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Food Being Prepared</span>
                    </button>
                  )}

                  {(ord.status === 'PREPARATION_STARTED' || ord.status === 'BEING_PREPARED') && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'FOOD_READY', 'Packed in thermal container.')}
                      disabled={actionLoading === ord.id}
                      className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Food Ready & Packed</span>
                    </button>
                  )}

                  {ord.status === 'FOOD_READY' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'OUT_FOR_DELIVERY', 'Delivery agent departed.')}
                      disabled={actionLoading === ord.id}
                      className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Dispatch (Out for Delivery)</span>
                    </button>
                  )}

                  {ord.status === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'DELIVERED', 'Delivered safely to customer.')}
                      disabled={actionLoading === ord.id}
                      className="px-4 py-2 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Delivered & Paid</span>
                    </button>
                  )}

                  {ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCancelOrder(ord.id)}
                      disabled={actionLoading === ord.id}
                      className="ml-auto px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Adjust Times Modal */}
      {timeAdjustOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-gray-100">
            <h3 className="font-heading font-bold text-base text-gray-900">
              Adjust Times for #{timeAdjustOrder.orderNumber}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Preparation Time (Minutes):
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={customPrepMinutes}
                  onChange={(e) => setCustomPrepMinutes(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Delivery Departure Time (Minutes):
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={customDeliveryMinutes}
                  onChange={(e) => setCustomDeliveryMinutes(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:border-rasoi-green"
                />
              </div>

              <p className="text-[11px] text-gray-500 italic">
                *The customer's live tracking countdown will update immediately.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveTimes}
                className="flex-1 py-2 rounded-xl bg-rasoi-green text-white font-bold text-xs"
              >
                Save & Broadcast
              </button>
              <button
                onClick={() => setTimeAdjustOrder(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
