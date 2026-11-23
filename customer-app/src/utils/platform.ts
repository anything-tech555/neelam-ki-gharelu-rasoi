import { Capacitor } from '@capacitor/core';

export const isRunningInApp = (): boolean => {
  if (typeof window === 'undefined') return false;

  // 1. Capacitor Native Platform (Android / iOS)
  try {
    if (Capacitor.isNativePlatform()) return true;
    if (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios') return true;
  } catch (e) {}

  // 2. Window Capacitor Injection
  try {
    if ((window as any)?.Capacitor) return true;
    if ((window as any)?.androidBridge) return true;
  } catch (e) {}

  // 3. Native scheme / localhost origins typical of Capacitor
  try {
    if (window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:') return true;
    if (window.location.hostname === 'localhost' && (!window.location.port || window.location.port === '80' || window.location.port === '443')) return true;
  } catch (e) {}

  // 4. Standalone PWA mode (added to home screen)
  try {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    if ((window.navigator as any)?.standalone === true) {
      return true;
    }
  } catch (e) {}

  // 5. Android WebView User-Agent check
  try {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes('capacitor') || ua.includes('wv') || ua.includes('crosswalk') || ua.includes('version/4.0')) {
      return true;
    }
  } catch (e) {}

  return false;
};
