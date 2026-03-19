import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, Dashboard, WidgetConfig } from '../types';
import { testJeedomConnection } from '../services/jeedomService';
import { Save, X, Moon, Sun, Activity, RefreshCw, Download, Upload, FileJson, Wifi, WifiOff, Lock, CloudUpload, CloudDownload, LogIn, LogOut, Shield } from 'lucide-react';
import SettingsHealthTab from './SettingsHealthTab';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import KioskToggleButton from './KioskToggleButton';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSave: (settings: AppSettings) => void;
    dashboards?: Dashboard[];
    widgets?: WidgetConfig[];
    onImport?: (data: { settings?: AppSettings, dashboards?: Dashboard[], widgets?: WidgetConfig[] }, mode: 'replace' | 'merge') => void;
}

type Tab = 'general' | 'health' | 'data';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, dashboards, widgets, onImport }) => {
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [formData, setFormData] = useState<AppSettings>(settings);
    
    // Connection Test State
    const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState<string>('');
    const [isMixedContent, setIsMixedContent] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { login, logout, isAuthenticated, user, saveConfigToDrive, loadConfigFromDrive, isGapiLoaded } = useGoogleDrive();
    const [driveLoading, setDriveLoading] = useState(false);
    const [driveStatus, setDriveStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
    const [pendingImport, setPendingImport] = useState<{ settings?: AppSettings, dashboards?: Dashboard[], widgets?: WidgetConfig[] } | null>(null);
    const [importError, setImportError] = useState<string | null>(null);

    // Sync form data when settings change or modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(settings);
            setActiveTab('general'); // Reset to general tab on open
            setTestStatus('idle');
            setTestMessage('');
        }
    }, [isOpen, settings]);

    // Check for Mixed Content warning
    useEffect(() => {
        if (window.location.protocol === 'https:' && formData.jeedomUrl.trim().toLowerCase().startsWith('http:')) {
            setIsMixedContent(true);
        } else {
            setIsMixedContent(false);
        }
    }, [formData.jeedomUrl]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        
        // Auto-disable demo mode if typing in URL or API Key
        let newUseDemo = formData.useDemoMode;
        if ((name === 'jeedomUrl' || name === 'apiKey') && value.length > 0 && formData.useDemoMode) {
            newUseDemo = false;
        }
        if (name === 'useDemoMode') newUseDemo = checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            useDemoMode: newUseDemo
        }));
        
        // Reset test status on change
        if (name === 'jeedomUrl' || name === 'apiKey') {
            setTestStatus('idle');
        }
    };

    const toggleTheme = () => {
        setFormData(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleTestConnection = async () => {
        setTestStatus('loading');
        setTestMessage('');
        const result = await testJeedomConnection(formData);
        setTestStatus(result.success ? 'success' : 'error');
        setTestMessage(result.message);
    };

    // Export Logic
    const handleExport = () => {
        const data = {
            settings: formData,
            dashboards: dashboards || [],
            widgets: widgets || [],
            exportDate: new Date().toISOString(),
            version: 1
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `jeedom-connect-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Import Logic
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                setImportError(null);
                setPendingImport(json);
            } catch (err) {
                setImportError("Fichier invalide : impossible de lire le JSON.");
                console.error(err);
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const confirmImport = (mode: 'replace' | 'merge') => {
        if (pendingImport && onImport) {
            onImport(pendingImport, mode);
        }
        setPendingImport(null);
    };

    const handleSaveToDrive = async () => {
        setDriveLoading(true);
        setDriveStatus(null);
        try {
            const data = {
                settings: formData,
                dashboards: dashboards || [],
                widgets: widgets || [],
                exportDate: new Date().toISOString(),
                version: 1
            };
            await saveConfigToDrive(data);
            setDriveStatus({ message: "Configuration sauvegardée sur Google Drive !", type: 'success' });
        } catch (error) {
            setDriveStatus({ message: "Erreur lors de la sauvegarde sur Drive.", type: 'error' });
        } finally {
            setDriveLoading(false);
        }
    };

    const handleRestoreFromDrive = async () => {
        setDriveLoading(true);
        setDriveStatus(null);
        try {
            const data = await loadConfigFromDrive();
            if (data) {
                setPendingImport(data);
                setDriveStatus({ message: "Configuration chargée. Choisissez le mode d'import ci-dessous.", type: 'success' });
            }
        } catch (error) {
            setDriveStatus({ message: "Erreur lors de la restauration depuis Drive.", type: 'error' });
        } finally {
            setDriveLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/60 backdrop-blur-sm">
            <div className="bg-dark-surface w-full max-w-md rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex flex-col border-b border-border">
                    <div className="flex items-center justify-between p-6 pb-2">
                        <h2 className="text-xl font-bold text-content-primary">Paramètres</h2>
                        <button onClick={onClose} className="text-content-secondary hover:text-content-primary">
                            <X size={24} />
                        </button>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex px-6 gap-6">
                        <button 
                            onClick={() => setActiveTab('general')}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'general' ? 'text-jeedom-500' : 'text-content-secondary hover:text-content-primary'}`}
                        >
                            Général
                            {activeTab === 'general' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-jeedom-500 rounded-full" />}
                        </button>
                        <button 
                            onClick={() => setActiveTab('health')}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'health' ? 'text-jeedom-500' : 'text-content-secondary hover:text-content-primary'}`}
                        >
                            Santé
                            {activeTab === 'health' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-jeedom-500 rounded-full" />}
                        </button>
                        <button 
                            onClick={() => setActiveTab('data')}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'data' ? 'text-jeedom-500' : 'text-content-secondary hover:text-content-primary'}`}
                        >
                            Données
                            {activeTab === 'data' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-jeedom-500 rounded-full" />}
                        </button>
                    </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-dark-bg/50">
                    
                    {/* GENERAL TAB */}
                    {activeTab === 'general' && (
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Theme Switcher */}
                            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-input-bg">
                                <div className="flex flex-col">
                                    <span className="font-medium text-content-primary">Apparence</span>
                                    <span className="text-xs text-content-secondary">Choisir le thème de l'application</span>
                                </div>
                                <button 
                                    type="button"
                                    onClick={toggleTheme}
                                    className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${formData.theme === 'dark' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-orange-100 text-orange-600'}`}
                                >
                                    {formData.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                                    <span className="text-sm font-semibold capitalize">{formData.theme === 'dark' ? 'Sombre' : 'Clair'}</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-input-bg cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        name="useDemoMode"
                                        checked={formData.useDemoMode}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-jeedom-500 rounded focus:ring-jeedom-500 bg-input-bg border-border"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium text-content-primary">Mode Démo</span>
                                        <span className="block text-xs text-content-secondary">
                                            {formData.useDemoMode 
                                                ? "Données d'exemple. Décocher pour configurer votre propre Jeedom." 
                                                : "Cocher pour utiliser des données factices sans connexion."}
                                        </span>
                                    </div>
                                </label>

                                {/* Kiosk Mode Toggle */}
                                <div className="pt-2">
                                    <KioskToggleButton />
                                </div>
                            </div>

                            {!formData.useDemoMode && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">URL Jeedom</label>
                                        <input 
                                            type="text" 
                                            name="jeedomUrl"
                                            value={formData.jeedomUrl}
                                            onChange={handleChange}
                                            placeholder="Ex: http://192.168.1.20 ou https://mon.dns.com/jeedom"
                                            className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 focus:ring-2 focus:ring-jeedom-500 focus:border-transparent outline-none transition-all"
                                        />
                                        <p className="text-[10px] text-content-secondary mt-1 ml-1">
                                            Conseil : Si Jeedom est dans un sous-dossier, ajoutez-le (ex: /jeedom).
                                        </p>
                                        
                                        {isMixedContent && (
                                            <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-xs">
                                                <Lock size={14} className="mt-0.5 shrink-0" />
                                                <span>
                                                    <strong>Problème de sécurité :</strong> Vous tentez d'accéder à un site HTTP depuis une application HTTPS. Le navigateur bloquera probablement la connexion (Mixed Content). Utilisez HTTPS pour Jeedom ou accédez à cette application via HTTP.
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">Clé API (Core)</label>
                                        <input 
                                            type="password" 
                                            name="apiKey"
                                            value={formData.apiKey}
                                            onChange={handleChange}
                                            placeholder="Clé API Core"
                                            className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 focus:ring-2 focus:ring-jeedom-500 focus:border-transparent outline-none transition-all font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-content-secondary mb-1">Clé API ImgBB (Optionnel)</label>
                                        <input 
                                            type="password" 
                                            name="imgbbApiKey"
                                            value={formData.imgbbApiKey || ''}
                                            onChange={handleChange}
                                            placeholder="Clé API pour l'upload d'images"
                                            className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 focus:ring-2 focus:ring-jeedom-500 focus:border-transparent outline-none transition-all font-mono"
                                        />
                                        <p className="text-[10px] text-content-secondary mt-1 ml-1">
                                            Nécessaire pour uploader des images de fond. Obtenez-en une sur <a href="https://api.imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-jeedom-400 hover:underline">api.imgbb.com</a>.
                                        </p>
                                    </div>

                                    <label className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-input-bg cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            name="useWebSocket"
                                            checked={formData.useWebSocket !== false}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-jeedom-500 rounded focus:ring-jeedom-500 bg-input-bg border-border"
                                        />
                                        <div>
                                            <span className="block text-sm font-medium text-content-primary">Utiliser WebSocket</span>
                                            <span className="block text-xs text-content-secondary">
                                                {formData.useWebSocket !== false
                                                    ? "Connexion en temps réel activée. Décocher en cas de problème de connexion." 
                                                    : "Désactivé. L'application utilisera uniquement le rafraîchissement périodique."}
                                            </span>
                                        </div>
                                    </label>

                                    {/* Test Connection Button */}
                                    <div className="pt-2">
                                        <button 
                                            type="button"
                                            onClick={handleTestConnection}
                                            disabled={testStatus === 'loading' || !formData.jeedomUrl || !formData.apiKey}
                                            className={`w-full py-2.5 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm ${
                                                testStatus === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/50' :
                                                testStatus === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/50' :
                                                'bg-jeedom-600 text-white hover:bg-jeedom-500 border border-transparent shadow-jeedom-900/20'
                                            }`}
                                        >
                                            {testStatus === 'loading' ? <RefreshCw className="animate-spin" size={16} /> : 
                                             testStatus === 'success' ? <Wifi size={16} /> :
                                             testStatus === 'error' ? <WifiOff size={16} /> : <Activity size={16} />}
                                            
                                            {testStatus === 'loading' ? 'Connexion en cours...' : 'Tester la connexion'}
                                        </button>
                                        
                                        {testMessage && (
                                            <div className={`text-xs mt-3 p-3 rounded-xl bg-dark-card border leading-relaxed ${testStatus === 'success' ? 'border-green-500/20 text-green-400' : 'border-red-500/20 text-red-400'}`}>
                                                {testMessage}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-content-secondary mb-1">Intervalle de rafraîchissement (ms)</label>
                                <input 
                                    type="number" 
                                    name="refreshInterval"
                                    value={formData.refreshInterval}
                                    onChange={(e) => setFormData({...formData, refreshInterval: parseInt(e.target.value)})}
                                    className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 focus:ring-2 focus:ring-jeedom-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </form>
                    )}

                    {/* HEALTH TAB */}
                    {activeTab === 'health' && (
                        <SettingsHealthTab settings={formData} />
                    )}

                    {/* DATA TAB */}
                    {activeTab === 'data' && (
                        <div className="p-6 space-y-6">
                            <div className="bg-jeedom-500/10 border border-jeedom-500/30 rounded-xl p-4">
                                <div className="flex gap-3">
                                    <FileJson className="text-jeedom-500 shrink-0" />
                                    <div>
                                        <h3 className="font-medium text-content-primary text-sm">Stockage Local</h3>
                                        <p className="text-xs text-content-secondary mt-1">
                                            Votre configuration est automatiquement sauvegardée dans ce navigateur. Utilisez les options ci-dessous pour transférer vos données.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-content-primary mb-3">Sauvegarde</h4>
                                    <button 
                                        onClick={handleExport}
                                        className="w-full bg-dark-card hover:bg-input-bg border border-border text-content-primary py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Download size={18} />
                                        <span>Exporter la configuration (JSON)</span>
                                    </button>
                                    <p className="text-xs text-content-secondary mt-2 px-1">
                                        Télécharge un fichier contenant vos paramètres, dashboards et widgets. Gardez ce fichier en lieu sûr.
                                    </p>
                                </div>

                                <div className="border-t border-border pt-4">
                                    <h4 className="text-sm font-medium text-content-primary mb-3">Restauration</h4>
                                    <div className="relative">
                                        <input 
                                            ref={fileInputRef}
                                            type="file" 
                                            accept=".json"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="config-file-upload"
                                        />
                                        <label 
                                            htmlFor="config-file-upload"
                                            className="w-full bg-dark-card hover:bg-input-bg border border-border border-dashed text-content-primary py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                        >
                                            <Upload size={18} />
                                            <span>Importer une configuration</span>
                                        </label>
                                    </div>
                                    {importError && (
                                        <p className="mt-2 text-xs text-red-400 px-1">{importError}</p>
                                    )}
                                    {pendingImport ? (
                                        <div className="mt-3 p-3 rounded-xl border border-jeedom-500/40 bg-jeedom-500/10 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <p className="text-xs font-medium text-jeedom-500">Fichier chargé — comment l'appliquer ?</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => confirmImport('merge')}
                                                    className="flex-1 py-2 px-3 rounded-lg bg-jeedom-500 hover:bg-jeedom-400 text-white text-xs font-medium transition-colors"
                                                >
                                                    Fusionner
                                                </button>
                                                <button
                                                    onClick={() => confirmImport('replace')}
                                                    className="flex-1 py-2 px-3 rounded-lg bg-dark-card hover:bg-input-bg border border-orange-500/50 text-orange-400 text-xs font-medium transition-colors"
                                                >
                                                    Remplacer tout
                                                </button>
                                                <button
                                                    onClick={() => setPendingImport(null)}
                                                    className="py-2 px-3 rounded-lg bg-dark-card hover:bg-input-bg border border-border text-content-secondary text-xs transition-colors"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                            <p className="text-xs text-content-secondary">
                                                <span className="text-jeedom-500 font-medium">Fusionner</span> : ajoute les nouveaux dashboards/widgets sans toucher à l'existant.<br />
                                                <span className="text-orange-400 font-medium">Remplacer</span> : écrase toute la configuration actuelle.
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-content-secondary mt-2 px-1">
                                            Vous pourrez choisir de fusionner ou de remplacer après sélection du fichier.
                                        </p>
                                    )}
                                </div>

                                {/* Google Drive Sync Section */}
                                <div className="border-t border-border pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-medium text-content-primary">Google Drive Sync</h4>
                                        {!isAuthenticated ? (
                                            <button 
                                                onClick={login}
                                                className="text-xs flex items-center gap-1.5 text-jeedom-500 hover:text-jeedom-400 transition-colors"
                                            >
                                                <LogIn size={14} /> Connexion
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {user && (
                                                    <img 
                                                        src={user.picture || undefined} 
                                                        alt={user.name} 
                                                        className="w-5 h-5 rounded-full border border-border" 
                                                        title={user.email}
                                                    />
                                                )}
                                                <button 
                                                    onClick={logout}
                                                    className="text-xs flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    <LogOut size={14} /> Déconnexion
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isAuthenticated ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <button 
                                                    onClick={handleSaveToDrive}
                                                    disabled={driveLoading}
                                                    className="bg-dark-card hover:bg-input-bg border border-border text-content-primary py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50"
                                                >
                                                    {driveLoading ? <RefreshCw size={16} className="animate-spin" /> : <CloudUpload size={16} className="text-blue-400" />}
                                                    <span>Sauvegarder</span>
                                                </button>
                                                <button 
                                                    onClick={handleRestoreFromDrive}
                                                    disabled={driveLoading}
                                                    className="bg-dark-card hover:bg-input-bg border border-border text-content-primary py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50"
                                                >
                                                    {driveLoading ? <RefreshCw size={16} className="animate-spin" /> : <CloudDownload size={16} className="text-green-400" />}
                                                    <span>Restaurer</span>
                                                </button>
                                            </div>
                                            {driveStatus && (
                                                <div className={`text-[10px] p-2 rounded-lg text-center ${driveStatus.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {driveStatus.message}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-dark-card/50 border border-border border-dashed rounded-xl p-4 text-center">
                                            <p className="text-xs text-content-secondary">
                                                Connectez votre compte Google pour sauvegarder votre configuration dans le cloud.
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="mt-4 text-center">
                                        <button 
                                            onClick={() => setIsPrivacyPolicyOpen(true)}
                                            className="text-[10px] text-content-secondary hover:text-jeedom-500 underline transition-colors flex items-center justify-center gap-1 mx-auto"
                                        >
                                            <Shield size={10} />
                                            Politique de Confidentialité
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer (Only for General Tab) */}
                {activeTab === 'general' && (
                    <div className="p-6 border-t border-border flex flex-col gap-4">
                        <button 
                            onClick={handleSubmit}
                            className="w-full bg-jeedom-600 hover:bg-jeedom-500 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-jeedom-900/20"
                        >
                            <Save size={20} />
                            Enregistrer
                        </button>
                    </div>
                )}
                {activeTab === 'health' && (
                    <div className="p-6 border-t border-border flex justify-center">
                        <div className="text-center text-xs text-content-secondary">
                           État du système Jeedom à {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                )}
                {activeTab === 'data' && (
                    <div className="p-6 border-t border-border flex justify-center">
                         <div className="text-center text-xs text-content-secondary">
                           Version de configuration : v1
                        </div>
                    </div>
                )}
            </div>
            
            <PrivacyPolicyModal 
                isOpen={isPrivacyPolicyOpen} 
                onClose={() => setIsPrivacyPolicyOpen(false)} 
            />
        </div>
    );
};

export default SettingsModal;