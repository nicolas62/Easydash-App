import React from 'react';
import { X, LayoutDashboard, Smartphone, Cloud, Cookie, AlertTriangle, Wrench, Bell, ShieldCheck, SlidersHorizontal, BarChart2, Clapperboard, Wifi } from 'lucide-react';
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
                    </section>

                    {/* Vie privée & stockage — mis en avant */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-jeedom-500">
                            <ShieldCheck size={20} />
                            Vie privée & stockage des données
                        </h3>
                        <div className="bg-input-bg border border-border rounded-xl p-4 text-sm space-y-3">
                            <p className="text-content-secondary leading-relaxed">
                                EasyDash est conçu pour ne <strong className="text-content-primary">rien stocker côté serveur</strong>. Toute votre configuration (dashboards, widgets, règles d'alerte, historique) est conservée <strong className="text-content-primary">uniquement dans le stockage local de votre navigateur</strong> (localStorage). Aucune donnée personnelle ne transite ni n'est stockée sur nos serveurs.
                            </p>

                            <div className="grid md:grid-cols-2 gap-3 text-xs">
                                <div className="bg-dark-card border border-green-500/20 rounded-lg p-3 space-y-1">
                                    <p className="font-semibold text-green-400">✅ Stocké uniquement chez vous</p>
                                    <ul className="text-content-secondary space-y-0.5 list-disc list-inside ml-1">
                                        <li>Dashboards & widgets</li>
                                        <li>URL et clé API Jeedom</li>
                                        <li>Règles d'alerte</li>
                                        <li>Historique des alertes</li>
                                        <li>Préférences & paramètres</li>
                                    </ul>
                                </div>
                                <div className="bg-dark-card border border-orange-500/20 rounded-lg p-3 space-y-1">
                                    <p className="font-semibold text-orange-400">⚠️ Exception : notifications push</p>
                                    <p className="text-content-secondary leading-relaxed">
                                        Si vous activez les <strong>notifications push</strong>, votre navigateur génère un <em>endpoint</em> unique (URL anonyme fournie par Google/Mozilla/Apple) stocké dans le fichier <code className="bg-dark-surface px-1 rounded">subscriptions.json</code> sur le serveur.
                                        Ce fichier ne contient <strong>aucun nom, email ni donnée personnelle</strong> — uniquement des identifiants techniques nécessaires à l'envoi des notifications. Vous pouvez vous désabonner à tout moment depuis l'onglet <strong>Alertes → Push</strong>.
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-content-secondary italic">
                                La clé API Jeedom est chiffrée (AES-GCM) avant d'être sauvegardée dans votre navigateur. Elle ne quitte jamais votre appareil en clair.
                            </p>
                        </div>
                    </section>

                    {/* Installation Mobile */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-jeedom-500">
                            <Smartphone size={20} />
                            Installer l'application sur votre téléphone
                        </h3>
                        <div className="bg-input-bg border border-border rounded-xl p-4 text-sm space-y-4">
                            <p>Pour un accès plus rapide, installez EasyDash comme une vraie application sur votre smartphone :</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-dark-card p-3 rounded-lg border border-border/50">
                                    <h4 className="font-bold text-content-primary mb-2">🍎 Sur iPhone / iPad (Safari) :</h4>
                                    <ol className="list-decimal list-inside text-content-secondary space-y-1 ml-1 text-xs">
                                        <li>Touchez l'icône de <strong>Partage</strong> (carré avec flèche, en bas).</li>
                                        <li>Choisissez <strong>"Sur l'écran d'accueil"</strong>.</li>
                                        <li>Confirmez en touchant <strong>"Ajouter"</strong>.</li>
                                    </ol>
                                </div>
                                <div className="bg-dark-card p-3 rounded-lg border border-border/50">
                                    <h4 className="font-bold text-content-primary mb-2">🤖 Sur Android (Chrome) :</h4>
                                    <ol className="list-decimal list-inside text-content-secondary space-y-1 ml-1 text-xs">
                                        <li>Touchez les <strong>3 petits points</strong> en haut à droite.</li>
                                        <li>Choisissez <strong>"Ajouter à l'écran d'accueil"</strong>.</li>
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
                            <p>Votre écran est composé de "blocs" appelés widgets. Voici comment ils fonctionnent :</p>
                            <ul className="space-y-2 text-content-secondary">
                                <li className="flex gap-2">
                                    <span className="text-lg">💡</span>
                                    <span><strong>Interrupteurs et Prises :</strong> Un clic allume ou éteint. L'icône change de couleur quand c'est actif.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-lg">🌡️</span>
                                    <span><strong>Thermostat :</strong> Affiche la température actuelle. Utilisez + et − pour ajuster la consigne.</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <SlidersHorizontal size={16} className="text-jeedom-500 mt-0.5 shrink-0" />
                                    <span><strong>Slider :</strong> Curseur pour ajuster une valeur numérique (luminosité, volet, volume…). La valeur se met à jour en temps réel via WebSocket et est envoyée à Jeedom au relâchement.</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <Clapperboard size={16} className="text-jeedom-500 mt-0.5 shrink-0" />
                                    <span><strong>Caméra :</strong> Affiche la vue en direct. En mode proxy, l'image transite par le serveur pour ne jamais exposer votre clé API dans le navigateur.</span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <BarChart2 size={16} className="text-jeedom-500 mt-0.5 shrink-0" />
                                    <span><strong>Graphiques :</strong> Historique d'une donnée sur 24h, 7j ou 30j avec sélection de période personnalisée.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-lg">☀️</span>
                                    <span><strong>Météo :</strong> Conditions actuelles et prévisions min/max en un coup d'œil.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Alertes & Notifications */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-jeedom-500">
                            <Bell size={20} />
                            Alertes & Notifications Push
                        </h3>
                        <div className="bg-input-bg border border-border rounded-xl p-4 text-sm space-y-3">
                            <p className="text-content-secondary leading-relaxed">
                                Le système d'alertes vous permet de surveiller n'importe quelle commande Jeedom et de recevoir une notification dès qu'un seuil est franchi — même lorsque l'application est fermée.
                            </p>

                            <div className="space-y-2 text-content-secondary">
                                <p className="font-semibold text-content-primary text-xs uppercase tracking-wide">Créer une règle (Paramètres → Alertes → Règles)</p>
                                <ul className="space-y-1.5 list-disc list-inside ml-1 text-xs">
                                    <li><strong>Commande :</strong> choisissez le capteur à surveiller (température, humidité, présence…).</li>
                                    <li><strong>Condition :</strong> supérieur à, inférieur à, égal à, ou changement de valeur.</li>
                                    <li><strong>Seuil & hystérésis :</strong> évite les fausses alertes répétées autour d'une valeur limite.</li>
                                    <li><strong>Plage horaire :</strong> la règle ne se déclenche que pendant la période définie (ex : uniquement la nuit).</li>
                                    <li><strong>Cooldown :</strong> délai minimum entre deux alertes successives.</li>
                                    <li><strong>Canal :</strong> <em>Toast</em> (bandeau dans l'app), <em>Notification</em> (push même app fermée), ou <em>Les deux</em>.</li>
                                </ul>
                            </div>

                            <div className="space-y-2 text-content-secondary">
                                <p className="font-semibold text-content-primary text-xs uppercase tracking-wide">Activer les notifications push (Paramètres → Alertes → Push)</p>
                                <ul className="space-y-1.5 list-disc list-inside ml-1 text-xs">
                                    <li>Cliquez sur <strong>"Activer les notifications"</strong> — votre navigateur demandera la permission.</li>
                                    <li>Une fois abonné, les alertes avec canal <em>Notification</em> ou <em>Les deux</em> arrivent directement sur votre écran, même si EasyDash est fermé.</li>
                                    <li>Utilisez <strong>"Tester"</strong> pour vérifier que tout fonctionne.</li>
                                    <li>Chaque appareil (téléphone, tablette, PC) doit s'abonner séparément.</li>
                                </ul>
                            </div>

                            <div className="bg-dark-card border border-border/50 rounded-lg p-3 text-xs text-content-secondary">
                                💡 <strong>Historique des alertes</strong> disponible dans l'onglet <em>Historique</em> — vous pouvez y acquitter chaque alerte et tout effacer.
                            </div>
                        </div>
                    </section>

                    {/* Google Drive Backup */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-jeedom-500">
                            <Cloud size={20} />
                            Sauvegarde et Restauration (Google Drive)
                        </h3>
                        <div className="bg-input-bg border border-border rounded-xl p-4 text-sm space-y-3">
                            <p>Vous pouvez sauvegarder votre configuration (dashboards, widgets, paramètres) sur Google Drive :</p>
                            <ol className="list-decimal list-inside text-content-secondary space-y-1 ml-1">
                                <li>Allez dans <strong>Paramètres → Données</strong> et cliquez sur <strong>"Sauvegarder sur Google Drive"</strong>.</li>
                                <li>Une fenêtre Google s'ouvre pour vous authentifier.</li>
                                <li>Pour restaurer, cliquez sur <strong>"Importer depuis Google Drive"</strong> et choisissez Fusionner ou Remplacer.</li>
                            </ol>

                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-xs text-orange-200 flex gap-2 items-start">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                <div>
                                    <strong>Message de sécurité Google :</strong>
                                    <p className="mt-1 opacity-90">
                                        Google peut afficher un avertissement "application non vérifiée". C'est normal pour une application privée. Cliquez sur <strong>"Paramètres avancés"</strong> puis <strong>"Accéder à l'application (non sécurisé)"</strong>.
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-content-secondary italic">
                                L'application ne lit jamais vos emails ni vos fichiers personnels. Elle crée uniquement un fichier de configuration caché dans votre Drive.
                            </p>
                        </div>
                    </section>

                    {/* Privacy & Cookies */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-jeedom-500">
                            <Cookie size={20} />
                            Cookies & Analytics
                        </h3>
                        <div className="bg-input-bg border border-border rounded-xl p-4 text-sm space-y-2">
                            <p className="text-content-secondary">
                                Nous utilisons Google Analytics de manière anonyme pour comprendre comment le tableau de bord est utilisé et l'améliorer. Un bandeau s'affiche lors de votre première visite — vous êtes libre d'accepter ou de refuser sans impact sur le fonctionnement.
                            </p>
                        </div>
                    </section>

                    {/* WebSocket */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-jeedom-500">
                            <Wifi size={20} />
                            Connexion WebSocket temps réel
                        </h3>
                        <div className="bg-input-bg border border-border rounded-xl p-4 text-sm space-y-4">
                            <p className="text-content-secondary leading-relaxed">
                                EasyDash se connecte à Jeedom en WebSocket pour recevoir les mises à jour d'état instantanément, sans polling HTTP. Si la connexion échoue, il bascule automatiquement en mode polling.
                            </p>

                            <div className="space-y-2">
                                <p className="font-semibold text-content-primary text-xs uppercase tracking-wide">Activer dans EasyDash</p>
                                <p className="text-content-secondary text-xs">
                                    Dans <strong>Paramètres → Général</strong>, activez <strong>"Connexion WebSocket"</strong>. Si désactivé, EasyDash utilise le polling HTTP classique.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="font-semibold text-content-primary text-xs uppercase tracking-wide">Comment EasyDash se connecte</p>
                                <p className="text-content-secondary text-xs mb-1">Deux URLs sont tentées dans l'ordre :</p>
                                <div className="space-y-2">
                                    <div className="bg-dark-card border border-border/50 rounded-lg p-3 text-xs space-y-1">
                                        <p className="font-semibold text-content-primary">① Port direct Jeedom (prioritaire)</p>
                                        <code className="text-jeedom-400 block">ws://votre-jeedom.local:8011</code>
                                        <code className="text-jeedom-400 block">wss://votre-jeedom.local:8012 <span className="text-content-secondary">(si HTTPS)</span></code>
                                        <p className="text-content-secondary mt-1">Ports natifs du démon Jeedom. À ouvrir dans le pare-feu si nécessaire.</p>
                                    </div>
                                    <div className="bg-dark-card border border-border/50 rounded-lg p-3 text-xs space-y-1">
                                        <p className="font-semibold text-content-primary">② Proxy Apache/Nginx (repli automatique)</p>
                                        <code className="text-jeedom-400 block">ws://votre-jeedom.local/ws/</code>
                                        <p className="text-content-secondary mt-1">Utilisé si les ports directs sont inaccessibles (reverse proxy sans exposition des ports 8011/8012).</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="font-semibold text-content-primary text-xs uppercase tracking-wide">Configuration Linux / Jeedom</p>
                                <div className="grid md:grid-cols-2 gap-2 text-xs">
                                    <div className="bg-dark-card border border-border/50 rounded-lg p-3 space-y-1.5">
                                        <p className="font-semibold text-content-primary">Port direct — ouvrir le pare-feu</p>
                                        <code className="text-jeedom-400 block">sudo ufw allow 8011/tcp</code>
                                        <code className="text-jeedom-400 block">sudo ufw allow 8012/tcp</code>
                                        <p className="text-content-secondary mt-1">Jeedom écoute nativement sur ces ports. Aucune autre config nécessaire.</p>
                                    </div>
                                    <div className="bg-dark-card border border-border/50 rounded-lg p-3 space-y-1.5">
                                        <p className="font-semibold text-content-primary">Proxy Apache — activer les modules</p>
                                        <code className="text-jeedom-400 block">sudo a2enmod proxy proxy_http proxy_wstunnel rewrite</code>
                                        <code className="text-jeedom-400 block">sudo systemctl restart apache2</code>
                                        <p className="text-content-secondary mt-1">Le VirtualHost Jeedom doit contenir <code className="bg-dark-surface px-1 rounded">ProxyPass /ws/ ws://localhost:8011/</code></p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-dark-card border border-border/50 rounded-lg p-3 text-xs text-content-secondary space-y-1">
                                <p className="font-semibold text-content-primary">🔍 Diagnostic</p>
                                <p>Ouvrez la console du navigateur (F12) et cherchez les messages <code className="bg-dark-surface px-1 rounded">[JeedomWS]</code> :</p>
                                <ul className="mt-1 space-y-0.5 list-disc list-inside ml-1">
                                    <li><span className="text-green-400">🟢 Connecté</span> — WebSocket actif, tout fonctionne.</li>
                                    <li><span className="text-orange-400">Tentative URL B</span> — port direct inaccessible, vérifiez le pare-feu ou activez le proxy Apache.</li>
                                    <li><span className="text-red-400">Connexion zombie</span> — réseau instable, reconnexion automatique après 90 s.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Troubleshooting */}
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-jeedom-500">
                            <Wrench size={20} />
                            Dépannage rapide
                        </h3>
                        <div className="bg-input-bg border border-border rounded-xl p-4 text-sm space-y-3">
                            <ul className="space-y-3 text-content-secondary">
                                <li>
                                    <strong>L'écran ne répond plus ou affiche des valeurs bizarres :</strong> Le tableau de bord essaiera de se reconnecter automatiquement. Sinon, rechargez la page (glissez vers le bas sur mobile).
                                </li>
                                <li>
                                    <strong>Écran noir après une mise à jour :</strong> Votre navigateur a conservé l'ancienne version en cache. Rafraîchissez une ou deux fois, ou videz le cache.
                                </li>
                                <li>
                                    <strong>Les notifications push n'arrivent plus :</strong> Désabonnez-vous puis réabonnez-vous depuis <strong>Paramètres → Alertes → Push</strong>. Cela arrive notamment après une réinstallation du navigateur.
                                </li>
                                <li>
                                    <strong>Un widget a disparu :</strong> Vérifiez dans les Paramètres si vous ne l'avez pas masqué par erreur.
                                </li>
                                <li>
                                    <strong>Connexion impossible depuis l'extérieur :</strong> Assurez-vous d'avoir ouvert les ports <strong>HTTPS (443)</strong> et <strong>RPC (8012)</strong> sur votre box internet.
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
