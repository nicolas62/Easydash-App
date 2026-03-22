import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WidgetConfig, JeedomEqLogic, JeedomCommand, JeedomScenario, AppSettings } from '../types';
import { COLORS, CATEGORIES } from '../constants';
import IconSelector from './IconSelector';
import { fetchJeedomScenarios } from '../services/jeedomService';
import { X, Check, Plus, Trash2, ChevronDown, Search, Command, Layers, RotateCw, Star, Workflow, RefreshCw } from 'lucide-react';

interface WidgetEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (widget: WidgetConfig) => void;
    initialData?: WidgetConfig;
    availableEqLogics: JeedomEqLogic[];
    availableScenarios?: JeedomScenario[];
    dashboardId: string;
    settings: AppSettings;
}

// --- COMPOSANT INTERNE DE SÉLECTION AVEC RECHERCHE ---
interface CommandSelectorProps {
    value: string | undefined;
    onChange: (value: string) => void;
    availableEqLogics: JeedomEqLogic[];
    filterType?: 'info' | 'action' | 'all';
    placeholder?: string;
    disabled?: boolean;
}

const CommandSelector: React.FC<CommandSelectorProps> = ({ 
    value, onChange, availableEqLogics, filterType = 'all', placeholder = "Sélectionner...", disabled 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fermer le menu si on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus sur l'input quand on ouvre
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        if (!isOpen) {
            setSearchTerm(""); // Reset recherche à la fermeture
        }
    }, [isOpen]);

    // Trouver le nom de la commande sélectionnée pour l'affichage
    const selectedCommandName = useMemo(() => {
        if (!value) return null;
        for (const eq of (availableEqLogics || [])) {
            const cmd = eq.cmds?.find(c => c.id === value);
            if (cmd) return `${eq.name} - ${cmd.name}`;
        }
        return value; // Fallback ID si non trouvé
    }, [value, availableEqLogics]);

    // Filtrer les données
    const filteredData = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();

        return (availableEqLogics || []).map(eq => {
            // Filtrer les commandes par type ET par recherche
            const matchingCmds = (eq.cmds || []).filter(cmd => {
                const typeMatch = filterType === 'all' || cmd.type === filterType;
                const searchMatch = 
                    cmd.name.toLowerCase().includes(lowerSearch) || 
                    eq.name.toLowerCase().includes(lowerSearch); // On garde si le nom de l'équipement matche aussi
                
                return typeMatch && searchMatch;
            });

            return { ...eq, cmds: matchingCmds };
        }).filter(eq => eq.cmds.length > 0); // On ne garde que les équipements qui ont des commandes correspondantes
    }, [availableEqLogics, filterType, searchTerm]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-input-bg border border-border text-content-primary rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-jeedom-500 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-content-secondary/50'}`}
            >
                <span className={`truncate ${!selectedCommandName ? 'text-content-secondary' : ''}`}>
                    {selectedCommandName || placeholder}
                </span>
                <ChevronDown size={16} className={`ml-2 text-content-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-dark-card border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-60">
                    {/* Barre de recherche */}
                    <div className="sticky top-0 bg-dark-card p-2 border-b border-border z-10">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 text-content-secondary" size={14} />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full bg-input-bg border border-border rounded-md py-2 pl-8 pr-3 text-sm text-content-primary focus:outline-none focus:border-jeedom-500 placeholder:text-content-secondary/50"
                                placeholder="Rechercher une commande..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Liste des résultats */}
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        {filteredData.length === 0 ? (
                            <div className="p-4 text-center text-xs text-content-secondary">
                                Aucune commande trouvée.
                            </div>
                        ) : (
                            filteredData.map(eq => (
                                <div key={eq.id}>
                                    <div className="px-3 py-1.5 bg-dark-surface/50 text-[10px] font-bold text-jeedom-500 uppercase tracking-wider sticky top-0">
                                        {eq.name}
                                    </div>
                                    {eq.cmds.map(cmd => (
                                        <button
                                            key={cmd.id}
                                            type="button"
                                            onClick={() => {
                                                onChange(cmd.id);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-jeedom-600 hover:text-white transition-colors flex items-center justify-between ${value === cmd.id ? 'bg-jeedom-600/20 text-jeedom-500' : 'text-content-primary'}`}
                                        >
                                            <span>{cmd.name}</span>
                                            {value === cmd.id && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- FIN COMPOSANT INTERNE ---

const WidgetEditorModal: React.FC<WidgetEditorModalProps> = ({ isOpen, onClose, onSave, initialData, availableEqLogics, availableScenarios = [], dashboardId, settings }) => {
    const [scenarios, setScenarios] = useState<JeedomScenario[]>(availableScenarios || []);
    const [isLoadingScenarios, setIsLoadingScenarios] = useState(false);
    const [scenarioError, setScenarioError] = useState<string | null>(null);

    // Debug logs
    console.log("WidgetEditorModal Render. Scenarios count:", (scenarios || []).length, "Available props:", (availableScenarios || []).length);

    // Sync with props but allow local override
    useEffect(() => {
        if ((availableScenarios || []).length > 0) {
            console.log("Syncing scenarios from props:", availableScenarios.length);
            setScenarios(availableScenarios);
        }
    }, [availableScenarios]);

    const loadScenarios = async () => {
        if (!settings) {
            console.error("Settings missing in loadScenarios");
            return;
        }
        setIsLoadingScenarios(true);
        setScenarioError(null);
        try {
            console.log("Fetching scenarios in editor with settings:", { url: settings.jeedomUrl, hasKey: !!settings.apiKey });
            const data = await fetchJeedomScenarios(settings);
            console.log("WidgetEditorModal received scenarios:", data);
            console.log("Setting scenarios state with:", data.length, "items");
            
            // Sort: Groups first, then names
            data.sort((a, b) => {
                if (a.group === b.group) return a.name.localeCompare(b.name);
                return (a.group || 'Aucun').localeCompare(b.group || 'Aucun');
            });
            setScenarios(data);
        } catch (e: any) {
            console.error("Failed to load scenarios in editor", e);
            setScenarioError(e.message || "Erreur de chargement");
        } finally {
            setIsLoadingScenarios(false);
        }
    };

    // Fetch scenarios on mount (like ScenarioModal)
    useEffect(() => {
        if (isOpen && settings) {
            loadScenarios();
        }
    }, [isOpen, settings]);

    const [widget, setWidget] = useState<WidgetConfig>({
        id: '',
        dashboardId: dashboardId,
        name: '',
        type: 'info',
        category: 'other',
        icon: 'activity',
        color: 'bg-jeedom-500',
        size: 'small',
        additionalCommandIds: [],
        actionExecutionMode: 'sequence',
        isFavorite: false
    });
    
    useEffect(() => {
        if (initialData) {
            // Migration logic for sequenceSteps
            let steps = initialData.sequenceSteps || [];
            if (steps.length === 0 && initialData.actionExecutionMode === 'sequence') {
                // Legacy migration: commandId is step 1, additionalCommandIds are subsequent steps
                if (initialData.commandId) steps.push([initialData.commandId]);
                if (initialData.additionalCommandIds) {
                    initialData.additionalCommandIds.forEach(id => steps.push([id]));
                }
            }
            // Ensure at least one step if empty
            if (steps.length === 0) steps = [['']];

            setWidget({
                ...initialData,
                category: initialData.category || 'other',
                additionalCommandIds: initialData.additionalCommandIds || [],
                sequenceSteps: steps,
                actionExecutionMode: initialData.actionExecutionMode || 'sequence',
                isFavorite: initialData.isFavorite || false
            });
        } else {
            setWidget({
                id: crypto.randomUUID(),
                dashboardId: dashboardId,
                name: '',
                type: 'info',
                category: 'other',
                icon: 'activity',
                color: 'bg-jeedom-500',
                size: 'small',
                additionalCommandIds: [],
                sequenceSteps: [['']], // Start with 1 step, 1 command
                actionExecutionMode: 'sequence',
                isFavorite: false
            });
        }
    }, [initialData, isOpen, dashboardId]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Sync commandId with first command of first step for consistency
        const finalWidget = { ...widget };
        // Only sync for 'action' type where sequence mode is used
        if (finalWidget.type === 'action' && finalWidget.actionExecutionMode === 'sequence' && finalWidget.sequenceSteps && finalWidget.sequenceSteps.length > 0) {
            const firstStep = finalWidget.sequenceSteps[0];
            if (firstStep && firstStep.length > 0) {
                finalWidget.commandId = firstStep[0];
            }
        }
        
        onSave(finalWidget);
        onClose();
    };

    const hasAvailableData = availableEqLogics && availableEqLogics.length > 0;

    // --- SEQUENCE MODE HANDLERS ---
    const handleAddStep = () => {
        setWidget(prev => ({
            ...prev,
            sequenceSteps: [...(prev.sequenceSteps || []), ['']]
        }));
    };

    const handleRemoveStep = (index: number) => {
        setWidget(prev => {
            const newSteps = [...(prev.sequenceSteps || [])];
            newSteps.splice(index, 1);
            return { ...prev, sequenceSteps: newSteps };
        });
    };

    const handleAddCommandToStep = (stepIndex: number) => {
        setWidget(prev => {
            const newSteps = [...(prev.sequenceSteps || [])];
            newSteps[stepIndex] = [...newSteps[stepIndex], ''];
            return { ...prev, sequenceSteps: newSteps };
        });
    };

    const handleRemoveCommandFromStep = (stepIndex: number, cmdIndex: number) => {
        setWidget(prev => {
            const newSteps = [...(prev.sequenceSteps || [])];
            const step = [...newSteps[stepIndex]];
            step.splice(cmdIndex, 1);
            newSteps[stepIndex] = step;
            
            // If step becomes empty, remove it (unless it's the only one)
            if (step.length === 0 && newSteps.length > 1) {
                newSteps.splice(stepIndex, 1);
            } else if (step.length === 0) {
                 newSteps[stepIndex] = ['']; // Keep at least one empty slot
            }
            
            return { ...prev, sequenceSteps: newSteps };
        });
    };

    const handleUpdateStepCommand = (stepIndex: number, cmdIndex: number, value: string) => {
        setWidget(prev => {
            const newSteps = [...(prev.sequenceSteps || [])];
            const step = [...newSteps[stepIndex]];
            step[cmdIndex] = value;
            newSteps[stepIndex] = step;
            
            // Sync commandId if it's the first command of first step
            let newCommandId = prev.commandId;
            if (stepIndex === 0 && cmdIndex === 0) {
                newCommandId = value;
            }
            
            return { ...prev, sequenceSteps: newSteps, commandId: newCommandId };
        });
    };

    // --- BATCH MODE HANDLERS ---
    const handleAddAction = () => {
        setWidget(prev => ({
            ...prev,
            additionalCommandIds: [...(prev.additionalCommandIds || []), '']
        }));
    };

    const handleRemoveAction = (index: number) => {
        setWidget(prev => ({
            ...prev,
            additionalCommandIds: prev.additionalCommandIds?.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateAdditionalAction = (index: number, value: string) => {
        const newIds = [...(widget.additionalCommandIds || [])];
        newIds[index] = value;
        setWidget(prev => ({ ...prev, additionalCommandIds: newIds }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-dark-bg/60 backdrop-blur-sm">
            <div className="bg-dark-surface w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl border border-border flex flex-col max-h-[95vh] animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-content-primary">{initialData ? 'Modifier Widget' : 'Nouveau Widget'}</h2>
                    <button onClick={onClose} className="text-content-secondary hover:text-content-primary">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    
                    {/* Name & Favorites */}
                    <div className="flex gap-4 items-start">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-content-secondary mb-1">Nom</label>
                            <input 
                                type="text" 
                                required
                                value={widget.name}
                                onChange={e => setWidget({...widget, name: e.target.value})}
                                className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 focus:ring-2 focus:ring-jeedom-500 outline-none"
                                placeholder="Ex: Température Salon"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-content-secondary mb-1">Favori</label>
                             <button
                                type="button"
                                onClick={() => setWidget(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                                className={`h-[50px] w-[50px] flex items-center justify-center rounded-lg border transition-all ${
                                    widget.isFavorite 
                                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' 
                                    : 'bg-input-bg border-border text-content-secondary hover:bg-dark-card'
                                }`}
                             >
                                <Star size={24} fill={widget.isFavorite ? "currentColor" : "none"} />
                             </button>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-2">Catégorie (pour les filtres)</label>
                        <div className="grid grid-cols-4 gap-2">
                            {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setWidget({...widget, category: cat.id})}
                                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                                        widget.category === cat.id 
                                        ? 'bg-jeedom-600/20 border-jeedom-500 text-jeedom-500' 
                                        : 'bg-input-bg border-transparent text-content-secondary hover:bg-dark-card'
                                    }`}
                                >
                                    <cat.icon size={18} className="mb-1" />
                                    <span className="text-[10px] font-medium">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Type & Size */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-content-secondary mb-1">Type</label>
                            <select 
                                value={widget.type}
                                onChange={e => setWidget({...widget, type: e.target.value as any})}
                                className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 outline-none"
                            >
                                <option value="info">Information</option>
                                <option value="action">Action (Bouton)</option>
                                <option value="toggle">Interrupteur (Toggle)</option>
                                <option value="scenario">Scénario</option>
                                <option value="chart">Graphique (Historique)</option>
                                <option value="camera">Caméra</option>
                                <option value="slider">Curseur (Slider)</option>
                                <option value="thermostat">Thermostat</option>
                                <option value="weather">Météo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-secondary mb-1">Taille</label>
                            <select 
                                value={widget.size}
                                onChange={e => setWidget({...widget, size: e.target.value as any})}
                                className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 outline-none"
                            >
                                <option value="small">Carré (1x1)</option>
                                <option value="medium">Large (2x1)</option>
                                <option value="large">Grand (2x2)</option>
                                <option value="wide">Très Large (4x2)</option>
                            </select>
                        </div>
                    </div>

                    {/* Commands Link */}
                    <div className="space-y-3">
                        {widget.type === 'scenario' ? (
                            <>
                            <div>
                                <label className="block text-sm font-medium text-content-secondary flex items-center gap-2 mb-2">
                                     <Workflow size={14} className="text-jeedom-500"/>
                                     Scénario à lancer
                                     {isLoadingScenarios && <RefreshCw size={12} className="animate-spin ml-2" />}
                                     {!isLoadingScenarios && (
                                         <button 
                                            type="button" 
                                            onClick={loadScenarios}
                                            className="ml-2 text-xs text-jeedom-500 hover:underline flex items-center gap-1"
                                         >
                                             <RefreshCw size={10} /> Actualiser
                                         </button>
                                     )}
                                     <span className="text-[10px] text-content-secondary ml-auto">
                                         {scenarios.length} trouvés
                                     </span>
                                </label>
                                {scenarios.length === 0 && !isLoadingScenarios && (
                                    <div className="mb-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-[10px] text-orange-200 font-mono">
                                        DEBUG: URL={settings?.jeedomUrl || 'N/A'} <br/>
                                        KEY={settings?.apiKey ? '***' : 'MISSING'} <br/>
                                        Last Error: {scenarioError || 'None'}
                                    </div>
                                )}
                                <select
                                    value={widget.scenarioId || ''}
                                    onChange={(e) => setWidget({...widget, scenarioId: e.target.value})}
                                    className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 outline-none"
                                    disabled={isLoadingScenarios}
                                >
                                    <option value="">-- Sélectionner un scénario --</option>
                                    {scenarios.length > 0 ? (
                                        scenarios.map(sc => (
                                            <option key={sc.id} value={sc.id}>
                                                {sc.group ? `[${sc.group}] ` : ''}{sc.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>
                                            {isLoadingScenarios ? "Chargement..." : (scenarioError ? `Erreur: ${scenarioError}` : "Aucun scénario trouvé")}
                                        </option>
                                    )}
                                </select>
                            </div>

                            {/* Tags de scénario */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-content-secondary mb-2">
                                    Tags passés au scénario (optionnel)
                                </label>
                                <div className="space-y-2">
                                    {(widget.scenarioTags || []).map((tag, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={tag.name}
                                                onChange={e => {
                                                    const tags = [...(widget.scenarioTags || [])];
                                                    tags[i] = { ...tags[i], name: e.target.value };
                                                    setWidget({...widget, scenarioTags: tags});
                                                }}
                                                placeholder="nom_tag"
                                                className="flex-1 bg-input-bg border border-border text-content-primary rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-jeedom-500"
                                            />
                                            <span className="text-content-secondary text-sm">=</span>
                                            <input
                                                type="text"
                                                value={tag.value}
                                                onChange={e => {
                                                    const tags = [...(widget.scenarioTags || [])];
                                                    tags[i] = { ...tags[i], value: e.target.value };
                                                    setWidget({...widget, scenarioTags: tags});
                                                }}
                                                placeholder="valeur"
                                                className="flex-1 bg-input-bg border border-border text-content-primary rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-jeedom-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const tags = (widget.scenarioTags || []).filter((_, idx) => idx !== i);
                                                    setWidget({...widget, scenarioTags: tags});
                                                }}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setWidget({...widget, scenarioTags: [...(widget.scenarioTags || []), { name: '', value: '' }]})}
                                        className="flex items-center gap-1 text-xs text-jeedom-500 hover:text-jeedom-400 transition-colors mt-1"
                                    >
                                        <Plus size={12} /> Ajouter un tag
                                    </button>
                                </div>
                            </div>
                            </>
                        ) : (
                            <>
                        {/* CONFIGURATION POUR INFO */}
                        {widget.type === 'info' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-content-secondary mb-1">
                                    Commande d'information
                                </label>
                                <CommandSelector 
                                    value={widget.infoId}
                                    onChange={(val) => setWidget({...widget, infoId: val})}
                                    availableEqLogics={availableEqLogics}
                                    filterType="info"
                                    placeholder="Sélectionner l'information..."
                                    disabled={!hasAvailableData}
                                />
                            </div>
                        )}

                        {/* CONFIGURATION POUR CAMERA */}
                        {widget.type === 'camera' && (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-content-secondary mb-1">
                                        URL du flux (Stream MJPEG ou Snapshot)
                                    </label>
                                    <input 
                                        type="text" 
                                        value={widget.streamUrl || ''}
                                        onChange={e => setWidget({...widget, streamUrl: e.target.value})}
                                        className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 focus:ring-2 focus:ring-jeedom-500 outline-none"
                                        placeholder="http://jeedom/plugins/camera/..."
                                    />
                                    <p className="text-[10px] text-content-secondary mt-1">
                                        L'URL doit être accessible depuis le navigateur. Si snapshot, activez le rafraîchissement.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-content-secondary mb-1">
                                        Rafraîchissement (ms) - 0 pour flux vidéo
                                    </label>
                                    <input 
                                        type="number" 
                                        value={widget.refreshInterval || 0}
                                        onChange={e => setWidget({...widget, refreshInterval: parseInt(e.target.value) || 0})}
                                        className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 focus:ring-2 focus:ring-jeedom-500 outline-none"
                                        placeholder="Ex: 5000 pour 5s"
                                    />
                                </div>
                            </div>
                        )}

                        {/* CONFIGURATION POUR SLIDER */}
                        {widget.type === 'slider' && (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-content-secondary mb-1">
                                        Commande Info (valeur courante)
                                    </label>
                                    <CommandSelector
                                        value={widget.sliderInfoId}
                                        onChange={(val) => setWidget({...widget, sliderInfoId: val})}
                                        availableEqLogics={availableEqLogics}
                                        filterType="info"
                                        placeholder="Sélectionner la commande info..."
                                        disabled={!hasAvailableData}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-content-secondary mb-1">
                                        Commande Action (envoyer la valeur)
                                    </label>
                                    <CommandSelector
                                        value={widget.sliderActionId}
                                        onChange={(val) => setWidget({...widget, sliderActionId: val})}
                                        availableEqLogics={availableEqLogics}
                                        filterType="action"
                                        placeholder="Sélectionner la commande action..."
                                        disabled={!hasAvailableData}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">Min</label>
                                        <input
                                            type="number"
                                            value={widget.sliderMin ?? 0}
                                            onChange={e => setWidget({...widget, sliderMin: Number(e.target.value)})}
                                            className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 focus:ring-2 focus:ring-jeedom-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">Max</label>
                                        <input
                                            type="number"
                                            value={widget.sliderMax ?? 100}
                                            onChange={e => setWidget({...widget, sliderMax: Number(e.target.value)})}
                                            className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 focus:ring-2 focus:ring-jeedom-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">Pas</label>
                                        <input
                                            type="number"
                                            value={widget.sliderStep ?? 1}
                                            onChange={e => setWidget({...widget, sliderStep: Number(e.target.value)})}
                                            className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 focus:ring-2 focus:ring-jeedom-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONFIGURATION POUR THERMOSTAT */}
                        {widget.type === 'thermostat' && (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-content-secondary mb-1">
                                        Température Actuelle (Info)
                                    </label>
                                    <CommandSelector 
                                        value={widget.currentTempCmdId}
                                        onChange={(val) => setWidget({...widget, currentTempCmdId: val})}
                                        availableEqLogics={availableEqLogics}
                                        filterType="info"
                                        placeholder="Sélectionner la température..."
                                        disabled={!hasAvailableData}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-content-secondary mb-1">
                                        Consigne (Info)
                                    </label>
                                    <CommandSelector 
                                        value={widget.setpointCmdId}
                                        onChange={(val) => setWidget({...widget, setpointCmdId: val})}
                                        availableEqLogics={availableEqLogics}
                                        filterType="info"
                                        placeholder="Sélectionner la consigne..."
                                        disabled={!hasAvailableData}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">
                                            Action (+)
                                        </label>
                                        <CommandSelector 
                                            value={widget.actionUpCmdId}
                                            onChange={(val) => setWidget({...widget, actionUpCmdId: val})}
                                            availableEqLogics={availableEqLogics}
                                            filterType="action"
                                            placeholder="Monter"
                                            disabled={!hasAvailableData}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">
                                            Action (-)
                                        </label>
                                        <CommandSelector 
                                            value={widget.actionDownCmdId}
                                            onChange={(val) => setWidget({...widget, actionDownCmdId: val})}
                                            availableEqLogics={availableEqLogics}
                                            filterType="action"
                                            placeholder="Descendre"
                                            disabled={!hasAvailableData}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-content-secondary mb-1">
                                        État (Chauffe/Clim/Arrêt) - Optionnel
                                    </label>
                                    <CommandSelector
                                        value={widget.stateCmdId}
                                        onChange={(val) => setWidget({...widget, stateCmdId: val})}
                                        availableEqLogics={availableEqLogics}
                                        filterType="info"
                                        placeholder="Sélectionner l'état..."
                                        disabled={!hasAvailableData}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-content-secondary mb-1">
                                        Mode actuel (Info) - Optionnel
                                    </label>
                                    <CommandSelector
                                        value={widget.modeInfoCmdId}
                                        onChange={(val) => setWidget({...widget, modeInfoCmdId: val})}
                                        availableEqLogics={availableEqLogics}
                                        filterType="info"
                                        placeholder="Sélectionner le mode..."
                                        disabled={!hasAvailableData}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">
                                            Action Mode Absent
                                        </label>
                                        <CommandSelector
                                            value={widget.awayModeCmdId}
                                            onChange={(val) => setWidget({...widget, awayModeCmdId: val})}
                                            availableEqLogics={availableEqLogics}
                                            filterType="action"
                                            placeholder="Mode absent..."
                                            disabled={!hasAvailableData}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">
                                            Action Mode Éco
                                        </label>
                                        <CommandSelector
                                            value={widget.ecoModeCmdId}
                                            onChange={(val) => setWidget({...widget, ecoModeCmdId: val})}
                                            availableEqLogics={availableEqLogics}
                                            filterType="action"
                                            placeholder="Mode éco..."
                                            disabled={!hasAvailableData}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONFIGURATION POUR METEO */}
                        {widget.type === 'weather' && (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-content-secondary mb-1">
                                        Température (Info)
                                    </label>
                                    <CommandSelector 
                                        value={widget.tempCmdId}
                                        onChange={(val) => setWidget({...widget, tempCmdId: val})}
                                        availableEqLogics={availableEqLogics}
                                        filterType="info"
                                        placeholder="Sélectionner la température..."
                                        disabled={!hasAvailableData}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-content-secondary mb-1">
                                        Condition Météo (Info Texte ou Numérique)
                                    </label>
                                    <CommandSelector 
                                        value={widget.conditionCmdId}
                                        onChange={(val) => setWidget({...widget, conditionCmdId: val})}
                                        availableEqLogics={availableEqLogics}
                                        filterType="info"
                                        placeholder="Sélectionner la condition..."
                                        disabled={!hasAvailableData}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">
                                            Min (Info)
                                        </label>
                                        <CommandSelector 
                                            value={widget.minCmdId}
                                            onChange={(val) => setWidget({...widget, minCmdId: val})}
                                            availableEqLogics={availableEqLogics}
                                            filterType="info"
                                            placeholder="Temp. Min"
                                            disabled={!hasAvailableData}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">
                                            Max (Info)
                                        </label>
                                        <CommandSelector 
                                            value={widget.maxCmdId}
                                            onChange={(val) => setWidget({...widget, maxCmdId: val})}
                                            availableEqLogics={availableEqLogics}
                                            filterType="info"
                                            placeholder="Temp. Max"
                                            disabled={!hasAvailableData}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SEQUENCE D'ACTIONS (Seulement pour type Action) */}
                        {widget.type === 'action' && (
                            <div className="mt-4 space-y-4 border-l-2 border-border pl-3">
                                
                                {/* Mode Selection: Cycle vs Batch */}
                                <div>
                                    <label className="block text-sm font-medium text-content-secondary mb-2">Mode d'exécution des actions</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setWidget({...widget, actionExecutionMode: 'sequence'})}
                                            className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                                                widget.actionExecutionMode !== 'batch'
                                                ? 'bg-jeedom-600/20 border-jeedom-500 text-jeedom-500'
                                                : 'bg-input-bg border-transparent text-content-secondary hover:bg-dark-card'
                                            }`}
                                        >
                                            <RotateCw size={14} />
                                            Cycle (Étapes)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setWidget({...widget, actionExecutionMode: 'batch'})}
                                            className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                                                widget.actionExecutionMode === 'batch'
                                                ? 'bg-jeedom-600/20 border-jeedom-500 text-jeedom-500'
                                                : 'bg-input-bg border-transparent text-content-secondary hover:bg-dark-card'
                                            }`}
                                        >
                                            <Layers size={14} />
                                            Tout exécuter
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-content-secondary mt-1.5">
                                        {widget.actionExecutionMode === 'batch' 
                                         ? "Toutes les actions listées ci-dessous seront lancées en même temps au clic."
                                         : "Chaque clic exécutera l'étape suivante (boucle). Une étape peut contenir plusieurs actions."}
                                    </p>
                                </div>

                                {/* EDITOR FOR SEQUENCE MODE */}
                                {widget.actionExecutionMode !== 'batch' && (
                                    <div className="space-y-6">
                                        {widget.sequenceSteps?.map((step, stepIndex) => (
                                            <div key={stepIndex} className="bg-dark-card/50 p-3 rounded-lg border border-border/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-jeedom-500 uppercase tracking-wider">
                                                        Étape {stepIndex + 1}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddCommandToStep(stepIndex)}
                                                            className="text-[10px] bg-jeedom-600/20 text-jeedom-500 px-2 py-1 rounded hover:bg-jeedom-600/30"
                                                        >
                                                            + Action
                                                        </button>
                                                        {widget.sequenceSteps && widget.sequenceSteps.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveStep(stepIndex)}
                                                                className="text-red-400 hover:text-red-500"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {step.map((cmdId, cmdIndex) => (
                                                        <div key={cmdIndex} className="flex gap-2 items-center">
                                                            <div className="flex-1">
                                                                <CommandSelector 
                                                                    value={cmdId}
                                                                    onChange={(val) => handleUpdateStepCommand(stepIndex, cmdIndex, val)}
                                                                    availableEqLogics={availableEqLogics}
                                                                    filterType="action"
                                                                    placeholder={`Action ${cmdIndex + 1}`}
                                                                    disabled={!hasAvailableData}
                                                                />
                                                            </div>
                                                            {step.length > 1 && (
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => handleRemoveCommandFromStep(stepIndex, cmdIndex)}
                                                                    className="text-content-secondary hover:text-red-400 p-1"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <button 
                                            type="button"
                                            onClick={handleAddStep}
                                            className="w-full py-2 border border-dashed border-border rounded-lg text-xs text-content-secondary hover:text-jeedom-500 hover:border-jeedom-500 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14} />
                                            Ajouter une étape au cycle
                                        </button>
                                    </div>
                                )}

                                {/* EDITOR FOR BATCH MODE (Legacy) */}
                                {widget.actionExecutionMode === 'batch' && (
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-content-secondary flex items-center gap-2">
                                            Actions à exécuter
                                        </label>
                                        
                                        {/* Main Command (Always first in batch) */}
                                        <div className="flex gap-2 items-start">
                                            <div className="flex-1">
                                                <CommandSelector 
                                                    value={widget.commandId}
                                                    onChange={(val) => setWidget({...widget, commandId: val})}
                                                    availableEqLogics={availableEqLogics}
                                                    filterType="action"
                                                    placeholder="Action Principale"
                                                    disabled={!hasAvailableData}
                                                />
                                            </div>
                                        </div>

                                        {widget.additionalCommandIds?.map((cmdId, index) => (
                                            <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-left-2 items-start">
                                                <div className="flex-1">
                                                    <CommandSelector 
                                                        value={cmdId}
                                                        onChange={(val) => handleUpdateAdditionalAction(index, val)}
                                                        availableEqLogics={availableEqLogics}
                                                        filterType="action"
                                                        placeholder={`Action supplémentaire ${index + 1}`}
                                                        disabled={!hasAvailableData}
                                                    />
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveAction(index)}
                                                    className="p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}

                                        <button 
                                            type="button"
                                            onClick={handleAddAction}
                                            className="text-sm text-jeedom-500 hover:text-jeedom-400 font-medium flex items-center gap-1 mt-2"
                                        >
                                            <Plus size={16} />
                                            Ajouter une action
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* CONFIGURATION SPECIFIQUE POUR TOGGLE (Simple Action) */}
                        {widget.type === 'toggle' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-content-secondary mb-1">
                                    Commande d'action
                                </label>
                                <CommandSelector 
                                    value={widget.commandId}
                                    onChange={(val) => setWidget({...widget, commandId: val})}
                                    availableEqLogics={availableEqLogics}
                                    filterType="action"
                                    placeholder="Sélectionner l'action (On/Off/Toggle)..."
                                    disabled={!hasAvailableData}
                                />
                            </div>
                        )}

                        {/* CONFIGURATION SPECIFIQUE POUR CHART */}
                        {widget.type === 'chart' && (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-content-secondary mb-1">
                                        Commande Historisée (Info)
                                    </label>
                                    <CommandSelector 
                                        value={widget.commandId}
                                        onChange={(val) => setWidget({...widget, commandId: val})}
                                        availableEqLogics={availableEqLogics}
                                        filterType="info"
                                        placeholder="Sélectionner l'info historisée..."
                                        disabled={!hasAvailableData}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">
                                            Type de graphique
                                        </label>
                                        <select 
                                            value={widget.chartType || 'line'}
                                            onChange={e => setWidget({...widget, chartType: e.target.value as any})}
                                            className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 outline-none"
                                        >
                                            <option value="line">Ligne (Courbe)</option>
                                            <option value="bar">Barres (Histogramme)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">
                                            Agrégation des données
                                        </label>
                                        <select 
                                            value={widget.chartAggregation || 'none'}
                                            onChange={e => setWidget({...widget, chartAggregation: e.target.value as any})}
                                            className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 outline-none"
                                        >
                                            <option value="none">Aucune (Données brutes)</option>
                                            <option value="daily_avg">Moyenne par jour</option>
                                            <option value="daily_max">Maximum par jour</option>
                                            <option value="daily_sum">Somme par jour</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-content-secondary mb-1">
                                        Période d'historique
                                    </label>
                                    <select 
                                        value={widget.historyPeriod || '24h'}
                                        onChange={e => setWidget({...widget, historyPeriod: e.target.value as any})}
                                        className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 outline-none"
                                    >
                                        <option value="24h">Dernières 24 heures</option>
                                        <option value="7d">7 derniers jours</option>
                                        <option value="30d">30 derniers jours</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Retour d'état pour Toggle ET Action (pour gérer l'icône dynamique) */}
                        {(widget.type === 'toggle' || widget.type === 'action') && (
                            <div className="mt-2">
                                <label className="block text-sm font-medium text-content-secondary mb-1">
                                    Info d'état (Retour)
                                    {widget.type === 'action' && <span className="ml-2 text-[10px] text-content-secondary opacity-70 font-normal">(Requis pour changer l'icône ON/OFF)</span>}
                                </label>
                                <CommandSelector 
                                    value={widget.infoId}
                                    onChange={(val) => setWidget({...widget, infoId: val})}
                                    availableEqLogics={availableEqLogics}
                                    filterType="info"
                                    placeholder="-- Sélectionner l'état --"
                                    disabled={!hasAvailableData}
                                />
                            </div>
                        )}

                        {/* Information SECONDAIRE pour les tuiles LARGE (Action/Toggle) */}
                        {widget.size === 'large' && (widget.type === 'toggle' || widget.type === 'action') && (
                            <div className="mt-4 pt-4 border-t border-dashed border-border">
                                <label className="block text-sm font-medium text-content-secondary mb-1">
                                    Information à afficher (Secondaire)
                                    <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Mode Large</span>
                                </label>
                                <p className="text-xs text-content-secondary mb-2">
                                    Permet d'afficher une valeur (ex: température, conso) tout en gardant l'action au clic.
                                </p>
                                <CommandSelector 
                                    value={widget.displayInfoId}
                                    onChange={(val) => setWidget({...widget, displayInfoId: val})}
                                    availableEqLogics={availableEqLogics}
                                    filterType="info"
                                    placeholder="-- Sélectionner une info --"
                                    disabled={!hasAvailableData}
                                />
                            </div>
                        )}
                        </>
                    )}
                    </div>

                    {/* Colors */}
                    <div>
                         <label className="block text-sm font-medium text-content-secondary mb-2">Couleur de fond (Actif)</label>
                         <div className="flex flex-wrap gap-2 mb-4">
                            {COLORS.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setWidget({...widget, color: c.value})}
                                    className={`w-8 h-8 rounded-full ${c.value} ring-2 ring-offset-2 ring-offset-dark-surface transition-all ${widget.color === c.value ? 'ring-content-primary scale-110' : 'ring-transparent opacity-70 hover:opacity-100'}`}
                                />
                            ))}
                        </div>

                        <label className="block text-sm font-medium text-content-secondary mb-2">Couleur de la bordure</label>
                        <div className="flex flex-wrap gap-2">
                             {/* Default/None option */}
                            <button
                                type="button"
                                onClick={() => setWidget({...widget, borderColor: undefined})}
                                className={`w-8 h-8 rounded-full bg-transparent border-2 border-dashed border-gray-500 ring-2 ring-offset-2 ring-offset-dark-surface transition-all ${!widget.borderColor ? 'ring-content-primary scale-110' : 'ring-transparent opacity-70 hover:opacity-100'}`}
                                title="Aucune bordure (Par défaut)"
                            />
                            {COLORS.map(c => {
                                const borderClass = c.value.replace('bg-', 'border-');
                                return (
                                    <button
                                        key={`border-${c.value}`}
                                        type="button"
                                        onClick={() => setWidget({...widget, borderColor: borderClass})}
                                        className={`w-8 h-8 rounded-full border-2 ${borderClass} ring-2 ring-offset-2 ring-offset-dark-surface transition-all ${widget.borderColor === borderClass ? 'ring-content-primary scale-110' : 'ring-transparent opacity-70 hover:opacity-100'}`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Icon */}
                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-2">Icone</label>
                        <IconSelector 
                            selectedIcon={widget.icon}
                            onSelect={(icon) => setWidget({...widget, icon})}
                        />
                    </div>

                </form>

                <div className="p-6 border-t border-border">
                    <button 
                        onClick={handleSubmit}
                        className="w-full bg-jeedom-600 hover:bg-jeedom-500 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2"
                    >
                        <Check size={20} />
                        Valider
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WidgetEditorModal;