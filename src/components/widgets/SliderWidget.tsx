import React, { useState, useCallback, useRef } from 'react';
import { WidgetConfig, AppSettings, JeedomCommand } from '../../types';
import { useJeedomCommand } from '../../hooks/useJeedomCommand';
import { executeJeedomCommand } from '../../services/jeedomService';
import { ICONS } from '../../constants';

interface SliderWidgetProps {
    widget: WidgetConfig;
    settings: AppSettings;
    commands: JeedomCommand[];
    isColorized: boolean;
}

const SliderWidget: React.FC<SliderWidgetProps> = ({ widget, settings, commands, isColorized }) => {
    const min  = widget.sliderMin  ?? 0;
    const max  = widget.sliderMax  ?? 100;
    const step = widget.sliderStep ?? 1;

    // Valeur initiale depuis le tableau commands chargé
    const infoCmd = commands.find(c => String(c.id) === String(widget.sliderInfoId ?? ''));
    const initialValue = infoCmd?.value !== undefined ? Number(infoCmd.value) : min;

    // Abonnement temps-réel WebSocket
    const wsValue = useJeedomCommand(widget.sliderInfoId, initialValue);
    const remoteValue = wsValue !== undefined ? Number(wsValue) : initialValue;

    // Valeur locale pendant le drag
    const [localValue, setLocalValue] = useState<number | null>(null);
    const [sending, setSending] = useState(false);
    const sendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rafRef = useRef<number | null>(null);

    const displayValue = localValue !== null ? localValue : remoteValue;
    const percent = max > min ? ((displayValue - min) / (max - min)) * 100 : 0;

    const Icon = ICONS[widget.icon] || ICONS['help-circle'];
    const unit = infoCmd?.unite || '';

    // Throttle state updates to one per animation frame to avoid
    // 60 re-renders/second on mobile during drag.
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            setLocalValue(newValue);
            rafRef.current = null;
        });
    }, []);

    const commitValue = useCallback(async (value: number) => {
        if (!widget.sliderActionId) return;
        if (sendTimer.current) clearTimeout(sendTimer.current);
        setSending(true);
        try {
            await executeJeedomCommand(settings, widget.sliderActionId, { value });
        } finally {
            setSending(false);
            setLocalValue(null);
        }
    }, [settings, widget.sliderActionId]);

    const handleRelease = useCallback(() => {
        if (localValue !== null) commitValue(localValue);
    }, [localValue, commitValue]);

    const textColor    = isColorized ? 'text-white' : 'text-content-primary';
    const subTextColor = isColorized ? 'text-white/70' : 'text-content-secondary';
    const trackColor   = isColorized ? 'bg-white/20' : 'bg-border';
    const fillColor    = isColorized ? 'bg-white' : 'bg-jeedom-500';

    return (
        <div
            className="flex flex-col h-full w-full p-3 gap-1 z-10"
            onClick={e => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    {Icon && (
                        <Icon
                            size={16}
                            strokeWidth={1.5}
                            className={isColorized ? 'text-white/80' : 'text-jeedom-500'}
                        />
                    )}
                    <span className={`text-xs font-medium truncate ${subTextColor}`}>
                        {widget.name}
                    </span>
                </div>
                <span className={`text-xs font-mono flex-shrink-0 ml-2 ${sending ? 'opacity-50 animate-pulse' : ''} ${textColor}`}>
                    {displayValue}{unit}
                </span>
            </div>

            {/* Slider track + thumb */}
            <div className="flex-1 flex flex-col justify-center px-1">
                <div className="relative h-2 w-full">
                    {/* Track background */}
                    <div className={`absolute inset-0 rounded-full ${trackColor}`} />
                    {/* Fill */}
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-75 ${fillColor}`}
                        style={{ width: `${percent}%` }}
                    />
                    {/* Native input range (invisible, overlaid) */}
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={displayValue}
                        onChange={handleChange}
                        onMouseUp={handleRelease}
                        onTouchEnd={handleRelease}
                        disabled={!widget.sliderActionId}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        style={{ margin: 0 }}
                    />
                    {/* Thumb visible */}
                    <div
                        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 shadow transition-all duration-75
                            ${isColorized ? 'bg-white border-white/50' : 'bg-white border-jeedom-500'}
                            ${sending ? 'scale-90 opacity-70' : 'scale-100'}`}
                        style={{ left: `calc(${percent}% - 8px)`, pointerEvents: 'none' }}
                    />
                </div>

                {/* Min / Max labels */}
                <div className={`flex justify-between mt-1.5 text-[10px] ${subTextColor}`}>
                    <span>{min}{unit}</span>
                    <span>{max}{unit}</span>
                </div>
            </div>
        </div>
    );
};

export default SliderWidget;
