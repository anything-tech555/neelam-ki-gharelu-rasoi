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
import { useAdminAuth } from '../context/AdminAuthContext';
import { Order } from '../types/shared';

interface AnalyticsData {
  totalOrders: number;
  todayOrdersCount: number;
  pendingOrdersCount: number;
  preparingOrdersCount: number;
  outForDeliveryOrdersCount: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  totalSales: number;
  todayRevenue: number;
  totalCustomers: number;
  avgRating: number;
  last7Days: { date: string; day: string; orders: number; revenue: number }[];
}

interface DashboardViewProps {
  onNavigateToOrders: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToOrders }) => {
  const { token } = useAdminAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const fetchDashboard = async () => {
    if (!token) return;
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        api.get('/api/settings/analytics', token),
        api.get('/api/orders?limit=5', token)
      ]);

      if (analyticsRes.success) setData(analyticsRes.analytics);
      if (ordersRes.success && ordersRes.orders) setRecentOrders(ordersRes.orders.slice(0, 5));
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-500">Loading live analytics...</div>;
  }

  const maxRevenue = data?.last7Days.reduce((m, d) => Math.max(m, d.revenue), 1) || 1;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900">
            Kitchen Overview & Sales Analytics
          </h2>
          <p className="text-xs text-gray-500">
            Real-time insights for Neelam Ki Gharelu Rasoi, Moradabad.
          </p>
        </div>
        <button
          onClick={onNavigateToOrders}
          className="px-4 py-2 rounded-xl bg-rasoi-green text-white font-heading font-bold text-xs flex items-center gap-1.5 hover:bg-rasoi-dark shadow-sm transition-all"
        >
          <span>View Live Orders Stream</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today’s Revenue</p>
            <h3 className="font-heading font-extrabold text-2xl text-rasoi-green mt-1">
              ₹{data?.todayRevenue || 0}
            </h3>
            <span className="text-[11px] text-gray-400">Total: ₹{data?.totalSales || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-rasoi-green flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today’s Orders</p>
            <h3 className="font-heading font-extrabold text-2xl text-gray-900 mt-1">
              {data?.todayOrdersCount || 0}
            </h3>
            <span className="text-[11px] text-gray-400">Lifetime: {data?.totalOrders || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-rasoi-goldDark flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Active Preparing Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active In Kitchen</p>
            <h3 className="font-heading font-extrabold text-2xl text-orange-600 mt-1">
              {data?.preparingOrdersCount || 0}
            </h3>
            <span className="text-[11px] text-gray-400">
              {data?.pendingOrdersCount || 0} pending confirmation
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Average Rating & Customers */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Rating</p>
            <h3 className="font-heading font-extrabold text-2xl text-rasoi-goldDark mt-1 flex items-center gap-1">
              {data?.avgRating || 4.9}
              <Star className="w-5 h-5 fill-rasoi-gold text-rasoi-gold" />
            </h3>
            <span className="text-[11px] text-gray-400">
              {data?.totalCustomers || 1} registered users
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 7-Day Revenue Trend Chart */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-heading font-bold text-base text-gray-900">
              7-Day Sales & Revenue Trend
            </h4>
            <p className="text-xs text-gray-500">
              Daily revenue volume in INR (₹)
            </p>
          </div>
          <span className="text-xs font-semibold text-rasoi-green bg-rasoi-lightGreen px-2.5 py-1 rounded-full">
            Live Synchronized
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-48 flex items-end justify-between gap-2 sm:gap-6 pt-4 border-b border-gray-100">
          {data?.last7Days.map((dayItem, i) => {
            const heightPercent = Math.max(8, Math.round((dayItem.revenue / maxRevenue) * 100));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{dayItem.revenue}
                </span>
                <div
                  className="w-full max-w-[40px] bg-rasoi-green group-hover:bg-rasoi-gold rounded-t-lg transition-all"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-xs font-semibold text-gray-600">
                  {dayItem.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-heading font-bold text-base text-gray-900">
            Recent Orders
          </h4>
          <button
            onClick={onNavigateToOrders}
            className="text-xs font-bold text-rasoi-green hover:underline"
          >
            View All Orders ›
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No orders yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 overflow-x-auto">
            {recentOrders.map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    #{ord.orderNumber}
                  </span>
                  <div>
                    <p className="font-bold text-gray-800">{ord.customerName} ({ord.customerPhone})</p>
                    <p className="text-gray-500 text-[11px] truncate max-w-xs">{ord.deliveryAddress.address}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-heading font-bold text-sm text-gray-900">₹{ord.totalAmount}</span>
                  <p className="text-[10px] text-gray-400">{ord.paymentMethod} • {ord.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
