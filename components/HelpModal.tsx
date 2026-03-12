import React from 'react';
import { X, LayoutDashboard, PlusSquare, ToggleLeft, Activity, MousePointerClick, Edit3, Database, Workflow, Play, Power, Star, Settings, RotateCw, Layers, Smartphone, HelpCircle, Cloud, Cookie, AlertTriangle, Wrench } from 'lucide-react';
import { APP_VERSION } from '../constants';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-dark-bg/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-dark-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-dark-surface/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
                        <span className="bg-jeedom-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">?</span>
                        Aide & Documentation
                    </h2>
                    <button onClick={onClose} className="text-content-secondary hover:text-content-primary p-1 hover:bg-input-bg rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 text-content-primary">
                    
                    {/* Intro */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-jeedom-500">
                            🏠 Bienvenue sur votre Tableau de Bord !
                        </h3>
                        <p className="text-content-secondary leading-relaxed">
                            Ce tableau de bord vous permet de contrôler et de surveiller la maison en temps réel. Dès qu'un équipement change d'état (une lumière qui s'allume, une température qui monte), l'écran se met à jour instantanément !
                        </p>
                        <p className="text-content-secondary">
                            Voici un petit guide pour vous aider à utiliser toutes les fonctionnalités.
                        </p>
                    </section>

                    {/* Installation Mobile */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-jeedom-500">
                            <Smartphone size={20} />
                            Installer l'application sur votre téléphone
                        </h3>
                        <div className="bg-input-bg border border-border rounded-xl p-4 text-sm space-y-4">
                            <p>Pour un accès plus rapide, vous pouvez installer ce tableau de bord comme une vraie application sur votre smartphone (sans avoir à ouvrir le navigateur à chaque fois) :</p>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-dark-card p-3 rounded-lg border border-border/50">
                                    <h4 className="font-bold text-content-primary mb-2">🍎 Sur iPhone / iPad (Safari) :</h4>
                                    <ol className="list-decimal list-inside text-content-secondary space-y-1 ml-1 text-xs">
                                        <li>Touchez l'icône de <strong>Partage</strong> (le carré avec une flèche vers le haut, en bas de l'écran).</li>
                                        <li>Descendez et choisissez <strong>"Sur l'écran d'accueil"</strong>.</li>
                                        <li>Confirmez en touchant <strong>"Ajouter"</strong>.</li>
                                    </ol>
                                </div>
                                <div className="bg-dark-card p-3 rounded-lg border border-border/50">
                                    <h4 className="font-bold text-content-primary mb-2">🤖 Sur Android (Chrome) :</h4>
                                    <ol className="list-decimal list-inside text-content-secondary space-y-1 ml-1 text-xs">
                                        <li>Touchez les <strong>3 petits points</strong> en haut à droite.</li>
                                        <li>Choisissez <strong>"Ajouter à l'écran d'accueil"</strong> (ou "Installer l'application").</li>
                                        <li>Suivez les instructions à l'écran.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Widgets Guide */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-jeedom-500">
                            <LayoutDashboard size={20} />
                            Comment utiliser les Widgets ?
                        </h3>
                        <div className="bg-input-bg border border-border rounded-xl p-4 text-sm space-y-3">
                            <p className="mb-2">Votre écran est composé de plusieurs "blocs" appelés widgets. Voici comment ils fonctionnent :</p>
                            <ul className="space-y-2 text-content-secondary">
                                <li className="flex gap-2">
                                    <span className="text-lg">💡</span>
                                    <span><strong>Interrupteurs et Prises :</strong> Un simple clic sur le bouton permet d'allumer ou d'éteindre l'équipement. L'icône change de couleur quand c'est allumé.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-lg">🌡️</span>
                                    <span><strong>Thermostat :</strong> Affiche la température actuelle en grand. Utilisez les petits boutons + et - pour ajuster la température souhaitée (la consigne). La couleur du widget peut changer selon si le chauffage/clim est en route !</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-lg">📷</span>
                                    <span><strong>Caméra :</strong> Affiche la vue en direct. Si la fonctionnalité est activée, cliquez sur l'image pour la voir en plein écran.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-lg">📈</span>
                                    <span><strong>Graphiques :</strong> Ces blocs vous montrent l'historique d'une donnée (comme la température de la journée). Selon la configuration, vous verrez une courbe continue ou des barres regroupées par jour.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-lg">☀️</span>
                                    <span><strong>Météo :</strong> Vous donne les conditions actuelles et les prévisions (températures minimales et maximales) en un clin d'œil.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Google Drive Backup */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-jeedom-500">
                            <Cloud size={20} />
                            Sauvegarde et Restauration (Google Drive)
                        </h3>
                        <div className="bg-input-bg border border-border rounded-xl p-4 text-sm space-y-3">
                            <p>Vous avez passé du temps à organiser vos widgets parfaitement ? Vous pouvez sauvegarder votre configuration !</p>
                            <ol className="list-decimal list-inside text-content-secondary space-y-1 ml-1">
                                <li>Allez dans les paramètres et cliquez sur <strong>"Sauvegarder sur Google Drive"</strong>.</li>
                                <li>Une fenêtre Google va s'ouvrir pour vous demander de vous connecter.</li>
                            </ol>
                            
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-xs text-orange-200 flex gap-2 items-start">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                <div>
                                    <strong>⚠️ Attention - Message de sécurité Google :</strong>
                                    <p className="mt-1 opacity-90">
                                        Comme il s'agit d'une application privée et familiale, Google affichera un avertissement rouge indiquant que "Google n'a pas validé cette application". C'est tout à fait normal !
                                    </p>
                                    <ul className="list-disc list-inside mt-1 ml-1 opacity-80">
                                        <li>Cliquez sur le lien en bas <strong>"Paramètres avancés"</strong>.</li>
                                        <li>Puis cliquez sur <strong>"Accéder à l'application (non sécurisé)"</strong>.</li>
                                    </ul>
                                </div>
                            </div>

                            <p className="text-xs text-content-secondary mt-2 italic">
                                L'application ne lira jamais vos emails ou vos fichiers personnels. Elle a uniquement l'autorisation de créer un petit fichier de configuration caché pour sauvegarder l'ordre de vos widgets.
                            </p>
                        </div>
                    </section>

                    {/* Privacy & Cookies */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-jeedom-500">
                            <Cookie size={20} />
                            Vie privée et Cookies
                        </h3>
                        <div className="bg-input-bg border border-border rounded-xl p-4 text-sm space-y-2">
                            <p className="text-content-secondary">
                                Nous utilisons un outil statistique (Google Analytics) de manière totalement anonyme pour comprendre comment le tableau de bord est utilisé et l'améliorer.
                            </p>
                            <p className="text-content-secondary">
                                Un bandeau s'affiche en bas de votre écran lors de votre première visite : vous êtes totalement libre de cliquer sur "Accepter" ou "Refuser". Cela ne bloquera en aucun cas le fonctionnement de la maison !
                            </p>
                        </div>
                    </section>

                    {/* Troubleshooting */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-jeedom-500">
                            <Wrench size={20} />
                            Dépannage rapide
                        </h3>
                        <div className="bg-input-bg border border-border rounded-xl p-4 text-sm space-y-3">
                            <p className="mb-2">Un petit souci ? Voici les solutions aux problèmes les plus courants :</p>
                            <ul className="space-y-3 text-content-secondary">
                                <li>
                                    <strong>L'écran ne répond plus ou affiche des valeurs bizarres :</strong> Si la connexion internet saute, le tableau de bord essaiera de se reconnecter tout seul. Si rien ne bouge après quelques secondes, rechargez simplement la page (glissez votre doigt vers le bas sur mobile).
                                </li>
                                <li>
                                    <strong>Écran noir après une mise à jour :</strong> Si nous avons fait une mise à jour du système et que votre écran reste noir, c'est que votre téléphone a gardé l'ancienne version en mémoire. Rafraîchissez la page une ou deux fois, ou videz le cache de votre navigateur.
                                </li>
                                <li>
                                    <strong>Un widget a disparu :</strong> Vérifiez dans les paramètres (l'icône engrenage) si vous ne l'avez pas masqué par erreur.
                                </li>
                                <li>
                                    <strong>Connexion impossible depuis l'extérieur :</strong> Si vous utilisez l'application en dehors de chez vous (4G/5G), assurez-vous d'avoir ouvert les ports <strong>HTTPS (443)</strong> pour l'interface et <strong>RPC (8012)</strong> pour le temps réel sur votre box internet.
                                </li>
                            </ul>
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-dark-surface/50 rounded-b-2xl">
                    <button 
                        onClick={onClose}
                        className="w-full bg-jeedom-600 hover:bg-jeedom-500 text-white py-3 rounded-xl font-medium transition-colors"
                    >
                        J'ai compris
                    </button>
                    <div className="mt-4 text-center">
                        <span className="text-[10px] text-content-secondary font-medium opacity-60">
                            © <a href="https://www.gauthier-nicolas.fr" target="_blank" rel="noopener noreferrer" className="hover:text-jeedom-500 transition-colors">Gauthier Nicolas</a> - v{APP_VERSION}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;