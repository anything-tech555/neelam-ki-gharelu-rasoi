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
  RotateCcw,
  Check
} from 'lucide-react';
import { Order, OrderStatus, ORDER_STATUS_DETAILS } from '../types/shared';
import { api, socket } from '../services/api';
import { localDatabase } from '../services/localDatabase';
import { useAdminAuth } from '../context/AdminAuthContext';

interface OrdersViewProps {
  soundEnabled: boolean;
  onPendingCountChange: (fn: ((prev: number) => number) | number) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ soundEnabled, onPendingCountChange }) => {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>(() => localDatabase.getOrders());
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Time adjustment modal state
  const [timeAdjustOrder, setTimeAdjustOrder] = useState<Order | null>(null);
  const [customPrepMinutes, setCustomPrepMinutes] = useState<number>(20);
  const [customDeliveryMinutes, setCustomDeliveryMinutes] = useState<number>(25);

  const syncOrders = () => {
    const list = localDatabase.getOrders();
    setOrders(list);
    const pending = list.filter(o => o.status === 'ORDER_PLACED' || o.status === 'ORDER_CONFIRMED').length;
    onPendingCountChange(pending);
  };

  useEffect(() => {
    syncOrders();

    // 1. Try backend sync
    if (token) {
      api.get('/api/orders', token).then(res => {
        if (res.success && res.orders && res.orders.length > 0) {
          setOrders(res.orders);
          res.orders.forEach((o: Order) => localDatabase.addOrder(o));
        }
      }).catch(() => {});
    }

    // 2. Subscribe to real-time local sync (broadcast channel & storage)
    const unsubscribe = localDatabase.subscribe(event => {
      if (event.type === 'ORDER_CREATED' || event.type === 'ORDER_UPDATED' || event.type === 'nkg_orders') {
        syncOrders();
        if (soundEnabled && event.type === 'ORDER_CREATED') {
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {});
          } catch (e) {}
        }
      }
    });

    return unsubscribe;
  }, [token, soundEnabled]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, prep?: number, del?: number) => {
    setActionLoading(orderId);
    try {
      // 1. Update locally
      const updated = localDatabase.updateOrderStatus(orderId, newStatus, prep, del);
      if (updated) {
        syncOrders();
      }

      // 2. Update backend if online
      if (token) {
        await api.patch(
          `/api/orders/${orderId}/status`,
          { status: newStatus, prepTimeMinutes: prep, deliveryTimeMinutes: del },
          token
        ).catch(() => {});
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveAdjustedTime = async () => {
    if (!timeAdjustOrder) return;
    await handleUpdateStatus(
      timeAdjustOrder.id,
      timeAdjustOrder.status,
      Number(customPrepMinutes),
      Number(customDeliveryMinutes)
    );
    setTimeAdjustOrder(null);
  };

  const filteredOrders = orders.filter(o => {
    if (filterStatus && o.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        String(o.orderNumber).includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.deliveryAddress.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-xl text-gray-900 flex items-center gap-2">
            <span>Live Kitchen Orders</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rasoi-green text-white">
              {orders.length} Total
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Accept, prepare, and dispatch orders in real-time. Changes sync directly to the customer app.
          </p>
        </div>

        {/* Quick Filter */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-rasoi-green"
          />
        </div>
      </div>

      {/* Filter Status Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: '', label: 'All Orders' },
          { id: 'ORDER_PLACED', label: 'New Placed' },
          { id: 'ORDER_CONFIRMED', label: 'Confirmed' },
          { id: 'BEING_PREPARED', label: 'Preparing' },
          { id: 'FOOD_READY', label: 'Ready' },
          { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
          { id: 'DELIVERED', label: 'Delivered' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              filterStatus === tab.id
                ? 'bg-rasoi-green text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300 space-y-2">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="font-heading font-bold text-gray-700">No Orders in this View</h4>
            <p className="text-xs text-gray-400">
              When customers order food, it will appear here instantly with sound alert.
            </p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isNew = order.status === 'ORDER_PLACED';
            const isConfirmed = order.status === 'ORDER_CONFIRMED';
            const isPrep = order.status === 'BEING_PREPARED' || order.status === 'PREPARATION_STARTED';
            const isReady = order.status === 'FOOD_READY';
            const isOut = order.status === 'OUT_FOR_DELIVERY';
            const isDelivered = order.status === 'DELIVERED';
            const isCancelled = order.status === 'CANCELLED';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4 transition-all ${
                  isNew ? 'border-2 border-amber-400 bg-amber-50/20 ring-2 ring-amber-100' : 'border-gray-200'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-black text-lg text-gray-900">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rasoi-lightGreen text-rasoi-green border border-emerald-200">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    {isNew && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                        NEW INCOMING
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rasoi-gold" />
                      <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span className="font-heading font-black text-base text-rasoi-green">
                      ₹{order.totalAmount}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-gray-100 rounded">
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Customer Details & Items */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  {/* Left: Customer Address */}
                  <div className="md:col-span-5 space-y-1.5 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <p className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{order.customerName}</span>
                      <a href={`tel:${order.customerPhone}`} className="text-rasoi-green hover:underline flex items-center gap-0.5 ml-2">
                        <Phone className="w-3 h-3" />
                        <span>{order.customerPhone}</span>
                      </a>
                    </p>
                    <p className="text-gray-600 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>{order.deliveryAddress.address}</span>
                    </p>
                    {order.deliveryAddress.landmark && (
                      <p className="text-gray-500 pl-4">
                        Landmark: {order.deliveryAddress.landmark}
                      </p>
                    )}
                    <p className="text-emerald-700 font-semibold pl-4">
                      Area: {order.deliveryAddress.areaName || `${order.deliveryAddress.distanceKm} km`}
                    </p>
                  </div>

                  {/* Right: Ordered Dishes */}
                  <div className="md:col-span-7 space-y-2">
                    <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="veg-badge !w-3 !h-3"></span>
                            <span className="font-bold text-gray-900">
                              {item.quantity} × {item.name}
                            </span>
                          </div>
                          <span className="font-heading font-bold text-gray-700">
                            ₹{item.itemTotal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Advancement Action Buttons */}
                {!isDelivered && !isCancelled && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={() => {
                          setTimeAdjustOrder(order);
                          setCustomPrepMinutes(order.prepTimeEstimatedMinutes || 20);
                          setCustomDeliveryMinutes(order.deliveryTimeEstimatedMinutes || 25);
                        }}
                        className="text-xs font-bold text-gray-600 hover:text-rasoi-green flex items-center gap-1 underline"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Adjust Time (~{order.prepTimeEstimatedMinutes || 20}m prep + ~{order.deliveryTimeEstimatedMinutes || 25}m del)</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {isNew && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'ORDER_CONFIRMED')}
                            disabled={actionLoading === order.id}
                            className="px-4 py-2 rounded-xl bg-rasoi-green hover:bg-rasoi-dark text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept Order</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                            disabled={actionLoading === order.id}
                            className="px-3 py-2 rounded-xl bg-red-100 text-red-700 font-bold text-xs hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'BEING_PREPARED')}
                          disabled={actionLoading === order.id}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <ChefHat className="w-4 h-4" />
                          <span>Start Cooking</span>
                        </button>
                      )}

                      {isPrep && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'FOOD_READY')}
                          disabled={actionLoading === order.id}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Food Ready & Packed</span>
                        </button>
                      )}

                      {isReady && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                          disabled={actionLoading === order.id}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <Bike className="w-4 h-4" />
                          <span>Dispatch (Out for Delivery)</span>
                        </button>
                      )}

                      {isOut && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          disabled={actionLoading === order.id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>Mark Delivered ✓</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Adjust Time Modal */}
      {timeAdjustOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-heading font-black text-base text-gray-900">
              Adjust Delivery Estimates for #{timeAdjustOrder.orderNumber}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Preparation Time (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={customPrepMinutes}
                  onChange={e => setCustomPrepMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Delivery Time (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={customDeliveryMinutes}
                  onChange={e => setCustomDeliveryMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300"
                />
              </div>

              <p className="text-[11px] text-gray-500 italic">
                Total estimated delivery time: ~{Number(customPrepMinutes) + Number(customDeliveryMinutes)} minutes from confirmation.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setTimeAdjustOrder(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdjustedTime}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rasoi-green rounded-lg shadow-sm"
              >
                Update Customer Estimate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
