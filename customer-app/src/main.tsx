import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './index.css';

// Fail-safe: if customer bundle ever loads on an admin route (e.g. stale service worker), redirect to admin index.html
if (window.location.pathname.toLowerCase().includes('/admin')) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      for (const reg of regs) reg.unregister();
    });
  }
  const target = window.location.origin + '/neelam-ki-gharelu-rasoi/admin/index.html';
  if (window.location.href !== target) {
    window.location.replace(target);
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);
