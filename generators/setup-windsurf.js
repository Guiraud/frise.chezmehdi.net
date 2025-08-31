#!/usr/bin/env node

/**
 * Script de configuration automatique pour Windsurf IDE
 * Configure MCP et les workflows pour le générateur de frises chronologiques
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WindsurfSetup {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.windsurfDir = path.join(this.projectRoot, '.windsurf');
    this.generatorsPath = path.resolve(__dirname);
  }

  async setup() {
    console.log('🌊 Configuration de Windsurf IDE pour le générateur de frises...\n');

    try {
      // 1. Créer le répertoire .windsurf
      await this.createWindsurfDirectory();

      // 2. Configuration des outils
      await this.setupToolsConfiguration();

      // 3. Configuration Cascade (workflows)
      await this.setupCascadeConfiguration();

      // 4. Configuration MCP
      await this.setupMCPConfiguration();

      // 5. Configuration Copilot
      await this.setupCopilotConfiguration();

      // 6. Configuration des raccourcis
      await this.setupShortcuts();

      // 7. Instructions finales
      this.showFinalInstructions();

      console.log('✅ Configuration Windsurf terminée avec succès!\n');

    } catch (error) {
      console.error('❌ Erreur lors de la configuration:', error.message);
      process.exit(1);
    }
  }

  async createWindsurfDirectory() {
    console.log('📁 Création du répertoire .windsurf...');
    
    if (!fs.existsSync(this.windsurfDir)) {
      fs.mkdirSync(this.windsurfDir, { recursive: true });
    }
    
    console.log('✅ Répertoire .windsurf créé');
  }

  async setupToolsConfiguration() {
    console.log('🛠️ Configuration des outils...');

    const toolsConfig = {
      "timeline_generator": {
        type: "command",
        command: "node",
        args: [path.join(this.generatorsPath, "main.js")],
        cwd: this.generatorsPath,
        description: "Générateur de frises chronologiques IA",
        category: "Timeline",
        icon: "timeline",
        parameters: {
          action: {
            type: "string",
            enum: ["generate", "analyze", "test", "fragment"],
            description: "Action à effectuer",
            default: "generate"
          },
          config: {
            type: "string",
            description: "Configuration JSON ou chemin vers fichier",
            placeholder: "config/historical.json ou {\"type\":\"scientific\"}"
          }
        },
        examples: [
          {
            title: "Frise historique",
            action: "generate",
            config: "config/historical.json"
          },
          {
            title: "Analyse scientifique",
            action: "analyze", 
            config: "{\"type\":\"scientific\",\"domain\":\"physics\"}"
          },
          {
            title: "Test connectivité",
            action: "test",
            config: ""
          }
        ]
      },
      "timeline_quick_gen": {
        type: "command",
        command: "node",
        args: [path.join(this.generatorsPath, "main.js"), "generate"],
        cwd: this.generatorsPath,
        description: "Génération rapide de timeline",
        category: "Timeline",
        quickAccess: true,
        parameters: {
          type: {
            type: "select",
            options: ["historical", "scientific", "business", "personal", "project"],
            description: "Type de frise",
            default: "historical"
          },
          name: {
            type: "string",
            description: "Nom du composant",
            placeholder: "TimelineExample"
          },
          features: {
            type: "multiselect",
            options: ["zoom", "pan", "filter", "export", "search", "clustering"],
            description: "Fonctionnalités",
            default: ["zoom", "pan", "export"]
          }
        }
      },
      "timeline_analyze": {
        type: "command", 
        command: "node",
        args: [path.join(this.generatorsPath, "main.js"), "analyze"],
        cwd: this.generatorsPath,
        description: "Analyse avec pensée séquentielle",
        category: "Timeline",
        parameters: {
          requirements: {
            type: "json",
            description: "Besoins à analyser",
            schema: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["historical", "scientific", "business", "personal", "project"] },
                domain: { type: "string" },
                volume: { type: "string", enum: ["small", "medium", "large"] },
                complexity: { type: "string", enum: ["low", "medium", "high"] },
                target_audience: { type: "string" },
                features: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    };

    const toolsPath = path.join(this.windsurfDir, 'tools.json');
    fs.writeFileSync(toolsPath, JSON.stringify(toolsConfig, null, 2));
    
    console.log('✅ Configuration des outils sauvegardée');
  }

  async setupCascadeConfiguration() {
    console.log('🏔️ Configuration Cascade (workflows)...');

    const cascadeConfig = {
      flows: {
        "timeline_creation": {
          name: "Création complète de timeline",
          description: "Workflow complet: analyse → génération → intégration",
          trigger: "timeline_create",
          steps: [
            {
              name: "collect_requirements",
              type: "input",
              prompt: "Décrivez votre besoin de frise chronologique",
              output: "user_requirements"
            },
            {
              name: "analyze_needs",
              type: "tool",
              tool: "timeline_analyze",
              input: "user_requirements",
              output: "analysis_result"
            },
            {
              name: "generate_component",
              type: "tool", 
              tool: "timeline_generator",
              action: "generate",
              input: "analysis_result.final_configuration",
              output: "component_info"
            },
            {
              name: "open_generated_file",
              type: "action",
              action: "open_file",
              file: "component_info.component_path"
            },
            {
              name: "show_integration_guide",
              type: "display",
              content: "Composant généré avec succès! Consultez INTEGRATION.md pour l'intégrer."
            }
          ]
        },
        "timeline_optimization": {
          name: "Optimisation de timeline existante", 
          description: "Analyse et optimise une frise chronologique existante",
          trigger: "timeline_optimize",
          steps: [
            {
              name: "select_component",
              type: "file_picker",
              filter: "*.vue",
              prompt: "Sélectionnez le composant à optimiser",
              output: "existing_component"
            },
            {
              name: "analyze_current",
              type: "tool",
              tool: "timeline_analyze",
              input: "existing_component.analysis",
              output: "optimization_suggestions"
            },
            {
              name: "apply_optimizations",
              type: "choice",
              prompt: "Voulez-vous appliquer les optimisations automatiquement ?",
              options: ["Oui", "Non", "Voir les suggestions d'abord"],
              output: "apply_choice"
            },
            {
              name: "generate_optimized",
              type: "tool",
              tool: "timeline_generator", 
              condition: "apply_choice === 'Oui'",
              input: "optimization_suggestions.configuration",
              output: "optimized_component"
            }
          ]
        },
        "timeline_exploration": {
          name: "Exploration de bibliothèques",
          description: "Compare différentes bibliothèques pour un même besoin",
          trigger: "timeline_explore", 
          steps: [
            {
              name: "define_requirements",
              type: "form",
              fields: {
                type: { type: "select", options: ["historical", "scientific", "business", "personal", "project"] },
                volume: { type: "select", options: ["small", "medium", "large"] },
                features: { type: "multiselect", options: ["zoom", "3d", "realtime", "export", "collaboration"] }
              },
              output: "requirements"
            },
            {
              name: "generate_vis_version",
              type: "tool",
              tool: "timeline_generator",
              input: "requirements + {library: 'vis-timeline'}",
              output: "vis_component"
            },
            {
              name: "generate_d3_version", 
              type: "tool",
              tool: "timeline_generator",
              input: "requirements + {library: 'd3js'}",
              output: "d3_component"
            },
            {
              name: "generate_plotly_version",
              type: "tool", 
              tool: "timeline_generator",
              input: "requirements + {library: 'plotlyjs'}",
              output: "plotly_component"
            },
            {
              name: "compare_results",
              type: "analysis",
              input: ["vis_component", "d3_component", "plotly_component"],
              output: "comparison_report"
            }
          ]
        }
      },
      triggers: {
        "//timeline": {
          flow: "timeline_creation",
          description: "Crée une nouvelle timeline"
        },
        "//timeline-opt": {
          flow: "timeline_optimization", 
          description: "Optimise une timeline existante"
        },
        "//timeline-explore": {
          flow: "timeline_exploration",
          description: "Explore les options de bibliothèques"
        }
      }
    };

    const cascadePath = path.join(this.windsurfDir, 'cascade.yml');
    
    // Convertir en YAML pour Cascade
    const yaml = this.jsonToYaml(cascadeConfig);
    fs.writeFileSync(cascadePath, yaml);
    
    console.log('✅ Configuration Cascade sauvegardée');
  }

  async setupMCPConfiguration() {
    console.log('🔧 Configuration MCP...');

    const mcpConfig = {
      servers: {
        "timeline-mcp": {
          command: "node",
          args: [path.join(this.generatorsPath, "main.js")],
          cwd: this.generatorsPath,
          env: {
            MCP_MODE: "windsurf",
            NODE_ENV: "development"
          },
          timeout: 30000,
          restart_on_error: true
        }
      },
      client_config: {
        max_retries: 3,
        retry_delay: 1000,
        request_timeout: 15000
      }
    };

    const mcpPath = path.join(this.windsurfDir, 'mcp-config.json');
    fs.writeFileSync(mcpPath, JSON.stringify(mcpConfig, null, 2));
    
    console.log('✅ Configuration MCP sauvegardée');
  }

  async setupCopilotConfiguration() {
    console.log('🤖 Configuration Copilot...');

    const copilotConfig = `
// Configuration Windsurf Copilot pour générateur de frises
module.exports = {
  tools: {
    // Trigger: //timeline
    timelineGen: {
      trigger: '//timeline',
      description: 'Génère une frise chronologique avec IA',
      action: async (context) => {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        const prompt = context.selection || context.prompt || '';
        const command = \`node "${path.join(this.generatorsPath, 'main.js')}" analyze '\${prompt}'\`;
        
        try {
          const { stdout } = await execAsync(command);
          return {
            type: 'analysis',
            content: stdout,
            actions: [
              {
                label: 'Générer le composant',
                command: \`node "${path.join(this.generatorsPath, 'main.js')}" generate\`
              }
            ]
          };
        } catch (error) {
          return {
            type: 'error',
            content: \`Erreur: \${error.message}\`
          };
        }
      }
    },
    
    // Trigger: //timeline-config
    timelineConfig: {
      trigger: '//timeline-config',
      description: 'Génère une configuration de timeline',
      action: async (context) => {
        const configTemplate = {
          type: 'historical|scientific|business|personal|project',
          name: 'Timeline[Name]',
          description: 'Description de la frise',
          features: ['zoom', 'pan', 'filter', 'export'],
          library: 'vis-timeline|d3js|timelinejs|chartjs|plotlyjs',
          target_audience: 'general_public|students|experts|professionals'
        };
        
        return {
          type: 'snippet',
          content: JSON.stringify(configTemplate, null, 2),
          language: 'json'
        };
      }
    },
    
    // Trigger: //timeline-analyze
    timelineAnalyze: {
      trigger: '//timeline-analyze',
      description: 'Analyse des besoins avec pensée séquentielle',
      action: async (context) => {
        const requirements = context.selection || context.prompt;
        if (!requirements) {
          return {
            type: 'prompt',
            content: 'Décrivez vos besoins pour la frise chronologique'
          };
        }
        
        const command = \`node "${path.join(this.generatorsPath, 'main.js')}" analyze '\${requirements}'\`;
        const { exec } = require('child_process');
        
        return new Promise((resolve) => {
          exec(command, (error, stdout, stderr) => {
            if (error) {
              resolve({
                type: 'error',
                content: \`Erreur d'analyse: \${error.message}\`
              });
            } else {
              resolve({
                type: 'analysis',
                content: stdout,
                metadata: {
                  thinking_steps: 8,
                  llm_used: 'local'
                }
              });
            }
          });
        });
      }
    }
  },
  
  // Configuration globale
  settings: {
    auto_suggest: true,
    context_aware: true,
    multi_step_workflows: true
  },
  
  // Snippets spécialisés
  snippets: {
    'tl-vue-import': {
      prefix: 'tlimport',
      body: 'import \${1:TimelineComponent} from "@/generated/\${1:TimelineComponent}.vue";',
      description: 'Import composant timeline généré'
    },
    'tl-vue-use': {
      prefix: 'tluse', 
      body: [
        '<\${1:TimelineComponent}',
        '  :items="\${2:timelineData}"',
        '  :options="\${3:timelineOptions}"',
        '  @select="\${4:handleSelect}"',
        '  @rangechanged="\${5:handleRangeChanged}"',
        '/>'
      ],
      description: 'Utilisation composant timeline'
    }
  }
};
`;

    const copilotPath = path.join(this.windsurfDir, 'copilot-config.js');
    fs.writeFileSync(copilotPath, copilotConfig);
    
    console.log('✅ Configuration Copilot sauvegardée');
  }

  async setupShortcuts() {
    console.log('⌨️ Configuration des raccourcis...');

    const shortcutsConfig = {
      keybindings: [
        {
          key: "ctrl+shift+t",
          command: "windsurf.runTool",
          args: ["timeline_quick_gen"],
          when: "editorTextFocus"
        },
        {
          key: "ctrl+shift+a", 
          command: "windsurf.runTool",
          args: ["timeline_analyze"],
          when: "editorTextFocus"
        },
        {
          key: "ctrl+shift+w",
          command: "windsurf.runFlow", 
          args: ["timeline_creation"],
          when: "editorTextFocus"
        }
      ],
      commands: [
        {
          command: "timeline.generateFromSelection",
          title: "Timeline: Générer depuis sélection",
          keybinding: "ctrl+alt+t"
        },
        {
          command: "timeline.analyzeComponent",
          title: "Timeline: Analyser composant", 
          keybinding: "ctrl+alt+a"
        }
      ]
    };

    const shortcutsPath = path.join(this.windsurfDir, 'shortcuts.json');
    fs.writeFileSync(shortcutsPath, JSON.stringify(shortcutsConfig, null, 2));
    
    console.log('✅ Raccourcis sauvegardés');
  }

  // Utilitaire pour convertir JSON en YAML simple
  jsonToYaml(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    let yaml = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.jsonToYaml(value, indent + 1);
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        for (const item of value) {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n`;
            yaml += this.jsonToYaml(item, indent + 2);
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        }
      } else {
        yaml += `${spaces}${key}: ${JSON.stringify(value)}\n`;
      }
    }
    
    return yaml;
  }

  showFinalInstructions() {
    console.log('\n📋 INSTRUCTIONS FINALES:\n');
    
    console.log('1. 🔄 Redémarrer Windsurf IDE');
    console.log('2. 📖 Ouvrir la palette de commandes (Ctrl+Shift+P)');
    console.log('3. 🔍 Chercher "Timeline" pour voir les nouveaux outils');
    console.log('4. 🌊 Utiliser les triggers Cascade dans le chat');
    
    console.log('\n🎮 RACCOURCIS CLAVIER:');
    console.log('• Ctrl+Shift+T : Génération rapide');
    console.log('• Ctrl+Shift+A : Analyse des besoins');
    console.log('• Ctrl+Shift+W : Workflow complet');
    console.log('• Ctrl+Alt+T : Générer depuis sélection');
    console.log('• Ctrl+Alt+A : Analyser composant');
    
    console.log('\n🏔️ TRIGGERS CASCADE:');
    console.log('• //timeline : Workflow création complète');
    console.log('• //timeline-opt : Optimisation existante');
    console.log('• //timeline-explore : Exploration bibliothèques');
    
    console.log('\n🤖 TRIGGERS COPILOT:');
    console.log('• //timeline : Génération avec IA');
    console.log('• //timeline-config : Template de config');
    console.log('• //timeline-analyze : Analyse séquentielle');
    
    console.log('\n📝 SNIPPETS:');
    console.log('• tlimport : Import composant généré');
    console.log('• tluse : Utilisation composant');
    
    console.log('\n🛠️ OUTILS DISPONIBLES:');
    console.log('• timeline_generator : Génération principale');
    console.log('• timeline_quick_gen : Génération rapide');
    console.log('• timeline_analyze : Analyse avec IA');
    
    console.log('\n📂 FICHIERS CRÉÉS:');
    console.log(`• ${path.relative(this.projectRoot, path.join(this.windsurfDir, 'tools.json'))}`);
    console.log(`• ${path.relative(this.projectRoot, path.join(this.windsurfDir, 'cascade.yml'))}`);
    console.log(`• ${path.relative(this.projectRoot, path.join(this.windsurfDir, 'mcp-config.json'))}`);
    console.log(`• ${path.relative(this.projectRoot, path.join(this.windsurfDir, 'copilot-config.js'))}`);
    console.log(`• ${path.relative(this.projectRoot, path.join(this.windsurfDir, 'shortcuts.json'))}`);
    
    console.log('\n🎯 EXEMPLE D\'UTILISATION:');
    console.log('1. Ouvrir Windsurf');
    console.log('2. Taper "//timeline" dans le chat');
    console.log('3. Décrire vos besoins');
    console.log('4. Laisser le workflow vous guider');
    console.log('5. Composant généré automatiquement!');
    
    console.log('\n🆘 DÉPANNAGE:');
    console.log('• Vérifier que Node.js est accessible');
    console.log('• Redémarrer Windsurf après configuration');
    console.log('• Consulter les logs Windsurf en cas d\'erreur');
    console.log('• Tester avec: node main.js help');
  }
}

// Exécution
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new WindsurfSetup();
  setup.setup().catch(console.error);
}

export default WindsurfSetup;
