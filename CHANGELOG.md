# Changelog

All notable changes to EasyDash are documented here.

---

## [0.9.1] — 2026-03-27

### Nouveau — Widget Alarme
- **Widget Alarme** : nouveau type de widget permettant d'activer/désactiver une alarme Jeedom directement depuis le tableau de bord. Le widget devient rouge lorsque l'alarme est armée (icône `ShieldAlert`) et revient à sa couleur normale désarmé (`ShieldCheck`).
- **Code de désactivation sécurisé** : le code est haché via SHA-256 (Web Crypto API) avant d'être stocké. Le code en clair n'est jamais sauvegardé — ni en `localStorage`, ni dans la config, ni visible dans les DevTools navigateur.
- **État temps réel optionnel** : si une commande info Jeedom est configurée (`alarmStateId`), l'état armé/désarmé est synchronisé en temps réel via WebSocket. La valeur déclenchant l'état "armé" est configurable (défaut : `1`).
- **Fallback local** : sans commande d'état, le widget gère l'état localement pour la session en cours.

### Corrections
- **Service Worker désactivé** (`src/index.tsx`) : le SW était désactivé et désenregistré à chaque chargement de page — reliquat d'un ancien workaround de stabilité qui avait été oublié. Cela empêchait totalement les notifications push de fonctionner après un refresh de page.
- **État abonnement push après refresh** : initialisation de `isSubscribed` corrigée — passage de `useState(false)` à `useState(() => !!localStorage.getItem(DEVICE_ID_KEY))` (optimiste) et remplacement de `serviceWorker.ready` par `serviceWorker.getRegistration()` pour la confirmation asynchrone.

---

## [0.9.0] — 2026-03-23

### Nouveau — Notifications Push Web (Web Push API)
- **Service Worker push** : migration PWA vers `injectManifest` — le SW personnalisé (`src/sw.ts`) gère le précache Workbox, le fallback SPA, l'événement `push` et le clic sur notification. Les notifications arrivent même lorsque l'app est fermée.
- **Endpoints push** : `/api/push/vapid-public-key`, `/api/push/subscribe`, `/api/push/subscribe/:id` (DELETE), `/api/push/devices`, `/api/push/broadcast`, `/api/push/test/:id` — avec nettoyage automatique des abonnements expirés (statut 404/410).
- **Stockage des abonnements** : fichier JSON persisté dans un volume Docker dédié (`data/subscriptions.json`), chargé au démarrage du serveur.
- **Hook `useAlertSubscription`** : gestion complète (permission, clé VAPID, subscribe PushManager, POST serveur, unsubscribe, test, liste appareils). L'ID d'appareil est conservé en `localStorage`.
- **`useAlerts` broadcast** : quand une règle avec canal `notification` ou `both` se déclenche, un `POST /api/push/broadcast` est envoyé en fire-and-forget vers tous les appareils abonnés.
- **UI onglet Push** : nouvel onglet "Push" dans Alertes (Settings) — statut d'abonnement, bouton activer/désactiver, test de notification, liste des appareils enregistrés.

### Corrections / Améliorations
- **Build script corrigé** : `vite build --config src/vite.config.ts` — VitePWA était silencieusement ignoré depuis l'origine faute de ce flag.
- **VAPID configurable** : clés injectées via `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (env vars). Si absentes, le push est désactivé proprement sans crash.
- **docker-compose.local.yml** : ajout des env vars VAPID + volume persistant pour les abonnements.

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
