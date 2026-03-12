import React, { useState, useEffect } from 'react';
import { AppSettings, JeedomHealthItem } from '../types';
import { fetchJeedomHealth, getJeedomUsbMapping, jeedomReboot, jeedomHalt, jeedomUpdate, jeedomBackup } from '../services/jeedomService';
import { Activity, Usb, RefreshCw, Power, Save, CheckCircle, AlertTriangle, XCircle, Database, HardDrive, Cpu, Clock, Network, ArrowUpCircle } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface SettingsHealthTabProps {
    settings: AppSettings;
}

const SettingsHealthTab: React.FC<SettingsHealthTabProps> = ({ settings }) => {
    const [healthData, setHealthData] = useState<JeedomHealthItem[]>([]);
    const [usbMapping, setUsbMapping] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    
    // Action States
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: 'reboot' | 'halt' | 'update' | 'backup', title: string, message: string } | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [health, usb] = await Promise.all([
                fetchJeedomHealth(settings),
                getJeedomUsbMapping(settings)
            ]);
            setHealthData(health);
            setUsbMapping(usb);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [settings]);

    const handleAction = async () => {
        if (!confirmAction) return;
        
        const actionType = confirmAction.type;
        // Close modal first
        // Note: ConfirmationModal handles closing itself, but we need to clear state
        // Actually ConfirmationModal calls onConfirm then onClose. 
        // We should clear the confirmAction state in the onClose prop of the modal.
        
        setActionLoading(actionType);

        try {
            switch (actionType) {
                case 'reboot':
                    await jeedomReboot(settings);
                    break;
                case 'halt':
                    await jeedomHalt(settings);
                    break;
                case 'update':
                    await jeedomUpdate(settings);
                    break;
                case 'backup':
                    await jeedomBackup(settings);
                    break;
            }
        } catch (e) {
            console.error(`Action ${actionType} failed:`, e);
            alert(`L'action ${actionType} a échoué.`);
        } finally {
            setActionLoading(null);
            setConfirmAction(null); // Clear modal state
        }
    };

    // Helper for icons
    const getHealthIcon = (type: JeedomHealthItem['type']) => {
        switch(type) {
            case 'database': return <Database size={18} />;
            case 'filesystem': return <HardDrive size={18} />;
            case 'cpu': return <Cpu size={18} />;
            case 'date': return <Clock size={18} />;
            case 'network': return <Network size={18} />;
            default: return <Activity size={18} />;
        }
    };

    const getStatusColor = (state: string) => {
        if (state === 'OK') return 'text-green-500 bg-green-500/10';
        if (state === 'WARNING') return 'text-orange-500 bg-orange-500/10';
        return 'text-red-500 bg-red-500/10';
    };

    const getStatusIcon = (state: string) => {
        if (state === 'OK') return <CheckCircle size={16} />;
        if (state === 'WARNING') return <AlertTriangle size={16} />;
        return <XCircle size={16} />;
    };

    // Global Status
    const globalStatus = healthData.find(h => h.id === 'jeedom' || h.id === 'system')?.state || 
                         (healthData.length > 0 && healthData.every(h => h.state === 'OK') ? 'OK' : 'WARNING');

    return (
        <div className="p-6 space-y-8">
            {/* Global Status Header */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
                globalStatus === 'OK' ? 'bg-green-500/5 border-green-500/20' : 
                globalStatus === 'WARNING' ? 'bg-orange-500/5 border-orange-500/20' : 
                'bg-red-500/5 border-red-500/20'
            }`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                        globalStatus === 'OK' ? 'bg-green-500 text-white' : 
                        globalStatus === 'WARNING' ? 'bg-orange-500 text-white' : 
                        'bg-red-500 text-white'
                    }`}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-content-primary">Système Jeedom</h3>
                        <p className="text-sm text-content-secondary">
                            {loading ? 'Analyse en cours...' : 
                             globalStatus === 'OK' ? 'Tout fonctionne correctement' : 
                             'Attention requise'}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={loadData} 
                    disabled={loading}
                    className="p-2 text-content-secondary hover:text-jeedom-500 transition-colors rounded-lg hover:bg-jeedom-500/10"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Health Details List */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-content-secondary uppercase tracking-wider mb-2">Détails de Santé</h4>
                {loading && healthData.length === 0 ? (
                    <div className="text-center py-4 text-content-secondary">Chargement...</div>
                ) : (
                    healthData.map((item) => (
                        <div key={item.id} className="bg-input-bg border border-border rounded-xl p-3 flex items-start gap-3">
                            <div className="p-2 bg-dark-surface rounded-lg text-content-secondary">
                                {getHealthIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-content-primary truncate">{item.name}</span>
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(item.state)}`}>
                                        {getStatusIcon(item.state)}
                                        <span>{item.state}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-content-secondary break-words">{item.details}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* USB Mapping */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-content-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Usb size={16} /> Ports USB
                </h4>
                <div className="bg-input-bg border border-border rounded-xl overflow-hidden">
                    {Object.keys(usbMapping).length === 0 ? (
                        <div className="p-4 text-center text-xs text-content-secondary">Aucun périphérique USB détecté ou information indisponible.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-dark-surface text-content-secondary text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-2 font-medium">Port</th>
                                    <th className="px-4 py-2 font-medium">Périphérique</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {Object.entries(usbMapping).map(([port, device]) => (
                                    <tr key={port}>
                                        <td className="px-4 py-2 font-mono text-xs text-jeedom-400">{port}</td>
                                        <td className="px-4 py-2 text-content-primary">{device}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Maintenance Actions */}
            <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-content-secondary uppercase tracking-wider mb-2">Actions de Maintenance</h4>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setConfirmAction({
                            type: 'reboot',
                            title: 'Redémarrer Jeedom ?',
                            message: 'Êtes-vous sûr de vouloir redémarrer votre box Jeedom ? Le système sera inaccessible pendant plusieurs minutes.'
                        })}
                        disabled={!!actionLoading}
                        className="p-3 bg-dark-card border border-border hover:border-orange-500/50 hover:bg-orange-500/5 rounded-xl flex flex-col items-center gap-2 transition-all group"
                    >
                        <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                            {actionLoading === 'reboot' ? <RefreshCw className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                        </div>
                        <span className="text-xs font-medium text-content-primary">Redémarrer</span>
                    </button>

                    <button
                        onClick={() => setConfirmAction({
                            type: 'halt',
                            title: 'Éteindre Jeedom ?',
                            message: 'Êtes-vous sûr de vouloir éteindre votre box Jeedom ? Vous devrez la rallumer physiquement.'
                        })}
                        disabled={!!actionLoading}
                        className="p-3 bg-dark-card border border-border hover:border-red-500/50 hover:bg-red-500/5 rounded-xl flex flex-col items-center gap-2 transition-all group"
                    >
                        <div className="p-2 bg-red-500/10 text-red-500 rounded-lg group-hover:scale-110 transition-transform">
                            {actionLoading === 'halt' ? <RefreshCw className="animate-spin" size={20} /> : <Power size={20} />}
                        </div>
                        <span className="text-xs font-medium text-content-primary">Éteindre</span>
                    </button>

                    <button
                        onClick={() => setConfirmAction({
                            type: 'update',
                            title: 'Mettre à jour Jeedom ?',
                            message: 'Voulez-vous lancer la mise à jour du core Jeedom ? Assurez-vous d\'avoir une sauvegarde récente.'
                        })}
                        disabled={!!actionLoading}
                        className="p-3 bg-dark-card border border-border hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl flex flex-col items-center gap-2 transition-all group"
                    >
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                            {actionLoading === 'update' ? <RefreshCw className="animate-spin" size={20} /> : <ArrowUpCircle size={20} />}
                        </div>
                        <span className="text-xs font-medium text-content-primary">Mise à jour</span>
                    </button>

                    <button
                        onClick={() => setConfirmAction({
                            type: 'backup',
                            title: 'Lancer une sauvegarde ?',
                            message: 'Voulez-vous lancer une sauvegarde manuelle de Jeedom ? Cela peut prendre du temps.'
                        })}
                        disabled={!!actionLoading}
                        className="p-3 bg-dark-card border border-border hover:border-green-500/50 hover:bg-green-500/5 rounded-xl flex flex-col items-center gap-2 transition-all group"
                    >
                        <div className="p-2 bg-green-500/10 text-green-500 rounded-lg group-hover:scale-110 transition-transform">
                            {actionLoading === 'backup' ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                        </div>
                        <span className="text-xs font-medium text-content-primary">Sauvegarde</span>
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmAction && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={() => setConfirmAction(null)}
                    onConfirm={handleAction}
                    title={confirmAction.title}
                    message={confirmAction.message}
                    confirmLabel="Confirmer"
                    cancelLabel="Annuler"
                />
            )}
        </div>
    );
};

export default SettingsHealthTab;
