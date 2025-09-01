# Frise Chronologique - ChezMehdi.net

Application de frise chronologique interactive développée avec Vue 3 et Vite. Créez des timelines dynamiques à partir de Google Sheets, Framacalc ou fichiers CSV.

## ✨ Fonctionnalités

- 📊 **Import de données** : Google Sheets, Framacalc, fichiers CSV locaux
- 🎯 **Timeline interactive** : Zoom, navigation, sélection d'événements
- 🔗 **Partage facile** : URLs avec ancres pour événements spécifiques
- 📱 **Responsive** : Compatible mobile, tablette et desktop
- 🎨 **Types d'événements** : Événements contextuels/déclencheurs, périodes contextuelles/d'activité
- 🔍 **Recherche** : Filtrage en temps réel des événements
- 📋 **Notifications** : Système de messages utilisateur intégré

## 🚀 Mise en route

### Prérequis

- Node.js (version 18 ou supérieure)  
- npm ou yarn

### Installation

1. Cloner le dépôt :

   ```bash
   git clone git@gitlab.com:journalism-with-ai/frise.chezmehdi.net.git
   cd frise.chezmehdi.net
   ```

2. Installer les dépendances :

   ```bash
   npm install
   ```

### Développement local

```bash
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur.

### Compilation pour la production

```bash
npm run build
```

Les fichiers compilés seront disponibles dans le dossier `dist`.

## 📋 Format des données

Vos tableurs doivent contenir ces colonnes :

| Colonne | Description | Requis |
|---------|-------------|---------|
| `type` | Type d'événement (voir ci-dessous) | ✅ |
| `date_début` | Date de début (YYYY-MM-DD) | ✅ |
| `titre` | Titre de l'événement | ✅ |
| `date_fin` | Date de fin (optionnelle pour événements) | ⭕ |
| `description` | Description HTML de l'événement | ⭕ |

### Types d'événements supportés

- `événement_contextuel` - Événement ponctuel de contexte (bleu)
- `événement_déclencheur` - Événement ponctuel déclencheur (rouge)
- `période_contextuelle` - Période de contexte (vert)
- `période_activité` - Période d'activité (violet)

## 💾 Sources de données

### Google Sheets
1. Rendez votre feuille publique
2. Copiez l'URL complète
3. Collez dans l'interface

### Framacalc
1. Publiez votre feuille
2. Copiez l'URL
3. Collez dans l'interface

### Fichiers CSV locaux
1. Placez votre fichier dans le dossier `public/`
2. Saisissez le nom du fichier (ex: `data.csv`)

## 🔗 Partage et navigation

- **URL avec paramètres** : `?url=lien-vers-tableur`
- **Ancres événements** : `#event-123` pour navigation directe
- **Boutons de partage** : Copie automatique des liens
- **État synchronisé** : L'URL reflète l'état de la timeline

## ☁️ Déploiement

Le projet est configuré pour GitLab CI/CD avec déploiement automatique sur Cloudflare Pages.

### Configuration GitLab CI

Le fichier `.gitlab-ci.yml` contient :
- **Stage build** : Installation et compilation
- **Stage deploy** : Déploiement des artifacts

### Variables d'environnement Cloudflare

- Framework preset : `Vite`
- Build command: `npm run build`
- Build output directory: `dist`

## 🛠 Technologies utilisées

- **Vue 3** (Composition API)
- **Vite** (Build tool et dev server)
- **vis-timeline** (Visualisation de timeline)
- **Vue Router** (Routing)

## 🔧 Développement et CI/CD

### Pipeline GitLab CI

Le projet utilise un pipeline GitLab CI/CD complet avec 4 étapes :

1. **Install** - Installation des dépendances avec cache
2. **Quality** - Vérifications qualité (linting, tests, type checking)
3. **Build** - Construction pour production et preview
4. **Deploy** - Déploiement manuel vers Cloudflare Pages

### Variables d'environnement GitLab

Configurez ces variables dans GitLab (Settings → CI/CD → Variables) :

- `CLOUDFLARE_API_TOKEN` - Token API Cloudflare avec permissions Pages
- `CLOUDFLARE_ACCOUNT_ID` - ID de compte Cloudflare
- `CLOUDFLARE_PROJECT_NAME` - Nom du projet Pages

### Environnements

- **Production** : `main` → https://frise.chezmehdi.net
- **Staging** : `develop` → https://develop.frise.chezmehdi.net
- **Preview** : Merge requests (déclenchement manuel)

### Test local de la pipeline

```bash
# Test du build
npm run build

# Test du serveur de dev
npm run dev

# Test des scripts de qualité (placeholders)
npm run lint
npm run test
```

### Documentation

- `CLAUDE.md` - Guide pour Claude Code
- `DEPLOYMENT.md` - Guide de déploiement détaillé
- `wrangler.toml` - Configuration Cloudflare Pages

## 📝 Licence

MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

🌐 **Application en ligne** : https://frise.chezmehdi.net
