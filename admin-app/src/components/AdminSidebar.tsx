import React from 'react';
import {
  LayoutDashboard,
  BellRing,
  UtensilsCrossed,
  Layers,
  Sliders,
  Ticket,
  Star
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'food'
  | 'categories'
  | 'settings'
  | 'coupons'
  | 'reviews';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingOrderCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingOrderCount
}) => {
  const items: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard & Sales', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      id: 'orders',
      label: 'Live Orders',
      icon: <BellRing className="w-5 h-5" />,
      badge: pendingOrderCount
    },
    { id: 'food', label: 'Food Menu Items', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: 'categories', label: 'Menu Categories', icon: <Layers className="w-5 h-5" /> },
    { id: 'settings', label: 'Store & Time Controls', icon: <Sliders className="w-5 h-5" /> },
    { id: 'coupons', label: 'Offers & Coupons', icon: <Ticket className="w-5 h-5" /> },
    { id: 'reviews', label: 'Reviews & Feedback', icon: <Star className="w-5 h-5" /> }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shrink-0 hidden md:flex flex-col justify-between p-4">
      <div className="space-y-1.5">
        <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Management Console
        </p>
        {items.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold transition-all ${
                isActive
                  ? 'bg-rasoi-green text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-rasoi-gold' : 'text-gray-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-rasoi-gold text-rasoi-dark' : 'bg-rasoi-red text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-rasoi-cream rounded-xl border border-rasoi-line/70 text-xs text-gray-600 space-y-1">
        <p className="font-bold text-rasoi-green">Pure Veg Homemade Kitchen</p>
        <p className="text-[11px]">Moradabad, UP, India</p>
        <p className="text-[10px] text-gray-400 pt-1">Production v1.0 • Multi-Device Sync</p>
      </div>
    </aside>
  );
};
