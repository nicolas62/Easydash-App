# Changelog

All notable changes to EasyDash are documented here.

---

## [0.8.4] — 2026-03-22

### Nouveaux widgets
- **Widget Slider** — curseur interactif pour contrôler des valeurs numériques (lumière, volet, etc.). Valeur temps réel via WebSocket, commit sur relâchement, min/max/step configurables.
- **Widget Thermostat** — modes Absent et Éco ajoutés (icônes Moon/Leaf), mis en surbrillance selon le mode actif. Correction complète : les données s'affichent et les actions fonctionnent.

### Nouvelles fonctionnalités
- **Sélecteur de période pour les graphiques** — onglets 24h / 7j / 30j + saisie de dates personnalisées.
- **Tags de scénarios** — possibilité de définir des paires `nom=valeur` transmises à Jeedom lors du déclenchement d'un scénario.
- **Error Boundary** — chaque widget est isolé dans un `WidgetErrorBoundary`. En cas de crash, une carte d'erreur s'affiche avec bouton "Réessayer" sans affecter le reste du tableau de bord.

### Performances
- **React.memo** appliqué sur `SortableWidget`, `InfoWidget`, `ActionWidget`, `WidgetCard` — les widgets ne se re-rendent que si leurs données propres changent (comparateur personnalisé sur les IDs de commandes).
- **Lazy loading caméra** — `CameraWidget` utilise `IntersectionObserver` pour ne démarrer le flux / l'intervalle de rafraîchissement que lorsque le widget est visible dans le viewport.

### SEO & PWA
- Balises meta complètes (`description`, `keywords`, Open Graph, Twitter Card) sur chaque page.
- `manifest.json` et `sitemap.xml` mis à jour.
- Intégration `react-helmet-async` pour la gestion dynamique des meta.

### Sécurité
- Correction de la CVE high sur `serialize-javascript` — forcé en `>=7.0.3` via `overrides` npm sans impacter `vite-plugin-pwa`.

### Documentation
- README entièrement reécrit pour la page GitHub : captures, liste des fonctionnalités, guide d'installation, FAQ.

### Corrections de bugs
- Thermostat : les IDs de commandes (`currentTempCmdId`, `setpointCmdId`, `stateCmdId`, `modeInfoCmdId`) sont maintenant inclus dans `refreshWidgetValues`.
- WidgetEditorModal : correction d'une erreur JSX (fragment manquant dans la branche ternaire du bloc scénario).
- TypeScript : correction du typage de `setChartPeriod` (`useState<string>` au lieu de l'union).

---

## [0.8.3] — 2026-03-15

### Corrections
- Hauteur minimale des lignes de la grille fixée à 140px (`auto-rows-[minmax(140px,auto)]`) pour corriger l'affichage des widgets larges (graphiques).

---

## [0.8.2] — 2026-03-10

### Fonctionnalités
- Support du layout React Grid Layout (glisser-déposer + redimensionnement libre).
- Widget météo.
- Gestion des favoris.

---

## [0.8.0] — 2026-02-20

### Fonctionnalités majeures
- Mode proxy intégré (serveur Express) pour contourner les restrictions CORS.
- Support WebSocket Jeedom pour les mises à jour temps réel.
- Cache service pour les données historiques (graphiques).
- Widget scénario avec bouton stop.
- Widget caméra (snapshot et flux MJPEG).
- Widget graphique (historique Recharts).
- Widget thermostat basique.

---

## [0.7.0] — 2026-01-15

### Version initiale publique
- Tableau de bord configurable avec widgets action, toggle, info.
- Connexion à l'API Jeedom (REST + JSON-RPC).
- Thème sombre, responsive, PWA.
