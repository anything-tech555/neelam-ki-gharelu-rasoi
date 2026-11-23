import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  Bike,
  CheckCircle2,
  Users,
  Star,
  DollarSign,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { localDatabase } from '../services/localDatabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Order } from '../types/shared';

interface DashboardViewProps {
  onNavigateToOrders: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToOrders }) => {
  const { token } = useAdminAuth();
  const [data, setData] = useState(() => localDatabase.getAnalytics());
  const [recentOrders, setRecentOrders] = useState<Order[]>(() => localDatabase.getOrders().slice(0, 5));
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    // 1. Immediately populate from localDatabase
    setData(localDatabase.getAnalytics());
    setRecentOrders(localDatabase.getOrders().slice(0, 5));

    // 2. Try backend sync if online
    if (token) {
      try {
        const [analyticsRes, ordersRes] = await Promise.all([
          api.get('/api/settings/analytics', token).catch(() => null),
          api.get('/api/orders?limit=5', token).catch(() => null)
        ]);
        if (analyticsRes?.success && analyticsRes.analytics) setData(analyticsRes.analytics);
        if (ordersRes?.success && ordersRes.orders) setRecentOrders(ordersRes.orders.slice(0, 5));
      } catch (e) {}
    }
  };

  useEffect(() => {
    fetchDashboard();

    const unsubscribe = localDatabase.subscribe(event => {
      if (event.type === 'ORDER_CREATED' || event.type === 'ORDER_UPDATED' || event.type === 'nkg_orders') {
        setData(localDatabase.getAnalytics());
        setRecentOrders(localDatabase.getOrders().slice(0, 5));
      }
    });
    return unsubscribe;
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-rasoi-green via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rasoi-gold text-rasoi-dark font-heading font-extrabold text-xs">
            Kitchen Dashboard • Moradabad
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl">
            Welcome, Neelam Sharma Ji!
          </h2>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl">
            Pure vegetarian kitchen management console. Track incoming orders in real time, adjust preparation & delivery times, and update your menu.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Today's Revenue</p>
            <h3 className="font-heading font-black text-2xl text-rasoi-green mt-1">₹{data.todayRevenue}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Daily turnover</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-rasoi-green flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Today's Orders</p>
            <h3 className="font-heading font-black text-2xl text-gray-900 mt-1">{data.todayOrdersCount}</h3>
            <span className="text-[11px] text-rasoi-green font-medium font-bold">{data.pendingOrdersCount} Pending</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Happy Customers</p>
            <h3 className="font-heading font-black text-2xl text-gray-900 mt-1">{data.totalCustomers}+</h3>
            <span className="text-[11px] text-gray-400">Moradabad households</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Quality Rating</p>
            <h3 className="font-heading font-black text-2xl text-rasoi-gold mt-1 flex items-center gap-1">
              <span>{data.avgRating}</span>
              <Star className="w-5 h-5 fill-rasoi-gold text-rasoi-gold" />
            </h3>
            <span className="text-[11px] text-gray-400">Desi Ghee preparation</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Star className="w-6 h-6 fill-current" />
          </div>
        </div>
      </div>

      {/* Recent Orders Stream */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-gray-900">
              Recent Incoming Orders
            </h3>
            <p className="text-xs text-gray-500">
              Live orders from customers across Moradabad.
            </p>
          </div>
          <button
            onClick={onNavigateToOrders}
            className="text-xs font-bold text-rasoi-green hover:underline flex items-center gap-1"
          >
            <span>View All Live Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              No orders placed yet. Orders will appear here as soon as customers order!
            </div>
          ) : (
            recentOrders.map(ord => (
              <div key={ord.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-gray-900">
                      Order #{ord.orderNumber}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rasoi-cream border border-rasoi-line text-rasoi-green">
                      {ord.customerName}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {ord.customerPhone}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {ord.deliveryAddress.address}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <span className="font-heading font-extrabold text-sm text-gray-900 block">
                      ₹{ord.totalAmount}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {ord.paymentMethod}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rasoi-lightGreen text-rasoi-green border border-emerald-200">
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
