import React from 'react';
import { Maximize, Minimize, Monitor } from 'lucide-react';
import { useKioskMode } from '../hooks/useKioskMode';

const KioskToggleButton: React.FC = () => {
    const { isKioskActive, toggleKiosk } = useKioskMode();

    return (
        <button
            onClick={toggleKiosk}
            className={`
                flex items-center justify-between p-3 border rounded-lg w-full transition-all
                ${isKioskActive 
                    ? 'bg-jeedom-500/10 border-jeedom-500/50 text-jeedom-500' 
                    : 'bg-input-bg border-border text-content-primary hover:border-jeedom-500/30'}
            `}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isKioskActive ? 'bg-jeedom-500 text-white' : 'bg-dark-card text-content-secondary'}`}>
                    <Monitor size={20} />
                </div>
                <div className="text-left">
                    <span className="block text-sm font-medium">Mode Kiosque</span>
                    <span className="block text-xs text-content-secondary">
                        {isKioskActive ? 'Activé (Plein écran + Écran allumé)' : 'Désactivé'}
                    </span>
                </div>
            </div>
            <div className="text-content-secondary">
                {isKioskActive ? <Minimize size={20} /> : <Maximize size={20} />}
            </div>
        </button>
    );
};

export default KioskToggleButton;
