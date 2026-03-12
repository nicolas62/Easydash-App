import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// DÉSACTIVATION TEMPORAIRE DU SERVICE WORKER POUR STABILISER L'APPLICATION
// On désenregistre tout pour nettoyer les caches corrompus chez les clients
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for(let registration of registrations) {
      console.log('Unregistering service worker:', registration);
      registration.unregister();
    }
  });
}

// Code précédent commenté pour référence future
/*
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
      console.log("Nouvelle version disponible, mise à jour en cours...");
    },
    onOfflineReady() {
      console.log("Application prête pour le hors-ligne");
    },
  });
}
*/

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