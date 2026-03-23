import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Bell, BellOff, Clock, Smartphone, BellRing, Loader2, CheckCircle2, XCircle, FlaskConical } from 'lucide-react';
import { AlertRule, JeedomCommand } from '../../types';
import { useAlertRules } from '../../hooks/useAlertRules';
import { useAlertSubscription, PushDeviceInfo } from '../../hooks/useAlertSubscription';
import AlertRuleModal from './AlertRuleModal';
import AlertHistoryPanel from './AlertHistoryPanel';

interface AlertsTabProps {
    commands: JeedomCommand[];
    historyRefreshKey?: number;
}

const SEVERITY_STYLES: Record<string, string> = {
    info:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
    warning:  'bg-orange-500/10 text-orange-400 border-orange-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const SEVERITY_LABELS: Record<string, string> = {
    info: 'Info', warning: 'Avertissement', critical: 'Critique',
};

const CONDITION_LABELS: Record<string, string> = {
    above: '>', below: '<', equals: '=', change: 'Changement',
};

const AlertsTab: React.FC<AlertsTabProps> = ({ commands, historyRefreshKey }) => {
    const { rules, addRule, updateRule, deleteRule, toggleRule } = useAlertRules();
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [editingRule, setEditingRule]   = useState<AlertRule | undefined>();
    const [activeView, setActiveView]     = useState<'rules' | 'history' | 'push'>('rules');

    const { isSupported, pushAvailable, isSubscribed, isLoading: pushLoading, permission, deviceId, subscribe, unsubscribe, sendTest, fetchDevices } = useAlertSubscription();
    const [devices, setDevices]       = useState<PushDeviceInfo[]>([]);
    const [devicesLoaded, setDevicesLoaded] = useState(false);

    useEffect(() => {
        if (activeView === 'push' && !devicesLoaded) {
            fetchDevices().then(d => { setDevices(d); setDevicesLoaded(true); });
        }
    }, [activeView, devicesLoaded, fetchDevices]);

    // Refresh device list after subscribe/unsubscribe
    useEffect(() => {
        if (activeView === 'push') {
            fetchDevices().then(setDevices);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSubscribed]);

    const handleSave = (rule: AlertRule) => {
        if (editingRule) {
            updateRule(rule);
        } else {
            addRule(rule);
        }
        setEditingRule(undefined);
    };

    const handleEdit = (rule: AlertRule) => {
        setEditingRule(rule);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingRule(undefined);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex gap-1 bg-dark-card rounded-lg p-1">
                <button
                    onClick={() => setActiveView('rules')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        activeView === 'rules' ? 'bg-dark-surface text-content-primary' : 'text-content-secondary hover:text-content-primary'
                    }`}
                >
                    <Bell size={12} />
                    Règles ({rules.length})
                </button>
                <button
                    onClick={() => setActiveView('history')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        activeView === 'history' ? 'bg-dark-surface text-content-primary' : 'text-content-secondary hover:text-content-primary'
                    }`}
                >
                    <Clock size={12} />
                    Historique
                </button>
                <button
                    onClick={() => setActiveView('push')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        activeView === 'push' ? 'bg-dark-surface text-content-primary' : 'text-content-secondary hover:text-content-primary'
                    }`}
                >
                    <Smartphone size={12} />
                    Push
                    {isSubscribed && <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-0.5" />}
                </button>
            </div>

            {activeView === 'rules' && (
                <>
                    {/* Bouton ajout */}
                    <button
                        onClick={handleNew}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-border rounded-xl text-sm text-content-secondary hover:text-jeedom-500 hover:border-jeedom-500/50 transition-colors"
                    >
                        <Plus size={16} />
                        Nouvelle règle
                    </button>

                    {/* Liste des règles */}
                    {rules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-content-secondary gap-2">
                            <BellOff size={28} className="opacity-40" />
                            <p className="text-sm">Aucune règle d'alerte</p>
                            <p className="text-xs opacity-60">Créez une règle pour surveiller vos capteurs</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {rules.map(rule => (
                                <div key={rule.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-opacity ${
                                        rule.enabled ? 'bg-dark-card border-border' : 'bg-dark-card border-border opacity-50'
                                    }`}
                                >
                                    {/* Toggle actif/inactif */}
                                    <button onClick={() => toggleRule(rule.id)} className="flex-shrink-0">
                                        {rule.enabled
                                            ? <ToggleRight size={22} className="text-jeedom-500" />
                                            : <ToggleLeft size={22} className="text-content-secondary" />
                                        }
                                    </button>

                                    {/* Infos */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-content-primary truncate">{rule.name}</p>
                                        <p className="text-xs text-content-secondary mt-0.5 truncate">
                                            {rule.cmdName ?? rule.cmdId}
                                            {' '}
                                            <span className="font-mono">{CONDITION_LABELS[rule.conditionType]}</span>
                                            {rule.conditionType !== 'change' && (
                                                <> <span className="font-mono">{rule.threshold}</span>{rule.cmdUnit}</>
                                            )}
                                        </p>
                                    </div>

                                    {/* Badge sévérité */}
                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border flex-shrink-0 ${SEVERITY_STYLES[rule.severity]}`}>
                                        {SEVERITY_LABELS[rule.severity]}
                                    </span>

                                    {/* Actions */}
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button onClick={() => handleEdit(rule)}
                                            className="p-1.5 hover:bg-dark-surface rounded-lg transition-colors text-content-secondary hover:text-content-primary">
                                            <Pencil size={13} />
                                        </button>
                                        <button onClick={() => deleteRule(rule.id)}
                                            className="p-1.5 hover:bg-dark-surface rounded-lg transition-colors text-content-secondary hover:text-red-400">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeView === 'history' && (
                <AlertHistoryPanel refreshKey={historyRefreshKey} />
            )}

            {activeView === 'push' && (
                <div className="space-y-4">
                    {/* Status banner */}
                    {!isSupported || pushAvailable === false ? (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-card border border-border">
                            <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-content-primary">Push non disponible</p>
                                <p className="text-xs text-content-secondary mt-0.5">
                                    {!isSupported
                                        ? 'Votre navigateur ne supporte pas les notifications push.'
                                        : 'Le serveur n\'a pas de clés VAPID configurées. Ajoutez VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY aux variables d\'environnement.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Subscription card */}
                            <div className="p-3 rounded-xl bg-dark-card border border-border space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BellRing size={15} className={isSubscribed ? 'text-jeedom-500' : 'text-content-secondary'} />
                                        <span className="text-sm font-medium text-content-primary">Cet appareil</span>
                                    </div>
                                    {isSubscribed
                                        ? <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle2 size={12} /> Abonné</span>
                                        : <span className="text-xs text-content-secondary">Non abonné</span>
                                    }
                                </div>

                                {permission === 'denied' && (
                                    <p className="text-xs text-orange-400">
                                        Les notifications sont bloquées dans votre navigateur. Autorisez-les dans les paramètres du site.
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    {!isSubscribed ? (
                                        <button
                                            onClick={subscribe}
                                            disabled={pushLoading || permission === 'denied'}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-jeedom-500/10 hover:bg-jeedom-500/20 text-jeedom-400 text-xs font-medium transition-colors disabled:opacity-50"
                                        >
                                            {pushLoading ? <Loader2 size={13} className="animate-spin" /> : <Bell size={13} />}
                                            Activer les notifications
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={sendTest}
                                                disabled={pushLoading}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-surface hover:bg-dark-surface/80 text-content-secondary hover:text-content-primary text-xs transition-colors"
                                            >
                                                <FlaskConical size={12} />
                                                Tester
                                            </button>
                                            <button
                                                onClick={unsubscribe}
                                                disabled={pushLoading}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
                                            >
                                                {pushLoading ? <Loader2 size={13} className="animate-spin" /> : <BellOff size={13} />}
                                                Se désabonner
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Device list */}
                            <div>
                                <p className="text-xs font-medium text-content-secondary mb-2 flex items-center gap-1.5">
                                    <Smartphone size={11} />
                                    Appareils abonnés ({devices.length})
                                </p>
                                {devices.length === 0 ? (
                                    <p className="text-xs text-content-secondary opacity-60 text-center py-4">Aucun appareil abonné</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {devices.map(d => (
                                            <div key={d.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${d.id === deviceId ? 'bg-jeedom-500/5 border-jeedom-500/20' : 'bg-dark-card border-border'}`}>
                                                <Smartphone size={11} className={d.id === deviceId ? 'text-jeedom-400' : 'text-content-secondary'} />
                                                <span className="flex-1 truncate text-content-primary">{d.deviceName}</span>
                                                {d.id === deviceId && <span className="text-[10px] text-jeedom-400">Cet appareil</span>}
                                                <span className="text-content-secondary opacity-60">{new Date(d.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Help text */}
                            <p className="text-xs text-content-secondary opacity-60">
                                Les notifications push fonctionnent même lorsque l'application est fermée, pour les règles configurées avec le canal "Notification" ou "Les deux".
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* Modal création/édition */}
            <AlertRuleModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingRule(undefined); }}
                onSave={handleSave}
                initialData={editingRule}
                commands={commands}
            />
        </div>
    );
};

export default AlertsTab;
