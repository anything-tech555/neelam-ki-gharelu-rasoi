import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './context/AdminAuthContext';
import { AdminLoginView } from './views/AdminLoginView';
import { AdminNavbar } from './components/AdminNavbar';
import { AdminSidebar, AdminTab } from './components/AdminSidebar';
import { DashboardView } from './views/DashboardView';
import { OrdersView } from './views/OrdersView';
import { FoodManagementView } from './views/FoodManagementView';
import { CategoriesView } from './views/CategoriesView';
import { SettingsView } from './views/SettingsView';
import { CouponsView } from './views/CouponsView';
import { ReviewsView } from './views/ReviewsView';
import { RestaurantSettings } from './types/shared';
import { api } from './services/api';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, token } = useAdminAuth();
  const [currentTab, setCurrentTab] = useState<AdminTab>('orders');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/api/settings').then(res => {
        if (res.success && res.settings) setSettings(res.settings);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleTogglePauseStore = async () => {
    if (!settings || !token) return;
    try {
      const res = await api.put(
        '/api/settings',
        { isPaused: !settings.isPaused },
        token
      );
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update store pause status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-rasoi-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Admin Navbar */}
      <AdminNavbar
        settings={settings}
        onTogglePauseStore={handleTogglePauseStore}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        pendingOrderCount={pendingCount}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          pendingOrderCount={pendingCount}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Tab Pills */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar text-xs">
              {(
                [
                  ['orders', 'Live Orders'],
                  ['dashboard', 'Overview'],
                  ['food', 'Menu Items'],
                  ['categories', 'Categories'],
                  ['settings', 'Store Settings'],
                  ['coupons', 'Coupons'],
                  ['reviews', 'Reviews']
                ] as [AdminTab, string][]
              ).map(([tabId, label]) => (
                <button
                  key={tabId}
                  onClick={() => setCurrentTab(tabId)}
                  className={`shrink-0 px-3 py-1.5 rounded-full font-bold transition-all ${
                    currentTab === tabId
                      ? 'bg-rasoi-green text-white shadow-sm'
                      : 'bg-white border text-gray-700'
                  }`}
                >
                  {label} {tabId === 'orders' && pendingCount > 0 ? `(${pendingCount})` : ''}
                </button>
              ))}
            </div>

            {currentTab === 'dashboard' && (
              <DashboardView onNavigateToOrders={() => setCurrentTab('orders')} />
            )}
            {currentTab === 'orders' && (
              <OrdersView
                soundEnabled={soundEnabled}
                onPendingCountChange={setPendingCount}
              />
            )}
            {currentTab === 'food' && <FoodManagementView />}
            {currentTab === 'categories' && <CategoriesView />}
            {currentTab === 'settings' && <SettingsView />}
            {currentTab === 'coupons' && <CouponsView />}
            {currentTab === 'reviews' && <ReviewsView />}
          </div>
        </main>
      </div>
    </div>
  );
};
