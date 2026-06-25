import React, { useState, useCallback, useRef } from 'react';
import { WidgetConfig, AppSettings, JeedomCommand } from '../../types';
import { useJeedomCommand } from '../../hooks/useJeedomCommand';
import { executeJeedomCommand } from '../../services/jeedomService';
import { ICONS } from '../../constants';
import { ChevronUp, ChevronDown, Square, Loader2 } from 'lucide-react';

interface ShutterWidgetProps {
    widget: WidgetConfig;
    settings: AppSettings;
    commands: JeedomCommand[];
    isColorized: boolean;
}

const ShutterWidget: React.FC<ShutterWidgetProps> = ({ widget, settings, commands, isColorized }) => {
    const [loading, setLoading] = useState<'open' | 'stop' | 'close' | 'position' | null>(null);
    const [localPosition, setLocalPosition] = useState<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const sendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const positionCmd = commands.find(c => String(c.id) === String(widget.shutterPositionInfoId ?? ''));
    const initialPosition = positionCmd?.value !== undefined ? Number(positionCmd.value) : 50;
    const { value: wsPosition } = useJeedomCommand(widget.shutterPositionInfoId, initialPosition);
    const remotePosition = wsPosition !== undefined ? Number(wsPosition) : initialPosition;
    const displayPosition = localPosition !== null ? localPosition : remotePosition;

    const hasPosition = !!(widget.shutterPositionInfoId || widget.shutterPositionCmdId);
    const percent = Math.max(0, Math.min(100, displayPosition));

    const Icon = ICONS[widget.icon] || ICONS['blinds'] || ICONS['help-circle'];

    const textColor = isColorized ? 'text-white' : 'text-content-primary';
    const subTextColor = isColorized ? 'text-white/70' : 'text-content-secondary';
    const btnBase = `flex items-center justify-center rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed`;
    const btnColorized = isColorized
        ? 'bg-white/20 hover:bg-white/30 text-white'
        : 'bg-dark-bg/60 hover:bg-dark-bg text-content-primary border border-border';

    const execute = useCallback(async (cmdId: string | undefined, key: 'open' | 'stop' | 'close', value?: number) => {
        if (!cmdId) return;
        setLoading(key);
        try {
            await executeJeedomCommand(settings, cmdId, value !== undefined ? { value } : undefined);
        } catch (err) {
            console.error('ShutterWidget action error:', err);
        } finally {
            setLoading(null);
        }
    }, [settings]);

    const handlePositionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            setLocalPosition(val);
            rafRef.current = null;
        });
    }, []);

    const commitPosition = useCallback(async (val: number) => {
        if (!widget.shutterPositionCmdId) return;
        if (sendTimer.current) clearTimeout(sendTimer.current);
        setLoading('position');
        try {
            await executeJeedomCommand(settings, widget.shutterPositionCmdId, { value: val });
        } finally {
            setLoading(null);
            setLocalPosition(null);
        }
    }, [settings, widget.shutterPositionCmdId]);

    const handlePositionRelease = useCallback(() => {
        if (localPosition !== null) commitPosition(localPosition);
    }, [localPosition, commitPosition]);

    const trackColor = isColorized ? 'bg-white/20' : 'bg-border';
    const fillColor = isColorized ? 'bg-white' : 'bg-jeedom-500';

    return (
        <div
            className="flex flex-col h-full w-full p-3 gap-2 z-10"
            onClick={e => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center gap-2 min-w-0">
                {Icon && (
                    <Icon size={14} strokeWidth={1.5} className={isColorized ? 'text-white/80' : 'text-jeedom-500'} />
                )}
                <span className={`text-xs font-medium truncate ${subTextColor}`}>{widget.name}</span>
                {hasPosition && (
                    <span className={`ml-auto text-xs font-mono flex-shrink-0 ${loading === 'position' ? 'opacity-50 animate-pulse' : ''} ${textColor}`}>
                        {Math.round(percent)}%
                    </span>
                )}
            </div>

            {/* Control buttons */}
            <div className="flex-1 flex flex-col justify-center gap-2">
                <div className={`grid gap-2 ${widget.shutterStopCmdId ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {/* Open / Monter */}
                    <button
                        className={`${btnBase} ${btnColorized} py-2 flex-col gap-0.5`}
                        disabled={!widget.shutterOpenCmdId || loading !== null}
                        onClick={() => execute(widget.shutterOpenCmdId, 'open')}
                        title="Monter / Ouvrir"
                    >
                        {loading === 'open'
                            ? <Loader2 size={16} className="animate-spin" />
                            : <ChevronUp size={16} />
                        }
                        <span className="text-[10px] font-medium">Ouvrir</span>
                    </button>

                    {/* Stop */}
                    {widget.shutterStopCmdId && (
                        <button
                            className={`${btnBase} ${btnColorized} py-2 flex-col gap-0.5`}
                            disabled={loading !== null}
                            onClick={() => execute(widget.shutterStopCmdId, 'stop')}
                            title="Arrêter"
                        >
                            {loading === 'stop'
                                ? <Loader2 size={16} className="animate-spin" />
                                : <Square size={14} fill="currentColor" />
                            }
                            <span className="text-[10px] font-medium">Stop</span>
                        </button>
                    )}

                    {/* Close / Fermer */}
                    <button
                        className={`${btnBase} ${btnColorized} py-2 flex-col gap-0.5`}
                        disabled={!widget.shutterCloseCmdId || loading !== null}
                        onClick={() => execute(widget.shutterCloseCmdId, 'close')}
                        title="Descendre / Fermer"
                    >
                        {loading === 'close'
                            ? <Loader2 size={16} className="animate-spin" />
                            : <ChevronDown size={16} />
                        }
                        <span className="text-[10px] font-medium">Fermer</span>
                    </button>
                </div>

                {/* Position slider (optional) */}
                {hasPosition && widget.shutterPositionCmdId && (
                    <div className="px-1 mt-1">
                        <div className="relative h-2 w-full">
                            <div className={`absolute inset-0 rounded-full ${trackColor}`} />
                            <div
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-75 ${fillColor}`}
                                style={{ width: `${percent}%` }}
                            />
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={displayPosition}
                                onChange={handlePositionChange}
                                onMouseUp={handlePositionRelease}
                                onTouchEnd={handlePositionRelease}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                style={{ margin: 0 }}
                            />
                            <div
                                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 shadow transition-all duration-75
                                    ${isColorized ? 'bg-white border-white/50' : 'bg-white border-jeedom-500'}
                                    ${loading === 'position' ? 'scale-90 opacity-70' : 'scale-100'}`}
                                style={{ left: `calc(${percent}% - 8px)`, pointerEvents: 'none' }}
                            />
                        </div>
                        <div className={`flex justify-between mt-1 text-[10px] ${subTextColor}`}>
                            <span>0%</span>
                            <span>100%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShutterWidget;
