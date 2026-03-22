import React, { useState, useEffect, useMemo } from 'react';
import { WidgetConfig, JeedomCommand, JeedomScenario } from '../types';
import { ICONS, DYNAMIC_ICONS } from '../constants';
import { executeJeedomCommand, executeScenario, stopScenario, getJeedomHistory } from '../services/jeedomService';
import { cacheService } from '../services/cacheService';
import { useJeedomCommand } from '../hooks/useJeedomCommand';
import { Loader2, Trash2, Edit3, Star, Square } from 'lucide-react';
import CameraWidget from './CameraWidget';
import ThermostatWidget from './ThermostatWidget';
import WeatherWidget from './WeatherWidget';
import ChartWidget from './widgets/ChartWidget';
import InfoWidget from './widgets/InfoWidget';
import ActionWidget from './widgets/ActionWidget';
import SliderWidget from './widgets/SliderWidget';

// --- HELPER ---
const aggregateChartData = (data: { time: number; value: number }[], method: string = 'none') => {
    if (!data || data.length === 0) return [];
    if (method === 'none') return data;

    const grouped: { [key: string]: number[] } = {};
    data.forEach(item => {
        const date = new Date(item.time).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item.value);
    });

    return Object.keys(grouped).sort().map(date => {
        const values = grouped[date];
        let aggregatedValue = 0;
        if (method === 'daily_avg') aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
        else if (method === 'daily_max') aggregatedValue = Math.max(...values);
        else if (method === 'daily_sum') aggregatedValue = values.reduce((a, b) => a + b, 0);
        return { time: new Date(date + 'T12:00:00').getTime(), value: parseFloat(aggregatedValue.toFixed(2)) };
    });
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

const WidgetCard = React.forwardRef<HTMLDivElement, WidgetCardProps>(({
    widget, commands, scenarios = [], settings, editMode,
    isConnected = true, onEdit, onDelete, onScenarioClick, onActionSuccess,
    className, style, ...props
}, ref) => {
    const [loading, setLoading] = useState(false);
    const [animateValue, setAnimateValue] = useState(false);
    const [chartData, setChartData] = useState<{ time: number; value: number }[]>([]);
    const [chartError, setChartError] = useState<string | null>(null);
    const [optimisticValue, setOptimisticValue] = useState<string | number | undefined>(undefined);
    const [chartPeriod, setChartPeriod] = useState<string>(widget.historyPeriod || '24h');
    const [customStart, setCustomStart] = useState(widget.chartCustomStart || '');
    const [customEnd, setCustomEnd] = useState(widget.chartCustomEnd || '');

    const isGridLayout = className?.includes('react-grid-item');
    const isScenario = widget.type === 'scenario';
    const isChart = widget.type === 'chart';
    const isCamera = widget.type === 'camera';
    const isThermostat = widget.type === 'thermostat';
    const isWeather = widget.type === 'weather';
    const isSlider = widget.type === 'slider';
    const isInfoType = widget.type === 'info';

    // Fetch chart history
    useEffect(() => {
        if (!isChart || !widget.commandId) return;
        if (chartPeriod === 'custom' && (!customStart || !customEnd)) return;

        const fetchHistory = async () => {
            const formatDate = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');
            let start: Date, end: Date;
            if (chartPeriod === 'custom') {
                start = new Date(customStart + 'T00:00:00');
                end   = new Date(customEnd   + 'T23:59:59');
            } else {
                end   = new Date();
                start = new Date();
                if (chartPeriod === '7d')  start.setDate(end.getDate() - 7);
                else if (chartPeriod === '30d') start.setDate(end.getDate() - 30);
                else start.setDate(end.getDate() - 1);
            }
            const cacheKey = `chart_${widget.commandId}_${chartPeriod}_${customStart}_${customEnd}_${widget.chartAggregation || 'none'}`;

            // TTL adaptatif : les données historiques longues changent rarement
            const cacheTTL: Record<string, number> = {
                '24h':   15 * 60 * 1000,      // 15 min
                '7d':     2 * 60 * 60 * 1000,  // 2 h
                '30d':    6 * 60 * 60 * 1000,  // 6 h
                'custom': 30 * 60 * 1000,       // 30 min
            };
            const cachedData = cacheService.get<{ time: number; value: number }[]>(cacheKey, cacheTTL[chartPeriod] ?? 15 * 60 * 1000);
            if (cachedData) { setChartData(cachedData); return; }

            try {
                const data = await getJeedomHistory(settings, widget.commandId!, formatDate(start), formatDate(end));
                const rawData = data.map((item: any) => ({
                    time: new Date(item.datetime).getTime(),
                    value: parseFloat(item.value),
                })).filter((p: { time: number; value: number }) => !isNaN(p.value));
                const aggregated = aggregateChartData(rawData, widget.chartAggregation || 'none');
                if (aggregated.length > 0) {
                    cacheService.set(cacheKey, aggregated); // Ne cache pas les résultats vides
                    setChartError(null);
                } else {
                    setChartError('Aucune donnée historique. Vérifiez que la commande est historisée dans Jeedom.');
                }
                setChartData(aggregated);
            } catch (e: any) {
                console.error('Failed to load chart data', e);
                setChartError(e?.message?.includes('CORS') || e?.message?.includes('fetch')
                    ? 'Erreur réseau — activez le Mode Proxy dans les paramètres.'
                    : 'Erreur lors du chargement des données.');
            }
        };

        fetchHistory();
    }, [isChart, widget.commandId, chartPeriod, customStart, customEnd, widget.chartAggregation, settings]);

    // Find commands
    const mainCommand = useMemo(() => {
        if (isScenario) return null;
        if ((widget.type === 'toggle' || widget.type === 'action') && widget.infoId) {
            const infoCmd = commands.find(c => c.id === widget.infoId);
            if (infoCmd) return infoCmd;
        }
        return commands.find(c => c.id === widget.commandId) || commands.find(c => c.id === widget.infoId);
    }, [commands, widget.commandId, widget.infoId, isScenario, widget.type]);

    const secondaryCommand = useMemo(() =>
        isScenario ? null : commands.find(c => c.id === widget.displayInfoId),
        [commands, widget.displayInfoId, isScenario]
    );

    // Real-time values via WebSocket
    const mainValue = useJeedomCommand(mainCommand?.id, mainCommand?.value);
    const secondaryValue = useJeedomCommand(secondaryCommand?.id, secondaryCommand?.value);

    // Clear optimistic value on WS update
    useEffect(() => {
        if (optimisticValue !== undefined && mainValue !== undefined) {
            setOptimisticValue(undefined);
        }
    }, [mainValue]);

    const scenario = useMemo(() =>
        isScenario ? scenarios.find(s => s.id === widget.scenarioId) ?? null : null,
        [scenarios, widget.scenarioId, isScenario]
    );

    const isScenarioRunning = scenario?.state === 'run';

    // Display values
    const displayValue = useMemo(() => {
        if (isScenario) return scenario?.isActive ? 'Actif' : 'Inactif';
        if (!mainCommand) return 'N/A';
        const val = optimisticValue !== undefined ? optimisticValue
            : (mainValue !== undefined ? mainValue : (mainCommand.value ?? ''));
        return `${val}${mainCommand.unite || ''}`;
    }, [mainCommand, isScenario, scenario, mainValue, optimisticValue]);

    const secondaryDisplayValue = useMemo(() => {
        if (!secondaryCommand) return undefined;
        const val = secondaryValue !== undefined ? secondaryValue : (secondaryCommand.value ?? '');
        return `${val}${secondaryCommand.unite || ''}`;
    }, [secondaryCommand, secondaryValue]);

    // Icon
    const Icon = useMemo(() => {
        if (widget.type === 'toggle' || widget.type === 'action') {
            const inactiveIconName = DYNAMIC_ICONS[widget.icon];
            if (inactiveIconName) {
                const val = optimisticValue !== undefined ? optimisticValue
                    : (mainValue !== undefined ? mainValue : mainCommand?.value);
                const isActive = val === 1 || val === '1' || val === 'on';
                if (!isActive) return ICONS[inactiveIconName] || ICONS[widget.icon] || ICONS['help-circle'];
            }
        }
        return ICONS[widget.icon] || ICONS['help-circle'];
    }, [widget.icon, widget.type, mainCommand, mainValue, optimisticValue]);

    // Styles
    const isColorized = !!widget.color;
    const bgClass = widget.color || 'bg-dark-card';
    const shadowClass = isColorized ? 'shadow-lg shadow-black/20' : 'shadow-sm';
    const borderColorClass = isColorized ? 'border-transparent' : (widget.borderColor || 'border-border');

    const actionTooltip = useMemo(() => {
        if (editMode) return 'Déplacer ou redimensionner';
        if (isScenario) return 'Lancer le scénario';
        if (widget.type === 'action') return "Exécuter l'action";
        return '';
    }, [editMode, isScenario, widget.type]);

    const sizeClasses: Record<string, string> = {
        small: 'col-span-1 row-span-1',
        medium: 'col-span-2 row-span-1',
        large: 'col-span-2 row-span-2',
        wide: 'col-span-3 row-span-1',
    };

    // --- HANDLERS ---
    const handleAction = async (e: React.MouseEvent) => {
        if (editMode || !isConnected) return;
        e.stopPropagation();
        if (widget.type === 'info') return;

        setLoading(true);
        const previousValue = mainValue !== undefined ? mainValue : mainCommand?.value;

        try {
            if (widget.type === 'scenario') {
                if (widget.scenarioId) {
                    if (onScenarioClick) onScenarioClick(widget.scenarioId);
                    else await executeScenario(settings, widget.scenarioId, widget.scenarioTags);
                }
            } else if (widget.type === 'action' || widget.type === 'toggle' || widget.type === 'slider') {
                if (widget.type === 'toggle' || widget.type === 'action') {
                    const isActive = previousValue === 1 || previousValue === '1' || previousValue === 'on';
                    setOptimisticValue(isActive ? 0 : 1);
                }

                if (widget.type === 'action' && widget.actionExecutionMode === 'sequence' && widget.sequenceSteps?.length) {
                    let currentStepIndex = 0;
                    if (mainCommand?.value !== undefined) {
                        const val = parseInt(String(mainCommand.value), 10);
                        if (!isNaN(val) && val >= 0 && val < widget.sequenceSteps.length) currentStepIndex = val;
                    }
                    const nextStepIndex = (currentStepIndex + 1) % widget.sequenceSteps.length;
                    const validCommands = widget.sequenceSteps[nextStepIndex].filter(id => id && String(id).trim() !== '');
                    if (validCommands.length > 0) {
                        await Promise.all(validCommands.map(cmdId => executeJeedomCommand(settings, String(cmdId))));
                    }
                } else if (widget.type === 'action' && widget.actionExecutionMode === 'batch') {
                    const allCommands = [widget.commandId, ...(widget.additionalCommandIds || [])].filter(Boolean) as string[];
                    await Promise.all(allCommands.map(cmdId => executeJeedomCommand(settings, String(cmdId))));
                } else {
                    if (widget.commandId) await executeJeedomCommand(settings, String(widget.commandId));
                }

                setAnimateValue(true);
                setTimeout(() => setAnimateValue(false), 300);
                if (onActionSuccess) onActionSuccess();
            }
        } catch (error) {
            console.error('Error executing action:', error);
            setOptimisticValue(previousValue);
            alert('Échec de la commande. Vérifiez votre connexion.');
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
            console.error('Error stopping scenario:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER ---
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
                {/* Favorite indicator */}
                {widget.isFavorite && (
                    <div className="absolute top-1 left-1 opacity-50 z-20 pointer-events-none">
                        <Star size={10} fill="#fbbf24" className="text-amber-400" />
                    </div>
                )}

                {/* Stop button for running scenarios */}
                {!editMode && isScenario && isScenarioRunning && (
                    <button
                        onClick={handleStopScenario}
                        className="absolute top-1 right-1 p-1.5 text-white hover:text-white bg-blue-500/20 hover:bg-blue-500/40 rounded-full transition-all z-30 animate-in fade-in zoom-in duration-200"
                        title="Arrêter le scénario"
                    >
                        <Square size={10} fill="currentColor" />
                    </button>
                )}

                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-dark-bg/40 backdrop-blur-[1px] z-30 flex items-center justify-center rounded-xl">
                        <Loader2 size={24} className="animate-spin text-white" />
                    </div>
                )}

                {/* Widget content — routed by type */}
                {isCamera ? (
                    <CameraWidget widget={widget} settings={settings} isColorized={isColorized} />
                ) : isSlider ? (
                    <SliderWidget widget={widget} settings={settings} isColorized={isColorized} commands={commands} />
                ) : isThermostat ? (
                    <ThermostatWidget widget={widget} settings={settings} isColorized={isColorized} commands={commands} />
                ) : isWeather ? (
                    <WeatherWidget widget={widget} isColorized={isColorized} />
                ) : isInfoType ? (
                    <InfoWidget
                        widget={widget}
                        Icon={Icon}
                        displayValue={displayValue}
                        isColorized={isColorized}
                        animateValue={animateValue}
                    />
                ) : isChart ? (
                    chartError ? (
                        <div className="flex items-center justify-center h-full p-3 text-center">
                            <p className="text-xs text-orange-400 leading-snug">{chartError}</p>
                        </div>
                    ) : (
                        <ChartWidget
                            widget={widget}
                            chartData={chartData}
                            isColorized={isColorized}
                            period={chartPeriod}
                            onPeriodChange={setChartPeriod}
                            customStart={customStart}
                            customEnd={customEnd}
                            onCustomChange={(s, e) => { setCustomStart(s); setCustomEnd(e); }}
                        />
                    )
                ) : (
                    <ActionWidget
                        widget={widget}
                        Icon={Icon}
                        displayValue={displayValue}
                        secondaryDisplayValue={secondaryDisplayValue}
                        isColorized={isColorized}
                        animateValue={animateValue}
                        loading={loading}
                    />
                )}

                {/* Glow effect */}
                <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 rounded-full blur-xl opacity-10 pointer-events-none transition-colors duration-300 ${isColorized ? 'bg-white' : 'bg-jeedom-500'}`} />
            </div>

            {/* Edit mode controls */}
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

const areWidgetCardPropsEqual = (prev: WidgetCardProps & React.RefAttributes<HTMLDivElement>, next: WidgetCardProps & React.RefAttributes<HTMLDivElement>): boolean => {
    if (prev.widget !== next.widget) return false;
    if (prev.editMode !== next.editMode) return false;
    if (prev.settings !== next.settings) return false;
    if (prev.isConnected !== next.isConnected) return false;
    if (prev.scenarios !== next.scenarios) return false;

    const ids = [
        prev.widget.commandId,
        prev.widget.infoId,
        prev.widget.displayInfoId,
        prev.widget.currentTempCmdId,
        prev.widget.setpointCmdId,
        prev.widget.stateCmdId,
        prev.widget.sliderInfoId,
        prev.widget.modeInfoCmdId,
    ].filter((id): id is string => !!id);

    for (const id of ids) {
        const prevCmd = prev.commands.find(c => String(c.id) === id);
        const nextCmd = next.commands.find(c => String(c.id) === id);
        if (String(prevCmd?.value) !== String(nextCmd?.value)) return false;
    }

    return true;
};

export default React.memo(WidgetCard, areWidgetCardPropsEqual);
