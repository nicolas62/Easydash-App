import { AlertRule, AlertHistory, AlertState, AlertConditionType } from '../types';

const RULES_KEY   = 'jeedom_alert_rules';
const HISTORY_KEY = 'jeedom_alert_history';
const STATE_KEY   = 'jeedom_alert_state';

const MAX_HISTORY = 200;

// ─── Persistence ─────────────────────────────────────────────────────────────

export function loadRules(): AlertRule[] {
    try {
        const raw = localStorage.getItem(RULES_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function saveRules(rules: AlertRule[]): void {
    localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export function loadHistory(): AlertHistory[] {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function saveHistory(history: AlertHistory[]): void {
    // Garder seulement les MAX_HISTORY entrées les plus récentes
    const trimmed = history.slice(-MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function loadStates(): Map<string, AlertState> {
    try {
        const raw = localStorage.getItem(STATE_KEY);
        if (!raw) return new Map();
        const arr: AlertState[] = JSON.parse(raw);
        return new Map(arr.map(s => [s.ruleId, s]));
    } catch { return new Map(); }
}

export function saveStates(states: Map<string, AlertState>): void {
    localStorage.setItem(STATE_KEY, JSON.stringify([...states.values()]));
}

// ─── Condition evaluation ────────────────────────────────────────────────────

export function evaluateCondition(
    type: AlertConditionType,
    currentValue: string | number,
    threshold: string | number,
    previousValue: string | number | undefined,
    hysteresis: number = 0,
): boolean {
    const curr = Number(currentValue);
    const thr  = Number(threshold);

    switch (type) {
        case 'above':
            // Déclenche sur front montant uniquement (évite répétition)
            if (hysteresis > 0) {
                const prev = previousValue !== undefined ? Number(previousValue) : undefined;
                return curr > thr + hysteresis && (prev === undefined || prev <= thr + hysteresis);
            }
            return curr > thr;

        case 'below':
            if (hysteresis > 0) {
                const prev = previousValue !== undefined ? Number(previousValue) : undefined;
                return curr < thr - hysteresis && (prev === undefined || prev >= thr - hysteresis);
            }
            return curr < thr;

        case 'equals':
            return String(currentValue) === String(threshold);

        case 'change':
            return previousValue !== undefined && String(currentValue) !== String(previousValue);

        default:
            return false;
    }
}

// ─── Time window check ───────────────────────────────────────────────────────

export function isWithinTimeWindow(rule: AlertRule): boolean {
    if (!rule.enabledFrom || !rule.enabledTo) return true;

    const now    = new Date();
    const [fH, fM] = rule.enabledFrom.split(':').map(Number);
    const [tH, tM] = rule.enabledTo.split(':').map(Number);
    const current = now.getHours() * 60 + now.getMinutes();
    const from    = fH * 60 + fM;
    const to      = tH * 60 + tM;

    if (from <= to) return current >= from && current <= to;
    // Cas overnight ex: 22:00 → 06:00
    return current >= from || current <= to;
}

// ─── Notification dispatch ───────────────────────────────────────────────────

function buildMessage(rule: AlertRule, value: string | number): string {
    const unit = rule.cmdUnit || '';
    return `${rule.cmdName || rule.cmdId} : ${value}${unit} (seuil ${rule.threshold}${unit})`;
}

export function dispatchNotification(rule: AlertRule, value: string | number): void {
    const title   = rule.name;
    const body    = buildMessage(rule, value);

    // Toast via custom event (écouté dans App.tsx)
    if (rule.channel === 'toast' || rule.channel === 'both') {
        window.dispatchEvent(new CustomEvent('easydash:alert', {
            detail: { title, body, severity: rule.severity }
        }));
    }

    // Notification API système
    if (rule.channel === 'notification' || rule.channel === 'both') {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/logo.png',
                tag: rule.id,
                silent: rule.severity === 'info',
            });
        } else if (Notification.permission === 'default') {
            // Demande la permission silencieusement
            Notification.requestPermission().then(perm => {
                if (perm === 'granted') {
                    new Notification(title, { body, icon: '/logo.png', tag: rule.id });
                }
            });
        }
    }
}

// ─── Main check function ─────────────────────────────────────────────────────

export function checkRules(
    rules: AlertRule[],
    cmdId: string,
    currentValue: string | number,
    states: Map<string, AlertState>,
): { triggered: AlertRule[]; newStates: Map<string, AlertState>; historyEntries: AlertHistory[] } {
    const now            = Date.now();
    const triggered: AlertRule[]       = [];
    const historyEntries: AlertHistory[] = [];
    const newStates      = new Map(states);

    const relevantRules = rules.filter(r => r.enabled && r.cmdId === cmdId);

    for (const rule of relevantRules) {
        const state      = newStates.get(rule.id) ?? { ruleId: rule.id, lastValue: undefined, lastAlertAt: 0 };
        const cooldownOk = now - state.lastAlertAt >= rule.cooldownMs;

        if (!cooldownOk) continue;
        if (!isWithinTimeWindow(rule)) continue;

        const fires = evaluateCondition(
            rule.conditionType,
            currentValue,
            rule.threshold,
            state.lastValue,
            rule.hysteresis,
        );

        // Toujours mettre à jour la lastValue
        newStates.set(rule.id, { ...state, ruleId: rule.id, lastValue: currentValue });

        if (fires) {
            triggered.push(rule);
            newStates.set(rule.id, { ruleId: rule.id, lastValue: currentValue, lastAlertAt: now });

            historyEntries.push({
                id:            `${rule.id}_${now}`,
                ruleId:        rule.id,
                ruleName:      rule.name,
                cmdId:         rule.cmdId,
                cmdName:       rule.cmdName,
                value:         currentValue,
                threshold:     rule.threshold,
                conditionType: rule.conditionType,
                severity:      rule.severity,
                triggeredAt:   now,
                acknowledged:  false,
            });

            dispatchNotification(rule, currentValue);
        }
    }

    return { triggered, newStates, historyEntries };
}
