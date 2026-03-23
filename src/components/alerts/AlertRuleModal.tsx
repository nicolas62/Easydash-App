import React, { useState, useEffect } from 'react';
import { X, Save, Bell } from 'lucide-react';
import { AlertRule, AlertConditionType, AlertSeverity, AlertChannel, JeedomCommand } from '../../types';

interface AlertRuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: AlertRule) => void;
    initialData?: AlertRule;
    commands: JeedomCommand[];
}

const DEFAULT_RULE: Omit<AlertRule, 'id' | 'createdAt'> = {
    name: '',
    cmdId: '',
    cmdName: '',
    cmdUnit: '',
    conditionType: 'above',
    threshold: '',
    severity: 'warning',
    channel: 'both',
    enabled: true,
    cooldownMs: 300_000, // 5 min
    hysteresis: 0,
    enabledFrom: '',
    enabledTo: '',
};

const AlertRuleModal: React.FC<AlertRuleModalProps> = ({ isOpen, onClose, onSave, initialData, commands }) => {
    const [form, setForm] = useState(DEFAULT_RULE);

    useEffect(() => {
        if (isOpen) {
            setForm(initialData
                ? { ...initialData }
                : { ...DEFAULT_RULE }
            );
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleCommandChange = (cmdId: string) => {
        const cmd = commands.find(c => String(c.id) === cmdId);
        setForm(f => ({
            ...f,
            cmdId,
            cmdName: cmd?.name ?? '',
            cmdUnit: cmd?.unite ?? '',
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.cmdId || !form.name) return;
        onSave({
            ...form,
            id:        initialData?.id ?? `alert_${Date.now()}`,
            createdAt: initialData?.createdAt ?? Date.now(),
            threshold: form.conditionType === 'change' ? '' : form.threshold,
        });
        onClose();
    };

    const infoCommands = commands.filter(c => c.type === 'info');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Bell size={18} className="text-jeedom-500" />
                        <h2 className="text-base font-semibold text-content-primary">
                            {initialData ? 'Modifier l\'alerte' : 'Nouvelle alerte'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-dark-card rounded-lg transition-colors">
                        <X size={18} className="text-content-secondary" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Nom */}
                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1">Nom de l'alerte</label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Ex: Température trop haute"
                            className="w-full bg-dark-card border border-border rounded-lg px-3 py-2 text-sm text-content-primary placeholder-content-secondary/50 focus:outline-none focus:ring-1 focus:ring-jeedom-500"
                        />
                    </div>

                    {/* Commande */}
                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1">Commande Jeedom</label>
                        <select
                            required
                            value={form.cmdId}
                            onChange={e => handleCommandChange(e.target.value)}
                            className="w-full bg-dark-card border border-border rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-jeedom-500"
                        >
                            <option value="">-- Sélectionner --</option>
                            {infoCommands.map(cmd => (
                                <option key={cmd.id} value={String(cmd.id)}>
                                    {cmd.name} {cmd.unite ? `(${cmd.unite})` : ''} — #{cmd.id}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Condition */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-content-secondary mb-1">Condition</label>
                            <select
                                value={form.conditionType}
                                onChange={e => setForm(f => ({ ...f, conditionType: e.target.value as AlertConditionType }))}
                                className="w-full bg-dark-card border border-border rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-jeedom-500"
                            >
                                <option value="above">Supérieur à</option>
                                <option value="below">Inférieur à</option>
                                <option value="equals">Égal à</option>
                                <option value="change">Changement</option>
                            </select>
                        </div>
                        {form.conditionType !== 'change' && (
                            <div>
                                <label className="block text-xs font-medium text-content-secondary mb-1">Seuil</label>
                                <input
                                    type="text"
                                    required
                                    value={String(form.threshold)}
                                    onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))}
                                    placeholder="Ex: 28"
                                    className="w-full bg-dark-card border border-border rounded-lg px-3 py-2 text-sm text-content-primary placeholder-content-secondary/50 focus:outline-none focus:ring-1 focus:ring-jeedom-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Sévérité + Canal */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-content-secondary mb-1">Sévérité</label>
                            <select
                                value={form.severity}
                                onChange={e => setForm(f => ({ ...f, severity: e.target.value as AlertSeverity }))}
                                className="w-full bg-dark-card border border-border rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-jeedom-500"
                            >
                                <option value="info">Info</option>
                                <option value="warning">Avertissement</option>
                                <option value="critical">Critique</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-content-secondary mb-1">Canal</label>
                            <select
                                value={form.channel}
                                onChange={e => setForm(f => ({ ...f, channel: e.target.value as AlertChannel }))}
                                className="w-full bg-dark-card border border-border rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-jeedom-500"
                            >
                                <option value="toast">Toast uniquement</option>
                                <option value="notification">Notification système</option>
                                <option value="both">Les deux</option>
                            </select>
                        </div>
                    </div>

                    {/* Cooldown + Hystérésis */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-content-secondary mb-1">Cooldown (minutes)</label>
                            <input
                                type="number"
                                min={0}
                                value={Math.round(form.cooldownMs / 60_000)}
                                onChange={e => setForm(f => ({ ...f, cooldownMs: Number(e.target.value) * 60_000 }))}
                                className="w-full bg-dark-card border border-border rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-jeedom-500"
                            />
                        </div>
                        {(form.conditionType === 'above' || form.conditionType === 'below') && (
                            <div>
                                <label className="block text-xs font-medium text-content-secondary mb-1">Hystérésis</label>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.1"
                                    value={form.hysteresis ?? 0}
                                    onChange={e => setForm(f => ({ ...f, hysteresis: Number(e.target.value) }))}
                                    className="w-full bg-dark-card border border-border rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-jeedom-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Plage horaire */}
                    <div>
                        <label className="block text-xs font-medium text-content-secondary mb-1">Plage horaire active (optionnel)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="time"
                                value={form.enabledFrom ?? ''}
                                onChange={e => setForm(f => ({ ...f, enabledFrom: e.target.value }))}
                                className="flex-1 bg-dark-card border border-border rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-jeedom-500"
                            />
                            <span className="text-content-secondary text-xs">→</span>
                            <input
                                type="time"
                                value={form.enabledTo ?? ''}
                                onChange={e => setForm(f => ({ ...f, enabledTo: e.target.value }))}
                                className="flex-1 bg-dark-card border border-border rounded-lg px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-jeedom-500"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm text-content-secondary hover:text-content-primary hover:bg-dark-card rounded-lg transition-colors">
                            Annuler
                        </button>
                        <button type="submit"
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-jeedom-600 hover:bg-jeedom-500 text-white rounded-lg transition-colors font-medium">
                            <Save size={14} />
                            {initialData ? 'Enregistrer' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AlertRuleModal;
