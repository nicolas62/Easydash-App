<div align="center">

<img src="https://easydash.fr/logo.png" alt="EasyDash Logo" width="100" />

# EasyDash

**Le dashboard moderne et personnalisable pour votre box Jeedom**

[![Version](https://img.shields.io/badge/version-0.9.2-brightgreen?style=flat-square)](https://github.com/nicolas62/EasyDash/releases)
[![Docker](https://img.shields.io/badge/Docker-ghcr.io-blue?style=flat-square&logo=docker)](https://github.com/nicolas62/EasyDash/pkgs/container/easydash)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)

[🌐 Site officiel](https://easydash.fr) · [🚀 Démo en ligne](https://easydash.fr?demo=true) · [🐛 Signaler un bug](https://github.com/nicolas62/EasyDash/issues)

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

- **Code PIN alarme hashé SHA-256** — le code de désactivation n'est jamais stocké en clair (Web Crypto API)
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
  ghcr.io/nicolas62/easydash:latest
```

### Avec docker-compose

```yaml
services:
  easydash:
    image: ghcr.io/nicolas62/easydash:latest
    container_name: easydash
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
git clone https://github.com/nicolas62/EasyDash.git
cd EasyDash

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

### v0.9.2 — 17 Avril 2026
- Nouveau widget **Volet / Portail** : boutons Ouvrir / Stop / Fermer, affichage de position en temps réel, curseur de positionnement optionnel (0–100 %)
- Mise à jour sécurité : vite 6.4.2 (GHSA-4w7w-66w2-5vf9, GHSA-p9ff-h696-f583), firebase 12.12.0 + override protobufjs ≥ 7.5.5 (GHSA-xq3m-2v4x-88gg)
- Suppression de la dépendance directe lodash (non utilisée dans le code source)

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
