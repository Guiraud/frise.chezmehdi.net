#!/usr/bin/env node

/**
 * Script de configuration automatique pour Cursor IDE
 * Configure MCP et les outils pour le générateur de frises chronologiques
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CursorSetup {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.cursorDir = path.join(this.projectRoot, '.cursor');
    this.generatorsPath = path.resolve(__dirname);
  }

  async setup() {
    console.log('🎯 Configuration de Cursor IDE pour le générateur de frises...\n');

    try {
      // 1. Créer le répertoire .cursor
      await this.createCursorDirectory();

      // 2. Configuration MCP
      await this.setupMCPConfiguration();

      // 3. Configuration Composer
      await this.setupComposerConfiguration();

      // 4. Configuration des outils
      await this.setupToolsConfiguration();

      // 5. Configuration des snippets
      await this.setupSnippets();

      // 6. Instructions finales
      this.showFinalInstructions();

      console.log('✅ Configuration Cursor terminée avec succès!\n');

    } catch (error) {
      console.error('❌ Erreur lors de la configuration:', error.message);
      process.exit(1);
    }
  }

  async createCursorDirectory() {
    console.log('📁 Création du répertoire .cursor...');
    
    if (!fs.existsSync(this.cursorDir)) {
      fs.mkdirSync(this.cursorDir, { recursive: true });
    }
    
    console.log('✅ Répertoire .cursor créé');
  }

  async setupMCPConfiguration() {
    console.log('🔧 Configuration MCP...');

    const mcpConfig = {
      mcpServers: {
        "timeline-generator": {
          command: "node",
          args: [path.join(this.generatorsPath, "main.js")],
          cwd: this.generatorsPath,
          env: {
            NODE_ENV: "development",
            MCP_MODE: "cursor"
          }
        },
        "timeline-demo": {
          command: "node", 
          args: [path.join(this.generatorsPath, "mcp-demo.js")],
          cwd: this.generatorsPath,
          env: {
            MCP_DELEGATE: "true"
          }
        }
      }
    };

    const mcpConfigPath = path.join(this.cursorDir, 'mcp-config.json');
    fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
    
    console.log('✅ Configuration MCP sauvegardée');
  }

  async setupComposerConfiguration() {
    console.log('🎼 Configuration Cursor Composer...');

    const composerConfig = {
      tools: {
        "timeline-generator": {
          command: path.join(this.generatorsPath, "main.js"),
          description: "Génère des frises chronologiques avec IA",
          examples: [
            "generate config/historical.json",
            "generate '{\"type\":\"scientific\",\"name\":\"TimelinePhysics\"}'",
            "analyze '{\"type\":\"business\",\"domain\":\"startup\"}'",
            "test"
          ],
          categories: ["generation", "ai", "vue"]
        },
        "timeline-analysis": {
          command: path.join(this.generatorsPath, "main.js"),
          args: ["analyze"],
          description: "Analyse les besoins avec pensée séquentielle",
          examples: [
            "'{\"type\":\"scientific\",\"complexity\":\"high\"}'",
            "'{\"existing_component\":\"Timeline.vue\",\"optimization_needs\":[\"performance\"]}''"
          ],
          categories: ["analysis", "ai"]
        }
      },
      workflows: {
        "create-timeline": {
          description: "Workflow complet de création de frise",
          steps: [
            {
              tool: "timeline-analysis",
              input: "user_requirements",
              output: "analysis_result"
            },
            {
              tool: "timeline-generator", 
              action: "generate",
              input: "analysis_result",
              output: "component_path"
            },
            {
              action: "open_file",
              input: "component_path"
            }
          ]
        }
      }
    };

    const composerPath = path.join(this.cursorDir, 'composer.json');
    fs.writeFileSync(composerPath, JSON.stringify(composerConfig, null, 2));
    
    console.log('✅ Configuration Composer sauvegardée');
  }

  async setupToolsConfiguration() {
    console.log('🛠️ Configuration des outils...');

    const toolsConfig = {
      "timeline.generate": {
        "title": "Générer Timeline",
        "command": "node generators/main.js generate",
        "group": "Timeline",
        "shortcut": "Cmd+Shift+T",
        "input": {
          "type": "prompt",
          "placeholder": "Type de frise (historical/scientific/business/personal/project)"
        }
      },
      "timeline.analyze": {
        "title": "Analyser Besoins Timeline", 
        "command": "node generators/main.js analyze",
        "group": "Timeline",
        "shortcut": "Cmd+Shift+A",
        "input": {
          "type": "selection_or_prompt",
          "placeholder": "Décrivez vos besoins pour la frise chronologique"
        }
      },
      "timeline.test": {
        "title": "Test Connectivité LLM",
        "command": "node generators/main.js test", 
        "group": "Timeline"
      },
      "timeline.demo": {
        "title": "Démo Complete",
        "command": "./generators/launch.sh demo",
        "group": "Timeline"
      }
    };

    const toolsPath = path.join(this.cursorDir, 'tools.json');
    fs.writeFileSync(toolsPath, JSON.stringify(toolsConfig, null, 2));
    
    console.log('✅ Configuration des outils sauvegardée');
  }

  async setupSnippets() {
    console.log('📝 Configuration des snippets...');

    const snippets = {
      "timeline-config": {
        "prefix": "tl-config",
        "body": [
          "{",
          "  \"type\": \"${1|historical,scientific,business,personal,project|}\",",
          "  \"name\": \"Timeline${2:Name}\",", 
          "  \"description\": \"${3:Description}\",",
          "  \"features\": [${4:\"zoom\", \"filter\", \"export\"}],",
          "  \"library\": \"${5|vis-timeline,d3js,timelinejs,chartjs,plotlyjs|}\",",
          "  \"target_audience\": \"${6:general_public}\"",
          "}"
        ],
        "description": "Configuration de frise chronologique"
      },
      "timeline-analyze": {
        "prefix": "tl-analyze", 
        "body": [
          "{",
          "  \"type\": \"${1|historical,scientific,business,personal,project|}\",",
          "  \"domain\": \"${2:domain}\",",
          "  \"volume\": \"${3|small,medium,large|}\",", 
          "  \"complexity\": \"${4|low,medium,high|}\",",
          "  \"target_audience\": \"${5:audience}\",",
          "  \"features\": [${6:features}]",
          "}"
        ],
        "description": "Configuration d'analyse de besoins"
      },
      "timeline-vue-import": {
        "prefix": "tl-import",
        "body": [
          "import ${1:TimelineComponent} from '@/generated/${1:TimelineComponent}.vue';"
        ],
        "description": "Import d'un composant timeline généré"
      },
      "timeline-vue-usage": {
        "prefix": "tl-use",
        "body": [
          "<${1:TimelineComponent}",
          "  :items=\"${2:timelineData}\"",
          "  :options=\"${3:timelineOptions}\"",
          "  @select=\"${4:handleSelect}\"",
          "  @rangechanged=\"${5:handleRangeChanged}\"",
          "/>"
        ],
        "description": "Utilisation d'un composant timeline"
      }
    };

    const snippetsPath = path.join(this.cursorDir, 'snippets.json');
    fs.writeFileSync(snippetsPath, JSON.stringify(snippets, null, 2));
    
    console.log('✅ Snippets sauvegardés');
  }

  showFinalInstructions() {
    console.log('\n📋 INSTRUCTIONS FINALES:\n');
    
    console.log('1. 🔄 Redémarrer Cursor IDE');
    console.log('2. 📖 Ouvrir la palette de commandes (Cmd+Shift+P)');
    console.log('3. 🔍 Chercher "Timeline" pour voir les nouveaux outils');
    console.log('4. 💬 Dans le chat, utiliser @mcp pour accéder aux fonctions MCP');
    
    console.log('\n🎮 COMMANDES RAPIDES:');
    console.log('• Cmd+Shift+T : Générer une timeline');
    console.log('• Cmd+Shift+A : Analyser des besoins');
    console.log('• tl-config : Snippet de configuration');
    console.log('• tl-analyze : Snippet d\'analyse');
    
    console.log('\n💬 EXEMPLES CHAT:');
    console.log('• "@mcp Génère une frise historique pour la Révolution française"');
    console.log('• "@mcp Analyse mes besoins pour une timeline scientifique"');
    console.log('• "@mcp Test la connectivité avec les LLMs"');
    
    console.log('\n📂 FICHIERS CRÉÉS:');
    console.log(`• ${path.relative(this.projectRoot, path.join(this.cursorDir, 'mcp-config.json'))}`);
    console.log(`• ${path.relative(this.projectRoot, path.join(this.cursorDir, 'composer.json'))}`);
    console.log(`• ${path.relative(this.projectRoot, path.join(this.cursorDir, 'tools.json'))}`);
    console.log(`• ${path.relative(this.projectRoot, path.join(this.cursorDir, 'snippets.json'))}`);
  }
}

// Exécution
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new CursorSetup();
  setup.setup().catch(console.error);
}

export default CursorSetup;
