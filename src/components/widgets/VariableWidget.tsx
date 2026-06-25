import React, { useState, useRef } from 'react';
import { AlertTriangle, Loader2, Send } from 'lucide-react';
import { WidgetConfig, AppSettings } from '../../types';
import { ICONS } from '../../constants';
import { useVariableWidget } from '../../hooks/useVariableWidget';

interface VariableWidgetProps {
    widget: WidgetConfig;
    settings: AppSettings;
    isEditMode: boolean;
}

const VariableWidget: React.FC<VariableWidgetProps> = ({ widget, settings, isEditMode }) => {
    const pollInterval = widget.variablePollInterval ?? 60;
    const { value, loading, error, writeValue } = useVariableWidget(settings, widget.variableName, pollInterval);

    const [editing, setEditing] = useState(false);
    const [inputVal, setInputVal] = useState('');
    const [sending, setSending] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const Icon = ICONS[widget.icon] || ICONS['variable'] || ICONS['hash'] || ICONS['help-circle'];

    const isColorized = !!widget.color;
    const textColor = isColorized ? 'text-white' : 'text-content-primary';
    const subTextColor = isColorized ? 'text-white/70' : 'text-content-secondary';

    const handleEditStart = () => {
        if (isEditMode) return;
        setInputVal(value ?? '');
        setEditing(true);
        setTimeout(() => inputRef.current?.select(), 50);
    };

    const handleSend = async () => {
        if (sending) return;
        setSending(true);
        await writeValue(inputVal);
        setSending(false);
        setEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
        if (e.key === 'Escape') setEditing(false);
    };

    return (
        <>
            {/* Background watermark icon */}
            <div className={`absolute inset-0 flex items-center justify-center overflow-hidden z-0 pointer-events-none ${isColorized ? 'text-white' : 'text-jeedom-500'}`}>
                {Icon && (
                    <Icon
                        size={widget.size === 'small' ? 80 : widget.size === 'medium' ? 120 : 160}
                        strokeWidth={1}
                        className="opacity-20 transform -rotate-12"
                    />
                )}
            </div>

            <div className="relative z-10 flex flex-col h-full w-full p-2" onClick={e => e.stopPropagation()}>
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-1">
                    {loading && (
                        <Loader2 size={24} className={`animate-spin ${isColorized ? 'text-white/70' : 'text-jeedom-500'}`} />
                    )}
                    {!loading && error && (
                        <div className="flex flex-col items-center gap-1">
                            <AlertTriangle size={20} className="text-orange-400" />
                            <span className={`text-xs ${subTextColor}`}>Erreur</span>
                        </div>
                    )}
                    {!loading && !error && !editing && (
                        <span
                            className={`font-bold font-mono tracking-tight leading-none drop-shadow-md ${widget.size === 'small' ? 'text-2xl' : 'text-4xl'} ${textColor} ${widget.variableAllowEdit && !isEditMode ? 'cursor-pointer hover:opacity-80' : ''}`}
                            onClick={widget.variableAllowEdit ? handleEditStart : undefined}
                            title={widget.variableAllowEdit ? 'Cliquer pour modifier' : undefined}
                        >
                            {value ?? '—'}
                        </span>
                    )}
                    {!loading && !error && editing && (
                        <div className="flex items-center gap-1 w-full px-1">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputVal}
                                onChange={e => setInputVal(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className={`flex-1 min-w-0 rounded px-2 py-1 text-sm font-mono bg-black/20 border border-white/20 focus:outline-none focus:ring-1 focus:ring-jeedom-400 ${textColor}`}
                                autoFocus
                            />
                            <button
                                onClick={handleSend}
                                disabled={sending}
                                className={`flex-shrink-0 p-1.5 rounded transition-colors ${isColorized ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-jeedom-500 hover:bg-jeedom-600 text-white'} disabled:opacity-50`}
                                title="Envoyer"
                            >
                                {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <h3 className={`text-xs font-medium truncate opacity-90 ${subTextColor}`}>
                        {widget.name}
                    </h3>
                    {widget.variableName && !editing && (
                        <span className={`text-[9px] opacity-50 font-mono ${subTextColor}`}>#{widget.variableName}#</span>
                    )}
                </div>
            </div>
        </>
    );
};

export default VariableWidget;
