import React, { useState, useEffect } from 'react';
import { Dashboard } from '../types';
import IconSelector from './IconSelector';
import { X, Check, Image, Trash2 } from 'lucide-react';
import { uploadImage } from '../services/imageService';

interface DashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dashboard: Dashboard) => void;
    initialData?: Dashboard;
    imgbbApiKey?: string;
}

const DashboardModal: React.FC<DashboardModalProps> = ({ isOpen, onClose, onSave, initialData, imgbbApiKey }) => {
    const [dashboard, setDashboard] = useState<Dashboard>({
        id: '',
        name: '',
        icon: 'home'
    });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setDashboard(initialData);
        } else {
            setDashboard({
                id: crypto.randomUUID(),
                name: '',
                icon: 'home'
            });
        }
        setUploadError(null);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(dashboard);
        onClose();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const url = await uploadImage(file, imgbbApiKey);
            setDashboard(prev => ({ ...prev, backgroundImage: url }));
        } catch (err: any) {
            setUploadError(err.message || 'Erreur lors de l\'upload');
        } finally {
            setIsUploading(false);
            // Reset input so the user can select the same file again if they want to retry
            e.target.value = '';
        }
    };

    const handleRemoveImage = () => {
        setDashboard(prev => ({ ...prev, backgroundImage: undefined }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/60 backdrop-blur-sm">
            <div className="bg-dark-surface w-full max-w-md rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-dark-surface z-10">
                    <h2 className="text-xl font-bold text-content-primary">{initialData ? 'Modifier Dashboard' : 'Nouveau Dashboard'}</h2>
                    <button onClick={onClose} className="text-content-secondary hover:text-content-primary">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-1">Nom</label>
                        <input 
                            type="text" 
                            required
                            value={dashboard.name}
                            onChange={e => setDashboard({...dashboard, name: e.target.value})}
                            className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 focus:ring-2 focus:ring-jeedom-500 outline-none"
                            placeholder="Ex: Cuisine"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-2">Icone</label>
                        <IconSelector 
                            selectedIcon={dashboard.icon}
                            onSelect={(icon) => setDashboard({...dashboard, icon})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-2">Image de fond (Optionnel)</label>
                        
                        {dashboard.backgroundImage ? (
                            <div className="relative group rounded-lg overflow-hidden border border-border aspect-video bg-dark-bg">
                                <img src={dashboard.backgroundImage || undefined} alt="Background" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-dark-bg/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                        title="Supprimer l'image"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-jeedom-500/50 transition-colors bg-input-bg/50 relative">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    id="bg-upload"
                                />
                                {isUploading ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jeedom-500"></div>
                                ) : (
                                    <>
                                        <Image className="text-content-secondary mb-2" size={32} />
                                        <span className="text-sm font-medium text-content-primary">Cliquez pour uploader une image</span>
                                        <span className="text-xs text-content-secondary mt-1">Hébergé gratuitement via API</span>
                                    </>
                                )}
                            </div>
                        )}
                        {uploadError && <p className="text-red-400 text-xs mt-2">{uploadError}</p>}
                        
                        <div className="text-xs text-content-secondary mt-3 space-y-1 bg-dark-bg p-3 rounded-lg border border-border">
                            <p className="font-medium text-content-primary mb-1">Limitations :</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Taille maximale : <strong>5 Mo</strong>.</li>
                                <li>L'hébergement par défaut (Catbox) peut être bloqué par certains navigateurs (CORS).</li>
                                <li>Pour plus de fiabilité, ajoutez une <strong>clé API ImgBB</strong> dans les paramètres.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border sticky bottom-0 bg-dark-surface z-10">
                    <button 
                        onClick={handleSubmit}
                        className="w-full bg-jeedom-600 hover:bg-jeedom-500 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2"
                    >
                        <Check size={20} />
                        Valider
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardModal;