import React from 'react';
import { GitCommit, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const releases = [
    {
        version: "0.9.7",
        date: "14 Juin 2026",
        features: [
            { type: 'fix', text: "Sécurité — react-router (high) : 6 CVEs corrigées — XSS via cible javascript: dans les redirections RSC, stored XSS dans le HTML prerendered, RCE via désérialisation turbo-stream TYPE_ERROR, open redirect URL protocol-relative, DoS via endpoint __manifest et single-fetch — mise à jour vers >=7.14.3." },
            { type: 'fix', text: "Sécurité — @grpc/grpc-js (high) : crash serveur/client sur requête compressée malformée (GHSA-5375-pq7m-f5r2) et requête mal formée (GHSA-99f4-grh7-6pcq) — mise à jour via npm audit fix." },
            { type: 'fix', text: "Sécurité — esbuild GHSA-gv7w-rqvm-qjhr (high) : intégrité binaire manquante en contexte Deno — non applicable à EasyDash (projet npm uniquement). GHSA-g7r4-m6w7-qqqr (lecture fichiers Windows dev server) corrigé par vite 6.4.3." },
            { type: 'new', text: "Lien GitHub : icône GitHub (lucide-react) dans le menu principal et le footer, cliquable vers le dépôt open source." },
        ]
    },
    {
        version: "0.9.6",
        date: "1 Juin 2026",
        features: [
            { type: 'fix', text: "Sécurité — qs CVE-2026-8723 (moderate) : qs.stringify plantait avec TypeError sur les entrées null/undefined dans les tableaux au format comma avec encodeValuesOnly. Correction via override qs >=6.15.2 (6.15.0 → 6.15.2, dépendance transitive d'express)." },
        ]
    },
    {
        version: "0.9.5",
        date: "1 Juin 2026",
        features: [
            { type: 'fix', text: "Navigation mobile — swipe entre dashboards : après un swipe, le sélecteur de dashboard en haut de l'écran scrolle automatiquement pour centrer le dashboard actif, évitant de devoir faire défiler manuellement la barre." },
        ]
    },
    {
        version: "0.9.4",
        date: "10 Mai 2026",
        features: [
            { type: 'fix', text: "Sécurité — protobufjs : correction de 6 CVE high/moderate (code injection, DoS, prototype pollution) via override >=8.2.0. La version installée passe de 8.0.1 à 8.4.2 (firebase → @grpc/proto-loader)." },
            { type: 'fix', text: "Sécurité — CSP connect-src : ajout de http: pour autoriser les connexions vers les instances Jeedom en réseau local (http://192.168.x.x). Seul https: était autorisé, bloquant l'API REST sur HTTP." },
        ]
    },
    {
        version: "0.9.3",
        date: "5 Mai 2026",
        features: [
            { type: 'new', text: "Code PIN admin : le mode édition et les paramètres sont désormais protégés par un code PIN hashé PBKDF2-SHA-256 (minimum 6 caractères). À configurer dans Paramètres → Sécurité." },
            { type: 'new', text: "Anti-bruteforce admin : 5 tentatives échouées entraînent un verrouillage de 5 minutes. Le compteur et le temps restant s'affichent en temps réel. L'état est persisté en localStorage." },
            { type: 'new', text: "Session admin déverrouillée : une seule saisie de PIN suffit par session. Un bouton cadenas (orange) apparaît dans le header pour re-verrouiller manuellement. Quitter le mode édition ne demande jamais de PIN." },
            { type: 'new', text: "Section 'Sécurité' dans les Paramètres : création, modification et suppression du PIN admin avec vérification de l'ancien code avant tout changement." },
            { type: 'improvement', text: "Sécurité — code PIN alarme : migration de SHA-256 non salé vers PBKDF2-SHA-256 (100 000 itérations, sel aléatoire 16 octets). Rétrocompatible avec les hashes SHA-256 existants." },
            { type: 'improvement', text: "Sécurité — en-têtes HTTP : ajout Content-Security-Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy sur toutes les réponses serveur." },
            { type: 'improvement', text: "Sécurité — clé API ImgBB : déplacée du paramètre d'URL vers le corps de la requête POST pour éviter son exposition dans les logs serveur et l'historique navigateur." },
            { type: 'fix', text: "Sécurité — validation protocole URL caméra : seuls http: et https: sont acceptés, bloquant les URLs javascript: ou data: potentiellement malveillantes." },
            { type: 'fix', text: "TypeScript : correction de l'erreur 'Cannot find module virtual:pwa-register' lors du typecheck hors build Vite — ajout de vite-plugin-pwa/client dans tsconfig.json." },
        ]
    },
    {
        version: "0.9.2",
        date: "4 Mai 2026",
        features: [
            { type: 'new', text: "Nouveau widget Volet / Portail : boutons Ouvrir / Stop / Fermer pour piloter volets roulants, portes de garage et portails. Le bouton Stop n'apparaît que s'il est configuré." },
            { type: 'new', text: "Widget Volet — position en temps réel : si une commande info est liée, la position (0–100 %) s'affiche et se met à jour via WebSocket." },
            { type: 'new', text: "Widget Volet — curseur de positionnement : si une commande action slider est configurée, un curseur 0–100 % permet de définir la position cible directement depuis le widget." },
            { type: 'fix', text: "Sécurité — mise à jour vite 6.4.2 : correction GHSA-4w7w-66w2-5vf9 (path traversal dans les source maps) et GHSA-p9ff-h696-f583 (lecture arbitraire de fichiers via le WebSocket du dev server)." },
            { type: 'fix', text: "Sécurité — protobufjs ≥ 7.5.5 (résolu en 8.0.1) : correction GHSA-xq3m-2v4x-88gg (exécution de code arbitraire, critique), via firebase 12.12.0 et override npm." },
            { type: 'improvement', text: "Suppression de lodash des dépendances directes : la bibliothèque n'était pas utilisée dans le code source, réduisant la surface d'attaque." },
            { type: 'improvement', text: "Nettoyage — suppression de l'intégration Google AdSense (composant AdBanner, hook useAdSense, routes /ads.txt et /api/adsense-config, variables d'environnement ADSENSE_*)." },
            { type: 'improvement', text: "Nettoyage — suppression des fichiers Android legacy (AndroidManifest.xml, MainActivity.kt et 7 fichiers Kotlin) obsolètes depuis la migration en PWA." },
            { type: 'improvement', text: "Aide & Documentation : nouvelle section WebSocket expliquant les deux URLs tentées (port direct 8011/8012, proxy Apache /ws/), la configuration pare-feu Linux et le diagnostic via console navigateur." },
        ]
    },
    {
        version: "0.9.1",
        date: "27 Mars 2026",
        features: [
            { type: 'new', text: "Nouveau widget Alarme : active/désactive une alarme Jeedom depuis le tableau de bord. Le widget devient rouge lorsque l'alarme est armée (icône ShieldAlert). La désactivation est protégée par un code configurable." },
            { type: 'new', text: "Sécurité — code d'alarme haché (SHA-256) : le code de désactivation est stocké sous forme de hash SHA-256 via Web Crypto API. Le code en clair n'est jamais sauvegardé (ni dans localStorage, ni dans la config, ni visible dans les DevTools)." },
            { type: 'new', text: "Widget Alarme — commande info optionnelle : si une commande Jeedom d'état est configurée, l'état réel (armé/désarmé) est lu en temps réel via WebSocket. La valeur 'armée' est configurable (ex: 1, 'armé', 'total'…)." },
            { type: 'fix', text: "Correction critique — Service Worker désactivé : le SW était désactivé et désenregistré à chaque chargement de page (reliquat d'un ancien workaround de stabilité). Cela empêchait les notifications push de fonctionner après un refresh." },
            { type: 'fix', text: "Correction — état abonnement push après refresh : l'initialisation de l'état utilisait navigator.serviceWorker.ready (bloquant) au lieu de getRegistration() (instantané). Le widget affichait 'Non abonné' le temps que le SW réponde." },
        ]
    },
    {
        version: "0.9.0",
        date: "23 Mars 2026",
        features: [
            { type: 'new', text: "Notifications Push Web (Approach 3) : les alertes arrivent maintenant sur votre appareil même lorsque l'application est fermée, via le Web Push API (RFC 8030). Un Service Worker dédié reçoit les messages serveur et affiche la notification système." },
            { type: 'new', text: "Service Worker personnalisé : migration de la PWA vers le mode injectManifest — le SW gère désormais le précache Workbox, le fallback SPA et les événements push/notificationclick." },
            { type: 'new', text: "Gestion des abonnements push : nouvel onglet 'Push' dans Alertes — abonnement en un clic, liste des appareils enregistrés, bouton de test, et désabonnement. Les abonnements sont persistés dans un volume Docker dédié." },
            { type: 'new', text: "Endpoints push côté serveur : /api/push/vapid-public-key, /api/push/subscribe, /api/push/devices, /api/push/broadcast, /api/push/test/:id — avec nettoyage automatique des abonnements expirés (410/404)." },
            { type: 'improvement', text: "Règles d'alerte avec canal 'Notification' ou 'Les deux' : en plus de la Notification API locale, une diffusion push est envoyée à tous les appareils abonnés via /api/push/broadcast." },
            { type: 'improvement', text: "Script de build corrigé : vite build utilise désormais --config src/vite.config.ts, ce qui activait VitePWA qui était silencieusement ignoré depuis l'origine." },
            { type: 'improvement', text: "Hook useAlertSubscription : gestion complète du cycle de vie (permission, VAPID, subscribe, unsubscribe, test, fetchDevices) avec persistance de l'ID d'appareil en localStorage." },
        ]
    },
    {
        version: "0.8.5",
        date: "22 Mars 2026",
        features: [
            { type: 'improvement', text: "Sécurité — proxy caméra : les images sont désormais récupérées côté serveur via /api/camera, la clé API n'apparaît plus dans l'attribut src, le DOM ou le cache navigateur." },
            { type: 'improvement', text: "Sécurité — protection SSRF : toutes les requêtes passant par le proxy Express sont filtrées (blocage des endpoints de métadonnées cloud 169.254.169.254, protocoles non-HTTP)." },
            { type: 'improvement', text: "Sécurité — TLS conditionnel : la désactivation de la vérification SSL n'est plus active par défaut. Elle s'active via la variable d'environnement ALLOW_INSECURE_TLS=true pour les Jeedom avec certificat auto-signé." },
            { type: 'improvement', text: "Performances — comparateur WidgetCard O(1) : l'index des commandes est maintenant construit en Map avant la comparaison, réduisant de ~1 600 à ~208 opérations par widget lors des mises à jour." },
            { type: 'improvement', text: "Performances — slider sans jank : les mises à jour d'état pendant le drag passent par requestAnimationFrame, limitant les re-renders à 60fps maximum sur mobile." },
            { type: 'improvement', text: "Performances — chiffrement apiKey conditionnel : AES-GCM n'est déclenché que si la clé API a réellement changé, évitant une opération coûteuse à chaque modification des paramètres." },
            { type: 'fix', text: "WebSocket — reconnexion zombie fiable : la détection de connexion morte ne dépend plus de l'événement onclose (non garanti sur réseau mort) et force directement la reconnexion." },
            { type: 'fix', text: "WebSocket — suppression du console.log sur le hot path : les logs par message reçu ont été retirés pour éviter des centaines d'entrées par minute avec de nombreux widgets." },
            { type: 'improvement', text: "Cache graphiques — TTL adaptatif : 15 min pour 24h, 2h pour 7j, 6h pour 30j (au lieu d'un TTL fixe de 5 min qui générait jusqu'à 288 requêtes par jour)." },
        ]
    },
    {
        version: "0.8.4",
        date: "22 Mars 2026",
        features: [
            { type: 'new', text: "Nouveau widget Slider : curseur interactif pour contrôler des valeurs numériques (luminosité, volets, etc.). Valeur temps réel via WebSocket, commit sur relâchement, min/max/step configurables." },
            { type: 'new', text: "Thermostat : ajout des modes Absent et Éco avec icônes dédiées (lune / feuille), mis en surbrillance selon le mode actif. Correction complète de l'affichage des données et des actions." },
            { type: 'new', text: "Graphiques : sélecteur de période (24h / 7j / 30j) et mode dates personnalisées avec champs de saisie." },
            { type: 'new', text: "Scénarios : support des tags (paires clé=valeur) transmis à Jeedom lors du déclenchement d'un scénario." },
            { type: 'new', text: "Error Boundary : chaque widget est isolé — en cas de crash JS, une carte d'erreur s'affiche avec un bouton Réessayer sans perturber le reste du tableau de bord." },
            { type: 'improvement', text: "Optimisation des performances : React.memo appliqué sur WidgetCard (comparateur personnalisé sur les IDs de commandes), SortableWidget, InfoWidget et ActionWidget — seuls les widgets dont les données changent se re-rendent." },
            { type: 'improvement', text: "Lazy loading caméra : le flux et l'intervalle de rafraîchissement ne démarrent que lorsque le widget est visible dans le viewport (IntersectionObserver)." },
            { type: 'improvement', text: "SEO : balises meta complètes (description, keywords, Open Graph, Twitter Card) sur toutes les pages, intégration react-helmet-async." },
            { type: 'fix', text: "Sécurité : correction de la CVE haute sur serialize-javascript — forcé en >=7.0.3 via overrides npm." },
            { type: 'fix', text: "WidgetEditorModal : correction d'une erreur JSX dans la branche scénario (fragment React manquant)." },
        ]
    },
    {
        version: "0.8.3",
        date: "19 Mars 2026",
        features: [
            { type: 'fix', text: "Correction du bug mode édition : le bouton 'Ajouter un widget' était absent — un bouton flottant apparaît désormais en bas à droite lors de l'édition." },
            { type: 'improvement', text: "Refactorisation de WidgetCard en sous-composants (ChartWidget, InfoWidget, ActionWidget) pour une meilleure maintenabilité." },
            { type: 'fix', text: "Correction du type scenarioId dans App.tsx : suppression du cast `any` et de la branche morte dans le handler." },
            { type: 'improvement', text: "Race condition dans usePolling corrigée : les requêtes de rafraîchissement ne peuvent plus se superposer." },
            { type: 'improvement', text: "Heartbeat WebSocket : détection automatique des connexions zombie (silence > 90s) et reconnexion forcée." },
            { type: 'improvement', text: "Import de configuration : choix entre Fusionner (ajoute sans écraser) ou Remplacer tout, pour les imports fichier et Google Drive." },
            { type: 'improvement', text: "Pipeline CI/CD : build et push automatique de l'image Docker sur ghcr.io à chaque commit sur main." },
            { type: 'fix', text: "Ajout d'un .dockerignore pour éviter que les binaires node_modules Windows écrasent ceux du conteneur Linux." },
        ]
    },
    {
        version: "0.8.2",
        date: "6 Mars 2026",
        features: [
            { type: 'new', text: "Gestion du mode RPC WebSocket et API pour une connexion Jeedom ultra-rapide et temps réel." },
            { type: 'new', text: "Nouveaux types de widgets : Caméra (flux vidéo), Météo (prévisions) et Thermostat (contrôle complet)." },
            { type: 'new', text: "Mode Kiosque : Plein écran et maintien de l'écran allumé pour usage sur tablette murale." },
            { type: 'improvement', text: "Optimisation de la stabilité des connexions WebSocket." }
        ]
    },
    {
        version: "0.8.1",
        date: "4 Mars 2026",
        features: [
            { type: 'new', text: "Système de cache intelligent : Les widgets conservent leurs données lors de la navigation entre les dashboards." },
            { type: 'new', text: "Synchronisation des sauvegardes et restaurations avec Google Drive." },
            { type: 'improvement', text: "Rafraîchissement instantané des données lors du changement de dashboard." },
            { type: 'fix', text: "Amélioration de l'affichage des widgets 'Action' : Masquage de l'ID technique, seul le logo reste visible." }
        ]
    },
    {
        version: "0.8.0",
        date: "2 Mars 2026",
        features: [
            { type: 'new', text: "Nouveau widget 'Graphique' (Chart) pour visualiser l'historique des commandes." },
            { type: 'new', text: "Onglet 'Santé' dans les paramètres : État du système, ports USB, et actions de maintenance (Redémarrer, Éteindre, Mise à jour, Sauvegarde)." },
            { type: 'improvement', text: "Amélioration du Drag & Drop pour l'édition des widgets." },
            { type: 'fix', text: "Correction d'erreurs d'importation d'icônes." }
        ]
    },
    {
        version: "0.7.7",
        date: "24 Février 2026",
        features: [
            { type: 'new', text: "Images de fond personnalisables pour chaque dashboard (via ImgBB)." },
            { type: 'new', text: "Support complet des scénarios : Lancement, Arrêt, Statut en temps réel." },
            { type: 'improvement', text: "Amélioration de la gestion des erreurs réseau (mode hors ligne)." },
            { type: 'fix', text: "Correction de l'affichage de la grille sur certains navigateurs." }
        ]
    },
    {
        version: "0.7.6",
        date: "23 Février 2026",
        features: [
            { type: 'new', text: "Navigation par balayage (Swipe) entre les dashboards sur mobile." },
            { type: 'new', text: "Détails avancés des scénarios : Cliquez sur un widget scénario pour voir son statut, dernière exécution, et logs." },
            { type: 'improvement', text: "Amélioration visuelle du bouton d'arrêt pour les scénarios actifs." },
            { type: 'improvement', text: "Ajout d'infobulles sur les actions d'édition et de suppression." }
        ]
    },
    {
        version: "0.7.5",
        date: "19 Février 2026",
        features: [
            { type: 'new', text: "Mode 'Cycle' avancé : Créez des séquences d'actions multi-étapes (ex: Étape 1 = Allumer + Volume 50%, Étape 2 = Éteindre)." },
            { type: 'fix', text: "Correction du chargement des scénarios : Ajout d'une méthode de secours (HTTP GET) pour contourner les blocages RPC." },
            { type: 'improvement', text: "Ajout d'un bouton 'Actualiser' manuel dans la liste des scénarios." },
            { type: 'improvement', text: "Amélioration des logs de débogage dans l'éditeur de widget." }
        ]
    },
    {
        version: "0.7.0",
        date: "15 Février 2026",
        features: [
            { type: 'new', text: "Lancement initial de l'application." },
            { type: 'new', text: "Gestion multi-dashboards." },
            { type: 'new', text: "Widgets Info, Action, Toggle et Scénario." },
            { type: 'new', text: "Connexion API Jeedom (avec mode Proxy)." }
        ]
    }
];

const getIcon = (type: string) => {
    switch (type) {
        case 'new': return <Sparkles size={16} className="text-amber-400" />;
        case 'fix': return <CheckCircle2 size={16} className="text-green-400" />;
        case 'improvement': return <GitCommit size={16} className="text-blue-400" />;
        default: return <AlertCircle size={16} className="text-content-secondary" />;
    }
};

const ReleaseNotesList: React.FC = () => {
    return (
        <div className="space-y-8">
            {releases.map((release, index) => (
                <div key={release.version} className="relative pl-6 border-l-2 border-border last:border-transparent pb-2">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-dark-surface border-2 border-jeedom-500"></div>
                    
                    <div className="flex items-baseline justify-between mb-3">
                        <h3 className="text-lg font-bold text-content-primary">v{release.version}</h3>
                        <span className="text-xs text-content-secondary font-mono">{release.date}</span>
                    </div>

                    <ul className="space-y-3">
                        {release.features.map((feat, i) => (
                            <li key={i} className="flex gap-3 text-sm text-content-secondary leading-relaxed">
                                <div className="mt-0.5 flex-shrink-0">
                                    {getIcon(feat.type)}
                                </div>
                                <span>{feat.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default ReleaseNotesList;
