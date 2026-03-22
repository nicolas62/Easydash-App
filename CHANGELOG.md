# Changelog

All notable changes to EasyDash are documented here.

---

## [0.8.5] — 2026-03-22

### Sécurité
- **Proxy caméra** : les images sont récupérées côté serveur via `/api/camera` — la clé API n'apparaît plus dans l'attribut `src`, le DOM ou le cache disque du navigateur.
- **Protection SSRF** : toutes les requêtes passant par `/api/proxy` et `/api/camera` sont filtrées par `isSafeUrl()` — blocage de `169.254.169.254` (métadonnées cloud AWS/GCP/Azure), `::1`, protocoles non HTTP/HTTPS.
- **TLS conditionnel** : `NODE_TLS_REJECT_UNAUTHORIZED` n'est plus désactivé par défaut. Requiert désormais `ALLOW_INSECURE_TLS=true` pour les Jeedom avec certificat auto-signé.

### Performances
- **Comparateur WidgetCard O(1)** : `areWidgetCardPropsEqual` construit deux `Map` avant la boucle de comparaison → lookup O(1) par ID au lieu de `Array.find()` O(n). ~1 600 → ~208 opérations par widget.
- **Slider sans jank** : `handleChange` utilise `requestAnimationFrame` pour throttler les mises à jour d'état à 60fps max pendant le drag.
- **Chiffrement apiKey conditionnel** : `encryptData` (AES-GCM) n'est appelé que si `settings.apiKey` a réellement changé (suivi par `prevApiKeyRef`).
- **Cache graphiques TTL adaptatif** : 15 min (24h) / 2h (7j) / 6h (30j) au lieu d'un TTL fixe de 5 min.

### Corrections
- **Reconnexion zombie** : le heartbeat WebSocket force la reconnexion directement sans attendre `onclose` (non garanti sur réseau mort).
- **Hot path WebSocket** : suppression du `console.log` dans `useJeedomCommand` appelé à chaque message reçu.

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
