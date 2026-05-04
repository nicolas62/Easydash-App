import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { WidgetConfig, JeedomCommand } from '../../types';
import { executeJeedomCommand } from '../../services/jeedomService';
import { useJeedomCommand } from '../../hooks/useJeedomCommand';
import { verifyPin } from '../../utils/crypto';

interface AlarmWidgetProps {
    widget: WidgetConfig;
    settings: any;
    isColorized: boolean;
    commands: JeedomCommand[];
    onArmedChange: (isArmed: boolean) => void;
}

const AlarmWidget: React.FC<AlarmWidgetProps> = ({
    widget,
    settings,
    isColorized,
    commands,
    onArmedChange,
}) => {
    const [loading, setLoading]         = useState(false);
    const [localArmed, setLocalArmed]   = useState(false);
    const [showPin, setShowPin]         = useState(false);
    const [pinInput, setPinInput]       = useState('');
    const [pinError, setPinError]       = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockedUntil, setLockedUntil] = useState<number>(0);

    const LOCKOUT_ATTEMPTS = 3;
    const LOCKOUT_DURATION_MS = 30_000;
    const isLocked = Date.now() < lockedUntil;

    // Real-time state from Jeedom (optional)
    const stateCmd = commands.find(c => c.id === widget.alarmStateId);
    const rawState = useJeedomCommand(stateCmd?.id, stateCmd?.value);

    const armedValue = widget.alarmArmedValue ?? '1';
    const isArmed = widget.alarmStateId
        ? String(rawState !== undefined ? rawState : (stateCmd?.value ?? '')) === String(armedValue)
        : localArmed;

    // Display label from state command or fallback text
    const stateLabel = widget.alarmStateId
        ? String(rawState !== undefined ? rawState : (stateCmd?.value ?? '—'))
        : (isArmed ? 'Armée' : 'Désarmée');

    useEffect(() => { onArmedChange(isArmed); }, [isArmed, onArmedChange]);

    const handleArm = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!widget.alarmActivateCmdId) return;
        setLoading(true);
        try {
            await executeJeedomCommand(settings, widget.alarmActivateCmdId);
            if (!widget.alarmStateId) setLocalArmed(true);
        } catch (err) {
            console.error('[alarm] arm error:', err);
        } finally {
            setLoading(false);
        }
    }, [settings, widget.alarmActivateCmdId, widget.alarmStateId]);

    const handleDisarmClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setPinInput('');
        setPinError(false);
        setShowPin(true);
    }, []);

    const handlePinSubmit = useCallback(async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!widget.alarmDeactivateCmdId) { setShowPin(false); return; }

        // No code configured → disarm without verification
        if (!widget.alarmCodeHash) {
            setShowPin(false);
            setLoading(true);
            try {
                await executeJeedomCommand(settings, widget.alarmDeactivateCmdId);
                if (!widget.alarmStateId) setLocalArmed(false);
            } catch (err) {
                console.error('[alarm] disarm error:', err);
            } finally {
                setLoading(false);
            }
            return;
        }

        // Rate limiting check
        if (Date.now() < lockedUntil) return;

        const ok = await verifyPin(pinInput, widget.alarmCodeHash);
        if (!ok) {
            const next = failedAttempts + 1;
            setFailedAttempts(next);
            setPinError(true);
            setPinInput('');
            if (next >= LOCKOUT_ATTEMPTS) {
                setLockedUntil(Date.now() + LOCKOUT_DURATION_MS);
                setFailedAttempts(0);
            }
            return;
        }

        setFailedAttempts(0);
        setLockedUntil(0);
        setShowPin(false);
        setLoading(true);
        try {
            await executeJeedomCommand(settings, widget.alarmDeactivateCmdId);
            if (!widget.alarmStateId) setLocalArmed(false);
        } catch (err) {
            console.error('[alarm] disarm error:', err);
        } finally {
            setLoading(false);
        }
    }, [pinInput, failedAttempts, lockedUntil, settings, widget.alarmDeactivateCmdId, widget.alarmCodeHash, widget.alarmStateId]);

    const textColor    = isColorized ? 'text-white' : 'text-content-primary';
    const subColor     = isColorized ? 'text-white/70' : 'text-content-secondary';
    const btnArmedCls  = 'bg-white/20 hover:bg-white/30 text-white';
    const btnNormalCls = isColorized
        ? 'bg-white/20 hover:bg-white/30 text-white'
        : 'bg-jeedom-600/20 hover:bg-jeedom-600/30 text-jeedom-500';

    return (
        <>
            <div className="flex flex-col items-center justify-center h-full w-full p-3 gap-2 relative z-10">
                {loading ? (
                    <Loader2 size={32} className={`animate-spin ${textColor}`} />
                ) : isArmed ? (
                    <ShieldAlert size={32} className={textColor} />
                ) : (
                    <ShieldCheck size={32} className={textColor} />
                )}

                {widget.alarmStateId && (
                    <span className={`text-sm font-bold ${textColor}`}>{stateLabel}</span>
                )}

                <span className={`text-xs font-medium truncate max-w-full ${subColor}`}>
                    {widget.name}
                </span>

                {!loading && (
                    isArmed ? (
                        <button
                            onClick={handleDisarmClick}
                            className={`mt-1 px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all active:scale-95 ${btnArmedCls}`}
                        >
                            <Lock size={11} />
                            Désactiver
                        </button>
                    ) : (
                        <button
                            onClick={handleArm}
                            className={`mt-1 px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all active:scale-95 ${btnNormalCls}`}
                        >
                            Activer
                        </button>
                    )
                )}
            </div>

            {/* PIN popup */}
            {showPin && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowPin(false)}
                >
                    <div
                        className="bg-dark-surface border border-border rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-red-500/10 rounded-full">
                                <Lock size={20} className="text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-content-primary">Désactiver l'alarme</h3>
                                <p className="text-xs text-content-secondary">{widget.name}</p>
                            </div>
                        </div>

                        <form onSubmit={handlePinSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-content-secondary mb-1">
                                    Code de désactivation
                                </label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    value={pinInput}
                                    onChange={e => { setPinInput(e.target.value); setPinError(false); }}
                                    placeholder="••••••"
                                    autoFocus
                                    className={`w-full bg-input-bg border rounded-lg p-3 text-center text-xl tracking-[0.6em] font-bold text-content-primary outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                                        pinError ? 'border-red-500 bg-red-500/5' : 'border-border'
                                    }`}
                                />
                                {isLocked ? (
                                    <p className="text-xs text-orange-400 mt-1 text-center animate-in fade-in duration-200">
                                        Trop de tentatives — réessayez dans 30 s
                                    </p>
                                ) : pinError && (
                                    <p className="text-xs text-red-400 mt-1 text-center animate-in fade-in duration-200">
                                        Code incorrect ({LOCKOUT_ATTEMPTS - failedAttempts} essai{LOCKOUT_ATTEMPTS - failedAttempts > 1 ? 's' : ''} restant{LOCKOUT_ATTEMPTS - failedAttempts > 1 ? 's' : ''})
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPin(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-border text-sm text-content-secondary hover:bg-dark-card transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLocked}
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Valider
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AlarmWidget;
