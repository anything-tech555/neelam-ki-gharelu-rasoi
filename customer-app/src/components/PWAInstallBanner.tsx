import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { isRunningInApp } from '../utils/platform';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // If running inside Android APK or installed standalone PWA, never show banner
    if (isRunningInApp()) {
      setShowBanner(false);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner || isRunningInApp()) return null;

  return (
    <div className="bg-rasoi-gold text-rasoi-dark px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md relative z-40">
      <div className="flex items-center gap-2 max-w-[85%]">
        <Download className="w-4 h-4 shrink-0 text-rasoi-dark" />
        <span className="truncate">
          Install <strong>Neelam Ki Gharelu Rasoi</strong> on your phone for faster homemade food ordering!
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="bg-rasoi-dark text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-black transition-colors"
        >
          Install App
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-rasoi-dark/70 hover:text-rasoi-dark p-1"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
