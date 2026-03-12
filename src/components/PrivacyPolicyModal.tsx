import React from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark-bg/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-dark-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300">
                
                <div className="flex items-center justify-between p-6 border-b border-border bg-dark-surface/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
                        <Shield className="text-jeedom-500" size={24} />
                        Politique de Confidentialité
                    </h2>
                    <button onClick={onClose} className="text-content-secondary hover:text-content-primary p-1 hover:bg-input-bg rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar text-content-secondary space-y-6 text-sm leading-relaxed">
                    <div>
                        <h3 className="text-lg font-bold text-content-primary mb-2">Politique de Confidentialité de EasyDash</h3>
                        <p className="font-medium text-jeedom-400">Dernière mise à jour : 03 Mars 2026</p>
                        <p className="mt-2">
                            L'application <strong>EasyDash</strong> ("nous", "notre", "l'application") est un tableau de bord (Dashboard) pour la solution domotique Jeedom. Nous prenons votre vie privée très au sérieux. Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre fonctionnalité de sauvegarde sur Google Drive.
                        </p>
                    </div>

                    <section>
                        <h4 className="text-base font-bold text-content-primary mb-2">1. Données collectées</h4>
                        <p>EasyDash est une application qui fonctionne principalement localement dans votre navigateur ("Client-Side"). Nous ne possédons pas de serveurs backend pour stocker vos données personnelles.</p>
                        <p className="mt-2">Lorsque vous choisissez de connecter votre compte Google à EasyDash, nous accédons aux informations suivantes via les services d'authentification de Google (OAuth) :</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li><strong>Informations de base du profil :</strong> Votre nom et votre photo de profil (uniquement pour l'affichage dans l'interface des paramètres).</li>
                            <li><strong>Adresse e-mail :</strong> Pour identifier votre session de sauvegarde.</li>
                        </ul>
                    </section>

                    <section>
                        <h4 className="text-base font-bold text-content-primary mb-2">2. Utilisation des données Google Drive</h4>
                        <p>L'application demande l'accès à votre Google Drive avec une portée restreinte ("Scope") spécifique : <code className="bg-input-bg px-1 py-0.5 rounded text-xs font-mono">https://www.googleapis.com/auth/drive.file</code>.</p>
                        <p className="mt-2">Cela signifie que :</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li><strong>Nous N'AVONS PAS accès</strong> à l'ensemble de votre Google Drive.</li>
                            <li><strong>Nous N'AVONS PAS accès</strong> à vos photos, documents personnels ou fichiers créés par d'autres applications.</li>
                            <li><strong>Nous avons UNIQUEMENT accès</strong> aux fichiers et dossiers que <strong>EasyDash a créés lui-même</strong>.</li>
                        </ul>
                        <p className="mt-2">Nous utilisons cet accès exclusivement pour :</p>
                        <ol className="list-decimal pl-5 mt-1 space-y-1">
                            <li>Créer un fichier de configuration (<code className="bg-input-bg px-1 py-0.5 rounded text-xs font-mono">easydash_config.json</code>) contenant vos paramètres de dashboard.</li>
                            <li>Mettre à jour ce fichier spécifique lorsque vous cliquez sur "Sauvegarder".</li>
                            <li>Lire ce fichier spécifique lorsque vous cliquez sur "Restaurer".</li>
                        </ol>
                    </section>

                    <section>
                        <h4 className="text-base font-bold text-content-primary mb-2">3. Partage et divulgation des données</h4>
                        <p>Vos données de configuration (adresse IP de Jeedom, clés API, agencement des widgets) sont :</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Stockées localement dans le stockage de votre navigateur (<code className="bg-input-bg px-1 py-0.5 rounded text-xs font-mono">localStorage</code>).</li>
                            <li>Transférées directement de votre navigateur vers les serveurs de Google (Google Drive) via une connexion sécurisée (HTTPS).</li>
                        </ul>
                        <p className="mt-2"><strong>Nous ne vendons, n'échangeons, ni ne transférons vos informations personnelles à des tiers.</strong> L'application n'envoie aucune donnée sur des serveurs autres que ceux de Google (pour la sauvegarde) et votre propre instance Jeedom (pour la domotique).</p>
                    </section>

                    <section>
                        <h4 className="text-base font-bold text-content-primary mb-2">4. Conformité aux règles de données utilisateur de Google (Limited Use Policy)</h4>
                        <p>L'utilisation par EasyDash des informations reçues des API Google, ainsi que leur transfert vers toute autre application, respectera la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-jeedom-400 hover:underline">Politique relative aux données utilisateur des services API Google</a>, y compris les exigences d'utilisation limitée ("Limited Use requirements").</p>
                    </section>

                    <section>
                        <h4 className="text-base font-bold text-content-primary mb-2">5. Sécurité</h4>
                        <p>La sécurité de vos données est primordiale. L'échange de données se fait directement entre votre appareil et les services de Google via des protocoles chiffrés standards. Les jetons d'accès (Tokens) sont stockés temporairement dans votre navigateur et ne sont jamais enregistrés sur nos serveurs (puisque nous n'en avons pas).</p>
                    </section>

                    <section>
                        <h4 className="text-base font-bold text-content-primary mb-2">6. Vos droits</h4>
                        <p>Vous pouvez à tout moment révoquer l'accès de EasyDash à votre compte Google en visitant la page des <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-jeedom-400 hover:underline">paramètres de sécurité de votre compte Google</a>. Cela empêchera l'application d'accéder à votre Drive, mais ne supprimera pas les fichiers de sauvegarde déjà créés.</p>
                    </section>

                    <section>
                        <h4 className="text-base font-bold text-content-primary mb-2">7. Contact</h4>
                        <p>Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter via le formulaire de contact.</p>
                    </section>
                </div>

                <div className="p-4 border-t border-border bg-dark-surface/50 rounded-b-2xl text-center">
                    <button 
                        onClick={onClose}
                        className="text-sm text-content-secondary hover:text-content-primary transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyModal;
