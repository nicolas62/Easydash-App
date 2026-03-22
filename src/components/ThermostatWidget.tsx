import React, { useMemo } from 'react';
import { WidgetConfig, AppSettings, JeedomCommand } from '../types';
import { useJeedomCommand } from '../hooks/useJeedomCommand';
import { executeJeedomCommand } from '../services/jeedomService';
import { Plus, Minus, Thermometer, Flame, Snowflake, Moon, Leaf } from 'lucide-react';

interface ThermostatWidgetProps {
    widget: WidgetConfig;
    settings: AppSettings;
    isColorized: boolean;
    commands?: JeedomCommand[];
}

const ThermostatWidget: React.FC<ThermostatWidgetProps> = ({ widget, settings, isColorized, commands = [] }) => {
    // --- INITIAL VALUES from loaded commands ---
    const findInitialValue = (cmdId?: string): string | number | undefined => {
        if (!cmdId) return undefined;
        const cmd = commands.find(c => String(c.id) === String(cmdId));
        return cmd?.value as string | number | undefined;
    };

    // --- REAL-TIME DATA ---
    const currentTemp = useJeedomCommand(widget.currentTempCmdId, findInitialValue(widget.currentTempCmdId));
    const setpoint = useJeedomCommand(widget.setpointCmdId, findInitialValue(widget.setpointCmdId));
    const state = useJeedomCommand(widget.stateCmdId, findInitialValue(widget.stateCmdId));

    // --- LOGIC ---
    const isHeating = useMemo(() => {
        if (!state) return false;
        const s = String(state).toLowerCase();
        return s === 'heating' || s === 'chauffe' || s === 'on' || s === '1' || s.includes('chaud');
    }, [state]);

    const isCooling = useMemo(() => {
        if (!state) return false;
        const s = String(state).toLowerCase();
        return s === 'cooling' || s === 'clim' || s.includes('froid');
    }, [state]);

    const isActive = isHeating || isCooling;

    // --- MODE ---
    const modeInfo = useJeedomCommand(widget.modeInfoCmdId, findInitialValue(widget.modeInfoCmdId));
    const modeStr  = modeInfo !== undefined ? String(modeInfo).toLowerCase() : '';
    const isAway   = modeStr.includes('absent') || modeStr.includes('away') || modeStr === 'absent';
    const isEco    = modeStr.includes('eco');

    // --- HANDLERS ---
    const handleSetpointChange = async (direction: 'up' | 'down') => {
        const cmdId = direction === 'up' ? widget.actionUpCmdId : widget.actionDownCmdId;
        if (cmdId) await executeJeedomCommand(settings, cmdId);
    };

    const handleMode = async (mode: 'away' | 'eco') => {
        const cmdId = mode === 'away' ? widget.awayModeCmdId : widget.ecoModeCmdId;
        if (cmdId) await executeJeedomCommand(settings, cmdId);
    };

    // --- STYLES ---
    const getBgColor = () => {
        if (isHeating) return 'bg-gradient-to-br from-orange-500 to-red-600';
        if (isCooling) return 'bg-gradient-to-br from-blue-400 to-cyan-600';
        if (isColorized) return widget.color; // Fallback to user color
        return 'bg-dark-card'; // Default neutral
    };

    const getTextColor = () => {
        if (isActive || isColorized) return 'text-white';
        return 'text-content-primary';
    };

    const getSecondaryTextColor = () => {
        if (isActive || isColorized) return 'text-white/70';
        return 'text-content-secondary';
    };

    return (
        <div className={`relative w-full h-full flex flex-col items-center justify-between p-3 overflow-hidden rounded-xl transition-colors duration-500 ${getBgColor()}`}>
            
            {/* Header: Name & Icon */}
            <div className="w-full flex justify-between items-start z-10">
                <span className={`text-xs font-medium truncate max-w-[70%] ${getSecondaryTextColor()}`}>
                    {widget.name}
                </span>
                <div className={`p-1.5 rounded-full bg-content-inverted/10 backdrop-blur-sm ${isActive ? 'animate-pulse' : ''}`}>
                    {isHeating ? <Flame size={14} className="text-white" /> : 
                     isCooling ? <Snowflake size={14} className="text-white" /> : 
                     <Thermometer size={14} className={getSecondaryTextColor()} />}
                </div>
            </div>

            {/* Main Content: Circular Dial Look */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
                
                {/* Current Temp (Large) */}
                <div className="flex items-baseline justify-center">
                    <span className={`text-4xl font-bold tracking-tighter ${getTextColor()}`}>
                        {currentTemp !== undefined ? currentTemp : '--'}
                    </span>
                    <span className={`text-lg font-medium ml-1 -translate-y-2 ${getSecondaryTextColor()}`}>°</span>
                </div>

                {/* Setpoint & Controls */}
                <div className="flex items-center gap-4 mt-2 bg-content-primary/10 backdrop-blur-md rounded-full p-1 pr-3 pl-3 border border-content-inverted/5 shadow-inner">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleSetpointChange('down'); }}
                        className={`p-1.5 rounded-full hover:bg-content-primary/10 active:scale-90 transition-all ${getTextColor()}`}
                        disabled={!widget.actionDownCmdId}
                    >
                        <Minus size={14} strokeWidth={3} />
                    </button>
                    
                    <div className="flex flex-col items-center min-w-[40px]">
                        <span className={`text-xs font-semibold uppercase tracking-wider opacity-60 ${getTextColor()}`}>Cible</span>
                        <span className={`text-sm font-bold ${getTextColor()}`}>
                            {setpoint !== undefined ? setpoint : '--'}°
                        </span>
                    </div>

                    <button 
                        onClick={(e) => { e.stopPropagation(); handleSetpointChange('up'); }}
                        className={`p-1.5 rounded-full hover:bg-content-primary/10 active:scale-90 transition-all ${getTextColor()}`}
                        disabled={!widget.actionUpCmdId}
                    >
                        <Plus size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Mode buttons: Absent / Éco */}
            {(widget.awayModeCmdId || widget.ecoModeCmdId) && (
                <div className="flex gap-2 w-full z-10">
                    {widget.awayModeCmdId && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleMode('away'); }}
                            className={`flex-1 flex items-center justify-center gap-1 text-[10px] py-1 rounded-full border transition-all
                                ${isAway ? 'bg-blue-500/80 border-blue-400 text-white' : 'border-white/20 text-white/60 hover:text-white hover:border-white/40'}`}
                        >
                            <Moon size={10} /> Absent
                        </button>
                    )}
                    {widget.ecoModeCmdId && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleMode('eco'); }}
                            className={`flex-1 flex items-center justify-center gap-1 text-[10px] py-1 rounded-full border transition-all
                                ${isEco ? 'bg-green-500/80 border-green-400 text-white' : 'border-white/20 text-white/60 hover:text-white hover:border-white/40'}`}
                        >
                            <Leaf size={10} /> Éco
                        </button>
                    )}
                </div>
            )}

            {/* Background Glow Effect */}
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-0"></div>
            )}
        </div>
    );
};

export default ThermostatWidget;
