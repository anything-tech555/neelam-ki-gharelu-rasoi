import { Capacitor } from '@capacitor/core';

export const isRunningInApp = (): boolean => {
  if (typeof window === 'undefined') return false;

  // 1. Capacitor Native Platform (Android / iOS)
  try {
    if (Capacitor.isNativePlatform()) return true;
  } catch (e) {}

  // 2. Standalone PWA mode (added to home screen)
  try {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    if ((window.navigator as any)?.standalone === true) {
      return true;
    }
  } catch (e) {}

  // 3. Android WebView User-Agent check
  try {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes('capacitor') || ua.includes('wv') || ua.includes('crosswalk')) {
      return true;
    }
  } catch (e) {}

  return false;
};
