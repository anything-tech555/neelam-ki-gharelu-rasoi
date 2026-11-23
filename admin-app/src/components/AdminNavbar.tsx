import React from 'react';
import { Volume2, VolumeX, PauseCircle, PlayCircle, LogOut, Bell, Shield, MapPin } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { RestaurantSettings } from '../types/shared';

interface AdminNavbarProps {
  settings: RestaurantSettings | null;
  onTogglePauseStore: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  pendingOrderCount: number;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  settings,
  onTogglePauseStore,
  soundEnabled,
  onToggleSound,
  pendingOrderCount
}) => {
  const { admin, logout } = useAdminAuth();

  return (
    <header className="sticky top-0 z-40 bg-rasoi-green text-white shadow-md border-b border-rasoi-dark">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rasoi-gold/20 border-2 border-rasoi-gold p-1 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M25 45 C25 72, 75 72, 75 45 Z" fill="#F2B01E"/>
              <rect x="20" y="42" width="60" height="6" rx="3" fill="#FFF"/>
              <path d="M50 20 C42 28, 42 36, 50 40 C58 36, 58 28, 50 20 Z" fill="#5ac28a"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-lg sm:text-xl text-white leading-tight">
                Neelam Ki Gharelu Rasoi
              </h1>
              <span className="bg-rasoi-gold text-rasoi-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-rasoi-gold font-medium flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-rasoi-gold" />
              <span>Panchsheel Apt, Moradabad • Helpline: 9997433379 / 8272072057</span>
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Sound Alert Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-rasoi-dark/50 border-rasoi-gold text-rasoi-gold'
                : 'bg-white/10 border-white/20 text-gray-300'
            }`}
            title={soundEnabled ? 'Order Sound Enabled' : 'Order Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? 'Chime On' : 'Chime Off'}</span>
          </button>

          {/* Quick Pause Store Toggle */}
          {settings && (
            <button
              onClick={onTogglePauseStore}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                settings.isPaused
                  ? 'bg-rasoi-red border-red-400 text-white animate-pulse'
                  : 'bg-green-700 border-green-500 text-white'
              }`}
            >
              {settings.isPaused ? (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Resume Kitchen</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4" />
                  <span>Accepting Orders</span>
                </>
              )}
            </button>
          )}

          {/* Admin User Info & Logout */}
          <div className="flex items-center gap-3 pl-2 border-l border-white/20">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-heading font-bold text-white leading-tight">
                {admin?.name || 'Owner'}
              </p>
              <p className="text-[10px] text-gray-300">Authorized Admin</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-white/10 hover:bg-rasoi-red hover:text-white text-gray-300 transition-colors"
              title="Logout from Admin Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
