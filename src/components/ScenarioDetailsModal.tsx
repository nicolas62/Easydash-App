import React, { useState } from 'react';
import { X, Play, Square, Power, Calendar, Clock, Tag, Activity, Layers } from 'lucide-react';
import { JeedomScenario, AppSettings } from '../types';
import { executeScenario, stopScenario, toggleScenarioState } from '../services/jeedomService';
import Toast, { ToastType } from './Toast';

interface ScenarioDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    scenario: JeedomScenario | null;
    settings: AppSettings;
    onUpdate: () => void;
}

const ScenarioDetailsModal: React.FC<ScenarioDetailsModalProps> = ({ isOpen, onClose, scenario, settings, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);

    if (!isOpen || !scenario) return null;

    const isActive = scenario.isActive === '1' || scenario.isActive === 1 || scenario.isActive === true;
    const isRunning = scenario.state === 'run';

    const handleRun = async () => {
        setLoading(true);
        try {
            await executeScenario(settings, scenario.id);
            setToast({ message: "Scénario lancé", type: 'success' });
            setTimeout(() => {
                onUpdate();
                setLoading(false);
            }, 1000);
        } catch (e) {
            setToast({ message: "Echec lancement", type: 'error' });
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        try {
            await stopScenario(settings, scenario.id);
            setToast({ message: "Scénario arrêté", type: 'success' });
            setTimeout(() => {
                onUpdate();
                setLoading(false);
            }, 1000);
        } catch (e) {
            setToast({ message: "Echec arrêt", type: 'error' });
            setLoading(false);
        }
    };

    const handleToggleState = async () => {
        setLoading(true);
        try {
            await toggleScenarioState(settings, scenario.id, isActive);
            setToast({ message: isActive ? "Scénario désactivé" : "Scénario activé", type: 'success' });
            setTimeout(() => {
                onUpdate();
                setLoading(false);
            }, 500);
        } catch (e) {
            setToast({ message: "Erreur changement état", type: 'error' });
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/60 backdrop-blur-sm animate-in fade-in duration-200">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="bg-dark-surface w-full max-w-md rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-dark-bg/50">
                    <h2 className="text-lg font-bold text-content-primary flex items-center gap-2 truncate">
                        <Activity className="text-jeedom-500" size={20} />
                        <span className="truncate">{scenario.name}</span>
                    </h2>
                    <button onClick={onClose} className="p-2 text-content-secondary hover:text-content-primary rounded-full hover:bg-input-bg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <div className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border ${
                            isRunning 
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                            : 'bg-dark-card text-content-secondary border-border'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-orange-500 animate-pulse' : 'bg-content-secondary'}`}></div>
                            {isRunning ? 'En cours d\'exécution' : 'Arrêté'}
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-dark-card p-3 rounded-xl border border-border/50">
                            <div className="text-xs text-content-secondary mb-1 flex items-center gap-1">
                                <Layers size={12} /> Groupe
                            </div>
                            <div className="font-medium text-content-primary text-sm truncate">
                                {scenario.group || 'Aucun'}
                            </div>
                        </div>
                        <div className="bg-dark-card p-3 rounded-xl border border-border/50">
                            <div className="text-xs text-content-secondary mb-1 flex items-center gap-1">
                                <Tag size={12} /> Mode
                            </div>
                            <div className="font-medium text-content-primary text-sm truncate">
                                {scenario.mode === 'provoc' ? 'Provoqué' : 'Programmé'}
                            </div>
                        </div>
                        <div className="col-span-2 bg-dark-card p-3 rounded-xl border border-border/50">
                            <div className="text-xs text-content-secondary mb-1 flex items-center gap-1">
                                <Clock size={12} /> Dernier lancement
                            </div>
                            <div className="font-medium text-content-primary text-sm">
                                {scenario.lastLaunch || 'Jamais'}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        {isRunning ? (
                            <button 
                                onClick={handleStop}
                                disabled={loading}
                                className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all font-medium"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Square size={18} fill="currentColor" />}
                                Arrêter
                            </button>
                        ) : (
                            <button 
                                onClick={handleRun}
                                disabled={loading}
                                className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-jeedom-600 text-white hover:bg-jeedom-500 shadow-lg shadow-jeedom-900/20 transition-all font-medium active:scale-95"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Play size={18} fill="currentColor" />}
                                Lancer
                            </button>
                        )}

                        <button 
                            onClick={handleToggleState}
                            disabled={loading}
                            className={`col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all font-medium ${
                                isActive 
                                ? 'bg-dark-card text-content-secondary border-border hover:bg-dark-surface' 
                                : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                            }`}
                        >
                            <Power size={18} />
                            {isActive ? 'Désactiver le scénario' : 'Activer le scénario'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioDetailsModal;
