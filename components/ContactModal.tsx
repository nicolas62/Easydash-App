import React, { useState } from 'react';
import { X, Send, MessageSquare, Bug, Lightbulb, Mail } from 'lucide-react';
import { APP_VERSION } from '../constants';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const [type, setType] = useState<'support' | 'suggestion'>('support');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Construction du lien mailto
        const subject = encodeURIComponent(`[EasyDash] ${type === 'support' ? 'Support' : 'Suggestion'} - v${APP_VERSION}`);
        const body = encodeURIComponent(`Type: ${type.toUpperCase()}\nEmail contact: ${email}\n\nMessage:\n${message}\n\n--\nEnvoyé depuis EasyDash Web App v${APP_VERSION}`);
        
        // Adresse email du développeur
        const recipient = "easydash.l701w@silomails.com"; 
        
        window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
        
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-dark-bg/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-dark-surface w-full max-w-md rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-dark-surface/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
                        <Mail className="text-jeedom-500" size={20} />
                        Contact & Support
                    </h2>
                    <button onClick={onClose} className="text-content-secondary hover:text-content-primary p-1 hover:bg-input-bg rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                    
                    {/* Type Selector */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setType('support')}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                                type === 'support' 
                                ? 'bg-jeedom-600/20 border-jeedom-500 text-jeedom-500' 
                                : 'bg-input-bg border-border text-content-secondary hover:bg-dark-card'
                            }`}
                        >
                            <Bug size={20} />
                            <span className="text-sm font-medium">Support / Bug</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('suggestion')}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                                type === 'suggestion' 
                                ? 'bg-jeedom-600/20 border-jeedom-500 text-jeedom-500' 
                                : 'bg-input-bg border-border text-content-secondary hover:bg-dark-card'
                            }`}
                        >
                            <Lightbulb size={20} />
                            <span className="text-sm font-medium">Suggestion</span>
                        </button>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-1">Votre Email (pour réponse)</label>
                        <div className="relative">
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 pl-10 focus:ring-2 focus:ring-jeedom-500 outline-none transition-all"
                                placeholder="nom@exemple.com"
                            />
                            <Mail className="absolute left-3 top-3.5 text-content-secondary" size={16} />
                        </div>
                    </div>

                    {/* Message Input */}
                    <div>
                        <label className="block text-sm font-medium text-content-secondary mb-1">Message</label>
                        <div className="relative">
                            <textarea 
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-input-bg border border-border text-content-primary rounded-lg p-3 pl-10 h-32 resize-none focus:ring-2 focus:ring-jeedom-500 outline-none transition-all custom-scrollbar"
                                placeholder={type === 'support' ? "Décrivez le problème rencontré..." : "Quelle est votre idée ?"}
                            />
                            <MessageSquare className="absolute left-3 top-3.5 text-content-secondary" size={16} />
                        </div>
                    </div>

                    <div className="bg-jeedom-500/10 border border-jeedom-500/20 rounded-lg p-3 text-xs text-content-secondary">
                        En cliquant sur envoyer, votre client mail par défaut s'ouvrira avec les informations pré-remplies.
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-dark-surface/50 rounded-b-2xl">
                    <button 
                        onClick={handleSubmit}
                        className="w-full bg-jeedom-600 hover:bg-jeedom-500 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-jeedom-900/20"
                    >
                        <Send size={18} />
                        Envoyer l'email
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactModal;