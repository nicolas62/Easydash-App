import { useEffect, useRef, useCallback } from 'react';
import { JeedomCommand, AlertRule, AlertHistory } from '../types';
import {
    loadStates, saveStates, loadHistory, saveHistory, checkRules,
} from '../services/alertService';

interface UseAlertsOptions {
    rules: AlertRule[];
    commands: JeedomCommand[];
    onNewAlerts?: (entries: AlertHistory[]) => void;
}

/**
 * Surveille les changements de commandes et déclenche les alertes actives.
 * Doit être appelé dans App.tsx avec les commandes mises à jour par useJeedomData.
 */
export function useAlerts({ rules, commands, onNewAlerts }: UseAlertsOptions) {
    // Index précédent des valeurs pour détecter les changements
    const prevValuesRef = useRef<Map<string, string | number>>(new Map());
    const statesRef     = useRef(loadStates());

    const evaluate = useCallback((cmds: JeedomCommand[]) => {
        if (rules.length === 0) return;

        const states  = statesRef.current;
        let anyTriggered = false;
        const allHistory: AlertHistory[] = [];

        for (const cmd of cmds) {
            const currentValue = cmd.value ?? '';
            const prevValue    = prevValuesRef.current.get(String(cmd.id));

            // Ignorer si valeur inchangée (évite re-check inutile)
            if (String(currentValue) === String(prevValue ?? '__INIT__') && prevValue !== undefined) continue;

            const { newStates, historyEntries } = checkRules(
                rules,
                String(cmd.id),
                currentValue,
                states,
            );

            if (historyEntries.length > 0) {
                anyTriggered = true;
                allHistory.push(...historyEntries);
                statesRef.current = newStates;
            }

            prevValuesRef.current.set(String(cmd.id), currentValue);
        }

        if (anyTriggered) {
            saveStates(statesRef.current);
            const history = loadHistory();
            saveHistory([...history, ...allHistory]);
            onNewAlerts?.(allHistory);

            // Broadcast via Web Push (works even when app is closed)
            const pushToken = sessionStorage.getItem('easydash_push_token');
            if (pushToken) {
                for (const entry of allHistory) {
                    const rule = rules.find(r => r.id === entry.ruleId);
                    if (rule && (rule.channel === 'notification' || rule.channel === 'both')) {
                        const unit = rule.cmdUnit || '';
                        fetch('/api/push/broadcast', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${pushToken}`,
                            },
                            body: JSON.stringify({
                                title: rule.name,
                                body: `${entry.cmdName ?? entry.cmdId} : ${entry.value}${unit} (seuil ${entry.threshold}${unit})`,
                                severity: entry.severity,
                            }),
                        }).catch(() => {}); // fire-and-forget
                    }
                }
            }
        }
    }, [rules, onNewAlerts]);

    useEffect(() => {
        evaluate(commands);
    }, [commands, evaluate]);
}
