import React from 'react';
import { ShoppingBag, Search, User, Globe, Phone, Clock, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenAccount: () => void;
  onOpenTracking: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeOrderCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenAuth,
  onOpenAccount,
  onOpenTracking,
  searchQuery,
  setSearchQuery,
  activeOrderCount
}) => {
  const { lang, setLang, t } = useLanguage();
  const { user } = useAuth();
  const { totalCount, subtotal, restaurantSettings } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* Top Announcement Strip */}
      <div className="bg-rasoi-dark text-rasoi-gold text-xs py-1.5 px-4 font-medium flex items-center justify-between border-b border-rasoi-green/40">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="veg-badge !w-3 !h-3"></span>
              <span className="font-semibold text-white tracking-wide">100% PURE VEG</span>
            </span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span className="hidden sm:flex items-center gap-1 text-rasoi-gold/90">
              <MapPin className="w-3.5 h-3.5 text-rasoi-gold" />
              Moradabad, UP
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-white/90">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Phone className="w-3.5 h-3.5 text-rasoi-gold shrink-0" />
              <span className="hidden xs:inline text-white/70">Helpline:</span>
              <a href="tel:9997433379" className="hover:text-rasoi-gold transition-colors font-semibold">9997433379</a>
              <span className="text-white/40">/</span>
              <a href="tel:8272072057" className="hover:text-rasoi-gold transition-colors font-semibold">8272072057</a>
            </div>
            <div className="hidden md:flex items-center gap-1 text-rasoi-gold">
              <Clock className="w-3.5 h-3.5" />
              <span>{restaurantSettings?.openingTime || '07:00'} - {restaurantSettings?.closingTime || '22:30'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-rasoi-green text-white px-4 py-3 sm:py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rasoi-gold/20 border-2 border-rasoi-gold p-1 flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M25 45 C25 72, 75 72, 75 45 Z" fill="#F2B01E"/>
                <rect x="20" y="42" width="60" height="6" rx="3" fill="#FFF"/>
                <path d="M50 20 C42 28, 42 36, 50 40 C58 36, 58 28, 50 20 Z" fill="#5ac28a"/>
                <circle cx="50" cy="78" r="4" fill="#5ac28a"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-white leading-none">
                  Neelam Ki Gharelu Rasoi
                </h1>
                <span className="veg-badge"></span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-rasoi-gold tracking-wide leading-tight mt-0.5">
                नीलम की घरेलू रसोई • शुद्ध शाकाहारी भोजन
              </p>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 text-rasoi-mut absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white text-gray-800 text-sm rounded-full border border-transparent focus:border-rasoi-gold focus:outline-none shadow-sm transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-rasoi-dark/40 hover:bg-rasoi-dark/70 border border-white/20 text-xs sm:text-sm font-semibold text-rasoi-gold transition-colors"
              title="Toggle English / हिंदी"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* Live Order Tracking Button */}
            <button
              onClick={onOpenTracking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeOrderCount > 0
                  ? 'bg-rasoi-gold text-rasoi-dark font-bold pulse-glow shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('trackOrder')}</span>
              {activeOrderCount > 0 && (
                <span className="bg-rasoi-dark text-rasoi-gold text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {activeOrderCount}
                </span>
              )}
            </button>

            {/* User Profile / Login */}
            {user ? (
              <button
                onClick={onOpenAccount}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                <User className="w-3.5 h-3.5 text-rasoi-gold" />
                <span className="max-w-[80px] sm:max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('login')}</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rasoi-gold hover:bg-rasoi-goldDark text-rasoi-dark font-heading font-bold text-sm sm:text-base shadow-md transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>₹{subtotal}</span>
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rasoi-red text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-rasoi-mut absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white text-gray-800 text-sm rounded-full border border-transparent focus:border-rasoi-gold focus:outline-none shadow-sm placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
