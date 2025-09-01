#!/usr/bin/env node

/**
 * Script principal pour la génération de frises chronologiques interactives
 * Utilise mcp-delegate et la pensée séquentielle pour une analyse approfondie
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import des modules locaux
import TimelineGenerator from './timeline-generator.js';
import { ThinkingEngine } from './thinking-engine/thinking-engine.js';
import { MCPDelegateWrapper } from './thinking-engine/mcp-delegate-wrapper.js';

class TimelineGeneratorCLI {
  constructor() {
    this.generator = new TimelineGenerator();
    this.thinkingEngine = new ThinkingEngine();
    this.mcpDelegate = new MCPDelegateWrapper();
    
    // Configuration CLI
    this.commands = {
      'generate': this.generateTimeline.bind(this),
      'analyze': this.analyzeRequirements.bind(this),
      'test': this.testConnectivity.bind(this),
      'fragment': this.testFragmentation.bind(this),
      'help': this.showHelp.bind(this)
    };
  }

  /**
   * Point d'entrée principal
   */
  async run() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      this.showWelcome();
      this.showHelp();
      return;
    }
    
    const command = args[0];
    const commandArgs = args.slice(1);
    
    if (this.commands[command]) {
      try {
        await this.commands[command](commandArgs);
      } catch (error) {
        console.error(`❌ Erreur lors de l'exécution de ${command}:`, error.message);
        process.exit(1);
      }
    } else {
      console.error(`❌ Commande inconnue: ${command}`);
      this.showHelp();
      process.exit(1);
    }
  }

  /**
   * Affiche le message d'accueil
   */
  showWelcome() {
    console.log(`
🎯 Générateur de Frises Chronologiques Interactives
═══════════════════════════════════════════════════

Utilise mcp-delegate et la pensée séquentielle pour générer
automatiquement des composants de timeline optimisés.

Fonctionnalités:
• Analyse intelligente des besoins
• Sélection automatique de la bibliothèque JS optimale
• Génération de composants Vue.js personnalisés
• Support multi-LLM avec fragmentation des prompts
• Templates pour différents domaines (historique, scientifique, etc.)
`);
  }

  /**
   * Affiche l'aide
   */
  showHelp() {
    console.log(`
Utilisation: node main.js <commande> [options]

Commandes disponibles:

  generate [config.json]     Génère une frise chronologique
                            Exemple: node main.js generate config/historical.json

  analyze [requirements]     Analyse des besoins avec pensée séquentielle  
                            Exemple: node main.js analyze '{"type":"scientific","domain":"physics"}'

  test                      Test de connectivité avec les LLMs locaux

  fragment <prompt>         Test de fragmentation d'un prompt complexe

  help                      Affiche cette aide

Exemples de configuration:

  Frise historique:
  {
    "type": "historical",
    "name": "TimelineGuerre",
    "description": "Frise de la Seconde Guerre mondiale",
    "features": ["zoom", "filter", "export"],
    "data_source": "spreadsheet"
  }

  Frise scientifique:
  {
    "type": "scientific", 
    "name": "TimelinePhysics",
    "description": "Découvertes en physique quantique",
    "library": "plotlyjs",
    "features": ["3d", "interactive", "animation"]
  }

Pour plus d'informations: https://github.com/votre-repo/frise.chezmehdi.net
`);
  }

  /**
   * Génère une frise chronologique complète
   */
  async generateTimeline(args) {
    console.log('🚀 Génération de frise chronologique avec analyse intelligente...\n');
    
    let requirements = {};
    
    // Parsing des arguments
    if (args.length > 0) {
      const configPath = args[0];
      
      if (fs.existsSync(configPath)) {
        // Charger depuis fichier
        const configContent = fs.readFileSync(configPath, 'utf8');
        requirements = JSON.parse(configContent);
        console.log(`📁 Configuration chargée depuis: ${configPath}`);
      } else {
        // Parser JSON direct
        try {
          requirements = JSON.parse(configPath);
          console.log('📋 Configuration parsée depuis argument JSON');
        } catch (error) {
          console.error('❌ Impossible de parser la configuration JSON');
          console.log('💡 Utilisation de la configuration par défaut');
          requirements = this.getDefaultRequirements();
        }
      }
    } else {
      // Configuration interactive
      requirements = await this.interactiveConfiguration();
    }
    
    console.log('\n📊 Besoins détectés:', JSON.stringify(requirements, null, 2));
    
    // Étape 1: Analyse séquentielle avec mcp-delegate
    console.log('\n🧠 Phase 1: Analyse séquentielle des besoins...');
    const analysis = await this.performSequentialAnalysis(requirements);
    
    // Étape 2: Génération du composant
    console.log('\n🔧 Phase 2: Génération du composant...');
    const result = await this.generator.generate(analysis.final_configuration || requirements);
    
    // Étape 3: Rapport final
    this.generateReport(requirements, analysis, result);
    
    return result;
  }

  /**
   * Analyse séquentielle avec mcp-delegate
   */
  async performSequentialAnalysis(requirements) {
    const analysisPrompt = `
Tu es un expert en visualisation de données temporelles et en génération de frises chronologiques interactives.

MISSION: Analyse séquentielle des besoins pour optimiser la génération d'une frise chronologique.

BESOINS DE L'UTILISATEUR:
${JSON.stringify(requirements, null, 2)}

PROCESSUS D'ANALYSE EN 8 ÉTAPES:

1. ANALYSE DU CONTEXTE
   - Identifie le domaine d'application (historique, scientifique, business, personnel, projet)
   - Détermine le public cible (grand public, experts, étudiants, professionnels)
   - Précise les objectifs (information, navigation, analyse, storytelling)
   - Identifie les contraintes (performance, accessibilité, budget, temps)

2. ANALYSE DES DONNÉES
   - Examine la structure des données temporelles (événements, périodes, intervalles)
   - Évalue le volume de données (petit: <100, moyen: 100-1000, grand: >1000)
   - Détermine la fréquence de mise à jour (statique, occasionnelle, temps réel)
   - Identifie les relations entre données (hiérarchiques, groupées, catégorisées)

3. SÉLECTION TECHNOLOGIQUE
   - Recommande la bibliothèque JavaScript optimale (vis-timeline, d3js, timelinejs, chartjs, plotlyjs)
   - Justifie le choix par rapport aux besoins spécifiques
   - Évalue la compatibilité avec Vue.js et l'écosystème existant
   - Considère la courbe d'apprentissage et la maintenance

4. DESIGN ET EXPÉRIENCE UTILISATEUR
   - Propose un style visuel adapté au contexte
   - Définit une palette de couleurs cohérente
   - Spécifie les interactions utilisateur (zoom, pan, select, filter)
   - Conçoit la navigation et le layout responsive

5. OPTIMISATION DES PERFORMANCES
   - Identifie les techniques d'optimisation nécessaires
   - Recommande des stratégies de lazy loading si applicable
   - Propose des solutions de virtualisation pour gros datasets
   - Définit les métriques de performance critiques

6. STRATÉGIE D'IMPLÉMENTATION
   - Détaille l'architecture des composants Vue.js
   - Spécifie la gestion d'état (local, Pinia, Vuex)
   - Planifie l'intégration avec les sources de données
   - Définit les phases de développement

7. APPROCHE DE TEST ET VALIDATION
   - Planifie les tests unitaires et d'intégration
   - Définit les tests de performance et d'accessibilité
   - Spécifie les critères de validation
   - Prévoit les tests cross-browser

8. PLANIFICATION DE L'ÉVOLUTIVITÉ
   - Conçoit une architecture modulaire extensible
   - Prévoit l'ajout de nouvelles fonctionnalités
   - Planifie le support de nouveaux formats de données
   - Définit la stratégie de maintenance et documentation

RÉPONSE ATTENDUE:
Un JSON structuré avec:
{
  "analysis_steps": {
    "context": { ... },
    "data": { ... },
    "technology": { ... },
    "design": { ... },
    "performance": { ... },
    "implementation": { ... },
    "testing": { ... },
    "scalability": { ... }
  },
  "synthesis": {
    "key_decisions": [...],
    "trade_offs": [...],
    "risks": [...],
    "success_metrics": [...]
  },
  "final_configuration": {
    "component_name": "...",
    "library": "...",
    "features": [...],
    "options": { ... },
    "styles": { ... }
  }
}

Commence l'analyse séquentielle maintenant.
`;

    try {
      console.log('🔄 Exécution de l\'analyse via mcp-delegate...');
      
      const analysisResult = await this.mcpDelegate.executeFragmentedTask(
        analysisPrompt,
        {
          fragmentType: 'semantic',
          mergeStrategy: 'comprehensive',
          maxTokensPerFragment: 2048
        }
      );
      
      if (analysisResult.success) {
        console.log('✅ Analyse séquentielle terminée');
        console.log(`📊 ${analysisResult.fragments} fragments traités`);
        console.log(`🤖 Modèles utilisés: ${analysisResult.models_used.join(', ')}`);
        
        return this.parseAnalysisResult(analysisResult.result);
      } else {
        console.warn('⚠️ Analyse via mcp-delegate échouée, fallback local...');
        return this.fallbackAnalysis(requirements);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error.message);
      console.log('🔄 Utilisation de l\'analyse de fallback...');
      return this.fallbackAnalysis(requirements);
    }
  }

  /**
   * Parse le résultat de l'analyse
   */
  parseAnalysisResult(result) {
    try {
      // Extraire la configuration finale du résultat
      if (result.merged_analysis) {
        return result.merged_analysis;
      } else if (result.synthesis) {
        return result.synthesis;
      } else {
        return result;
      }
    } catch (error) {
      console.warn('⚠️ Erreur parsing résultat analyse:', error.message);
      return this.fallbackAnalysis({});
    }
  }

  /**
   * Analyse de fallback locale
   */
  fallbackAnalysis(requirements) {
    const type = requirements.type || 'historical';
    const library = requirements.library || 'vis-timeline';
    
    return {
      analysis_steps: {
        context: {
          domain: type,
          target_audience: 'general_public',
          objectives: ['visualization', 'navigation'],
          constraints: ['performance', 'accessibility']
        },
        data: {
          structure: 'chronological_events',
          volume: 'medium',
          update_frequency: 'occasional',
          relationships: 'temporal'
        },
        technology: {
          recommended_library: library,
          justification: 'Bibliothèque mature et bien documentée',
          vue_compatibility: 'excellent'
        },
        design: {
          visual_style: 'modern',
          color_palette: ['#42b983', '#2c3e50', '#ecf0f1'],
          interactions: ['zoom', 'pan', 'select'],
          responsive: true
        }
      },
      synthesis: {
        key_decisions: [
          `Utiliser ${library} comme bibliothèque principale`,
          'Implémenter un design responsive moderne',
          'Optimiser pour les performances',
          'Assurer l\'accessibilité'
        ],
        trade_offs: [
          'Simplicité vs fonctionnalités avancées',
          'Performance vs richesse visuelle'
        ],
        risks: ['Courbe d\'apprentissage', 'Maintenance'],
        success_metrics: [
          'Temps de chargement < 2s',
          'Interactions fluides à 60fps',
          'Compatibilité mobile'
        ]
      },
      final_configuration: {
        component_name: requirements.name || `Timeline${type.charAt(0).toUpperCase() + type.slice(1)}`,
        template_type: type,
        library: library,
        features: requirements.features || ['zoom', 'pan', 'select', 'export'],
        options: {
          responsive: true,
          interactive: true,
          animation: true,
          ...requirements.options
        },
        styles: {
          theme: 'modern',
          colors: ['#42b983', '#2c3e50', '#ecf0f1'],
          ...requirements.styles
        }
      }
    };
  }

  /**
   * Configuration interactive
   */
  async interactiveConfiguration() {
    console.log('\n🎯 Configuration interactive\n');
    
    // Dans un vrai CLI, utiliser readline pour l'interactivité
    // Pour la simulation, retourner une config par défaut
    console.log('💡 Utilisation de la configuration par défaut (interactivité à implémenter)');
    
    return this.getDefaultRequirements();
  }

  /**
   * Configuration par défaut
   */
  getDefaultRequirements() {
    return {
      type: 'historical',
      name: 'TimelineDemo',
      description: 'Démonstration de frise chronologique',
      features: ['zoom', 'pan', 'filter', 'export'],
      data_source: 'spreadsheet',
      library: 'vis-timeline'
    };
  }

  /**
   * Analyse des besoins uniquement
   */
  async analyzeRequirements(args) {
    console.log('🧠 Analyse des besoins avec pensée séquentielle...\n');
    
    let requirements = {};
    
    if (args.length > 0) {
      try {
        requirements = JSON.parse(args[0]);
      } catch (error) {
        console.error('❌ JSON invalide, utilisation de l\'exemple par défaut');
        requirements = {
          type: 'scientific',
          domain: 'physics',
          description: 'Timeline des découvertes en physique quantique',
          volume: 'medium',
          features: ['interactive', 'zoom', '3d_visualization']
        };
      }
    } else {
      requirements = this.getDefaultRequirements();
    }
    
    console.log('📋 Besoins à analyser:', JSON.stringify(requirements, null, 2));
    
    // Analyse via le moteur de pensée séquentielle
    const analysis = await this.thinkingEngine.analyzeRequirements(requirements);
    
    console.log('\n📊 Résultats de l\'analyse:');
    console.log('═══════════════════════════════\n');
    
    // Affichage des étapes
    console.log('🔍 ÉTAPES D\'ANALYSE:');
    for (const [step, result] of Object.entries(analysis.steps)) {
      console.log(`\n${step.toUpperCase()}:`);
      console.log(JSON.stringify(result, null, 2));
    }
    
    // Synthèse
    console.log('\n🎯 SYNTHÈSE:');
    console.log(JSON.stringify(analysis.synthesis, null, 2));
    
    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    console.log(JSON.stringify(analysis.recommendations, null, 2));
    
    return analysis;
  }

  /**
   * Test de connectivité avec les LLMs
   */
  async testConnectivity(args) {
    console.log('🔍 Test de connectivité avec les LLMs locaux...\n');
    
    // Test via mcp-delegate
    console.log('📡 Test via MCP-Delegate:');
    const mcpResults = await this.mcpDelegate.testConnectivity();
    
    for (const [model, result] of Object.entries(mcpResults)) {
      const status = result.status === 'connected' ? '✅' : '❌';
      console.log(`${status} ${model}: ${result.status}`);
      if (result.error) {
        console.log(`   ↳ Erreur: ${result.error}`);
      }
    }
    
    // Test via thinking engine
    console.log('\n🧠 Test via Thinking Engine:');
    const thinkingResults = await this.thinkingEngine.testConnectivity();
    
    for (const [model, result] of Object.entries(thinkingResults)) {
      const status = result.status === 'connected' ? '✅' : '❌';
      console.log(`${status} ${model}: ${result.status}`);
      if (result.error) {
        console.log(`   ↳ Erreur: ${result.error}`);
      }
    }
    
    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    const connectedModels = Object.values(mcpResults).filter(r => r.status === 'connected').length;
    
    if (connectedModels === 0) {
      console.log('❌ Aucun modèle connecté. Vérifiez qu\'Ollama est lancé sur localhost:11434');
      console.log('   Installation: https://ollama.ai/');
      console.log('   Modèles recommandés: ollama pull llama3.2 && ollama pull mistral');
    } else if (connectedModels < 2) {
      console.log('⚠️ Un seul modèle connecté. Pour une analyse optimale, installez plusieurs modèles');
      console.log('   ollama pull llama3.2 && ollama pull mistral && ollama pull codellama');
    } else {
      console.log('✅ Configuration optimale détectée!');
      console.log('   Vous pouvez utiliser la fragmentation multi-modèles pour des analyses avancées');
    }
  }

  /**
   * Test de fragmentation de prompt
   */
  async testFragmentation(args) {
    if (args.length === 0) {
      console.error('❌ Veuillez fournir un prompt à fragmenter');
      console.log('Exemple: node main.js fragment "Votre prompt complexe ici"');
      return;
    }
    
    const prompt = args.join(' ');
    console.log('🔧 Test de fragmentation de prompt...\n');
    console.log('📝 Prompt original:');
    console.log(prompt);
    console.log(`📏 Taille: ${prompt.length} caractères\n`);
    
    // Fragmentation sémantique
    console.log('🧩 Fragmentation sémantique:');
    const semanticFragments = await this.mcpDelegate.fragmentPrompt(prompt, {
      fragmentType: 'semantic',
      maxTokensPerFragment: 2048
    });
    
    semanticFragments.forEach((fragment, index) => {
      console.log(`\n📄 Fragment ${index + 1} (${fragment.type}):`);
      console.log(`🎯 Priorité: ${fragment.priority}`);
      console.log(`📏 Taille: ${fragment.content.length} caractères`);
      console.log('📋 Contenu:');
      console.log(fragment.content.substring(0, 200) + '...');
    });
    
    // Fragmentation simple
    console.log('\n\n🔪 Fragmentation simple:');
    const simpleFragments = await this.mcpDelegate.fragmentPrompt(prompt, {
      fragmentType: 'simple',
      maxTokensPerFragment: 1024
    });
    
    console.log(`📊 ${simpleFragments.length} fragments générés`);
    simpleFragments.forEach((fragment, index) => {
      console.log(`📄 Fragment ${index + 1}: ${fragment.content.length} caractères`);
    });
    
    // Simulation d'exécution
    console.log('\n🚀 Simulation d\'exécution fragmentée...');
    const result = await this.mcpDelegate.executeFragmentedTask(prompt, {
      fragmentType: 'semantic',
      mergeStrategy: 'comprehensive'
    });
    
    if (result.success) {
      console.log('✅ Exécution simulée réussie');
      console.log(`📊 Résultat: ${JSON.stringify(result.result, null, 2).substring(0, 300)}...`);
    } else {
      console.log('❌ Exécution simulée échouée');
      console.log(`🔄 Fallback: ${JSON.stringify(result.fallback, null, 2).substring(0, 300)}...`);
    }
  }

  /**
   * Génère un rapport final
   */
  generateReport(requirements, analysis, result) {
    console.log('\n📋 RAPPORT DE GÉNÉRATION');
    console.log('══════════════════════════════════════\n');
    
    // Résumé
    console.log('📊 RÉSUMÉ:');
    if (result.success) {
      console.log('✅ Génération réussie');
      console.log(`📁 Composant: ${result.files.component}`);
      console.log(`📖 Documentation: ${result.files.documentation}`);
    } else {
      console.log('❌ Génération échouée');
      console.log(`🔥 Erreur: ${result.error}`);
    }
    
    // Configuration finale
    console.log('\n⚙️ CONFIGURATION FINALE:');
    if (analysis.final_configuration) {
      console.log(JSON.stringify(analysis.final_configuration, null, 2));
    }
    
    // Recommandations d'amélioration
    console.log('\n💡 PROCHAINES ÉTAPES:');
    console.log('1. Tester le composant généré');
    console.log('2. Intégrer dans votre application Vue.js');
    console.log('3. Personnaliser selon vos besoins spécifiques');
    console.log('4. Ajouter vos données réelles');
    console.log('5. Optimiser les performances si nécessaire');
    
    // Métriques
    if (result.analysis) {
      console.log('\n📈 MÉTRIQUES D\'ANALYSE:');
      console.log(`🕒 Temps d'analyse: estimé`);
      console.log(`🤖 Modèles consultés: multi-LLM`);
      console.log(`📊 Qualité de l'analyse: ${analysis.synthesis ? 'élevée' : 'standard'}`);
    }
  }
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new TimelineGeneratorCLI();
  cli.run().catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
}

export default TimelineGeneratorCLI;
