import { useState, useCallback } from 'react';
import { AlertRule } from '../types';
import { loadRules, saveRules } from '../services/alertService';

export function useAlertRules() {
    const [rules, setRules] = useState<AlertRule[]>(() => loadRules());

    const addRule = useCallback((rule: AlertRule) => {
        setRules(prev => {
            const next = [...prev, rule];
            saveRules(next);
            return next;
        });
    }, []);

    const updateRule = useCallback((updated: AlertRule) => {
        setRules(prev => {
            const next = prev.map(r => r.id === updated.id ? updated : r);
            saveRules(next);
            return next;
        });
    }, []);

    const deleteRule = useCallback((id: string) => {
        setRules(prev => {
            const next = prev.filter(r => r.id !== id);
            saveRules(next);
            return next;
        });
    }, []);

    const toggleRule = useCallback((id: string) => {
        setRules(prev => {
            const next = prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
            saveRules(next);
            return next;
        });
    }, []);

    return { rules, addRule, updateRule, deleteRule, toggleRule };
}
