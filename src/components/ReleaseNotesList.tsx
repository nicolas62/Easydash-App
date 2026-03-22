import React from 'react';
import { GitCommit, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const releases = [
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
