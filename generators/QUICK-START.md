# Guide de Démarrage Rapide - Générateur de Frises Chronologiques

Ce guide explique comment démarrer rapidement avec le générateur de frises chronologiques selon votre environnement de développement.

## 🎯 Aperçu rapide

Le système génère automatiquement des composants Vue.js de frises chronologiques en utilisant :
- **MCP-Delegate** pour la distribution sur plusieurs LLMs
- **Pensée séquentielle** pour l'analyse intelligente des besoins  
- **Templates spécialisés** pour différents domaines

---

## 🖥️ Cursor IDE

### Installation rapide

1. **Ouvrir le projet dans Cursor**
   ```bash
   cursor /Users/mguiraud/Documents/gitlab/frise.chezmehdi.net
   ```

2. **Naviguer vers le générateur**
   ```bash
   cd generators
   npm install
   ```

3. **Configuration Cursor pour MCP**
   - Ouvrir les paramètres Cursor (`Cmd+,`)
   - Aller dans "Extensions" > "MCP"
   - Ajouter la configuration :
   ```json
   {
     "mcpServers": {
       "timeline-generator": {
         "command": "node",
         "args": ["main.js"],
         "cwd": "./generators"
       }
     }
   }
   ```

### Utilisation dans Cursor

1. **Chat avec le générateur**
   - Ouvrir le chat Cursor (`Cmd+L`)
   - Taper : `@mcp timeline-generator generate config/historical.json`

2. **Génération interactive**
   ```
   @mcp Génère une frise chronologique pour l'histoire de l'informatique
   Type: historical
   Domaine: computer_science  
   Période: 1940-2024
   Public: étudiants
   ```

3. **Analyse de code existant**
   - Sélectionner un composant Vue existant
   - Chat : `@mcp Analyse ce composant et propose des optimisations avec le générateur`

### Intégration Cursor Composer

```typescript
// .cursor/composer.json
{
  "tools": {
    "timeline-generator": {
      "command": "./generators/main.js",
      "description": "Génère des frises chronologiques avec IA",
      "examples": [
        "generate config/scientific.json",
        "analyze '{\"type\":\"business\"}'"
      ]
    }
  }
}
```

---

## 🌊 Windsurf IDE

### Configuration Windsurf

1. **Installer l'extension MCP**
   - Ouvrir Windsurf
   - Extensions > Chercher "MCP"
   - Installer "MCP Client for Windsurf"

2. **Configuration des outils**
   ```json
   // .windsurf/tools.json
   {
     "timeline_generator": {
       "type": "command",
       "command": "node generators/main.js",
       "description": "Générateur de frises chronologiques IA",
       "parameters": {
         "action": {
           "type": "string",
           "enum": ["generate", "analyze", "test", "fragment"]
         },
         "config": {
           "type": "string",
           "description": "Configuration JSON ou chemin vers fichier"
         }
       }
     }
   }
   ```

### Utilisation Windsurf

1. **Commande rapide**
   - `Ctrl+Shift+P` > "Windsurf: Run Tool"
   - Sélectionner "timeline_generator"
   - Action: "generate"
   - Config: "config/historical.json"

2. **Flow interactif**
   ```
   🤖 Windsurf AI: Je vais générer une frise chronologique pour vous.
   
   1. Quel type souhaitez-vous ?
      - Historique 📚
      - Scientifique 🔬  
      - Business 💼
      - Personnel 👤
      - Projet 🚀
   
   2. [Utilisateur] Scientifique pour la physique quantique
   
   3. 🔄 Exécution: timeline_generator --action=analyze --config='{"type":"scientific","domain":"quantum_physics"}'
   ```

3. **Intégration avec Cascade**
   ```yaml
   # .windsurf/cascade.yml
   flows:
     timeline_creation:
       steps:
         - tool: timeline_generator
           action: analyze
           input: user_requirements
         - tool: timeline_generator  
           action: generate
           input: analysis_result
         - action: open_file
           file: src/generated/*.vue
   ```

### Windsurf Copilot Integration

```javascript
// .windsurf/copilot-config.js
module.exports = {
  tools: {
    timelineGen: {
      trigger: '//timeline',
      action: async (context) => {
        const { exec } = require('child_process');
        const prompt = context.selection || context.prompt;
        
        return new Promise((resolve) => {
          exec(`node generators/main.js analyze '${prompt}'`, (error, stdout) => {
            resolve(stdout);
          });
        });
      }
    }
  }
};
```

---

## 🖥️ Claude Desktop

### Configuration MCP pour Claude Desktop

1. **Fichier de configuration**
   ```json
   // ~/claude_desktop_config.json (macOS)
   // %APPDATA%\Claude\claude_desktop_config.json (Windows)
   {
     "mcpServers": {
       "timeline-generator": {
         "command": "node",
         "args": ["/Users/mguiraud/Documents/gitlab/frise.chezmehdi.net/generators/main.js"],
         "env": {
           "NODE_ENV": "production"
         }
       },
       "timeline-delegator": {
         "command": "node", 
         "args": ["/Users/mguiraud/Documents/gitlab/frise.chezmehdi.net/generators/mcp-demo.js"],
         "env": {
           "MCP_DELEGATE": "true"
         }
       }
     }
   }
   ```

### Utilisation avec Claude Desktop

1. **Génération simple**
   ```
   Utilisateur: Peux-tu générer une frise chronologique pour l'histoire de l'art ?

   Claude: Je vais utiliser le générateur de frises chronologiques pour créer un composant spécialisé.

   [Appel MCP: timeline-generator generate]
   Configuration: type=historical, domain=art_history, features=[image_gallery, artist_details]

   ✅ Composant TimelineArtHistory.vue généré avec succès !
   ```

2. **Analyse avancée avec pensée séquentielle**
   ```
   Utilisateur: J'ai besoin d'optimiser ma frise existante qui rame avec 2000 événements

   Claude: Je vais analyser vos besoins avec le moteur de pensée séquentielle.

   [Appel MCP: timeline-generator analyze]
   Analyse en 8 étapes...
   
   Recommandations:
   - Virtualisation pour gros datasets
   - Clustering intelligent
   - Lazy loading optimisé
   ```

3. **Fragmentation de prompts complexes**
   ```
   Utilisateur: [Prompt très complexe de 3000 caractères sur une timeline collaborative multi-utilisateurs]

   Claude: Ce prompt est complexe, je vais le fragmenter intelligemment.

   [Appel MCP: timeline-delegator fragment]
   📑 Fragmenté en 4 parties
   🤖 Distribution: llama3.2, mistral, codellama
   ✅ Analyse fusionnée et cohérente
   ```

### Commandes Claude Desktop spécialisées

```
🎯 Commandes rapides pour Claude Desktop:

"Génère timeline historique" 
→ Génération automatique avec config par défaut

"Analyse besoins: [description]"
→ Analyse séquentielle des besoins

"Optimise timeline existante"  
→ Analyse et recommandations d'optimisation

"Test connectivité LLM"
→ Vérification des modèles disponibles

"Fragmente: [prompt complexe]"
→ Décomposition intelligente multi-LLM
```

---

## 🚀 Démarrage rapide universel

### En 3 minutes chrono

```bash
# 1. Clone et setup (30s)
cd /Users/mguiraud/Documents/gitlab/frise.chezmehdi.net/generators
npm install

# 2. Test rapide (60s)  
./launch.sh check

# 3. Première génération (90s)
node main.js generate config/historical.json
```

### Vérification du succès

✅ **Composant généré** : `src/generated/TimelineXXX.vue`  
✅ **Documentation** : `src/generated/TimelineXXX.md`  
✅ **Logs positifs** : Pas d'erreur dans la console  
✅ **MCP connecté** : LLMs détectés dans les tests  

---

## 🛠️ Configuration par IDE

### Variables d'environnement communes

```bash
# .env (pour tous les IDEs)
NODE_ENV=development
MCP_ENDPOINT=http://localhost:11434
MCP_MODELS=llama3.2,mistral,codellama
TIMELINE_OUTPUT_DIR=../src/generated
THINKING_ENGINE_ENABLED=true
```

### Scripts package.json

```json
{
  "scripts": {
    "gen": "node main.js generate",
    "analyze": "node main.js analyze", 
    "test-mcp": "node main.js test",
    "demo": "./launch.sh demo",
    "cursor:setup": "node setup-cursor.js",
    "windsurf:setup": "node setup-windsurf.js", 
    "claude:setup": "node setup-claude.js"
  }
}
```

---

## 🔧 Dépannage rapide

### Problèmes courants

**❌ "MCP Server not found"**
```bash
# Vérifier le chemin absolu
which node
pwd
# Mettre à jour la config avec les bons chemins
```

**❌ "Ollama connection failed"** 
```bash
# Démarrer Ollama
ollama serve
# Installer les modèles
ollama pull llama3.2
```

**❌ "Template generation failed"**
```bash
# Vérifier les permissions
chmod +x launch.sh
# Recréer les templates
./launch.sh clean && ./launch.sh demo
```

### Tests de validation

```bash
# Test complet (2 minutes)
./launch.sh check

# Test MCP uniquement
node main.js test

# Test génération basique
node main.js generate '{"type":"historical","name":"Test"}'
```

---

## 📚 Ressources et liens

### Documentation
- [Guide complet](README.md) - Documentation détaillée
- [Intégration](INTEGRATION.md) - Intégration dans le projet principal
- [Configs d'exemple](config/) - Templates de configuration

### Support MCP
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Ollama Setup](https://ollama.ai/download)
- [Claude Desktop](https://claude.ai/download)

### Communauté
- **Issues** : GitLab Issues du projet
- **Discussions** : Channels MCP communautaires
- **Updates** : Suivre les mises à jour du projet

---

## 🎉 Prêt à commencer !

Choisissez votre IDE et suivez la section correspondante. En quelques minutes, vous aurez un système complet de génération automatique de frises chronologiques avec IA ! 

Pour toute question : consultez d'abord le [README.md](README.md) puis ouvrez une issue si nécessaire.

**Happy coding! 🚀**
