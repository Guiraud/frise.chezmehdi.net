#!/usr/bin/env node

/**
 * Script de configuration automatique pour Claude Desktop
 * Configure MCP pour le générateur de frises chronologiques
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ClaudeDesktopSetup {
  constructor() {
    this.generatorsPath = path.resolve(__dirname);
    this.configPath = this.getClaudeConfigPath();
  }

  getClaudeConfigPath() {
    const platform = os.platform();
    
    switch (platform) {
      case 'darwin': // macOS
        return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
      case 'win32': // Windows  
        return path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
      case 'linux': // Linux
        return path.join(os.homedir(), '.config', 'claude', 'claude_desktop_config.json');
      default:
        throw new Error(`Plateforme non supportée: ${platform}`);
    }
  }

  async setup() {
    console.log('🖥️ Configuration de Claude Desktop pour le générateur de frises...\n');
    
    try {
      // 1. Vérifier l'installation de Claude Desktop
      await this.checkClaudeDesktop();

      // 2. Créer le répertoire de configuration
      await this.createConfigDirectory();

      // 3. Configuration MCP
      await this.setupMCPConfiguration();

      // 4. Tester la configuration
      await this.testConfiguration();

      // 5. Instructions finales
      this.showFinalInstructions();

      console.log('✅ Configuration Claude Desktop terminée avec succès!\n');

    } catch (error) {
      console.error('❌ Erreur lors de la configuration:', error.message);
      process.exit(1);
    }
  }

  async checkClaudeDesktop() {
    console.log('🔍 Vérification de Claude Desktop...');
    
    const platform = os.platform();
    let claudeInstalled = false;

    switch (platform) {
      case 'darwin':
        claudeInstalled = fs.existsSync('/Applications/Claude.app');
        break;
      case 'win32':
        // Vérifier plusieurs emplacements possibles sur Windows
        const windowsPaths = [
          path.join(os.homedir(), 'AppData', 'Local', 'Claude', 'Claude.exe'),
          'C:\\Program Files\\Claude\\Claude.exe',
          'C:\\Program Files (x86)\\Claude\\Claude.exe'
        ];
        claudeInstalled = windowsPaths.some(p => fs.existsSync(p));
        break;
      case 'linux':
        // Vérifier snap, AppImage, ou installation système
        try {
          const { execSync } = await import('child_process');
          execSync('which claude-desktop', { stdio: 'ignore' });
          claudeInstalled = true;
        } catch {
          claudeInstalled = fs.existsSync('/usr/bin/claude') || 
                           fs.existsSync('/usr/local/bin/claude') ||
                           fs.existsSync(path.join(os.homedir(), '.local', 'bin', 'claude'));
        }
        break;
    }

    if (!claudeInstalled) {
      console.warn('⚠️ Claude Desktop n\'est pas détecté.');
      console.log('📥 Téléchargez Claude Desktop depuis: https://claude.ai/download');
      console.log('🔄 Relancez ce script après installation.');
    } else {
      console.log('✅ Claude Desktop détecté');
    }
  }

  async createConfigDirectory() {
    console.log('📁 Création du répertoire de configuration...');
    
    const configDir = path.dirname(this.configPath);
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`✅ Répertoire créé: ${configDir}`);
    } else {
      console.log('✅ Répertoire de configuration existe');
    }
  }

  async setupMCPConfiguration() {
    console.log('🔧 Configuration MCP...');

    // Configuration MCP pour Claude Desktop
    const mcpConfig = {
      mcpServers: {
        "timeline-generator": {
          command: "node",
          args: [path.join(this.generatorsPath, "main.js")],
          env: {
            NODE_ENV: "production",
            MCP_MODE: "claude_desktop"
          }
        },
        "timeline-analyzer": {
          command: "node",
          args: [path.join(this.generatorsPath, "main.js"), "analyze"],
          env: {
            NODE_ENV: "production",
            THINKING_ENGINE: "true"
          }
        },
        "timeline-delegator": {
          command: "node", 
          args: [path.join(this.generatorsPath, "mcp-demo.js")],
          env: {
            MCP_DELEGATE: "true",
            AUTO_MERGE: "true"
          }
        }
      },
      // Configuration globale
      globalSettings: {
        timeout: 30000,
        retries: 3,
        logLevel: "info"
      }
    };

    // Merger avec la configuration existante si elle existe
    let existingConfig = {};
    if (fs.existsSync(this.configPath)) {
      try {
        const content = fs.readFileSync(this.configPath, 'utf8');
        existingConfig = JSON.parse(content);
        console.log('📄 Configuration existante détectée, fusion en cours...');
      } catch (error) {
        console.warn('⚠️ Erreur lecture config existante, création d\'une nouvelle');
      }
    }

    // Fusionner les configurations
    const finalConfig = {
      ...existingConfig,
      mcpServers: {
        ...existingConfig.mcpServers,
        ...mcpConfig.mcpServers
      },
      globalSettings: {
        ...existingConfig.globalSettings,
        ...mcpConfig.globalSettings
      }
    };

    // Sauvegarder la configuration
    fs.writeFileSync(this.configPath, JSON.stringify(finalConfig, null, 2));
    console.log(`✅ Configuration MCP sauvegardée: ${this.configPath}`);

    // Créer aussi une copie de backup
    const backupPath = this.configPath + '.backup.' + Date.now();
    if (fs.existsSync(this.configPath)) {
      fs.copyFileSync(this.configPath, backupPath);
      console.log(`💾 Backup créé: ${backupPath}`);
    }
  }

  async testConfiguration() {
    console.log('🧪 Test de la configuration...');

    try {
      // Test de base : vérifier que Node.js fonctionne
      const { execSync } = await import('child_process');
      
      // Test du générateur principal
      const testCommand = `node "${path.join(this.generatorsPath, 'main.js')}" help`;
      execSync(testCommand, { stdio: 'pipe' });
      console.log('✅ Générateur principal fonctionne');

      // Test de connectivité LLM (optionnel)
      try {
        const testConnectivity = `node "${path.join(this.generatorsPath, 'main.js')}" test`;
        const output = execSync(testConnectivity, { stdio: 'pipe', timeout: 10000 });
        console.log('✅ Test de connectivité LLM réussi');
      } catch (error) {
        console.warn('⚠️ Test LLM échoué (Ollama pas installé/démarré)');
      }

    } catch (error) {
      console.error('❌ Test de configuration échoué:', error.message);
      throw error;
    }
  }

  showFinalInstructions() {
    console.log('\n📋 INSTRUCTIONS FINALES:\n');
    
    console.log('1. 🔄 Redémarrer Claude Desktop (si ouvert)');
    console.log('2. 🖥️ Ouvrir Claude Desktop');
    console.log('3. 💬 Les nouveaux outils MCP seront automatiquement disponibles');
    
    console.log('\n🎮 COMMANDES DISPONIBLES DANS CLAUDE:\n');
    
    console.log('📊 **Génération de frises:**');
    console.log('• "Génère une frise chronologique historique"');
    console.log('• "Crée une timeline scientifique pour la physique"'); 
    console.log('• "Je veux une frise business pour ma startup"');
    
    console.log('\n🧠 **Analyse avec pensée séquentielle:**');
    console.log('• "Analyse mes besoins: frise collaborative temps réel"');
    console.log('• "Optimise ma timeline existante qui rame"');
    console.log('• "Quelle bibliothèque JS pour 10000 événements ?"');
    
    console.log('\n🔧 **Tests et diagnostics:**');
    console.log('• "Test la connectivité avec les LLMs"');
    console.log('• "Vérifie que le générateur fonctionne"');
    console.log('• "Montre-moi les modèles Ollama disponibles"');
    
    console.log('\n🎯 **Fragmentation avancée:**');
    console.log('• "Fragmente ce prompt complexe: [votre prompt long]"');
    console.log('• "Analyse avec multi-LLM: [besoins complexes]"');
    
    console.log('\n⚙️ **Configuration générée:**');
    console.log(`📄 ${this.configPath}`);
    console.log('🔧 3 serveurs MCP configurés:');
    console.log('   • timeline-generator (génération)');
    console.log('   • timeline-analyzer (analyse)'); 
    console.log('   • timeline-delegator (fragmentation)');
    
    console.log('\n🆘 **En cas de problème:**');
    console.log('1. Vérifier que Node.js est installé');
    console.log('2. Redémarrer Claude Desktop');
    console.log('3. Consulter les logs Claude Desktop');
    console.log('4. Tester avec: node main.js help');
    
    console.log('\n📚 **Ressources:**');
    console.log('• Guide complet: README.md');
    console.log('• Démarrage rapide: QUICK-START.md');
    console.log('• Config Claude: https://claude.ai/docs/mcp');
  }

  // Méthode utilitaire pour réinitialiser la config
  async reset() {
    console.log('🔄 Réinitialisation de la configuration Claude Desktop...');
    
    if (fs.existsSync(this.configPath)) {
      const backupPath = this.configPath + '.backup-before-reset.' + Date.now();
      fs.copyFileSync(this.configPath, backupPath);
      console.log(`💾 Backup créé: ${backupPath}`);
      
      // Lire la config existante et retirer nos serveurs
      try {
        const content = fs.readFileSync(this.configPath, 'utf8');
        const config = JSON.parse(content);
        
        // Retirer nos serveurs MCP
        if (config.mcpServers) {
          delete config.mcpServers['timeline-generator'];
          delete config.mcpServers['timeline-analyzer'];
          delete config.mcpServers['timeline-delegator'];
        }
        
        fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
        console.log('✅ Configuration réinitialisée');
      } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation:', error.message);
      }
    } else {
      console.log('ℹ️ Aucune configuration à réinitialiser');
    }
  }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);
const command = args[0];

if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new ClaudeDesktopSetup();
  
  switch (command) {
    case 'reset':
      setup.reset().catch(console.error);
      break;
    case 'test':
      setup.testConfiguration().catch(console.error);
      break;
    default:
      setup.setup().catch(console.error);
  }
}

export default ClaudeDesktopSetup;
