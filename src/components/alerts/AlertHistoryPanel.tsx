import React, { useState, useCallback } from 'react';
import { AlertHistory } from '../../types';
import { loadHistory, saveHistory } from '../../services/alertService';
import { Clock, Trash2, CheckCheck, AlertTriangle, Info, Zap } from 'lucide-react';

const SeverityIcon: React.FC<{ severity: string }> = ({ severity }) => {
    if (severity === 'critical') return <Zap size={14} className="text-red-400 flex-shrink-0" />;
    if (severity === 'warning')  return <AlertTriangle size={14} className="text-orange-400 flex-shrink-0" />;
    return <Info size={14} className="text-blue-400 flex-shrink-0" />;
};

const formatTime = (ts: number): string => {
    const d = new Date(ts);
    return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

interface AlertHistoryPanelProps {
    refreshKey?: number; // incrémenter pour forcer le rechargement
}

const AlertHistoryPanel: React.FC<AlertHistoryPanelProps> = ({ refreshKey }) => {
    const [history, setHistory] = useState<AlertHistory[]>(() =>
        loadHistory().slice().reverse() // Plus récent en premier
    );

    // Recharger si refreshKey change (nouvel événement)
    React.useEffect(() => {
        setHistory(loadHistory().slice().reverse());
    }, [refreshKey]);

    const clearAll = useCallback(() => {
        saveHistory([]);
        setHistory([]);
    }, []);

    const acknowledge = useCallback((id: string) => {
        const updated = loadHistory().map(h => h.id === id ? { ...h, acknowledged: true } : h);
        saveHistory(updated);
        setHistory(updated.slice().reverse());
    }, []);

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-content-secondary gap-2">
                <Clock size={28} className="opacity-40" />
                <p className="text-sm">Aucune alerte déclenchée</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-content-secondary">{history.length} entrée(s)</span>
                <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                    <Trash2 size={12} />
                    Tout effacer
                </button>
            </div>

            {history.map(entry => (
                <div
                    key={entry.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-opacity ${
                        entry.acknowledged
                            ? 'opacity-50 bg-dark-card border-border'
                            : 'bg-dark-surface border-border'
                    }`}
                >
                    <SeverityIcon severity={entry.severity} />

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-content-primary truncate">{entry.ruleName}</p>
                        <p className="text-xs text-content-secondary mt-0.5">
                            {entry.cmdName ?? entry.cmdId} : <span className="text-content-primary font-mono">{entry.value}</span>
                            {entry.conditionType !== 'change' && (
                                <> (seuil {entry.threshold})</>
                            )}
                        </p>
                        <p className="text-xs text-content-secondary/60 mt-1">{formatTime(entry.triggeredAt)}</p>
                    </div>

                    {!entry.acknowledged && (
                        <button
                            onClick={() => acknowledge(entry.id)}
                            title="Acquitter"
                            className="p-1 hover:bg-dark-card rounded-lg transition-colors text-content-secondary hover:text-jeedom-500"
                        >
                            <CheckCheck size={14} />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AlertHistoryPanel;
