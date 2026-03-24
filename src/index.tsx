import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  // Gestion du rechargement automatique lors d'une mise à jour du SW
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('[SW] Nouvelle version disponible, mise à jour en cours...');
    },
    onOfflineReady() {
      console.log('[SW] Application prête pour le hors-ligne');
    },
  });
}

import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);