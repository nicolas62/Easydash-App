import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, onClose, onConfirm, title, message, 
    confirmLabel = "Confirmer", cancelLabel = "Annuler" 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark-bg/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-dark-surface w-full max-w-sm rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-content-primary mb-2">{title}</h3>
                    <p className="text-content-secondary mb-8 leading-relaxed">{message}</p>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl bg-dark-card border border-border text-content-primary font-medium hover:bg-input-bg transition-colors active:scale-95"
                        >
                            {cancelLabel}
                        </button>
                        <button 
                            onClick={() => { onConfirm(); onClose(); }}
                            className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20 active:scale-95"
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;