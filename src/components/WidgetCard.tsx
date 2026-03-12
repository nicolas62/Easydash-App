import React, { useState, useEffect, useMemo } from 'react';
import { WidgetConfig, JeedomCommand, JeedomScenario } from '../types';
import { ICONS, DYNAMIC_ICONS, COLORS } from '../constants';
import { executeJeedomCommand, executeScenario, stopScenario, getJeedomHistory } from '../services/jeedomService';
import { cacheService } from '../services/cacheService';
import { useJeedomCommand } from '../hooks/useJeedomCommand';
import { Loader2, Trash2, Edit3, Star, Play, Square } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import CameraWidget from './CameraWidget';
import ThermostatWidget from './ThermostatWidget';
import WeatherWidget from './WeatherWidget';

// --- HELPER FUNCTION ---
const aggregateChartData = (data: { time: number; value: number }[], method: string = 'none') => {
    if (!data || data.length === 0) return [];
    if (method === 'none') return data;

    const grouped: { [key: string]: number[] } = {};

    // Group by day (YYYY-MM-DD)
    data.forEach(item => {
        const date = new Date(item.time).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item.value);
    });

    const result = Object.keys(grouped).sort().map(date => {
        const values = grouped[date];
        let aggregatedValue = 0;

        if (method === 'daily_avg') {
            const sum = values.reduce((a, b) => a + b, 0);
            aggregatedValue = sum / values.length;
        } else if (method === 'daily_max') {
            aggregatedValue = Math.max(...values);
        } else if (method === 'daily_sum') {
            aggregatedValue = values.reduce((a, b) => a + b, 0);
        }

        // Return time as timestamp of the day (e.g., 12:00 PM) for consistent plotting
        return {
            time: new Date(date + 'T12:00:00').getTime(),
            value: parseFloat(aggregatedValue.toFixed(2))
        };
    });

    return result;
};

interface WidgetCardProps extends React.HTMLAttributes<HTMLDivElement> {
    widget: WidgetConfig;
    commands: JeedomCommand[];
    scenarios?: JeedomScenario[];
    settings: any;
    editMode: boolean;
    isConnected?: boolean;
    onEdit: (widget: WidgetConfig) => void;
    onDelete: (id: string) => void;
    onScenarioClick?: (scenarioId: string) => void;
    onActionSuccess?: () => void;
}

const WidgetCard = React.forwardRef<HTMLDivElement, WidgetCardProps>(({ widget, commands, scenarios = [], settings, editMode, isConnected = true, onEdit, onDelete, onScenarioClick, onActionSuccess, className, style, ...props }, ref) => {
    const [loading, setLoading] = useState(false);
    const [animateValue, setAnimateValue] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);
    const [optimisticValue, setOptimisticValue] = useState<string | number | undefined>(undefined);
    
    // Check if we are in a grid layout context
    const isGridLayout = className?.includes('react-grid-item');

    // --- LOGIC ---
    const isScenario = widget.type === 'scenario';
    const isChart = widget.type === 'chart';
    const isCamera = widget.type === 'camera';
    const isThermostat = widget.type === 'thermostat';
    const isWeather = widget.type === 'weather';
    const isInfoType = widget.type === 'info';

    // Fetch History for Chart
    useEffect(() => {
        if (isChart && widget.commandId) {
            const fetchHistory = async () => {
                const end = new Date();
                const start = new Date();
                
                switch (widget.historyPeriod) {
                    case '7d':
                        start.setDate(end.getDate() - 7);
                        break;
                    case '30d':
                        start.setDate(end.getDate() - 30);
                        break;
                    case '24h':
                    default:
                        start.setDate(end.getDate() - 1);
                        break;
                }

                const formatDate = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');
                const cacheKey = `chart_${widget.commandId}_${widget.historyPeriod || '24h'}_${widget.chartAggregation || 'none'}`;
                
                // Try cache first (TTL 5 min)
                const cachedData = cacheService.get<any[]>(cacheKey, 5 * 60 * 1000);
                if (cachedData) {
                    setChartData(cachedData);
                    return;
                }

                try {
                    const data = await getJeedomHistory(settings, widget.commandId!, formatDate(start), formatDate(end));
                    // Format for Recharts: { time: timestamp, value: number }
                    // Jeedom returns: { datetime: "YYYY-MM-DD HH:mm:ss", value: "12.5" }
                    const rawData = data.map((item: any) => ({
                        time: new Date(item.datetime).getTime(),
                        value: parseFloat(item.value)
                    }));

                    // Aggregate Data
                    const aggregated = aggregateChartData(rawData, widget.chartAggregation || 'none');
                    
                    // Save to cache
                    cacheService.set(cacheKey, aggregated);
                    setChartData(aggregated);

                } catch (e) {
                    console.error("Failed to load chart data", e);
                }
            };
            
            fetchHistory();
        }
    }, [isChart, widget.commandId, widget.historyPeriod, widget.chartAggregation, settings]);

    // Find the main command
    const mainCommand = useMemo(() => {
        if (isScenario) return null;
        
        // For toggle/action, prefer infoId if available (for state/value)
        if ((widget.type === 'toggle' || widget.type === 'action') && widget.infoId) {
            const infoCmd = commands.find(c => c.id === widget.infoId);
            if (infoCmd) return infoCmd;
        }

        return commands.find(c => c.id === widget.commandId) || commands.find(c => c.id === widget.infoId);
    }, [commands, widget.commandId, widget.infoId, isScenario, widget.type]);

    // Find the secondary info command (for display)
    const secondaryCommand = useMemo(() => {
        if (isScenario) return null;
        return commands.find(c => c.id === widget.displayInfoId);
    }, [commands, widget.displayInfoId, isScenario]);

    // --- REAL-TIME UPDATES (WEBSOCKET) ---
    const mainValue = useJeedomCommand(mainCommand?.id, mainCommand?.value);
    const secondaryValue = useJeedomCommand(secondaryCommand?.id, secondaryCommand?.value);

    // Clear optimistic value when real value updates
    useEffect(() => {
        if (optimisticValue !== undefined && mainValue !== undefined) {
            // We could check if they match, but generally any update from WS means we can clear it
            setOptimisticValue(undefined);
        }
    }, [mainValue]);

    // Find the scenario object
    const scenario = useMemo(() => {
        if (!isScenario) return null;
        return scenarios.find(s => s.id === widget.scenarioId);
    }, [scenarios, widget.scenarioId, isScenario]);

    const isScenarioRunning = scenario?.state === 'run';

    // Determine Display Value
    const displayValue = useMemo(() => {
        if (isScenario) return scenario?.isActive ? 'Actif' : 'Inactif';
        if (!mainCommand) return 'N/A';
        
        // If it's a binary info, maybe show On/Off or custom text?
        // For now, just show the value + unit
        // Use optimistic value if available, else real-time value, else initial value
        const val = optimisticValue !== undefined ? optimisticValue : (mainValue !== undefined ? mainValue : (mainCommand.value !== undefined ? mainCommand.value : ''));
        const unit = mainCommand.unite || '';
        return `${val}${unit}`;
    }, [mainCommand, isScenario, scenario, mainValue, optimisticValue]);

    const secondaryDisplayValue = useMemo(() => {
        if (!secondaryCommand) return undefined;
        // Use real-time value if available
        const val = secondaryValue !== undefined ? secondaryValue : (secondaryCommand.value !== undefined ? secondaryCommand.value : '');
        const unit = secondaryCommand.unite || '';
        return `${val}${unit}`;
    }, [secondaryCommand, secondaryValue]);

    // Determine Icon
    const Icon = useMemo(() => {
        // Dynamic Icon Logic
        if (widget.type === 'toggle' || widget.type === 'action') {
             // Check if we have a dynamic icon mapping
             const activeIconName = widget.icon;
             const inactiveIconName = DYNAMIC_ICONS[activeIconName];
             
             if (inactiveIconName) {
                 // Determine state (is it active or inactive?)
                 // Usually based on mainCommand value (0 or 1)
                 // Use optimistic value if available, else real-time value
                 const val = optimisticValue !== undefined ? optimisticValue : (mainValue !== undefined ? mainValue : mainCommand?.value);
                 const isActive = val == 1 || val === '1' || val === 'on';
                 if (!isActive) {
                     return ICONS[inactiveIconName] || ICONS[activeIconName] || ICONS['help-circle'];
                 }
             }
        }
        return ICONS[widget.icon] || ICONS['help-circle'];
    }, [widget.icon, widget.type, mainCommand, mainValue, optimisticValue]);

    // --- STYLES ---
    const isColorized = !!widget.color;
    
    const bgClass = useMemo(() => {
        if (widget.color) return widget.color; // e.g., 'bg-blue-500'
        return 'bg-dark-card';
    }, [widget.color]);

    const shadowClass = useMemo(() => {
        if (isColorized) return 'shadow-lg shadow-black/20';
        return 'shadow-sm';
    }, [isColorized]);

    const borderColorClass = useMemo(() => {
        if (isColorized) return 'border-transparent';
        return widget.borderColor || 'border-border';
    }, [isColorized, widget.borderColor]);

    const actionTooltip = useMemo(() => {
        if (editMode) return 'Déplacer ou redimensionner';
        if (isScenario) return 'Lancer le scénario';
        if (widget.type === 'action') return 'Exécuter l\'action';
        return '';
    }, [editMode, isScenario, widget.type]);


    // --- HANDLERS ---

    const handleAction = async (e: React.MouseEvent) => {
        if (editMode || !isConnected) return;
        e.stopPropagation();

        if (widget.type === 'info') return;

        setLoading(true);
        // Step A: Save current value
        const previousValue = mainValue !== undefined ? mainValue : mainCommand?.value;

        try {
            if (widget.type === 'scenario') {
                if (widget.scenarioId) {
                    if (onScenarioClick) {
                        onScenarioClick(widget.scenarioId);
                    } else {
                        await executeScenario(settings, widget.scenarioId);
                    }
                }
            } else if (widget.type === 'action' || widget.type === 'toggle' || widget.type === 'slider') {
                // Step B: Optimistic Update (simulate toggle)
                if (widget.type === 'toggle' || widget.type === 'action') {
                    const isActive = previousValue == 1 || previousValue === '1' || previousValue === 'on';
                    setOptimisticValue(isActive ? 0 : 1);
                }

                // Sequence Mode
                if (widget.type === 'action' && widget.actionExecutionMode === 'sequence' && widget.sequenceSteps && widget.sequenceSteps.length > 0) {
                    // Deduce current step from actual Jeedom state (mainCommand.value)
                    // Assuming mainCommand.value corresponds to the step index (0, 1, 2...)
                    // If not numeric or out of bounds, default to 0
                    let currentStepIndex = 0;
                    if (mainCommand && mainCommand.value !== undefined) {
                        const val = parseInt(String(mainCommand.value), 10);
                        if (!isNaN(val) && val >= 0 && val < widget.sequenceSteps.length) {
                            currentStepIndex = val;
                        }
                    }
                    
                    // Calculate next step
                    const nextStepIndex = (currentStepIndex + 1) % widget.sequenceSteps.length;
                    const nextStepCommands = widget.sequenceSteps[nextStepIndex];
                    
                    // Execute all commands in the next step
                    const validCommands = nextStepCommands.filter(id => id && String(id).trim() !== '');
                    if (validCommands.length > 0) {
                        // Step C: Network Call
                        await Promise.all(validCommands.map(cmdId => 
                            executeJeedomCommand(settings, String(cmdId))
                        ));
                    }
                } 
                // Batch Mode
                else if (widget.type === 'action' && widget.actionExecutionMode === 'batch') {
                    const allCommands = [widget.commandId, ...(widget.additionalCommandIds || [])].filter(Boolean) as string[];
                    // Step C: Network Call
                    await Promise.all(allCommands.map(cmdId => 
                        executeJeedomCommand(settings, String(cmdId))
                    ));
                }
                // Default / Legacy Mode
                else {
                    // Simple Action for all types (including toggle)
                    // The user requested to simply execute the action for switches
                    if (widget.commandId) {
                        // Step C: Network Call
                        await executeJeedomCommand(settings, String(widget.commandId));
                    }
                }
                
                // Trigger animation
                setAnimateValue(true);
                setTimeout(() => setAnimateValue(false), 300);
                
                // Notify parent to refresh
                if (onActionSuccess) onActionSuccess();
            }
        } catch (error) {
            console.error("Error executing action:", error);
            // Step D: Rollback on error
            setOptimisticValue(previousValue);
            alert("Échec de la commande. Vérifiez votre connexion.");
        } finally {
            setLoading(false);
        }
    };

    const handleStopScenario = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!widget.scenarioId) return;
        
        setLoading(true);
        try {
            await stopScenario(settings, widget.scenarioId);
        } catch (error) {
            console.error("Error stopping scenario:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- CLASSES CSS DYNAMIQUES ---

    const sizeClasses = {
        small: 'col-span-1 row-span-1',
        medium: 'col-span-2 row-span-1', 
        large: 'col-span-2 row-span-2', 
        wide: 'col-span-3 row-span-1',
    };

    return (
        <div 
            ref={ref}
            className={`relative group h-full w-full ${!isGridLayout ? sizeClasses[widget.size] : ''} ${className || ''} ${!isConnected ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}
            style={style}
            {...props}
        >
            <div 
                onClick={handleAction}
                title={actionTooltip}
                className={`
                    h-full w-full rounded-xl flex flex-col overflow-hidden relative
                    transition-all duration-300 shadow-lg select-none animate-fade-in-up
                    ${editMode ? 'cursor-move ring-2 ring-dashed ring-gray-500 opacity-90' : 'cursor-pointer'}
                    ${!editMode && 'hover:shadow-xl hover:scale-[1.02] active:scale-95'}
                    ${bgClass} ${shadowClass}
                    ${isColorized ? 'ring-1 ring-white/20' : `border ${borderColorClass} hover:bg-dark-surface`}
                `}
            >
                {/* Visual Indicator for Favorite */}
                {widget.isFavorite && (
                    <div className="absolute top-1 left-1 opacity-50 z-20 pointer-events-none">
                         <Star size={10} fill="#fbbf24" className="text-amber-400" />
                    </div>
                )}

                {/* Stop Button for Running Scenarios */}
                {!editMode && isScenario && isScenarioRunning && (
                    <button 
                        onClick={handleStopScenario}
                        className="absolute top-1 right-1 p-1.5 text-white hover:text-white bg-blue-500/20 hover:bg-blue-500/40 rounded-full transition-all z-30 animate-in fade-in zoom-in duration-200"
                        title="Arrêter le scénario"
                    >
                        <Square size={10} fill="currentColor" />
                    </button>
                )}

                {/* Loading Overlay Effect */}
                {loading && (
                    <div className="absolute inset-0 bg-dark-bg/40 backdrop-blur-[1px] z-30 flex items-center justify-center rounded-xl">
                        <Loader2 size={24} className="animate-spin text-white" />
                    </div>
                )}

                {/* --- LAYOUT SPÉCIFIQUE INFO --- */}
                {isCamera ? (
                    <CameraWidget widget={widget} settings={settings} isColorized={isColorized} />
                ) : isThermostat ? (
                    <ThermostatWidget widget={widget} settings={settings} isColorized={isColorized} />
                ) : isWeather ? (
                    <WeatherWidget widget={widget} isColorized={isColorized} />
                ) : isInfoType ? (
                    <>
                        {/* BACKGROUND ICON (Watermark style) - En gros sur tout le widget */}
                        <div className={`
                            absolute inset-0 flex items-center justify-center overflow-hidden z-0 pointer-events-none
                            ${isColorized ? 'text-white' : 'text-jeedom-500'}
                        `}>
                            {Icon && <Icon 
                                size={widget.size === 'small' ? 80 : widget.size === 'medium' ? 120 : 160} 
                                strokeWidth={1}
                                className={`opacity-20 transform -rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-0`}
                            />}
                        </div>

                        {/* CONTENT OVERLAY */}
                        <div className="relative z-10 flex flex-col h-full w-full p-2">
                             {/* Value Centered */}
                             <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <span className={`
                                    font-bold font-mono tracking-tight leading-none drop-shadow-md transition-transform duration-300
                                    ${animateValue ? 'scale-110' : ''}
                                    ${widget.size === 'small' ? 'text-2xl' : 'text-4xl'}
                                    ${isColorized ? 'text-white' : 'text-content-primary'}
                                `}>
                                    {displayValue}
                                </span>
                             </div>
                             
                             {/* Name at bottom, Centered */}
                             <h3 className={`text-center text-xs font-medium truncate opacity-90 ${isColorized ? 'text-white' : 'text-content-secondary'}`}>
                                {widget.name}
                             </h3>
                        </div>
                    </>
                ) : isChart ? (
                    /* --- LAYOUT CHART --- */
                    <div className="flex flex-col h-full w-full relative z-10 p-2">
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                {widget.chartType === 'bar' ? (
                                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                        <XAxis 
                                            dataKey="time" 
                                            tickFormatter={(time) => {
                                                const date = new Date(time);
                                                return widget.chartAggregation && widget.chartAggregation !== 'none' 
                                                    ? date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
                                                    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            }}
                                            stroke={isColorized ? 'rgba(255,255,255,0.5)' : '#94a3b8'}
                                            tick={{ fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={false}
                                            minTickGap={30}
                                        />
                                        <YAxis 
                                            stroke={isColorized ? 'rgba(255,255,255,0.5)' : '#94a3b8'}
                                            tick={{ fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }}
                                            itemStyle={{ color: '#38bdf8' }}
                                            labelFormatter={(label) => new Date(label).toLocaleString()}
                                        />
                                        <Bar 
                                            dataKey="value" 
                                            fill={isColorized ? '#ffffff' : '#0ea5e9'} 
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                ) : (
                                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                        <XAxis 
                                            dataKey="time" 
                                            tickFormatter={(time) => {
                                                const date = new Date(time);
                                                return widget.chartAggregation && widget.chartAggregation !== 'none' 
                                                    ? date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
                                                    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            }}
                                            stroke={isColorized ? 'rgba(255,255,255,0.5)' : '#94a3b8'}
                                            tick={{ fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={false}
                                            minTickGap={30}
                                        />
                                        <YAxis 
                                            stroke={isColorized ? 'rgba(255,255,255,0.5)' : '#94a3b8'}
                                            tick={{ fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={false}
                                            domain={['auto', 'auto']}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }}
                                            itemStyle={{ color: '#38bdf8' }}
                                            labelFormatter={(label) => new Date(label).toLocaleString()}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke={isColorized ? '#ffffff' : '#0ea5e9'} 
                                            strokeWidth={2} 
                                            dot={widget.chartAggregation && widget.chartAggregation !== 'none'} 
                                            activeDot={{ r: 4 }}
                                        />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                        <h3 className={`text-center text-xs font-medium truncate mt-1 ${isColorized ? 'text-white' : 'text-content-secondary'}`}>
                            {widget.name}
                        </h3>
                    </div>
                ) : (
                    /* --- LAYOUT STANDARD (Action / Toggle) --- */
                    /* Nouvelle structure : Nom en bas centré, Icône + Valeur centrés au milieu */
                    <div className="flex flex-col h-full w-full relative z-10 p-2 items-center">
                        
                        {/* Center Content (Icon + State Value) */}
                        <div className="flex-1 flex flex-col items-center justify-center gap-1 w-full">
                            {/* Icône principale */}
                            <div className={`
                                rounded-xl transition-all duration-300 flex items-center justify-center
                                ${isColorized ? 'scale-110' : 'text-jeedom-500'}
                                ${loading ? 'animate-pulse' : ''}
                            `}>
                                {Icon && <Icon 
                                    size={widget.size === 'large' || widget.size === 'medium' ? 40 : 32} 
                                    className={`transition-colors duration-300 ${isColorized ? 'text-white' : 'text-jeedom-500 group-hover:text-jeedom-400'}`} 
                                    strokeWidth={1.5}
                                />}
                            </div>
                            
                            {/* Valeur d'état Centrée (si présente) */}
                            {/* On masque la valeur principale pour les widgets 'action' sans retour d'état explicite (infoId) */}
                            {((widget.type !== 'action' || !!widget.infoId) && displayValue || secondaryDisplayValue) && (
                                <span 
                                    className={`
                                        font-bold font-mono text-center truncate w-full px-1 transition-colors duration-300
                                        ${animateValue ? 'scale-105' : ''}
                                        ${isColorized ? 'text-white' : 'text-content-primary'}
                                        ${widget.size === 'small' ? 'text-sm' : 'text-lg'}
                                    `}
                                >
                                    {secondaryDisplayValue || displayValue}
                                </span>
                            )}
                        </div>

                        {/* Footer (Name Centered) */}
                        <div className="w-full mt-auto pt-1">
                            <h3 className={`text-center text-xs font-medium truncate transition-colors duration-300 leading-tight ${isColorized ? 'text-white font-semibold' : 'text-content-secondary group-hover:text-content-primary'}`}>
                                {widget.name}
                            </h3>
                        </div>
                    </div>
                )}
                
                {/* Effet de fond subtil (Glow) pour tous */}
                <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 rounded-full blur-xl opacity-10 pointer-events-none transition-colors duration-300 ${isColorized ? 'bg-white' : 'bg-jeedom-500'}`}></div>
            </div>

            {/* Mode Édition */}
            {editMode && (
                <div className="absolute top-2 right-2 flex gap-1 z-[101] animate-in zoom-in duration-200">
                     <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(widget); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="bg-blue-600 p-1.5 rounded-full text-white shadow-lg hover:bg-blue-500 hover:scale-110 transition-all no-drag"
                        title="Modifier"
                    >
                        <Edit3 size={12} className="pointer-events-none" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(widget.id); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="bg-red-600 p-1.5 rounded-full text-white shadow-lg hover:bg-red-500 hover:scale-110 transition-all no-drag"
                        title="Supprimer le widget"
                    >
                        <Trash2 size={12} className="pointer-events-none" />
                    </button>
                </div>
            )}
        </div>
    );
});

WidgetCard.displayName = 'WidgetCard';

export default WidgetCard;
