#!/usr/bin/env node

/**
 * Script d'exemple utilisant le vrai mcp-delegate
 * Démontre l'intégration avec les fonctions MCP disponibles
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPTimelineDemo {
  constructor() {
    this.exampleRequirements = {
      historical: {
        type: "historical",
        domain: "computer_science_history",
        period: "1940-2024",
        target_audience: "computer_science_students",
        volume: "medium",
        features: ["zoom", "filter", "search", "export"],
        complexity: "medium"
      },
      scientific: {
        type: "scientific", 
        domain: "quantum_physics",
        period: "1900-2024",
        target_audience: "researchers",
        volume: "large",
        features: ["3d_visualization", "formula_rendering", "interactive"],
        complexity: "high"
      },
      business: {
        type: "business",
        domain: "startup_journey", 
        period: "2020-2024",
        target_audience: "executives",
        volume: "small",
        features: ["metrics", "real_time", "collaboration"],
        complexity: "medium"
      }
    };
  }

  /**
   * Analyse des besoins avec pensée séquentielle via MCP
   */
  async analyzeWithMCP(requirementType = 'historical') {
    const requirements = this.exampleRequirements[requirementType];
    
    console.log('🧠 Analyse avec MCP-Delegate et pensée séquentielle...\n');
    console.log('📋 Besoins:', JSON.stringify(requirements, null, 2));
    
    // Construction du prompt d'analyse séquentielle
    const analysisPrompt = this.buildSequentialAnalysisPrompt(requirements);
    
    try {
      // Utilisation de la vraie fonction MCP execute_delegated_task
      console.log('🔄 Exécution via MCP-Delegate...');
      
      // Simulation de l'appel - dans un vrai environnement, décommenter:
      /*
      const mcpResult = await execute_delegated_task({
        prompt: analysisPrompt,
        llm_endpoint: "http://localhost:11434",
        model_name: "llama3.2",
        auto_merge: true
      });
      */
      
      // Pour la démo, simulation du résultat
      const mcpResult = this.simulateMCPResult(requirements);
      
      console.log('✅ Analyse terminée');
      return this.processAnalysisResult(mcpResult, requirements);
      
    } catch (error) {
      console.error('❌ Erreur MCP-Delegate:', error.message);
      return this.fallbackAnalysis(requirements);
    }
  }

  /**
   * Construction du prompt d'analyse séquentielle
   */
  buildSequentialAnalysisPrompt(requirements) {
    return `
Tu es un expert en visualisation de données temporelles et génération de frises chronologiques.

MISSION: Analyse séquentielle pour recommander la configuration optimale d'une frise chronologique interactive.

BESOINS UTILISATEUR:
${JSON.stringify(requirements, null, 2)}

PROCESSUS D'ANALYSE SÉQUENTIELLE (8 étapes):

ÉTAPE 1 - ANALYSE DU CONTEXTE:
- Évalue le domaine d'application: ${requirements.domain}
- Identifie le public cible: ${requirements.target_audience}
- Détermine les objectifs principaux
- Identifie les contraintes spécifiques

ÉTAPE 2 - ANALYSE DES DONNÉES:
- Structure: événements ponctuels vs périodes
- Volume estimé: ${requirements.volume}
- Complexité des relations temporelles
- Besoins de catégorisation/groupement

ÉTAPE 3 - SÉLECTION TECHNOLOGIQUE:
- Évalue: vis-timeline, d3js, timelinejs, chartjs, plotlyjs
- Critères: performance, fonctionnalités, maintenance
- Compatibilité Vue.js
- Courbe d'apprentissage

ÉTAPE 4 - DESIGN ET UX:
- Style visuel adapté au domaine
- Palette de couleurs cohérente
- Interactions utilisateur optimales
- Navigation intuitive

ÉTAPE 5 - PERFORMANCE:
- Stratégies d'optimisation pour ${requirements.volume} données
- Techniques de lazy loading
- Gestion mémoire
- Métriques critiques

ÉTAPE 6 - IMPLÉMENTATION:
- Architecture composants Vue.js
- Gestion d'état
- Intégration sources de données
- Modularité

ÉTAPE 7 - TESTS:
- Stratégie de validation
- Tests performance/accessibilité
- Critères qualité
- Compatibilité navigateurs

ÉTAPE 8 - ÉVOLUTIVITÉ:
- Architecture extensible
- Ajout fonctionnalités futures
- Maintenance long terme
- Documentation

RÉPONSE REQUISE (JSON):
{
  "sequential_analysis": {
    "step1_context": { "domain_analysis": "...", "audience_needs": "...", "constraints": [...] },
    "step2_data": { "structure_type": "...", "volume_impact": "...", "relationships": "..." },
    "step3_technology": { "recommended_library": "...", "justification": "...", "alternatives": [...] },
    "step4_design": { "visual_style": "...", "color_scheme": [...], "interactions": [...] },
    "step5_performance": { "optimization_strategy": "...", "bottlenecks": [...], "metrics": [...] },
    "step6_implementation": { "architecture": "...", "components": [...], "state_management": "..." },
    "step7_testing": { "test_strategy": "...", "quality_criteria": [...], "tools": [...] },
    "step8_scalability": { "extension_points": [...], "future_features": [...], "maintenance": "..." }
  },
  "synthesis": {
    "key_decisions": [...],
    "trade_offs": [...],
    "risk_assessment": {...},
    "success_metrics": [...]
  },
  "final_recommendation": {
    "component_name": "...",
    "library": "...",
    "configuration": {...},
    "implementation_priority": [...]
  }
}

Effectue maintenant l'analyse séquentielle complète.
`;
  }

  /**
   * Simulation du résultat MCP (à remplacer par vrai appel)
   */
  simulateMCPResult(requirements) {
    // Simulation d'une analyse séquentielle complète
    const domain = requirements.domain || 'general';
    const volume = requirements.volume || 'medium';
    const complexity = requirements.complexity || 'medium';
    
    return {
      sequential_analysis: {
        step1_context: {
          domain_analysis: `Domaine ${domain} nécessite une approche spécialisée`,
          audience_needs: `Public ${requirements.target_audience} requiert interface intuitive`,
          constraints: ['performance', 'accessibilité', 'maintenance']
        },
        step2_data: {
          structure_type: 'chronological_events',
          volume_impact: `Volume ${volume} nécessite optimisations spécifiques`,
          relationships: 'temporal_hierarchical'
        },
        step3_technology: {
          recommended_library: this.selectOptimalLibrary(requirements),
          justification: 'Équilibre optimal performance/fonctionnalités',
          alternatives: ['vis-timeline', 'd3js', 'timelinejs']
        },
        step4_design: {
          visual_style: this.getDesignStyle(requirements.type),
          color_scheme: this.getColorScheme(requirements.type),
          interactions: requirements.features
        },
        step5_performance: {
          optimization_strategy: this.getOptimizationStrategy(volume),
          bottlenecks: ['initial_load', 'zoom_operations', 'filter_performance'],
          metrics: ['load_time < 2s', 'smooth_60fps', 'memory < 100MB']
        },
        step6_implementation: {
          architecture: 'modular_vue_components',
          components: ['TimelineCore', 'TimelineControls', 'TimelineTooltip'],
          state_management: 'vue_composition_api'
        },
        step7_testing: {
          test_strategy: 'unit_integration_e2e',
          quality_criteria: ['performance', 'accessibility', 'usability'],
          tools: ['vitest', 'cypress', 'lighthouse']
        },
        step8_scalability: {
          extension_points: ['custom_renderers', 'data_sources', 'export_formats'],
          future_features: ['real_time_collaboration', 'ai_insights', 'advanced_analytics'],
          maintenance: 'quarterly_updates_lts_support'
        }
      },
      synthesis: {
        key_decisions: [
          `Utiliser ${this.selectOptimalLibrary(requirements)} comme bibliothèque principale`,
          'Architecture modulaire Vue.js avec Composition API',
          'Optimisations spécifiques au volume de données',
          'Design adapté au domaine et au public cible'
        ],
        trade_offs: [
          'Performance vs richesse visuelle',
          'Simplicité vs fonctionnalités avancées',
          'Flexibilité vs courbe d\'apprentissage'
        ],
        risk_assessment: {
          technical: complexity === 'high' ? 'medium' : 'low',
          timeline: 'medium',
          maintenance: 'low',
          scalability: 'low'
        },
        success_metrics: [
          'Temps de chargement < 2 secondes',
          'Interactions fluides à 60fps',
          'Satisfaction utilisateur > 8/10',
          'Taux d\'adoption > 75%'
        ]
      },
      final_recommendation: {
        component_name: this.generateComponentName(requirements),
        library: this.selectOptimalLibrary(requirements),
        configuration: this.buildConfiguration(requirements),
        implementation_priority: [
          'Core timeline functionality',
          'Basic interactions (zoom, pan)',
          'Data loading and display', 
          'Advanced features',
          'Export capabilities',
          'Performance optimizations'
        ]
      }
    };
  }

  /**
   * Sélection de la bibliothèque optimale
   */
  selectOptimalLibrary(requirements) {
    const libraryMap = {
      historical: 'vis-timeline',
      scientific: 'plotlyjs',
      business: 'vis-timeline',
      personal: 'timelinejs',
      project: 'vis-timeline'
    };

    // Logique avancée selon les caractéristiques
    if (requirements.features?.includes('3d_visualization')) {
      return 'plotlyjs';
    }
    if (requirements.features?.includes('storytelling')) {
      return 'timelinejs';
    }
    if (requirements.volume === 'large' && requirements.complexity === 'high') {
      return 'd3js';
    }

    return libraryMap[requirements.type] || 'vis-timeline';
  }

  /**
   * Style de design selon le type
   */
  getDesignStyle(type) {
    const styleMap = {
      historical: 'classic_academic',
      scientific: 'modern_technical',
      business: 'corporate_clean',
      personal: 'elegant_narrative',
      project: 'agile_functional'
    };
    return styleMap[type] || 'modern_clean';
  }

  /**
   * Schéma de couleurs selon le type
   */
  getColorScheme(type) {
    const colorMap = {
      historical: ['#8B4513', '#CD853F', '#DEB887', '#F5DEB3'],
      scientific: ['#4169E1', '#00BFFF', '#87CEEB', '#E0F6FF'],
      business: ['#2E8B57', '#3CB371', '#90EE90', '#F0FFF0'],
      personal: ['#9370DB', '#BA55D3', '#DDA0DD', '#F8F8FF'],
      project: ['#FF6347', '#FF7F50', '#FFA07A', '#FFF8DC']
    };
    return colorMap[type] || ['#42b983', '#2c3e50', '#ecf0f1'];
  }

  /**
   * Stratégie d'optimisation selon le volume
   */
  getOptimizationStrategy(volume) {
    const strategyMap = {
      small: 'direct_rendering',
      medium: 'lazy_loading_clustering',
      large: 'virtualization_progressive_loading'
    };
    return strategyMap[volume] || 'standard_optimization';
  }

  /**
   * Génération du nom de composant
   */
  generateComponentName(requirements) {
    const prefix = 'Timeline';
    const domain = requirements.domain?.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') || 'General';
    return prefix + domain;
  }

  /**
   * Construction de la configuration finale
   */
  buildConfiguration(requirements) {
    return {
      type: requirements.type,
      library: this.selectOptimalLibrary(requirements),
      features: requirements.features,
      options: {
        responsive: true,
        interactive: true,
        animation: true,
        clustering: requirements.volume === 'large',
        grouping: requirements.complexity === 'high',
        export_formats: ['png', 'svg', 'pdf']
      },
      styles: {
        theme: this.getDesignStyle(requirements.type),
        colors: this.getColorScheme(requirements.type)
      },
      performance: {
        lazy_loading: requirements.volume !== 'small',
        virtualization: requirements.volume === 'large',
        clustering: requirements.volume === 'large'
      }
    };
  }

  /**
   * Traitement du résultat d'analyse
   */
  processAnalysisResult(mcpResult, originalRequirements) {
    console.log('\n📊 RÉSULTATS DE L\'ANALYSE SÉQUENTIELLE');
    console.log('═════════════════════════════════════════\n');

    // Affichage des étapes d'analyse
    console.log('🔍 ANALYSE PAR ÉTAPES:');
    const analysis = mcpResult.sequential_analysis;
    
    Object.entries(analysis).forEach(([step, data]) => {
      const stepNum = step.match(/\d+/)?.[0] || '?';
      const stepName = step.replace(/step\d+_/, '').toUpperCase();
      console.log(`\n${stepNum}. ${stepName}:`);
      
      if (typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => {
          console.log(`   • ${key}: ${JSON.stringify(value)}`);
        });
      }
    });

    // Synthèse
    console.log('\n🎯 SYNTHÈSE:');
    const synthesis = mcpResult.synthesis;
    console.log(`Décisions clés: ${synthesis.key_decisions.join(', ')}`);
    console.log(`Compromis: ${synthesis.trade_offs.join(', ')}`);
    console.log(`Risques: ${JSON.stringify(synthesis.risk_assessment)}`);

    // Recommandation finale
    console.log('\n💡 RECOMMANDATION FINALE:');
    const recommendation = mcpResult.final_recommendation;
    console.log(`Composant: ${recommendation.component_name}`);
    console.log(`Bibliothèque: ${recommendation.library}`);
    console.log(`Configuration: ${JSON.stringify(recommendation.configuration, null, 2)}`);

    return {
      original_requirements: originalRequirements,
      analysis: mcpResult,
      ready_for_generation: true
    };
  }

  /**
   * Analyse de fallback
   */
  fallbackAnalysis(requirements) {
    console.log('⚠️ Utilisation de l\'analyse de fallback...');
    
    return {
      analysis: 'Analyse locale simplifiée',
      recommendation: {
        library: this.selectOptimalLibrary(requirements),
        component_name: this.generateComponentName(requirements),
        configuration: this.buildConfiguration(requirements)
      },
      fallback: true
    };
  }

  /**
   * Démo avec fragmentation de prompt
   */
  async demonstrateFragmentation() {
    console.log('🧩 Démonstration de fragmentation de prompt...\n');

    const complexPrompt = `
    Analyse complète pour frise chronologique de l'évolution technologique:
    
    CONTEXTE: Histoire des technologies informatiques de 1940 à 2024
    PUBLIC: Étudiants et professionnels en informatique
    VOLUME: ~2000 événements avec métadonnées complexes
    
    ANALYSE REQUISE:
    1. Contexte historique et impact sociétal
    2. Évolutions techniques et innovations
    3. Personnalités clés et institutions
    4. Chronologie des langages de programmation
    5. Évolution du matériel (processeurs, mémoire, stockage)
    6. Réseaux et internet (protocoles, standards)
    7. Intelligence artificielle et machine learning
    8. Cybersécurité et cryptographie
    9. Interfaces utilisateur et expérience
    10. Impact économique et business models
    
    RENDU VISUEL:
    - Timeline interactive multi-niveaux
    - Groupement par domaines technologiques
    - Zoom temporel avec détails progressifs
    - Liens entre événements connexes
    - Médias riches (images, vidéos, documents)
    - Export haute qualité pour publication
    
    CONTRAINTES TECHNIQUES:
    - Performance optimale même avec 2000+ éléments
    - Responsive design mobile-first
    - Accessibilité WCAG 2.1 AA
    - Compatibilité navigateurs modernes
    - Intégration API externes (Wikipedia, archives)
    - Collaboration temps réel multi-utilisateurs
    `;

    try {
      console.log('📝 Prompt original:');
      console.log(`Taille: ${complexPrompt.length} caractères\n`);

      // Simulation de fragmentation (vraie implémentation via fragment_prompt)
      /*
      const fragmentResult = await fragment_prompt({
        prompt: complexPrompt,
        max_tokens_per_fragment: 2048,
        model_type: "ollama"
      });
      */

      // Simulation pour la démo
      const fragments = this.simulateFragmentation(complexPrompt);
      
      console.log(`🔪 Fragmenté en ${fragments.length} parties:`);
      fragments.forEach((fragment, index) => {
        console.log(`\n📄 Fragment ${index + 1}:`);
        console.log(`   Type: ${fragment.type}`);
        console.log(`   Taille: ${fragment.content.length} caractères`);
        console.log(`   Focus: ${fragment.focus}`);
      });

      // Simulation d'exécution fragmentée
      console.log('\n🚀 Exécution fragmentée simulée...');
      /*
      const executionResult = await execute_delegated_task({
        prompt: complexPrompt,
        llm_endpoint: "http://localhost:11434",
        model_name: "llama3.2",
        auto_merge: true
      });
      */

      const executionResult = {
        success: true,
        fragments_processed: fragments.length,
        analysis_quality: 'high',
        recommendations: 'Configuration avancée générée'
      };

      console.log('✅ Résultats:', executionResult);

    } catch (error) {
      console.error('❌ Erreur fragmentation:', error.message);
    }
  }

  /**
   * Simulation de fragmentation
   */
  simulateFragmentation(prompt) {
    return [
      {
        type: 'context_analysis',
        focus: 'Contexte historique et impact sociétal',
        content: prompt.substring(0, 400) + '...'
      },
      {
        type: 'technical_analysis', 
        focus: 'Évolutions techniques et innovations',
        content: prompt.substring(400, 800) + '...'
      },
      {
        type: 'visual_requirements',
        focus: 'Spécifications de rendu visuel',
        content: prompt.substring(800, 1200) + '...'
      },
      {
        type: 'technical_constraints',
        focus: 'Contraintes et optimisations',
        content: prompt.substring(1200) + '...'
      }
    ];
  }

  /**
   * Génération du composant final
   */
  async generateTimelineComponent(analysisResult) {
    console.log('\n🔧 Génération du composant Vue.js...');
    
    const config = analysisResult.analysis.final_recommendation;
    
    // Génération du composant basée sur l'analyse
    const componentCode = this.buildVueComponent(config);
    
    // Sauvegarde
    const outputPath = path.join(__dirname, '..', 'src', 'generated', `${config.component_name}.vue`);
    
    // Créer le répertoire si nécessaire
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, componentCode);
    
    console.log(`✅ Composant généré: ${outputPath}`);
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. Importer le composant dans votre application Vue');
    console.log('2. Configurer les données de timeline');
    console.log('3. Personnaliser les styles selon vos besoins');
    console.log('4. Tester les interactions et performances');
    
    return outputPath;
  }

  /**
   * Construction du composant Vue.js
   */
  buildVueComponent(config) {
    return `<template>
  <div class="timeline-container">
    <div class="timeline-header">
      <h2>{{ title }}</h2>
      <div class="timeline-controls">
        <button @click="zoomIn" class="btn">Zoom +</button>
        <button @click="zoomOut" class="btn">Zoom -</button>
        <button @click="resetView" class="btn">Reset</button>
      </div>
    </div>
    
    <div ref="timelineEl" class="timeline-visualization"></div>
    
    <div v-if="selectedItem" class="timeline-details">
      <h3>{{ selectedItem.title }}</h3>
      <p>{{ selectedItem.description }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
${this.getLibraryImport(config.library)}

export default {
  name: '${config.component_name}',
  props: {
    items: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: 'Timeline Interactive'
    },
    options: {
      type: Object,
      default: () => (${JSON.stringify(config.configuration.options, null, 4)})
    }
  },
  emits: ['select', 'rangeChanged'],
  setup(props, { emit }) {
    const timelineEl = ref(null);
    const timeline = ref(null);
    const selectedItem = ref(null);
    
    const initTimeline = () => {
      if (!timelineEl.value) return;
      
      ${this.getInitializationCode(config.library)}
      
      timeline.value.on('select', (selection) => {
        if (selection.items.length > 0) {
          const item = props.items.find(i => i.id === selection.items[0]);
          selectedItem.value = item;
          emit('select', item);
        }
      });
      
      timeline.value.on('rangechanged', (range) => {
        emit('rangeChanged', range);
      });
    };
    
    const zoomIn = () => timeline.value?.zoomIn(0.2);
    const zoomOut = () => timeline.value?.zoomOut(0.2);
    const resetView = () => timeline.value?.fit();
    
    watch(() => props.items, () => {
      if (timeline.value) {
        timeline.value.setItems(props.items);
      }
    }, { deep: true });
    
    onMounted(() => {
      initTimeline();
    });
    
    return {
      timelineEl,
      selectedItem,
      zoomIn,
      zoomOut,
      resetView
    };
  }
};
</script>

<style scoped>
.timeline-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.timeline-controls {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn:hover {
  background: #f5f5f5;
}

.timeline-visualization {
  flex: 1;
  min-height: 400px;
}

.timeline-details {
  padding: 1rem;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}

/* Styles spécifiques au thème ${config.configuration.styles.theme} */
${this.getThemeStyles(config.configuration.styles)}
</style>`;
  }

  /**
   * Import de bibliothèque selon le type
   */
  getLibraryImport(library) {
    const imports = {
      'vis-timeline': `import { Timeline } from 'vis-timeline/standalone';`,
      'd3js': `import * as d3 from 'd3';`,
      'timelinejs': `import { TL } from '@knight-lab/timelinejs';`,
      'plotlyjs': `import Plotly from 'plotly.js-dist';`,
      'chartjs': `import { Chart } from 'chart.js';`
    };
    return imports[library] || '// Import de bibliothèque à définir';
  }

  /**
   * Code d'initialisation selon la bibliothèque
   */
  getInitializationCode(library) {
    const initCodes = {
      'vis-timeline': `
      timeline.value = new Timeline(timelineEl.value, props.items, props.options);`,
      'd3js': `
      // Initialisation D3.js personnalisée
      timeline.value = initD3Timeline(timelineEl.value, props.items, props.options);`,
      'plotlyjs': `
      Plotly.newPlot(timelineEl.value, [{
        x: props.items.map(i => i.start),
        y: props.items.map((i, idx) => idx),
        mode: 'markers+text',
        type: 'scatter'
      }], props.options);
      timeline.value = { plot: timelineEl.value };`
    };
    return initCodes[library] || '// Initialisation à définir';
  }

  /**
   * Styles selon le thème
   */
  getThemeStyles(styles) {
    return `
.timeline-container.${styles.theme} {
  background: ${styles.background || 'white'};
}

.timeline-container.${styles.theme} .timeline-header {
  background: ${styles.colors[0]};
  color: white;
}

.timeline-container.${styles.theme} .btn {
  border-color: ${styles.colors[1]};
  color: ${styles.colors[1]};
}

.timeline-container.${styles.theme} .btn:hover {
  background: ${styles.colors[1]};
  color: white;
}`;
  }

  /**
   * Démo complète
   */
  async runCompleteDemo() {
    console.log('🎯 DÉMONSTRATION COMPLÈTE - GÉNÉRATION DE FRISE CHRONOLOGIQUE\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    try {
      // 1. Analyse avec MCP
      console.log('Phase 1: Analyse des besoins');
      const analysisResult = await this.analyzeWithMCP('historical');

      // 2. Démonstration de fragmentation
      console.log('\nPhase 2: Démonstration de fragmentation');
      await this.demonstrateFragmentation();

      // 3. Génération du composant
      console.log('\nPhase 3: Génération du composant');
      const componentPath = await this.generateTimelineComponent(analysisResult);

      console.log('\n🎉 DÉMONSTRATION TERMINÉE AVEC SUCCÈS!');
      console.log(`📁 Composant généré: ${componentPath}`);
      
      return {
        success: true,
        analysis: analysisResult,
        component_path: componentPath
      };

    } catch (error) {
      console.error('❌ Erreur lors de la démonstration:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export et exécution
export default MCPTimelineDemo;

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new MCPTimelineDemo();
  
  const command = process.argv[2] || 'complete';
  
  switch (command) {
    case 'analyze':
      const type = process.argv[3] || 'historical';
      demo.analyzeWithMCP(type);
      break;
    case 'fragment':
      demo.demonstrateFragmentation();
      break;
    case 'complete':
    default:
      demo.runCompleteDemo();
  }
}
