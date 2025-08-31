# Frise Chronologique - ChezMehdi.net

Application de frise chronologique développée avec Vue 3 et Vite qui génère des timelines interactives à partir de données de tableurs (Google Sheets, Framacalc, CSV).

## 🚀 Mise en route

### Prérequis

- Node.js (version 18 ou supérieure)  
- npm ou yarn
- Un compte Cloudflare (pour le déploiement)

### Installation

1. Cloner le dépôt :

   ```bash
   git clone git@gitlab.com:journalism-with-ai/frise.chezmehdi.net.git
   cd frise.chezmehdi.net
   ```

2. Installer les dépendances :

   ```bash
   npm install
   # ou
   yarn
   ```

### Développement local

Pour lancer le serveur de développement :

```bash
npm run dev
# ou
yarn dev
```

Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur.

### Compilation pour la production

Pour compiler l'application pour la production :

```bash
npm run build
# ou
yarn build
```

Les fichiers compilés seront disponibles dans le dossier `dist`.

## ☁️ Configuration Cloudflare

### Déploiement sur Cloudflare Pages

1. Connectez-vous à votre [tableau de bord Cloudflare](https://dash.cloudflare.com/)
2. Allez dans Pages > Créer une application
3. Sélectionnez votre dépôt Git (GitHub/GitLab)
4. Configurez les paramètres de build :
   - Framework preset : `Vite`
   - Build command: `npm run build` ou `yarn build`
   - Build output directory: `dist`
   - Variables d'environnement :
     - `NODE_VERSION`: 16 (ou supérieur)
     - `VITE_APP_ENV`: production

### Configuration DNS

1. Dans votre tableau de bord Cloudflare, allez dans DNS
2. Ajoutez un enregistrement CNAME pointant vers votre domaine personnalisé (par exemple `frise.chezmehdi.net`)
3. Si nécessaire, activez le proxy Cloudflare (le nuage orange) pour bénéficier du CDN et de la protection DDoS

### Configuration du domaine personnalisé

1. Dans les paramètres de votre projet Cloudflare Pages
2. Allez dans l'onglet "Domaines personnalisés"
3. Ajoutez votre domaine personnalisé (par exemple `frise.chezmehdi.net`)
4. Suivez les instructions pour vérifier la propriété du domaine

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

MIT
