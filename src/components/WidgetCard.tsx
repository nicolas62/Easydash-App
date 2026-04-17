import React, { useState, useEffect, useMemo } from 'react';
import { WidgetConfig, JeedomCommand, JeedomScenario } from '../types';
import { ICONS, DYNAMIC_ICONS } from '../constants';
import { executeJeedomCommand, executeScenario, stopScenario } from '../services/jeedomService';
import { useJeedomCommand } from '../hooks/useJeedomCommand';
import { Loader2, Trash2, Edit3, Star, Square } from 'lucide-react';
import { useChartData } from '../hooks/useChartData';
import CameraWidget from './CameraWidget';
import ThermostatWidget from './ThermostatWidget';
import WeatherWidget from './WeatherWidget';
import ChartWidget from './widgets/ChartWidget';
import InfoWidget from './widgets/InfoWidget';
import ActionWidget from './widgets/ActionWidget';
import SliderWidget from './widgets/SliderWidget';
import AlarmWidget from './widgets/AlarmWidget';
import ShutterWidget from './widgets/ShutterWidget';


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
    const [alarmArmed, setAlarmArmed] = useState(false);
    const [optimisticValue, setOptimisticValue] = useState<string | number | undefined>(undefined);

    const isGridLayout = className?.includes('react-grid-item');
    const isScenario = widget.type === 'scenario';
    const isChart = widget.type === 'chart';

    const { chartData, chartError, chartPeriod, setChartPeriod, customStart, customEnd, setCustomStart, setCustomEnd } = useChartData(widget, settings, isChart);
    const isCamera = widget.type === 'camera';
    const isThermostat = widget.type === 'thermostat';
    const isWeather = widget.type === 'weather';
    const isSlider = widget.type === 'slider';
    const isInfoType = widget.type === 'info';
    const isAlarm = widget.type === 'alarm';
    const isShutter = widget.type === 'shutter';

    // Fetch chart history
    // O(1) lookup map — replaces multiple O(n) .find() calls
    const commandsMap = useMemo(() => new Map(commands.map(c => [String(c.id), c])), [commands]);

    // Find commands
    const mainCommand = useMemo(() => {
        if (isScenario) return null;
        if ((widget.type === 'toggle' || widget.type === 'action') && widget.infoId) {
            const infoCmd = commandsMap.get(String(widget.infoId));
            if (infoCmd) return infoCmd;
        }
        return commandsMap.get(String(widget.commandId)) || commandsMap.get(String(widget.infoId));
    }, [commandsMap, widget.commandId, widget.infoId, isScenario, widget.type]);

    const secondaryCommand = useMemo(() =>
        isScenario || !widget.displayInfoId ? null : (commandsMap.get(String(widget.displayInfoId)) ?? null),
        [commandsMap, widget.displayInfoId, isScenario]
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

    // Styles — alarm overrides color when armed
    const isColorized = isAlarm ? alarmArmed : !!widget.color;
    const bgClass = isAlarm
        ? (alarmArmed ? 'bg-red-600' : (widget.color || 'bg-dark-card'))
        : (widget.color || 'bg-dark-card');
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
        if (widget.type === 'info' || widget.type === 'alarm') return;

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
                {isShutter ? (
                    <ShutterWidget widget={widget} settings={settings} commands={commands} isColorized={isColorized} />
                ) : isAlarm ? (
                    <AlarmWidget
                        widget={widget}
                        settings={settings}
                        isColorized={isColorized}
                        commands={commands}
                        onArmedChange={setAlarmArmed}
                    />
                ) : isCamera ? (
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
        prev.widget.alarmStateId,
    ].filter((id): id is string => !!id);

    // Build Maps for O(1) lookup instead of O(n) Array.find() per ID.
    // With 200 commands and 8 IDs per widget, this goes from ~1600 ops to ~208.
    const prevIndex = new Map(prev.commands.map(c => [String(c.id), String(c.value)]));
    const nextIndex = new Map(next.commands.map(c => [String(c.id), String(c.value)]));

    for (const id of ids) {
        if (prevIndex.get(id) !== nextIndex.get(id)) return false;
    }

    return true;
};

export default React.memo(WidgetCard, areWidgetCardPropsEqual);
