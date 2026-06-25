<div align="center">

<img src="https://easydash.fr/logo.png" alt="EasyDash Logo" width="100" />

# EasyDash

**Le dashboard moderne et personnalisable pour votre box Jeedom**

[![Version](https://img.shields.io/badge/version-0.9.9-brightgreen?style=flat-square)](https://github.com/nicolas62/Easydash-App/releases)
[![Docker](https://img.shields.io/badge/Docker-ghcr.io-blue?style=flat-square&logo=docker)](https://github.com/nicolas62/Easydash-App/pkgs/container/easydash-app)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)

[🌐 Site officiel](https://easydash.fr) · [🚀 Démo en ligne](https://easydash.fr?demo=true) · [🐛 Signaler un bug](https://github.com/nicolas62/Easydash-App/issues)

</div>

---

## Présentation

EasyDash est une interface domotique **moderne, réactive et entièrement personnalisable** conçue pour remplacer l'interface native de Jeedom. Elle se connecte directement à votre box via l'API REST ou WebSocket et vous permet de créer des dashboards sur mesure — idéaux pour une tablette murale ou un smartphone.

> **Non affilié à Jeedom SAS.** EasyDash est un projet open source indépendant.

---

## Fonctionnalités

### Widgets disponibles

| Widget | Description |
|---|---|
| **Info** | Affiche la valeur d'une commande (température, humidité, état…) |
| **Action** | Déclenche une commande Jeedom (bouton, script…) |
| **Toggle** | Interrupteur on/off avec retour d'état visuel |
| **Slider** | Contrôle de valeur numérique (volume, luminosité…) |
| **Scénario** | Lance, arrête ou suit l'état d'un scénario en temps réel |
| **Graphique** | Historique d'une commande en courbe ou barres (Recharts) |
| **Thermostat** | Température actuelle, consigne, indicateur chauffe/clim |
| **Caméra** | Flux vidéo ou snapshot MJPEG/HTTP |
| **Météo** | Prévisions météo intégrées |
| **Alarme** | Activation/désactivation d'alarme avec code PIN sécurisé (SHA-256), card rouge quand armée |
| **Volet / Portail** | Boutons Ouvrir / Stop / Fermer, affichage de position en temps réel, curseur de positionnement optionnel |
| **Variable** | Lecture et écriture d'une variable de scénario Jeedom (`#maVariable#`), polling configurable, édition inline optionnelle |

### Tailles de widgets

`Petit` · `Moyen` · `Grand` · `Large` · `Très Large` — redimensionnables dans la grille par glisser-déposer.

### Dashboard & Navigation

- **Multi-dashboards** — créez autant de dashboards que vous voulez, organisez-les par pièce ou usage
- **Glisser-déposer** — réorganisez vos widgets librement en mode édition
- **Swipe** — naviguez entre dashboards par balayage sur mobile/tablette
- **Images de fond** — personnalisez le fond de chaque dashboard (via ImgBB)
- **Favoris** — épinglez vos widgets préférés sur un dashboard dédié

### Connexion Jeedom

- **API REST** — connexion standard par clé API
- **WebSocket (JSON-RPC)** — mises à jour temps réel sans polling agressif
- **Mode Proxy** — résout les erreurs CORS quand EasyDash est sur un domaine différent de Jeedom
- **Backoff automatique** — protection anti-bannissement IP (gestion des erreurs consécutives)
- **Cache intelligent** — les données sont conservées lors de la navigation entre dashboards

### Notifications Push

- **Web Push API** — notifications push sur mobile/desktop même application fermée
- **Clés VAPID** — authentification sécurisée entre le serveur et les navigateurs
- **Gestion multi-appareils** — abonnez plusieurs appareils indépendamment
- **Intégré au système d'alertes** — une alerte déclenchée notifie tous les appareils abonnés

### Système d'alertes

- **Règles configurables** — définissez des seuils (>, <, =) sur n'importe quelle commande Jeedom
- **Sévérités** : `info`, `warning`, `critical`
- **Cooldown** — évite le spam de notifications (délai entre deux déclenchements)
- **Hysteresis** — retour à la normale uniquement si la valeur s'éloigne suffisamment du seuil
- **Historique** — consultez les alertes passées dans l'onglet dédié des réglages
- **Toast in-app** — alerte affichée en temps réel dans l'interface

### Sécurité

- **PIN admin PBKDF2-SHA-256** — protège le mode édition et les paramètres (min. 6 caractères, anti-bruteforce 5 tentatives / 5 min)
- **Code PIN alarme PBKDF2-SHA-256** — le code de désactivation n'est jamais stocké en clair (sel aléatoire, 100 000 itérations)
- **En-têtes HTTP** — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy sur toutes les réponses
- **Proxy caméra sécurisé** — prévention SSRF, validation d'URL, restriction aux protocoles HTTP/HTTPS
- **Clé API chiffrée** — AES-GCM en localStorage, jamais exposée en clair
- **TLS conditionnel** — connexion sécurisée si votre Jeedom est en HTTPS

### Interface & Expérience

- **Design sombre** (dark mode natif)
- **Mode Kiosque** — plein écran + maintien d'écran allumé pour tablette murale
- **PWA** — installable sur mobile comme une application native, service worker actif
- **Landing page** — page d'accueil pour les nouveaux visiteurs avec démo en un clic
- **Alertes batterie** — notification automatique si un équipement est < 20 %
- **Panel Santé** — état du système Jeedom, ports USB, redémarrage, sauvegarde

### Sauvegarde & Import

- Export/import de la configuration en JSON
- **Synchronisation Google Drive** — sauvegardez et restaurez vos dashboards dans le cloud
- Choix entre **Fusionner** (ajoute sans écraser) ou **Remplacer tout** à l'import

---

## Déploiement avec Docker (recommandé)

### Depuis ghcr.io (image pré-buildée)

```bash
docker run -d \
  --name easydash \
  -p 3000:3000 \
  -e VAPID_PUBLIC_KEY=votre_cle_publique \
  -e VAPID_PRIVATE_KEY=votre_cle_privee \
  -e VAPID_SUBJECT=mailto:contact@exemple.fr \
  -v easydash_push_data:/app/data \
  --restart unless-stopped \
  ghcr.io/nicolas62/easydash-app:latest
```

### Avec docker-compose

```yaml
services:
  easydash:
    image: ghcr.io/nicolas62/easydash-app:latest
    container_name: easydash_app
    ports:
      - "3000:3000"
    environment:
      - VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY}
      - VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY}
      - VAPID_SUBJECT=${VAPID_SUBJECT:-mailto:contact@exemple.fr}
    volumes:
      - easydash_push_data:/app/data
    restart: unless-stopped

volumes:
  easydash_push_data:
```

```bash
docker-compose up -d
```

Accès : `http://votre-ip:3000`

### Générer les clés VAPID

Les clés VAPID sont nécessaires pour activer les notifications push. Générez-les une seule fois :

```bash
npx web-push generate-vapid-keys
```

Copiez `Public Key` dans `VAPID_PUBLIC_KEY` et `Private Key` dans `VAPID_PRIVATE_KEY`.

> Sans clés VAPID, les push notifications sont désactivées. L'application fonctionne normalement sans elles.

---

## Installation locale (développement)

**Prérequis :** Node.js 22+

```bash
# Cloner le dépôt
git clone https://github.com/nicolas62/Easydash-App.git
cd Easydash-App

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

Accès : `http://localhost:5173`

### Variables d'environnement (optionnel)

Créez un fichier `.env.local` pour activer les push notifications en dev :

```env
VITE_VAPID_PUBLIC_KEY=votre_cle_publique
VAPID_PRIVATE_KEY=votre_cle_privee
VAPID_SUBJECT=mailto:contact@exemple.fr
```

### Build de production

```bash
npm run build
npm run start   # Démarre le serveur Express sur le port 3000
```

---

## Configuration

Au premier lancement, une **landing page** s'affiche. Vous pouvez :
- **Essayer la démo** — ouvre une démo en direct dans un nouvel onglet (aucune donnée sauvegardée)
- **Commencer gratuitement** — ouvre directement la configuration

Dans les réglages, renseignez :

| Champ | Description |
|---|---|
| **URL Jeedom** | Adresse de votre box (ex: `http://192.168.1.10`) |
| **Clé API** | Clé API Jeedom (Réglages → Système → Configuration → API) |
| **WebSocket** | Activez pour les mises à jour temps réel |
| **Mode Proxy** | Activez si EasyDash est sur un domaine différent de Jeedom (résout CORS) |
| **Intervalle de refresh** | Fréquence de mise à jour par polling (min. 30s) |

---

## Widget Alarme — configuration

Le widget Alarme permet de piloter une alarme Jeedom avec protection par code PIN.

| Champ | Description |
|---|---|
| **Commande Activer** | ID de la commande action pour armer l'alarme |
| **Commande Désactiver** | ID de la commande action pour désarmer l'alarme |
| **Commande État** *(optionnel)* | ID de la commande info pour lire l'état réel |
| **Valeur = armé** | Valeur retournée par la commande État quand armée (défaut : `1`) |
| **Code PIN** | Code de désactivation — stocké uniquement sous forme de hash SHA-256, jamais en clair |

Quand l'alarme est armée, la card devient **rouge**. Cliquer sur "Désactiver" demande le code PIN avant d'exécuter la commande.

---

## Widget Volet / Portail — configuration

Le widget Volet / Portail permet de piloter un volet roulant, une porte de garage ou un portail depuis Jeedom.

| Champ | Description |
|---|---|
| **Commande Ouvrir** *(requis)* | ID de la commande action pour monter / ouvrir |
| **Commande Fermer** *(requis)* | ID de la commande action pour descendre / fermer |
| **Commande Stop** *(optionnel)* | ID de la commande action pour stopper le mouvement — affiche un bouton Stop entre Ouvrir et Fermer |
| **Position actuelle** *(optionnel)* | ID de la commande info retournant la position en % (0–100) — affichée en temps réel |
| **Définir la position** *(optionnel)* | ID de la commande action (slider) pour envoyer une position cible — affiche un curseur 0–100 % |

---

## Stack technique

| Technologie | Usage |
|---|---|
| **React 19** + **TypeScript 5.8** | Interface utilisateur |
| **Vite 6** | Build et développement |
| **Tailwind CSS 4** | Styles |
| **Recharts** | Graphiques d'historique |
| **@dnd-kit** | Glisser-déposer |
| **Express 5** | Serveur Node.js + route proxy |
| **web-push** | Envoi de notifications push (VAPID) |
| **Firebase** | Authentification (optionnel) |
| **vite-plugin-pwa** | Support PWA + Service Worker |
| **Web Crypto API** | Hachage SHA-256 du code PIN alarme |
| **Docker** + **ghcr.io** | Déploiement containerisé |
| **GitHub Actions** | CI/CD (build + push automatique) |

---

## Historique des versions

### v0.9.9 — 25 Juin 2026
- Nouveau widget **Variable** : lecture et écriture des variables de scénarios Jeedom (`#maVariable#`) depuis un widget dédié, polling configurable (30 s à 10 min), édition inline optionnelle. Compatible Jeedom 3.x+.
- **Temps écoulé** : option "Afficher le temps écoulé" sur les widgets info, action, toggle et slider — affiche "à l'instant", "il y a N min", "il y a Nh" ou "il y a Nj" sous le nom du widget. Tracking client-side, aucune dépendance de version Jeedom.

### v0.9.8 — 24 Juin 2026
- Sécurité — **protobufjs** (moderate) : CVE-2026-54270 (amplification mémoire binary decode) + CVE-2026-54269 (shadowing propriétés runtime) — override forcé à `>=8.6.0` (8.6.5 installé).
- Sécurité — **@babel/core** (low) : GHSA-4x5r-pxfx-6jf8 (lecture fichier via sourceMappingURL) — `7.29.0 → 7.29.7`, dépendance dev transitive.
- Sécurité — **SSRF hardening** : `localhost`, `127.0.0.1`, `0.0.0.0` ajoutés aux hôtes bloqués dans le proxy serveur. HTTP local et IPs LAN restent autorisés pour Jeedom.

### v0.9.7 — 14 Juin 2026
- Sécurité — **react-router** (high) : 6 CVEs — XSS (redirections RSC, prerendered redirect), RCE via turbo-stream, open redirect, DoS (`__manifest`, single-fetch) — mise à jour `>=7.14.3`.
- Sécurité — **@grpc/grpc-js** (high) : crash serveur/client sur requête compressée ou mal formée (GHSA-5375, GHSA-99f4) — mise à jour via `npm audit fix`.
- Sécurité — **esbuild** : GHSA-g7r4-m6w7-qqqr (lecture fichiers Windows dev server) corrigé par vite 6.4.3. GHSA-gv7w-rqvm-qjhr (intégrité binaire Deno) non applicable — projet npm uniquement.
- Lien **GitHub** : icône dans le menu et le footer de la landing page → [Easydash-App](https://github.com/nicolas62/Easydash-App).

### v0.9.6 — 1 Juin 2026
- Sécurité — **qs** CVE-2026-8723 (moderate) : DoS dans `qs.stringify` sur tableaux comma avec valeurs null/undefined — override forcé à `>=6.15.2` (6.15.0 → 6.15.2, dépendance transitive d'express).

### v0.9.5 — 1 Juin 2026
- Navigation mobile — **swipe entre dashboards** : après un swipe, le sélecteur en haut de l'écran scrolle automatiquement pour centrer le dashboard actif (plus besoin de faire défiler manuellement).

### v0.9.4 — 10 Mai 2026
- Sécurité — **protobufjs** : 6 CVE high/moderate corrigées (code injection, DoS, prototype pollution) — override forcé à `>=8.2.0`, version installée `8.4.2` via firebase → @grpc/proto-loader.
- Sécurité — **CSP** `connect-src` : ajout de `http:` pour les instances Jeedom en réseau local (était bloqué par la politique HTTPS uniquement).

### v0.9.3 — 5 Mai 2026
- **Code PIN admin** : le mode édition et les paramètres sont protégés par un code PIN hashé PBKDF2-SHA-256 (min. 6 caractères). Anti-bruteforce : 5 tentatives → verrouillage 5 min. Section "Sécurité" dans les Paramètres.
- Session admin déverrouillée : une seule saisie par session, bouton cadenas dans le header pour re-verrouiller.
- Sécurité — code PIN alarme migré de SHA-256 non salé vers PBKDF2-SHA-256 (100 000 itérations, sel 16 octets), rétrocompatible.
- Sécurité — en-têtes HTTP : CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy.
- Sécurité — clé API ImgBB dans le corps POST (au lieu du paramètre d'URL), validation protocole URL caméra.
- Fix TypeScript : erreur `virtual:pwa-register` corrigée via `tsconfig.json`.

### v0.9.2 — 4 Mai 2026
- Nouveau widget **Volet / Portail** : boutons Ouvrir / Stop / Fermer, position temps réel, curseur de positionnement optionnel (0–100 %)
- Mise à jour sécurité : vite 6.4.2 (GHSA-4w7w-66w2-5vf9, GHSA-p9ff-h696-f583), firebase 12.12.0 + override protobufjs ≥ 7.5.5 (GHSA-xq3m-2v4x-88gg)
- Suppression lodash des dépendances directes (non utilisé dans le code source)
- Suppression de l'intégration Google AdSense et des fichiers Android legacy

### v0.9.1 — 27 Mars 2026
- Nouveau widget **Alarme** : activation/désactivation, état optionnel, card rouge quand armée
- Code PIN alarme sécurisé par hash **SHA-256** (Web Crypto API) — jamais stocké en clair
- Correction Service Worker : re-activation du `registerSW` pour maintenir le push entre les sessions
- Correction état push "Non abonné" après rechargement de page (init optimiste depuis localStorage)

### v0.9.0 — 26 Mars 2026
- Système d'**alertes** : règles configurables avec seuils, sévérité, cooldown, hystérésis
- **Notifications Push** (Web Push API + VAPID) : notifications même application fermée
- Gestion multi-appareils pour les abonnements push
- Historique des alertes consultable dans les réglages
- SEO amélioré : meta tags enrichis, JSON-LD `SoftwareApplication`, landing page optimisée
- Landing page entièrement refondue : démo, comparatif, FAQ, widgets démo visuels
- Page **Mentions Légales** (`/legal`)
- Démo accessible via `?demo=true` en nouvel onglet (sans persistance localStorage)

### v0.8.3 — 19 Mars 2026
- Correction du mode édition : bouton flottant "Ajouter un widget"
- Heartbeat WebSocket : détection des connexions zombie et reconnexion automatique
- Import de configuration : choix Fusionner / Remplacer tout
- Pipeline CI/CD : build Docker automatique sur `ghcr.io` à chaque commit

### v0.8.2 — 6 Mars 2026
- Nouveaux widgets : **Caméra**, **Météo**, **Thermostat**
- Connexion WebSocket JSON-RPC pour mises à jour temps réel
- Mode Kiosque : plein écran + maintien d'écran

### v0.8.1 — 4 Mars 2026
- Cache intelligent entre dashboards
- Synchronisation Google Drive (sauvegarde/restauration)
- Rafraîchissement instantané au changement de dashboard

### v0.8.0 — 2 Mars 2026
- Nouveau widget **Graphique** (historique)
- Onglet **Santé** : état système, maintenance Jeedom
- Amélioration du drag & drop

### v0.7.x — Février 2026
- Images de fond personnalisables
- Support complet des scénarios (lancement, arrêt, logs)
- Navigation par swipe sur mobile
- Mode Cycle (séquences d'actions multi-étapes)
- Widgets Info, Action, Toggle, Slider, Scénario

---

## Contribution

Les contributions sont les bienvenues !

1. Forkez le dépôt
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Committez vos changements
4. Ouvrez une Pull Request

---

## Licence

MIT — voir [LICENSE](LICENSE)

---

<div align="center">

Fait avec ❤️ pour la communauté Jeedom · [easydash.fr](https://easydash.fr)

</div>
