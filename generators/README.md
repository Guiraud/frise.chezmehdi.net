# Générateur de Frises Chronologiques Interactives

Un système avancé de génération automatique de frises chronologiques utilisant **mcp-delegate** et la **pensée séquentielle** pour créer des composants Vue.js optimisés.

## 🎯 Fonctionnalités

- **Analyse intelligente** : Utilise la pensée séquentielle avec des LLMs locaux
- **Multi-bibliothèques** : Support de Vis-Timeline, D3.js, TimelineJS, Chart.js, Plotly.js
- **Fragmentation avancée** : Décompose les prompts complexes pour une analyse optimale
- **Templates spécialisés** : Historique, Scientifique, Business, Personnel, Projet
- **Génération automatique** : Composants Vue.js prêts à l'emploi
- **MCP-Delegate** : Distribution intelligente sur plusieurs modèles LLM

## 🚀 Installation

### Prérequis

1. **Node.js** >= 16.0.0
2. **Ollama** avec des modèles locaux installés
3. **Vue.js** 3.x dans votre projet

### Installation d'Ollama et des modèles

```bash
# Installation d'Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Installation des modèles recommandés
ollama pull llama3.2
ollama pull mistral
ollama pull codellama
ollama pull gemma

# Vérification
ollama list
```

### Installation du générateur

```bash
# Installation locale
cd generators
npm install

# Installation globale (optionnelle)
npm install -g .
```

## 🎮 Utilisation

### Génération rapide

```bash
# Génération avec configuration par défaut
node main.js generate

# Génération avec configuration spécifique
node main.js generate config/historical.json

# Génération avec JSON direct
node main.js generate '{"type":"scientific","name":"TimelinePhysics"}'
```

### Exemples prédéfinis

```bash
# Frise historique (Seconde Guerre mondiale)
npm run demo-historical

# Frise scientifique (Physique quantique)
npm run demo-scientific

# Frise business (Startup journey)
npm run demo-business

# Frise personnelle (Carrière)
npm run demo-personal

# Frise projet (Agile/Scrum)
npm run demo-project
```

### Analyse des besoins

```bash
# Analyse approfondie avec pensée séquentielle
node main.js analyze '{"type":"scientific","domain":"astronomy","volume":"large"}'

# Analyse interactive
node main.js analyze
```

### Tests et diagnostics

```bash
# Test de connectivité avec les LLMs
node main.js test

# Test de fragmentation de prompt
node main.js fragment "Prompt complexe à analyser..."
```

## 📋 Configuration

### Structure d'une configuration

```json
{
  "type": "historical|scientific|business|personal|project",
  "name": "NomDuComposant",
  "description": "Description de la frise",
  "features": ["zoom", "pan", "filter", "export"],
  "library": "vis-timeline|d3js|timelinejs|chartjs|plotlyjs",
  "options": {
    "responsive": true,
    "interactive": true,
    "animation": true
  },
  "styles": {
    "theme": "modern",
    "colors": ["#color1", "#color2"]
  },
  "data_fields": ["date", "event", "description"],
  "target_audience": "general_public|students|experts",
  "expected_volume": "small|medium|large"
}
```

### Types de frises disponibles

| Type | Description | Bibliothèque par défaut | Cas d'usage |
|------|-------------|------------------------|-------------|
| `historical` | Événements historiques | vis-timeline | Éducation, musées |
| `scientific` | Découvertes scientifiques | plotlyjs | Recherche, académique |
| `business` | Jalons d'entreprise | vis-timeline | Corporate, startups |
| `personal` | Parcours personnel | timelinejs | CV, portfolio |
| `project` | Gestion de projet | vis-timeline | Agile, sprints |

## 🧠 Pensée Séquentielle

Le système utilise un processus d'analyse en 8 étapes :

1. **Analyse du contexte** - Domaine, public, objectifs
2. **Analyse des données** - Structure, volume, relations
3. **Sélection technologique** - Bibliothèque optimale
4. **Design et UX** - Interface, interactions
5. **Optimisation** - Performance, accessibilité
6. **Implémentation** - Architecture, composants
7. **Tests** - Validation, qualité
8. **Évolutivité** - Maintenance, extensions

### Fragmentation intelligente

Pour les prompts complexes, le système :
- Détecte automatiquement les sections sémantiques
- Distribue l'analyse sur plusieurs modèles LLM
- Fusionne les résultats de manière cohérente
- Optimise selon les forces de chaque modèle

## 🔧 Architecture

```
generators/
├── main.js                     # Point d'entrée CLI
├── timeline-generator.js       # Générateur principal
├── thinking-engine/            # Moteur de pensée séquentielle
│   ├── thinking-engine.js      # Analyse séquentielle
│   └── mcp-delegate-wrapper.js # Interface MCP-Delegate
├── templates/                  # Templates de composants
│   ├── base.vue               # Template de base
│   ├── historical.vue         # Spécialisé historique
│   └── ...
├── libraries/                  # Intégrations bibliothèques
│   ├── vis-timeline.js        # Vis-Timeline
│   ├── d3js.js               # D3.js
│   └── ...
├── config/                    # Configurations exemple
│   ├── historical.json       # Frise historique
│   ├── scientific.json       # Frise scientifique
│   └── ...
└── src/generated/             # Composants générés
```

## 🎨 Bibliothèques supportées

### Vis-Timeline
- **Forces** : Interactions avancées, groupes, clustering
- **Usage** : Business, projets, historique général
- **Performance** : Excellente jusqu'à 10k items

### D3.js
- **Forces** : Flexibilité maximale, animations custom
- **Usage** : Visualisations scientifiques complexes
- **Performance** : Variable selon l'implémentation

### TimelineJS
- **Forces** : Storytelling, médias riches, narratif
- **Usage** : Parcours personnels, éducation
- **Performance** : Optimisée pour le contenu média

### Plotly.js
- **Forces** : Graphiques scientifiques, 3D, interactivité
- **Usage** : Recherche, données scientifiques
- **Performance** : Excellente pour visualisations complexes

### Chart.js
- **Forces** : Simplicité, performance, responsive
- **Usage** : Métriques business, KPIs temporels
- **Performance** : Très bonne pour données moyennes

## 🔄 MCP-Delegate

### Configuration des modèles

Le système s'adapte automatiquement aux modèles disponibles :

```javascript
{
  'llama3.2': {
    strengths: ['analysis', 'reasoning', 'french'],
    usage: 'Analyse contextuelle et synthèse'
  },
  'mistral': {
    strengths: ['technical', 'structured', 'code'],
    usage: 'Architecture et implémentation'
  },
  'codellama': {
    strengths: ['programming', 'architecture'],
    usage: 'Génération de code et optimisation'
  },
  'gemma': {
    strengths: ['creative', 'design', 'ux'],
    usage: 'Design et expérience utilisateur'
  }
}
```

### Stratégies de fusion

- **Comprehensive** : Fusion complète multi-modèles
- **Prioritized** : Priorisation selon expertise
- **Consensus** : Recherche de consensus entre modèles

## 📊 Exemples d'usage

### Frise historique complète

```bash
node main.js generate '{
  "type": "historical",
  "name": "TimelineRevolutionFrancaise",
  "description": "Chronologie de la Révolution française",
  "period": "1789-1799",
  "features": ["zoom", "filter", "clustering", "export"],
  "data_source": "spreadsheet",
  "target_audience": "students",
  "expected_volume": "large"
}'
```

### Frise scientifique avec 3D

```bash
node main.js generate '{
  "type": "scientific",
  "name": "TimelineSpaceExploration", 
  "description": "Exploration spatiale",
  "library": "plotlyjs",
  "features": ["3d_visualization", "animation", "interactive"],
  "special_features": {
    "orbital_mechanics": true,
    "mission_trajectories": true
  }
}'
```

### Analyse approfondie

```bash
node main.js analyze '{
  "description": "Frise pour startup fintech avec intégrations API",
  "domain": "financial_technology",
  "volume": "real_time_large",
  "complexity": "high",
  "requirements": [
    "real_time_updates",
    "financial_compliance",
    "multi_currency",
    "audit_trail"
  ]
}'
```

## 🧪 Tests et développement

### Tests de connectivité

```bash
# Test complet des modèles
npm run test-connectivity

# Test d'un modèle spécifique
node -e "
import { MCPDelegateWrapper } from './thinking-engine/mcp-delegate-wrapper.js';
const mcp = new MCPDelegateWrapper();
console.log(await mcp.testConnectivity());
"
```

### Développement et debug

```bash
# Mode développement avec rechargement automatique
npm run dev

# Test de fragmentation
npm run fragment-test

# Lint du code
npm run lint
```

## 🎯 Cas d'usage avancés

### Intégration avec APIs externes

```json
{
  "data_source": "api",
  "api_config": {
    "endpoint": "https://api.example.com/timeline",
    "auth": "bearer_token",
    "refresh_interval": 300
  },
  "real_time": true
}
```

### Collaboration en temps réel

```json
{
  "collaboration": {
    "real_time_editing": true,
    "shared_cursors": true,
    "comment_system": true,
    "version_control": true
  }
}
```

### Export et partage

```json
{
  "export_options": {
    "formats": ["png", "svg", "pdf", "html"],
    "quality": "high",
    "watermark": false,
    "sharing_links": true
  }
}
```

## 🐛 Dépannage

### Problèmes courants

1. **Ollama non connecté**
   ```bash
   # Vérifier qu'Ollama fonctionne
   curl http://localhost:11434/api/tags
   
   # Redémarrer si nécessaire
   ollama serve
   ```

2. **Modèles manquants**
   ```bash
   # Installer les modèles recommandés
   ollama pull llama3.2 mistral codellama
   ```

3. **Erreurs de génération**
   ```bash
   # Analyser d'abord les besoins
   node main.js analyze '{"type":"historical"}'
   
   # Puis générer avec fallback
   node main.js generate --fallback
   ```

### Debug avancé

```bash
# Mode verbose
DEBUG=* node main.js generate config/historical.json

# Logs détaillés de la pensée séquentielle
NODE_ENV=development node main.js analyze
```

## 🔮 Roadmap

- [ ] Interface web pour la configuration
- [ ] Support de nouveaux LLMs (Claude, GPT-4)
- [ ] Templates additionnels (médical, juridique)
- [ ] Intégration Figma pour le design
- [ ] Mode collaboratif avancé
- [ ] Analytics et métriques d'usage
- [ ] API REST pour intégration externe
- [ ] Plugins pour éditeurs de code

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📜 Licence

MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Ollama](https://ollama.ai/) pour l'infrastructure LLM locale
- [Vis.js](https://visjs.org/) pour la bibliothèque de timeline
- [Vue.js](https://vuejs.org/) pour le framework frontend
- La communauté MCP pour les outils de délégation

---

**Développé avec ❤️ par [Mehdi Guiraud](https://github.com/votre-username)**

Pour plus d'informations : https://frise.chezmehdi.net
