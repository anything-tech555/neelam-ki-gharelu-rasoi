import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-rasoi-gold text-rasoi-dark py-2.5 px-4 shadow-md flex items-center justify-between text-xs sm:text-sm font-semibold sticky top-0 z-50">
      <div className="flex items-center gap-2 max-w-xl">
        <Download className="w-4 h-4 shrink-0 text-rasoi-dark" />
        <span>
          Install <strong>Neelam Ki Gharelu Rasoi</strong> on your mobile for faster 1-tap food ordering!
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="px-3 py-1 bg-rasoi-green text-white rounded-lg text-xs font-bold hover:bg-rasoi-dark transition-colors shadow-sm"
        >
          Install App
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="p-1 hover:bg-black/10 rounded-full"
        >
          <X className="w-4 h-4 text-rasoi-dark" />
        </button>
      </div>
    </div>
  );
};
