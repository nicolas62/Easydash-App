import React, { useEffect, useState } from 'react';
import { X, Play, RefreshCw, Power, Workflow, Search, Layers } from 'lucide-react';
import { JeedomScenario, AppSettings } from '../types';
import { fetchJeedomScenarios, executeScenario, toggleScenarioState } from '../services/jeedomService';
import Toast, { ToastType } from './Toast';

interface ScenarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
}

const ScenarioModal: React.FC<ScenarioModalProps> = ({ isOpen, onClose, settings }) => {
    const [scenarios, setScenarios] = useState<JeedomScenario[]>([]);
    const [loading, setLoading] = useState(false);
    const [executingId, setExecutingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);

    // Fetch on open
    useEffect(() => {
        if (isOpen) {
            loadScenarios();
        }
    }, [isOpen]);

    const loadScenarios = async () => {
        setLoading(true);
        try {
            const data = await fetchJeedomScenarios(settings);
            // Sort: Groups first, then names
            data.sort((a, b) => {
                if (a.group === b.group) return a.name.localeCompare(b.name);
                return (a.group || 'Aucun').localeCompare(b.group || 'Aucun');
            });
            setScenarios(data);
        } catch (e) {
            setToast({ message: "Erreur chargement scénarios", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRun = async (id: string) => {
        setExecutingId(id);
        try {
            await executeScenario(settings, id);
            setToast({ message: "Scénario lancé", type: 'warning' }); // using warning for yellow/orange color (neutral)
            
            // Refresh state after a short delay
            setTimeout(() => {
                loadScenarios();
                setExecutingId(null);
            }, 2000);
        } catch (e: any) {
            const msg = e?.message ? `Echec: ${e.message.substring(0, 80)}` : "Echec lancement";
            setToast({ message: msg, type: 'error' });
            console.error("[ScenarioModal] handleRun error:", e);
            setExecutingId(null);
        }
    };

    const handleToggleState = async (s: JeedomScenario) => {
        // Optimistic UI update
        const isActive = s.isActive === '1' || s.isActive === 1 || s.isActive === true;
        const newState = !isActive;
        
        setScenarios(prev => prev.map(sc => sc.id === s.id ? { ...sc, isActive: newState ? '1' : '0' } : sc));

        try {
            await toggleScenarioState(settings, s.id, isActive);
        } catch (e) {
            // Revert on error
            setScenarios(prev => prev.map(sc => sc.id === s.id ? { ...sc, isActive: isActive ? '1' : '0' } : sc));
            setToast({ message: "Erreur changement état", type: 'error' });
        }
    };

    if (!isOpen) return null;

    // Filter logic
    const filteredScenarios = scenarios.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.group && s.group.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Grouping
    const grouped: Record<string, JeedomScenario[]> = {};
    filteredScenarios.forEach(s => {
        const g = s.group || 'Autres';
        if (!grouped[g]) grouped[g] = [];
        grouped[g].push(s);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/60 backdrop-blur-sm">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="bg-dark-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-dark-surface/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
                        <Workflow className="text-jeedom-500" />
                        Scénarios
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={loadScenarios} disabled={loading} className="p-2 text-content-secondary hover:text-jeedom-500 rounded-full hover:bg-input-bg transition-colors">
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button onClick={onClose} className="p-2 text-content-secondary hover:text-content-primary rounded-full hover:bg-input-bg transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-border bg-dark-bg/30">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Rechercher un scénario..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-input-bg border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-jeedom-500 focus:border-transparent outline-none"
                        />
                        <Search className="absolute left-3 top-3.5 text-content-secondary" size={16} />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    {Object.keys(grouped).length === 0 && !loading && (
                        <div className="text-center py-10 text-content-secondary">
                            Aucun scénario trouvé.
                        </div>
                    )}

                    {Object.entries(grouped).map(([group, list]) => (
                        <div key={group} className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-xs font-bold text-jeedom-500 uppercase tracking-wider flex items-center gap-2 px-1">
                                <Layers size={12} />
                                {group}
                            </h3>
                            <div className="grid gap-2">
                                {list.map(scenario => {
                                    const isActive = scenario.isActive === '1' || scenario.isActive === 1 || scenario.isActive === true;
                                    const isRunning = scenario.state === 'run';
                                    const isExecuting = executingId === scenario.id;

                                    return (
                                        <div key={scenario.id} className="bg-dark-card border border-border rounded-xl p-3 flex items-center justify-between group hover:border-jeedom-500/30 transition-colors">
                                            
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`p-2 rounded-lg ${isActive ? 'bg-jeedom-500/10 text-jeedom-500' : 'bg-input-bg text-content-secondary'}`}>
                                                    <Workflow size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-content-primary truncate flex items-center gap-2">
                                                        {scenario.name}
                                                        {isRunning && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>}
                                                    </div>
                                                    <div className="text-[10px] text-content-secondary truncate">
                                                        Dernier lancement: {scenario.lastLaunch || 'Jamais'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Toggle Active/Inactive */}
                                                <button 
                                                    onClick={() => handleToggleState(scenario)}
                                                    title={isActive ? "Désactiver" : "Activer"}
                                                    className={`p-2 rounded-lg transition-all ${
                                                        isActive 
                                                        ? 'text-green-400 hover:bg-green-400/10' 
                                                        : 'text-content-secondary hover:text-content-primary hover:bg-input-bg'
                                                    }`}
                                                >
                                                    <Power size={18} />
                                                </button>

                                                {/* Separator */}
                                                <div className="w-px h-6 bg-border mx-1"></div>

                                                {/* Run Button */}
                                                <button 
                                                    onClick={() => handleRun(scenario.id)}
                                                    disabled={isExecuting}
                                                    title="Lancer le scénario"
                                                    className={`
                                                        p-2 rounded-lg text-white shadow-lg transition-all active:scale-95 flex items-center justify-center
                                                        ${isExecuting 
                                                            ? 'bg-jeedom-600/50 cursor-wait' 
                                                            : 'bg-jeedom-600 hover:bg-jeedom-500 shadow-jeedom-900/20'}
                                                    `}
                                                >
                                                    {isExecuting ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScenarioModal;