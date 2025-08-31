# 🚀 Guide de Démarrage Rapide - Frise Chronologique

Guide spécialisé pour les éditeurs AI : **Cursor**, **Windsurf** et **Claude Desktop**

## 📋 Vue d'ensemble du projet

Application Vue 3 + Vite pour créer des frises chronologiques interactives utilisant vis-timeline. Le projet permet d'importer des données CSV et de générer des timelines dynamiques.

## 🏗️ Architecture technique

```
src/
├── components/          # Composants Vue
│   ├── Timeline.vue    # Composant principal timeline
│   ├── SpreadsheetInput.vue  # Import de données
│   └── HelloWorld.vue
├── services/           # Services métier
│   └── sheetService.js # Gestion des données CSV
├── generated/          # Fichiers générés automatiquement
├── views/             # Pages/Vues
└── router/            # Configuration routing
```

**Technologies clés :**
- Vue 3 (Composition API)
- Vite (build tool)
- vis-timeline (bibliothèque de timeline)
- vue-router (routing)

## 🎯 Démarrage rapide par éditeur

### 🎨 Cursor

**Configuration recommandée :**
1. Ouvrir le projet : `Cmd+O` → sélectionner le dossier
2. Installer les extensions suggérées automatiquement
3. Utiliser le terminal intégré pour les commandes npm

**Workflow optimal avec Cursor :**
```bash
# Démarrage
npm install && npm run dev

# Développement avec AI
# Utiliser Cmd+K pour les modifications de code
# Utiliser Cmd+I pour les questions contextuelles sur le code
```

**Commandes AI Cursor spécifiques :**
- `Cmd+K` + "Ajouter un nouveau composant timeline avec [fonctionnalité]"
- `Cmd+I` + "Expliquer le service sheetService.js"
- `@workspace` pour référencer l'ensemble du projet

### 🌊 Windsurf

**Configuration recommandée :**
1. Cloner et ouvrir : `File > Open Folder`
2. Activer le mode AI dans la sidebar
3. Configurer l'environnement Node.js

**Workflow optimal avec Windsurf :**
```bash
# Terminal Windsurf
npm install
npm run dev

# Utiliser Cascade (Flow) pour les modifications complexes
# Activer Supercomplete pour l'autocomplétion IA
```

**Commandes Windsurf spécifiques :**
- **Cascade (Flow)** : Pour des modifications multi-fichiers
- **Supercomplete** : Autocomplétion intelligente
- **Chat** : Questions contextuelles sur le projet
- Commande `/edit` pour modifications directes

### 💎 Claude Desktop

**Configuration recommandée :**
1. Démarrer Claude Desktop
2. Utiliser les outils MCP pour accéder aux fichiers
3. Analyser le projet étape par étape

**Workflow optimal avec Claude Desktop :**
```bash
# Dans le terminal système
cd /Users/mguiraud/Documents/gitlab/frise.chezmehdi.net
npm install && npm run dev
```

**Utilisation avec Claude Desktop :**
- Utiliser les outils de lecture de fichiers pour analyser le code
- Demander des analyses complètes de composants
- Générer de nouveaux composants avec des spécifications détaillées
- Utiliser l'outil d'écriture pour créer de nouveaux fichiers

## 🛠️ Commandes essentielles

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev
# → Ouvre http://localhost:5173

# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

## 📁 Fichiers clés à connaître

### `src/components/Timeline.vue`
Composant principal gérant l'affichage des timelines avec vis-timeline.

### `src/services/sheetService.js`
Service pour l'import et le traitement des fichiers CSV.

### `vite.config.js`
Configuration Vite avec :
- Alias `@` vers `src/`
- Configuration CORS
- Gestion des fichiers CSV
- Configuration du serveur de dev

### `src/generated/`
Dossier pour les composants générés automatiquement par IA.

## 🎨 Cas d'usage fréquents avec IA

### 1. Ajouter un nouveau type de timeline
```prompt
Créer un nouveau composant TimelineGantt.vue basé sur Timeline.vue 
mais optimisé pour les diagrammes de Gantt avec vis-timeline.
```

### 2. Améliorer l'import CSV
```prompt
Étendre sheetService.js pour supporter l'import Excel (.xlsx) 
en plus des fichiers CSV existants.
```

### 3. Ajouter une nouvelle vue
```prompt
Créer une nouvelle vue dans src/views/ pour gérer 
les paramètres d'export des timelines (PDF, PNG, SVG).
```

### 4. Optimiser les performances
```prompt
Analyser Timeline.vue et proposer des optimisations 
pour gérer de gros datasets (>1000 événements).
```

## 🔧 Configuration éditeur spécifique

### Extensions VSCode/Cursor recommandées
- **Vue.volar** (déjà configuré dans .vscode/extensions.json)
- **Vue 3 Snippets**
- **Vite** (support syntaxe)

### Configuration Windsurf
- Activer **Vue.js support** dans les settings
- Configurer **Supercomplete** pour Vue 3
- Activer **Flow mode** pour les modifications multi-composants

### Utilisation Claude Desktop
- Utiliser les outils MCP pour lire/écrire des fichiers
- Analyser la structure avec l'outil `directory_tree`
- Créer des artifacts pour les nouveaux composants

## 🐛 Debugging et développement

### Points de débogage courants
1. **Problèmes vis-timeline** : Vérifier les imports dans Timeline.vue
2. **Erreurs CSV** : Debugger sheetService.js avec des console.log
3. **Routing** : Vérifier src/router/index.js

### Logs utiles
```javascript
// Dans les composants Vue
console.log('Timeline data:', this.timelineData)

// Dans les services
console.log('CSV parsed:', parsedData)
```

## 📝 Bonnes pratiques par éditeur

### Cursor
- Utiliser `@workspace` dans les prompts pour le contexte global
- Exploiter Cmd+K pour des modifications ciblées
- Utiliser le terminal intégré pour git et npm

### Windsurf
- Activer Cascade pour les modifications complexes
- Utiliser Supercomplete en mode Vue.js
- Exploiter la sidebar AI pour les questions contextuelles

### Claude Desktop
- Analyser d'abord la structure complète du projet
- Utiliser les outils MCP pour les opérations sur fichiers
- Créer des artifacts pour les nouveaux composants
- Tester les modifications avec l'outil repl si nécessaire

## 📊 Exemples de Visualisation Intégrés

### 🎨 Technologies Disponibles

Le projet inclut des exemples complets de frises chronologiques avec trois technologies modernes :

#### **D3.js** (`Examples/d3js/`)
- **Fichier :** `timeline-betharram-d3.html`
- **Avantages :** Contrôle total, interactions avancées, performance
- **Fonctionnalités :** Zoom/pan natif, SVG, animations fluides
- **Cas d'usage :** Visualisations complexes, interactions personnalisées

#### **Chart.js** (`Examples/chartjs/`)
- **Fichier :** `timeline-betharram-chartjs.html`
- **Avantages :** Simplicité, responsive, plugins riches
- **Fonctionnalités :** Multiple vues, export PNG/SVG, densité temporelle
- **Cas d'usage :** Dashboards, rapports, analyses statistiques

#### **ApexCharts** (`Examples/apexcharts/`)
- **Fichier :** `timeline-betharram-apex.html`
- **Avantages :** Configuration déclarative, thèmes, toolbar intégré
- **Fonctionnalités :** RangeBar timeline, animations, export natif
- **Cas d'usage :** Applications business, présentations

### 🗃️ Données Source

**Fichier :** `Examples/pyrennees/republique-pyrenees-betharram-timeline.json`

```json
{
  "repuPyreneesEvents": [26 événements], // Événements ponctuels
  "repuPyreneesPeriods": [6 périodes],    // Périodes avec couleurs
  "TimelineFacts": [5 faits]              // Faits additionnels
}
```

### 🎯 Guide de Choix de Technologie

| Critère | D3.js | Chart.js | ApexCharts |
|---------|-------|----------|------------|
| **Courbe d'apprentissage** | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| **Flexibilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Rapidité de dev** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Personnalisation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

### 🛠️ Intégration dans le Projet Principal

**Pour Cursor/Windsurf :**
```prompt
Créer un composant Vue 3 qui intègre [D3.js/Chart.js/ApexCharts] 
basé sur l'exemple Examples/[technologie]/timeline-betharram-[tech].html
```

**Pour Claude Desktop :**
```prompt
Analyser Examples/[technologie]/ et créer un composant Vue réutilisable 
avec props pour les données et options de configuration
```

---

## 🚀 Prêt à coder !

Le projet est maintenant prêt pour le développement avec votre éditeur AI préféré. 

**Prochaines étapes suggérées :**
1. Lancer `npm run dev`
2. Explorer les exemples dans `Examples/`
3. Tester les trois technologies de visualisation
4. Choisir la technologie adaptée à votre cas d'usage
5. Intégrer dans le projet Vue principal
6. Développer de nouvelles fonctionnalités avec l'IA

**🎨 Pour commencer rapidement :**
- Ouvrir `Examples/d3js/timeline-betharram-d3.html` dans le navigateur
- Tester les interactions zoom/pan
- Examiner le code source pour comprendre la structure
- Adapter à vos propres données JSON

Happy coding! 🎉