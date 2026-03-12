import React, { useState, useEffect } from 'react';
import { initGA } from '../services/analytics';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('analytics_consent');
    
    if (consent === 'granted') {
      initGA();
      setIsVisible(false);
    } else if (consent === 'denied') {
      setIsVisible(false);
    } else {
      // Si aucun choix n'a été fait (null), on affiche le bandeau
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('analytics_consent', 'granted');
    initGA();
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('analytics_consent', 'denied');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-dark-surface border-t border-border p-4 shadow-lg z-[100] animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-content-primary text-sm text-center sm:text-left">
          <p>
            Nous utilisons des cookies pour analyser le trafic de manière anonyme et améliorer votre expérience.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-content-secondary hover:text-content-primary hover:bg-input-bg rounded-lg transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-jeedom-600 hover:bg-jeedom-500 rounded-lg shadow-sm transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
