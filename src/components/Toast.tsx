import React, { useEffect } from 'react';
import { XCircle, X, AlertTriangle, WifiOff, BatteryWarning, CheckCircle } from 'lucide-react';

export type ToastType = 'error' | 'warning' | 'success';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'error', onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    let Icon = XCircle;
    if (type === 'warning') Icon = AlertTriangle;
    if (type === 'success') Icon = CheckCircle;
    
    // Détection intelligente de l'icône (seulement si pas success)
    const lowerMsg = message.toLowerCase();
    
    if (type !== 'success') {
        if (lowerMsg.includes('connexion') || lowerMsg.includes('fetch') || lowerMsg.includes('network')) {
            Icon = WifiOff;
        } else if (lowerMsg.includes('clé') || lowerMsg.includes('api')) {
            Icon = AlertTriangle;
        } else if (lowerMsg.includes('batterie') || lowerMsg.includes('battery')) {
            Icon = BatteryWarning;
        }
    }

    // Styles basés sur le type
    let bgClass = 'bg-red-600/95 border-red-500/50';
    let title = 'Erreur';

    if (type === 'warning') {
        bgClass = 'bg-orange-600/95 border-orange-500/50';
        title = 'Avertissement';
    } else if (type === 'success') {
        bgClass = 'bg-green-600/95 border-green-500/50';
        title = 'Succès';
    }

    return (
        <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center px-4 animate-fade-in-up pointer-events-none">
            <div className={`${bgClass} backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 border ring-1 ring-black/20 w-full max-w-sm pointer-events-auto`}>
                <Icon className="shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                    <h3 className="font-semibold text-sm capitalize">{title}</h3>
                    <p className="text-sm opacity-90 leading-snug mt-0.5">{message}</p>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-1 -mr-1 -mt-1 hover:bg-content-inverted/20 rounded-full transition-colors"
                    aria-label="Fermer"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default Toast;