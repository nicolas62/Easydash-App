import React, { useState, useEffect, useCallback } from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import { verifyPin } from '../utils/crypto';

const LOCKOUT_KEY = 'dashboard_pin_lockout';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

interface LockoutState {
    count: number;
    lockedUntil: number;
}

function readLockout(): LockoutState {
    try {
        const raw = localStorage.getItem(LOCKOUT_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return { count: 0, lockedUntil: 0 };
}

function saveLockout(state: LockoutState): void {
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(state));
}

function clearLockout(): void {
    localStorage.removeItem(LOCKOUT_KEY);
}

interface PinUnlockModalProps {
    storedHash: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const PinUnlockModal: React.FC<PinUnlockModalProps> = ({ storedHash, onSuccess, onCancel }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [lockout, setLockout] = useState<LockoutState>(readLockout);
    const [, forceUpdate] = useState(0);

    const isLocked = Date.now() < lockout.lockedUntil;
    const remaining = Math.ceil((lockout.lockedUntil - Date.now()) / 1000);

    // Refresh remaining time display every second while locked
    useEffect(() => {
        if (!isLocked) return;
        const id = setInterval(() => forceUpdate(n => n + 1), 1000);
        return () => clearInterval(id);
    }, [isLocked]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked || pin.length < 6) return;

        const ok = await verifyPin(pin, storedHash);
        if (ok) {
            clearLockout();
            onSuccess();
            return;
        }

        const next = readLockout();
        next.count += 1;
        if (next.count >= MAX_ATTEMPTS) {
            next.lockedUntil = Date.now() + LOCKOUT_MS;
            next.count = 0;
        }
        saveLockout(next);
        setLockout({ ...next });
        setError(true);
        setPin('');
    }, [pin, storedHash, isLocked, onSuccess]);

    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
        >
            <div
                className="bg-dark-surface border border-border rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-jeedom-600/15 rounded-full">
                        {isLocked
                            ? <ShieldAlert size={20} className="text-orange-400" />
                            : <Lock size={20} className="text-jeedom-500" />
                        }
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-content-primary">Accès protégé</h3>
                        <p className="text-xs text-content-secondary">Entrez votre code PIN admin</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            inputMode="numeric"
                            value={pin}
                            onChange={e => { setPin(e.target.value); setError(false); }}
                            placeholder="••••••"
                            autoFocus
                            disabled={isLocked}
                            className={`w-full bg-input-bg border rounded-lg p-3 text-center text-xl tracking-[0.6em] font-bold text-content-primary outline-none focus:ring-2 focus:ring-jeedom-500 transition-all disabled:opacity-50 ${
                                error ? 'border-red-500 bg-red-500/5' : 'border-border'
                            }`}
                        />
                        {isLocked ? (
                            <p className="text-xs text-orange-400 mt-1.5 text-center animate-in fade-in duration-200">
                                Trop de tentatives — réessayez dans {remaining} s
                            </p>
                        ) : error ? (
                            <p className="text-xs text-red-400 mt-1.5 text-center animate-in fade-in duration-200">
                                Code incorrect — {MAX_ATTEMPTS - lockout.count} essai{MAX_ATTEMPTS - lockout.count > 1 ? 's' : ''} restant{MAX_ATTEMPTS - lockout.count > 1 ? 's' : ''}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-2.5 rounded-xl border border-border text-sm text-content-secondary hover:bg-dark-card transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isLocked || pin.length < 6}
                            className="flex-1 py-2.5 rounded-xl bg-jeedom-600 hover:bg-jeedom-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Valider
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PinUnlockModal;
