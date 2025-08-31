/**
 * Wrapper pour MCP-Delegate - Intégration avec les LLMs locaux
 * Permet de distribuer l'analyse de frises chronologiques sur plusieurs modèles
 */

export class MCPDelegateWrapper {
  constructor(options = {}) {
    this.defaultEndpoint = options.endpoint || 'http://localhost:11434';
    this.defaultModel = options.model || 'llama3.2';
    this.maxRetries = options.maxRetries || 3;
    this.timeout = options.timeout || 30000;
    
    // Configuration des modèles disponibles
    this.availableModels = {
      'llama3.2': {
        strengths: ['analysis', 'reasoning', 'french'],
        maxTokens: 4096,
        temperature: 0.7
      },
      'mistral': {
        strengths: ['technical', 'code', 'structured'],
        maxTokens: 8192,
        temperature: 0.5
      },
      'codellama': {
        strengths: ['programming', 'architecture', 'implementation'],
        maxTokens: 4096,
        temperature: 0.3
      },
      'gemma': {
        strengths: ['creative', 'user_experience', 'design'],
        maxTokens: 2048,
        temperature: 0.8
      }
    };
  }

  /**
   * Fragmente un prompt complexe et l'exécute via mcp-delegate
   */
  async executeFragmentedTask(prompt, options = {}) {
    console.log('🔄 Début de l\'exécution fragmentée...');
    
    try {
      // Étape 1: Fragmentation du prompt
      const fragments = await this.fragmentPrompt(prompt, options);
      console.log(`📑 Prompt fragmenté en ${fragments.length} parties`);
      
      // Étape 2: Sélection des modèles optimaux
      const modelAssignments = this.assignModelsToFragments(fragments, options);
      
      // Étape 3: Exécution parallèle des fragments
      const fragmentResults = await this.executeFragments(modelAssignments);
      
      // Étape 4: Fusion des résultats
      const mergedResult = await this.mergeResults(fragmentResults, options);
      
      console.log('✅ Exécution fragmentée terminée');
      return {
        success: true,
        result: mergedResult,
        fragments: fragments.length,
        models_used: modelAssignments.map(a => a.model)
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution fragmentée:', error);
      return {
        success: false,
        error: error.message,
        fallback: await this.executeFallback(prompt, options)
      };
    }
  }

  /**
   * Fragmente un prompt en sous-parties gérables
   */
  async fragmentPrompt(prompt, options = {}) {
    const maxTokensPerFragment = options.maxTokensPerFragment || 2048;
    const fragmentType = options.fragmentType || 'semantic';
    
    if (fragmentType === 'semantic') {
      return this.semanticFragmentation(prompt, maxTokensPerFragment);
    } else {
      return this.simpleFragmentation(prompt, maxTokensPerFragment);
    }
  }

  /**
   * Fragmentation sémantique intelligente
   */
  semanticFragmentation(prompt, maxTokens) {
    // Détecter les sections sémantiques
    const sections = this.detectSemanticSections(prompt);
    const fragments = [];
    let currentFragment = '';
    let fragmentContext = '';
    
    for (const section of sections) {
      const estimatedTokens = this.estimateTokens(currentFragment + section.content);
      
      if (estimatedTokens > maxTokens && currentFragment) {
        // Finaliser le fragment actuel
        fragments.push({
          content: fragmentContext + currentFragment,
          type: section.type,
          priority: section.priority || 'normal',
          dependencies: section.dependencies || []
        });
        
        // Commencer un nouveau fragment
        currentFragment = section.content;
        fragmentContext = this.buildFragmentContext(fragments, section);
      } else {
        currentFragment += '\n\n' + section.content;
      }
    }
    
    // Ajouter le dernier fragment
    if (currentFragment) {
      fragments.push({
        content: fragmentContext + currentFragment,
        type: 'final',
        priority: 'normal',
        dependencies: []
      });
    }
    
    return fragments;
  }

  /**
   * Détecte les sections sémantiques d'un prompt
   */
  detectSemanticSections(prompt) {
    const sections = [];
    const lines = prompt.split('\n');
    let currentSection = { content: '', type: 'general', priority: 'normal' };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Détecter les marqueurs de section
      if (trimmedLine.startsWith('ÉTAPE:') || trimmedLine.startsWith('STEP:')) {
        if (currentSection.content) {
          sections.push({ ...currentSection });
        }
        currentSection = {
          content: line,
          type: 'step',
          priority: 'high',
          step: trimmedLine.replace(/^(ÉTAPE:|STEP:)\s*/, '')
        };
      } else if (trimmedLine.startsWith('CONTEXTE:') || trimmedLine.startsWith('CONTEXT:')) {
        if (currentSection.content) {
          sections.push({ ...currentSection });
        }
        currentSection = {
          content: line,
          type: 'context',
          priority: 'high'
        };
      } else if (trimmedLine.startsWith('DONNÉES:') || trimmedLine.startsWith('DATA:')) {
        if (currentSection.content) {
          sections.push({ ...currentSection });
        }
        currentSection = {
          content: line,
          type: 'data',
          priority: 'medium'
        };
      } else {
        currentSection.content += '\n' + line;
      }
    }
    
    if (currentSection.content) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  /**
   * Construit le contexte pour un fragment
   */
  buildFragmentContext(previousFragments, currentSection) {
    if (previousFragments.length === 0) return '';
    
    const context = `
CONTEXTE DES FRAGMENTS PRÉCÉDENTS:
${previousFragments.map((f, i) => `Fragment ${i + 1}: ${f.type}`).join('\n')}

SECTION ACTUELLE: ${currentSection.type}
`;
    
    return context;
  }

  /**
   * Fragmentation simple par taille
   */
  simpleFragmentation(prompt, maxTokens) {
    const paragraphs = prompt.split('\n\n');
    const fragments = [];
    let currentFragment = '';
    
    for (const paragraph of paragraphs) {
      const estimatedTokens = this.estimateTokens(currentFragment + paragraph);
      
      if (estimatedTokens > maxTokens && currentFragment) {
        fragments.push({
          content: currentFragment.trim(),
          type: 'chunk',
          priority: 'normal'
        });
        currentFragment = paragraph;
      } else {
        currentFragment += '\n\n' + paragraph;
      }
    }
    
    if (currentFragment) {
      fragments.push({
        content: currentFragment.trim(),
        type: 'chunk',
        priority: 'normal'
      });
    }
    
    return fragments;
  }

  /**
   * Assigne les modèles optimaux aux fragments
   */
  assignModelsToFragments(fragments, options = {}) {
    const assignments = [];
    
    for (const fragment of fragments) {
      const optimalModel = this.selectOptimalModel(fragment, options);
      assignments.push({
        fragment,
        model: optimalModel.name,
        config: optimalModel.config
      });
    }
    
    return assignments;
  }

  /**
   * Sélectionne le modèle optimal pour un fragment
   */
  selectOptimalModel(fragment, options = {}) {
    if (options.forceModel) {
      return {
        name: options.forceModel,
        config: this.availableModels[options.forceModel] || {}
      };
    }
    
    // Logique de sélection basée sur le type de fragment
    const typeModelMap = {
      'context': 'llama3.2',     // Bon pour l'analyse contextuelle
      'step': 'mistral',         // Excellent pour les étapes structurées
      'data': 'codellama',       // Optimal pour l'analyse de données
      'technical': 'codellama',  // Spécialisé pour le technique
      'design': 'gemma',         // Créatif pour le design
      'general': 'llama3.2'      // Polyvalent
    };
    
    const selectedModel = typeModelMap[fragment.type] || 'llama3.2';
    
    return {
      name: selectedModel,
      config: {
        ...this.availableModels[selectedModel],
        temperature: this.getOptimalTemperature(fragment.type)
      }
    };
  }

  /**
   * Détermine la température optimale selon le type de tâche
   */
  getOptimalTemperature(fragmentType) {
    const temperatureMap = {
      'context': 0.7,     // Modérée pour l'analyse
      'step': 0.5,        // Basse pour la structure
      'data': 0.3,        // Très basse pour la précision
      'technical': 0.3,   // Précision technique
      'design': 0.8,      // Plus créative
      'general': 0.6      // Équilibrée
    };
    
    return temperatureMap[fragmentType] || 0.6;
  }

  /**
   * Exécute les fragments en parallèle
   */
  async executeFragments(assignments) {
    const results = [];
    
    // Exécution avec limitation de concurrence
    const concurrencyLimit = 3;
    const chunks = this.chunkArray(assignments, concurrencyLimit);
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(assignment => 
        this.executeSingleFragment(assignment)
      );
      
      const chunkResults = await Promise.allSettled(chunkPromises);
      results.push(...chunkResults);
      
      // Pause entre les chunks pour éviter la surcharge
      await this.sleep(1000);
    }
    
    return results;
  }

  /**
   * Exécute un fragment unique
   */
  async executeSingleFragment(assignment) {
    const { fragment, model, config } = assignment;
    let attempts = 0;
    
    while (attempts < this.maxRetries) {
      try {
        console.log(`🔄 Exécution fragment (${model}): ${fragment.type}`);
        
        const result = await this.callLLMWithTimeout(
          fragment.content,
          model,
          config
        );
        
        return {
          fragment,
          model,
          result: this.parseFragmentResponse(result),
          success: true,
          timestamp: new Date().toISOString()
        };
        
      } catch (error) {
        attempts++;
        console.warn(`⚠️ Tentative ${attempts}/${this.maxRetries} échouée pour ${model}:`, error.message);
        
        if (attempts >= this.maxRetries) {
          return {
            fragment,
            model,
            error: error.message,
            success: false,
            timestamp: new Date().toISOString()
          };
        }
        
        // Attendre avant la prochaine tentative
        await this.sleep(1000 * attempts);
      }
    }
  }

  /**
   * Appel LLM avec timeout
   */
  async callLLMWithTimeout(prompt, model, config) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      // Simulation d'appel à Ollama/LM Studio
      // Dans un environnement réel, remplacer par l'API réelle
      const response = await this.mockLLMCall(prompt, model, config, controller.signal);
      clearTimeout(timeoutId);
      return response;
      
      // Code réel pour Ollama (à décommenter):
      /*
      const response = await fetch(`${this.defaultEndpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt,
          options: {
            temperature: config.temperature,
            num_predict: config.maxTokens || 2048
          },
          stream: false
        }),
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      clearTimeout(timeoutId);
      return data.response;
      */
      
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Timeout après ${this.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Simulation d'appel LLM (à remplacer)
   */
  async mockLLMCall(prompt, model, config, signal) {
    // Vérification d'annulation
    if (signal.aborted) {
      throw new Error('Requête annulée');
    }
    
    // Simulation de latence variable selon le modèle
    const latencyMap = {
      'llama3.2': 2000,
      'mistral': 1500,
      'codellama': 3000,
      'gemma': 1000
    };
    
    await this.sleep(latencyMap[model] || 2000);
    
    // Vérification d'annulation après latence
    if (signal.aborted) {
      throw new Error('Requête annulée');
    }
    
    // Génération de réponse simulée basée sur le modèle et le prompt
    return this.generateMockResponse(prompt, model, config);
  }

  /**
   * Génère une réponse simulée
   */
  generateMockResponse(prompt, model, config) {
    const promptLower = prompt.toLowerCase();
    
    // Réponses spécialisées selon le modèle
    if (model === 'codellama' && promptLower.includes('technical')) {
      return {
        analysis: 'Analyse technique approfondie',
        architecture: 'Architecture modulaire recommandée',
        implementation: 'Implémentation progressive avec tests',
        performance: 'Optimisations critiques identifiées'
      };
    }
    
    if (model === 'mistral' && promptLower.includes('structured')) {
      return {
        structure: 'Structure hiérarchique optimale',
        organization: 'Organisation en modules cohérents',
        dependencies: 'Dépendances minimales et claires',
        maintainability: 'Maintenabilité élevée'
      };
    }
    
    if (model === 'gemma' && promptLower.includes('design')) {
      return {
        visual_approach: 'Approche visuelle moderne',
        user_experience: 'UX intuitive et accessible',
        aesthetics: 'Design élégant et fonctionnel',
        interactions: 'Interactions fluides et naturelles'
      };
    }
    
    // Réponse générique pour llama3.2
    return {
      analysis: `Analyse effectuée par ${model}`,
      recommendations: 'Recommandations adaptées au contexte',
      next_steps: 'Étapes suivantes identifiées',
      confidence: config.temperature < 0.5 ? 'high' : 'medium'
    };
  }

  /**
   * Parse la réponse d'un fragment
   */
  parseFragmentResponse(response) {
    try {
      if (typeof response === 'string') {
        // Tenter d'extraire du JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return { text: response };
      }
      return response;
    } catch (error) {
      return { 
        raw: response,
        parse_error: error.message 
      };
    }
  }

  /**
   * Fusionne les résultats de tous les fragments
   */
  async mergeResults(fragmentResults, options = {}) {
    const successfulResults = fragmentResults
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .map(result => result.value);
    
    if (successfulResults.length === 0) {
      throw new Error('Aucun fragment exécuté avec succès');
    }
    
    // Stratégie de fusion selon le type
    const mergeStrategy = options.mergeStrategy || 'comprehensive';
    
    switch (mergeStrategy) {
      case 'comprehensive':
        return this.comprehensiveMerge(successfulResults);
      case 'prioritized':
        return this.prioritizedMerge(successfulResults);
      case 'consensus':
        return this.consensusMerge(successfulResults);
      default:
        return this.simpleMerge(successfulResults);
    }
  }

  /**
   * Fusion comprehensive de tous les résultats
   */
  comprehensiveMerge(results) {
    const merged = {
      summary: 'Analyse comprehensive multi-modèles',
      models_used: results.map(r => r.model),
      timestamp: new Date().toISOString(),
      fragments_count: results.length,
      results_by_type: {}
    };
    
    // Organiser par type de fragment
    for (const result of results) {
      const fragmentType = result.fragment.type;
      if (!merged.results_by_type[fragmentType]) {
        merged.results_by_type[fragmentType] = [];
      }
      merged.results_by_type[fragmentType].push({
        model: result.model,
        result: result.result
      });
    }
    
    // Synthèse par type
    merged.synthesis = {};
    for (const [type, typeResults] of Object.entries(merged.results_by_type)) {
      merged.synthesis[type] = this.synthesizeByType(typeResults, type);
    }
    
    return merged;
  }

  /**
   * Synthétise les résultats par type
   */
  synthesizeByType(typeResults, type) {
    const synthesis = {
      models_consensus: typeResults.length > 1,
      primary_recommendation: null,
      alternatives: [],
      confidence: 'medium'
    };
    
    // Logique de synthèse selon le type
    if (type === 'technical' || type === 'step') {
      // Pour les aspects techniques, prioriser codellama et mistral
      const technicalResults = typeResults.filter(r => 
        ['codellama', 'mistral'].includes(r.model)
      );
      
      if (technicalResults.length > 0) {
        synthesis.primary_recommendation = technicalResults[0].result;
        synthesis.confidence = 'high';
      }
    } else if (type === 'design') {
      // Pour le design, prioriser gemma
      const designResults = typeResults.filter(r => r.model === 'gemma');
      if (designResults.length > 0) {
        synthesis.primary_recommendation = designResults[0].result;
        synthesis.confidence = 'high';
      }
    }
    
    // Fallback sur le premier résultat disponible
    if (!synthesis.primary_recommendation && typeResults.length > 0) {
      synthesis.primary_recommendation = typeResults[0].result;
    }
    
    // Alternatives
    synthesis.alternatives = typeResults.slice(1).map(r => ({
      model: r.model,
      result: r.result
    }));
    
    return synthesis;
  }

  /**
   * Fusion simple
   */
  simpleMerge(results) {
    const merged = {};
    
    for (const result of results) {
      if (result.result && typeof result.result === 'object') {
        Object.assign(merged, result.result);
      }
    }
    
    return {
      merged_analysis: merged,
      models_used: results.map(r => r.model),
      fragments_processed: results.length
    };
  }

  /**
   * Fallback en cas d'échec complet
   */
  async executeFallback(prompt, options) {
    console.log('🔄 Exécution du fallback...');
    
    try {
      // Tentative avec le modèle par défaut sans fragmentation
      const result = await this.callLLMWithTimeout(
        prompt,
        this.defaultModel,
        this.availableModels[this.defaultModel] || {}
      );
      
      return {
        source: 'fallback',
        model: this.defaultModel,
        result: this.parseFragmentResponse(result)
      };
      
    } catch (error) {
      return {
        source: 'fallback_failed',
        error: error.message,
        result: this.getEmergencyFallback(prompt)
      };
    }
  }

  /**
   * Fallback d'urgence avec analyse locale
   */
  getEmergencyFallback(prompt) {
    const keywords = prompt.toLowerCase();
    
    return {
      analysis: 'Analyse locale d\'urgence',
      detected_domain: this.detectDomainFromKeywords(keywords),
      basic_recommendations: [
        'Utiliser vis-timeline comme bibliothèque principale',
        'Implémenter un design responsive',
        'Ajouter des interactions de base',
        'Optimiser pour la performance'
      ],
      warning: 'Résultat généré localement sans LLM'
    };
  }

  /**
   * Détection de domaine par mots-clés
   */
  detectDomainFromKeywords(keywords) {
    const domainKeywords = {
      historical: ['histoire', 'historical', 'chronologie', 'événement'],
      scientific: ['science', 'recherche', 'découverte', 'expérience'],
      business: ['entreprise', 'business', 'projet', 'milestone'],
      personal: ['personnel', 'cv', 'carrière', 'formation'],
      project: ['projet', 'sprint', 'agile', 'développement']
    };
    
    for (const [domain, keywordList] of Object.entries(domainKeywords)) {
      if (keywordList.some(keyword => keywords.includes(keyword))) {
        return domain;
      }
    }
    
    return 'general';
  }

  /**
   * Utilitaires
   */
  estimateTokens(text) {
    // Estimation approximative: 1 token ≈ 4 caractères pour le français
    return Math.ceil(text.length / 4);
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test de connectivité avec les LLMs
   */
  async testConnectivity() {
    const models = Object.keys(this.availableModels);
    const results = {};
    
    for (const model of models) {
      try {
        const testPrompt = 'Test de connectivité. Réponds "OK".';
        const response = await this.callLLMWithTimeout(
          testPrompt,
          model,
          { temperature: 0.1, maxTokens: 10 }
        );
        
        results[model] = {
          status: 'connected',
          response: response,
          latency: 'normal'
        };
        
      } catch (error) {
        results[model] = {
          status: 'error',
          error: error.message
        };
      }
    }
    
    return results;
  }
}

// Export par défaut
export default MCPDelegateWrapper;

// Fonction de création d'instance
export function createMCPDelegate(options) {
  return new MCPDelegateWrapper(options);
}

// Interface Vue 3 Composition API
export function useMCPDelegate(options = {}) {
  const delegate = ref(new MCPDelegateWrapper(options));
  const isExecuting = ref(false);
  const executionProgress = ref(0);
  const currentModel = ref('');
  
  const executeTask = async (prompt, executeOptions = {}) => {
    isExecuting.value = true;
    executionProgress.value = 0;
    
    try {
      const result = await delegate.value.executeFragmentedTask(prompt, executeOptions);
      executionProgress.value = 100;
      return result;
    } catch (error) {
      console.error('Erreur d\'exécution:', error);
      throw error;
    } finally {
      isExecuting.value = false;
      currentModel.value = '';
    }
  };
  
  const testConnectivity = async () => {
    return await delegate.value.testConnectivity();
  };
  
  return {
    delegate,
    isExecuting,
    executionProgress,
    currentModel,
    executeTask,
    testConnectivity
  };
}
