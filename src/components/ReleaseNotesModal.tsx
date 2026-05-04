import React from 'react';
import { X } from 'lucide-react';
import ReleaseNotesList from './ReleaseNotesList';
import { APP_VERSION } from '../constants';

interface ReleaseNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-dark-bg/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-dark-surface w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300">
                
                <div className="flex items-center justify-between p-6 border-b border-border bg-dark-surface/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
                        <span className="bg-jeedom-600 text-white px-2 py-1 rounded text-sm font-mono">v{APP_VERSION}</span>
                        Notes de version
                    </h2>
                    <button onClick={onClose} className="text-content-secondary hover:text-content-primary p-1 hover:bg-input-bg rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <ReleaseNotesList />
                </div>

                <div className="p-4 border-t border-border bg-dark-surface/50 rounded-b-2xl text-center">
                    <button 
                        onClick={onClose}
                        className="text-sm text-content-secondary hover:text-content-primary transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReleaseNotesModal;
