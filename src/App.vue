<script>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SpreadsheetInput from './components/SpreadsheetInput.vue';
import Timeline from './components/Timeline.vue';
import ErrorBoundary from './components/ErrorBoundary.vue';
import DevTools from './components/DevTools.vue';
import { useTimeline } from './composables/useTimeline';
import { useUrlState } from './composables/useUrlState';
import { useNotifications } from './composables/useNotifications';

export default {
  name: 'App',
  components: {
    SpreadsheetInput,
    Timeline,
    ErrorBoundary,
    DevTools
  },
  setup() {
    // Composables
    const timeline = useTimeline();
    const urlState = useUrlState();
    const notifications = useNotifications();
    
    // State for UI
    const showInstructions = ref(true);
    
    // Gestion de la soumission de l'URL du tableur
    const handleUrlSubmit = async (url) => {
      if (!url) return;
      
      try {
        urlState.updateUrlWithSpreadsheet(url);
        await timeline.loadTimelineData(url);
        notifications.showSuccess('Données chargées avec succès');
        // Auto-collapse instructions when data loads successfully
        showInstructions.value = false;
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        notifications.showError('Erreur lors du chargement des données: ' + (err.message || 'Une erreur est survenue'));
      }
    };
    
    // Gestion de la sélection d'un élément
    const handleItemSelect = (properties) => {
      if (properties.items && properties.items.length > 0) {
        const itemId = properties.items[0];
        urlState.updateUrlWithSelection(itemId);
      }
    };
    
    // Gestion du changement de plage de dates
    const handleRangeChange = (range) => {
      urlState.updateUrlWithDateRange(range);
    };
    
    // Copie du lien de partage
    const copyShareLink = () => {
      const shareUrl = urlState.getShareableLink();
      navigator.clipboard.writeText(shareUrl).then(() => {
        notifications.showSuccess('Lien copié dans le presse-papiers');
      }).catch(err => {
        console.error('Erreur lors de la copie du lien:', err);
        notifications.showError('Erreur lors de la copie du lien');
      });
    };
    
    // Error handling for error boundary
    const lastAction = ref(null);
    
    const handleGlobalError = (errorInfo) => {
      console.error('🚨 Global error caught:', errorInfo);
      notifications.showError('Une erreur inattendue s\'est produite');
    };
    
    const handleRetry = () => {
      if (lastAction.value) {
        console.log('🔄 Retrying last action:', lastAction.value);
        lastAction.value();
      }
    };
    
    const retryLastAction = () => {
      if (lastAction.value) {
        lastAction.value();
      } else {
        // Default retry - reload the current URL
        const currentUrl = urlState.spreadsheetUrl.value;
        if (currentUrl) {
          handleUrlSubmit(currentUrl);
        }
      }
    };
    
    // Enhanced handleUrlSubmit with retry tracking
    const enhancedHandleUrlSubmit = async (url) => {
      lastAction.value = () => enhancedHandleUrlSubmit(url);
      return handleUrlSubmit(url);
    };
    
    // Toggle instructions visibility
    const toggleInstructions = () => {
      showInstructions.value = !showInstructions.value;
    };
    
    // Chargement initial
    onMounted(() => {
      const initialUrl = urlState.loadFromUrl();
      if (initialUrl) {
        enhancedHandleUrlSubmit(initialUrl);
      }
    });
    
    return {
      // Timeline state
      timelineData: timeline.timelineData,
      loading: timeline.loading,
      error: timeline.error,
      searchQuery: timeline.searchQuery,
      
      // URL state
      spreadsheetUrl: urlState.spreadsheetUrl,
      
      // UI state
      showInstructions,
      toggleInstructions,
      
      // Notifications
      notification: notifications.notification,
      getNotificationIcon: notifications.getNotificationIcon,
      
      // Methods
      handleUrlSubmit: enhancedHandleUrlSubmit,
      handleItemSelect,
      handleRangeChange,
      copyShareLink,
      
      // Error boundary methods
      handleGlobalError,
      handleRetry,
      retryLastAction,
      
      // Development methods
      handleSimulatedError: (info) => {
        console.log('🧪 Simulated error:', info);
        notifications.showError(`Test error: ${info.type}`);
      },
      handleTestCompleted: (result) => {
        console.log('✅ Test completed:', result);
        notifications.showSuccess(`Test completed: ${result.type}`);
      }
    };
  }
};
</script>

<template>
  <div class="app">
    <!-- En-tête de l'application -->
    <header class="app-header">
      <div class="container">
        <h1>Frise Chronologique Interactive</h1>
        <p>Générez une frise chronologique à partir de Google Sheets ou Framacalc</p>
      </div>
    </header>

    <!-- Error Boundary wrapper for main content -->
    <ErrorBoundary 
      :retry-callback="retryLastAction"
      @error="handleGlobalError"
      @retry="handleRetry"
    >
      <!-- Timeline principale - EN TÊTE -->
      <div v-if="timelineData.length > 0" class="timeline-header-section">
        <div class="container">
          <!-- Barre de recherche -->
          <div class="card search-container">
            <div class="search-box">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Rechercher dans la frise..." 
                class="search-input"
              >
              <i class="icon-search"></i>
            </div>
            <div class="results-count">
              {{ timelineData.length }} événement{{ timelineData.length > 1 ? 's' : '' }}
            </div>
          </div>

          <!-- Timeline with its own error boundary -->
          <ErrorBoundary fallback-message="Erreur lors de l'affichage de la timeline">
            <Timeline 
              :items="timelineData"
              @select="handleItemSelect"
              @rangechanged="handleRangeChange"
              class="timeline-card timeline-prominent"
            />
          </ErrorBoundary>
          
          <!-- Légende -->
          <div class="legend">
            <div class="legend-item">
              <span class="legend-color event-context"></span>
              <span>Événement contextuel</span>
            </div>
            <div class="legend-item">
              <span class="legend-color event-trigger"></span>
              <span>Événement déclencheur</span>
            </div>
            <div class="legend-item">
              <span class="legend-color period-context"></span>
              <span>Période contextuelle</span>
            </div>
            <div class="legend-item">
              <span class="legend-color period-activity"></span>
              <span>Période d'activité</span>
            </div>
          </div>
        </div>
      </div>

      <main class="app-main">
        <div class="container">
          <!-- Zone de saisie de l'URL du tableur -->
          <div class="card">
            <h2>Charger un tableur</h2>
            <SpreadsheetInput 
              :initial-url="spreadsheetUrl"
              @submit="handleUrlSubmit" 
            />
            
            <div v-if="spreadsheetUrl" class="share-section">
              <button @click="copyShareLink" class="btn btn-outline">
                <i class="icon-link"></i> Copier le lien de partage
              </button>
            </div>
          </div>

          <!-- Chargement en cours -->
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Chargement des données...</p>
          </div>

          <!-- Message d'erreur -->
          <div v-else-if="error" class="error-message">
            <i class="icon-error"></i>
            <p>{{ error }}</p>
          </div>

          <!-- Instructions pliables -->
          <div class="instructions-section">
            <div class="instructions-header" @click="toggleInstructions">
              <h2>
                <span class="chevron">{{ showInstructions ? '▼' : '▶' }}</span>
                {{ timelineData.length > 0 ? 'Instructions et aide' : 'Format et instructions' }}
              </h2>
              <p v-if="!showInstructions" class="instructions-summary">
                Format des données, partage Google Sheets...
              </p>
            </div>
            
            <div v-if="showInstructions" class="instructions-content">
              <!-- Format attendu pour le tableur -->
              <div class="card format-info">
                <h3>Format du tableur</h3>
                <p class="format-description">
                  Votre tableur doit contenir les colonnes suivantes (noms exacts) :
                </p>
            
            <div class="format-table">
              <div class="format-row format-header">
                <div class="format-cell">Colonne</div>
                <div class="format-cell">Description</div>
                <div class="format-cell">Obligatoire</div>
              </div>
              
              <div class="format-row">
                <div class="format-cell format-column" data-label="Colonne">type</div>
                <div class="format-cell" data-label="Description">
                  <strong>Type d'événement :</strong>
                  <div class="type-examples">
                    <div class="type-item">
                      <code>événement_contextuel</code> - Événement ponctuel donnant du contexte
                      <span class="example">Ex: "Élection présidentielle", "Signature d'un traité"</span>
                    </div>
                    <div class="type-item">
                      <code>événement_déclencheur</code> - Événement ponctuel qui déclenche une action
                      <span class="example">Ex: "Début des manifestations", "Annonce d'une réforme"</span>
                    </div>
                    <div class="type-item">
                      <code>période_contextuelle</code> - Période donnant du contexte historique
                      <span class="example">Ex: "Seconde Guerre mondiale", "Crise économique"</span>
                    </div>
                    <div class="type-item">
                      <code>période_activité</code> - Période d'activité continue
                      <span class="example">Ex: "Construction d'un bâtiment", "Campagne électorale"</span>
                    </div>
                  </div>
                </div>
                <div class="format-cell format-required" data-label="Obligatoire">✓</div>
              </div>
              
              <div class="format-row">
                <div class="format-cell format-column" data-label="Colonne">date_début</div>
                <div class="format-cell" data-label="Description">Date de début (format : AAAA-MM-JJ ou JJ/MM/AAAA)</div>
                <div class="format-cell format-required" data-label="Obligatoire">✓</div>
              </div>
              
              <div class="format-row">
                <div class="format-cell format-column" data-label="Colonne">titre</div>
                <div class="format-cell" data-label="Description">Titre de l'événement</div>
                <div class="format-cell format-required" data-label="Obligatoire">✓</div>
              </div>
              
              <div class="format-row">
                <div class="format-cell format-column" data-label="Colonne">date_fin</div>
                <div class="format-cell" data-label="Description">Date de fin pour les périodes (optionnel pour les événements ponctuels)</div>
                <div class="format-cell format-optional" data-label="Obligatoire">—</div>
              </div>
              
              <div class="format-row">
                <div class="format-cell format-column" data-label="Colonne">description</div>
                <div class="format-cell" data-label="Description">Description détaillée (optionnel)</div>
                <div class="format-cell format-optional" data-label="Obligatoire">—</div>
              </div>
            </div>
            
            <div class="format-note">
              <strong>Note :</strong> La première ligne doit contenir les en-têtes de colonnes.
            </div>
            
            <div class="format-example">
              <a href="https://docs.google.com/spreadsheets/d/1J_peuC7nbhzW8IEeH4xwNOlgEqbL4kRAumt02n2yOVg/edit?usp=sharing" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="btn btn-outline">
                <i class="icon-external"></i> Voir un modèle d'exemple
              </a>
            </div>
          </div>
          
          <!-- Instructions de partage Google Sheets -->
          <div class="card sharing-info">
            <h2>Comment partager votre Google Sheets</h2>
            <div class="sharing-warning">
              <i class="icon-warning"></i>
              <strong>Important :</strong> Votre document doit être public pour être accessible par l'application.
            </div>
            
            <div class="sharing-steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <strong>Ouvrez votre Google Sheets</strong>
                  <p>Accédez à votre document dans Google Drive ou Google Sheets</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <strong>Cliquez sur "Partager" (bouton bleu en haut à droite)</strong>
                  <p>Ou allez dans Fichier > Partager > Partager avec d'autres personnes</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <strong>Changez l'accès à "Tous les utilisateurs avec le lien"</strong>
                  <p>Cliquez sur "Accès restreint" puis sélectionnez "Tous les utilisateurs avec le lien"</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">4</div>
                <div class="step-content">
                  <strong>Définissez les autorisations sur "Lecteur"</strong>
                  <p>Assurez-vous que le niveau d'autorisation soit "Lecteur" (pas besoin d'édition)</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">5</div>
                <div class="step-content">
                  <strong>Copiez le lien</strong>
                  <p>Cliquez sur "Copier le lien" et collez-le dans le champ ci-dessus</p>
                </div>
              </div>
            </div>
            
              <div class="sharing-alternative">
                <h3>Alternative : Framacalc</h3>
                <p>Vous pouvez aussi utiliser <a href="https://framacalc.org" target="_blank" rel="noopener noreferrer">Framacalc</a>, 
                qui est public par défaut. Créez votre tableau, puis copiez l'URL de la page.</p>
              </div>
            </div>
          </div>
          </div>
          
          <!-- État vide -->
          <div v-if="!loading && !error && timelineData.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="icon-timeline"></i>
            </div>
            <h3>Commencez par charger un tableur</h3>
            <p>Collez l'URL d'un tableur Google Sheets ou Framacalc pour générer votre frise chronologique.</p>
          </div>
        </div>
      </main>
    </ErrorBoundary>

    <!-- Pied de page -->
    <footer class="app-footer">
      <div class="container">
        <p>© {{ new Date().getFullYear() }} Frise Chronologique - Développé avec Vue.js et Vis.js</p>
        <div class="footer-links">
          <a href="#" @click.prevent="showHelp">Aide</a>
          <span class="divider">•</span>
          <a href="#" @click.prevent="showAbout">À propos</a>
        </div>
      </div>
    </footer>
    
    <!-- Notifications -->
    <transition name="fade">
      <div v-if="notification.show" :class="['notification', notification.type]">
        <i :class="getNotificationIcon(notification.type)"></i>
        <span>{{ notification.message }}</span>
        <button @click="notification.show = false" class="close-btn">
          <i class="icon-close"></i>
        </button>
      </div>
    </transition>
    
    <!-- Development Tools (only in debug mode) -->
    <DevTools 
      @error-simulated="handleSimulatedError"
      @test-completed="handleTestCompleted"
    />
  </div>
</template>

<style>
:root {
  /* Couleurs principales */
  --primary-color: #42b983;
  --primary-dark: #369f6b;
  --primary-light: #e8f5e9;
  --secondary-color: #2c3e50;
  --secondary-light: #34495e;
  --error-color: #e74c3c;
  --warning-color: #f39c12;
  --success-color: #27ae60;
  --info-color: #3498db;
  --background-color: #f5f7fa;
  --surface-color: #ffffff;
  --text-color: #2c3e50;
  --text-secondary: #7f8c8d;
  --border-color: #e1e4e8;
  --shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
  
  /* Espacements */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Rayons de bordure */
  --border-radius-sm: 4px;
  --border-radius: 8px;
  --border-radius-lg: 12px;
  
  /* Typographie */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-xxl: 2rem;
  --line-height: 1.6;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 600;
}

/* Réinitialisation des styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Styles de base */
body {
  font-family: var(--font-family);
  line-height: var(--line-height);
  color: var(--text-color);
  background-color: var(--background-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Structure de l'application */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* En-tête */
.app-header {
  background-color: var(--secondary-color);
  color: white;
  padding: var(--spacing-xl) 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.app-header h1 {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
  line-height: 1.2;
}

.app-header p {
  font-size: var(--font-size-lg);
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
}

/* Contenu principal */
.app-main {
  flex: 1;
  padding: var(--spacing-xl) 0;
  position: relative;
}

/* Cartes */
.card {
  background: var(--surface-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  transition: var(--transition);
}

.card h2 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
  color: var(--secondary-color);
  font-weight: var(--font-weight-bold);
}

/* Section de partage */
.share-section {
  margin-top: var(--spacing-md);
  display: flex;
  justify-content: flex-end;
}

/* Section format du tableur */
.format-info {
  border-left: 4px solid var(--primary-color);
}

.format-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.format-table {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

.format-row {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 0;
}

.format-header {
  background-color: var(--background-color);
  font-weight: var(--font-weight-bold);
}

.format-cell {
  padding: var(--spacing-sm) var(--spacing-md);
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  font-size: var(--font-size-sm);
}

.format-cell:last-child {
  border-right: none;
}

.format-row:last-child .format-cell {
  border-bottom: none;
}

.format-column {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: var(--font-weight-medium);
  color: var(--primary-color);
  background-color: rgba(66, 185, 131, 0.05);
}

.format-required {
  color: var(--success-color);
  font-weight: var(--font-weight-bold);
  text-align: center;
}

.format-optional {
  color: var(--text-secondary);
  text-align: center;
}

.format-note {
  background-color: var(--primary-light);
  color: var(--primary-dark);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  border-left: 3px solid var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.format-example {
  display: flex;
  justify-content: center;
}

.type-examples {
  margin-top: var(--spacing-xs);
}

.type-item {
  margin-bottom: var(--spacing-xs);
  padding: var(--spacing-xs);
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: var(--border-radius-sm);
  border-left: 2px solid var(--border-color);
}

.type-item code {
  font-family: 'Monaco', 'Consolas', monospace;
  background-color: rgba(66, 185, 131, 0.1);
  color: var(--primary-dark);
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: var(--font-weight-medium);
  font-size: 0.9em;
}

.type-item .example {
  display: block;
  font-style: italic;
  color: var(--text-secondary);
  font-size: 0.85em;
  margin-top: 2px;
  margin-left: var(--spacing-md);
}

/* Instructions de partage */
.sharing-info {
  border-left: 4px solid var(--warning-color);
}

.sharing-warning {
  background-color: #fff3cd;
  color: #856404;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  border: 1px solid #ffeaa7;
}

.sharing-warning i {
  color: var(--warning-color);
  font-size: 1.2em;
}

.sharing-steps {
  margin: var(--spacing-md) 0;
}

.step {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: var(--border-radius);
  border-left: 3px solid var(--primary-color);
}

.step:last-child {
  margin-bottom: 0;
}

.step-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.step-content {
  flex: 1;
}

.step-content strong {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--text-color);
}

.step-content p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.sharing-alternative {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--primary-light);
  border-radius: var(--border-radius);
  border-left: 3px solid var(--primary-color);
}

.sharing-alternative h3 {
  color: var(--primary-dark);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-lg);
}

.sharing-alternative p {
  color: var(--primary-dark);
  margin: 0;
}

.sharing-alternative a {
  color: var(--primary-dark);
  font-weight: var(--font-weight-medium);
}

/* Barre de recherche */
.search-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-sm) var(--spacing-xl);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size);
  transition: var(--transition);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.search-box i {
  position: absolute;
  left: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.results-count {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

/* État de chargement */
.loading {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto var(--spacing-md);
  border: 3px solid rgba(66, 185, 131, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Messages d'erreur */
.error-message {
  background-color: #fde8e8;
  color: var(--error-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  margin: var(--spacing-md) 0;
  border-left: 4px solid var(--error-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.error-message i {
  font-size: 1.2em;
}

/* Timeline en tête de page */
.timeline-header-section {
  background: linear-gradient(135deg, var(--primary-light), rgba(255, 255, 255, 0.9));
  border-bottom: 3px solid var(--primary-color);
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Conteneur de la timeline */
.timeline-wrapper {
  margin-top: var(--spacing-lg);
}

.timeline-card {
  background: var(--surface-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  margin-bottom: var(--spacing-lg);
}

.timeline-prominent {
  box-shadow: 0 6px 30px rgba(66, 185, 131, 0.2);
  border: 3px solid var(--primary-color);
  margin: var(--spacing-lg) 0;
  border-radius: var(--border-radius-lg);
  background: var(--surface-color);
}

/* Instructions pliables */
.instructions-section {
  margin-top: var(--spacing-xl);
}

.instructions-header {
  cursor: pointer;
  padding: var(--spacing-lg);
  background: var(--surface-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  transition: var(--transition);
  user-select: none;
}

.instructions-header:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.instructions-header h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--secondary-color);
  font-size: var(--font-size-lg);
}

.instructions-header h2 .chevron {
  font-size: 0.8em;
  transition: transform 0.3s ease;
  color: var(--primary-color);
  display: inline-block;
  width: 1.2em;
}

.instructions-summary {
  margin: var(--spacing-xs) 0 0 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.instructions-content {
  margin-top: var(--spacing-md);
}

.instructions-content .card {
  margin-bottom: var(--spacing-md);
}

.instructions-content .card:last-child {
  margin-bottom: 0;
}

.instructions-content h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
  color: var(--secondary-color);
  font-weight: var(--font-weight-bold);
}

/* Légende */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.legend-color {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

/* Styles pour les différents types d'événements */
.event-context {
  background-color: #3498db;
}

.event-trigger {
  background-color: #e74c3c;
}

.period-context {
  background-color: #2ecc71;
}

.period-activity {
  background-color: #9b59b6;
}

/* État vide */
.empty-state {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-md);
  color: var(--text-secondary);
  background: var(--surface-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  margin-top: var(--spacing-lg);
}

.empty-icon {
  font-size: 4rem;
  color: var(--border-color);
  margin-bottom: var(--spacing-md);
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
}

/* Pied de page */
.app-footer {
  background-color: var(--secondary-color);
  color: rgba(255, 255, 255, 0.8);
  padding: var(--spacing-lg) 0;
  margin-top: auto;
  font-size: var(--font-size-sm);
}

.footer-links {
  margin-top: var(--spacing-sm);
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: var(--transition);
}

.footer-links a:hover {
  color: white;
  text-decoration: underline;
}

.divider {
  opacity: 0.5;
}

/* Notifications */
.notification {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius);
  color: white;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
  transition: var(--transition);
}

.notification i {
  font-size: 1.2em;
}

.notification.success {
  background-color: var(--success-color);
}

.notification.error {
  background-color: var(--error-color);
}

.notification.warning {
  background-color: var(--warning-color);
}

.notification.info {
  background-color: var(--info-color);
}

.close-btn {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  margin-left: var(--spacing-sm);
  padding: 0 var(--spacing-xs);
  font-size: 1.1em;
  opacity: 0.8;
  transition: var(--transition);
}

.close-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

@keyframes slideIn {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Boutons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  white-space: nowrap;
}

.btn i {
  font-size: 1.1em;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-light);
  transform: translateY(-1px);
}

/* Icônes (à remplacer par des icônes réelles) */
[class^="icon-"], [class*=" icon-"] {
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Responsive */
@media (max-width: 768px) {
  :root {
    --font-size: 0.9375rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.5rem;
    --font-size-xxl: 1.75rem;
  }
  
  .app-header {
    padding: var(--spacing-lg) 0;
  }
  
  .card {
    padding: var(--spacing-md);
  }
  
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: 100%;
  }
  
  .legend {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .format-table {
    font-size: 0.8rem;
  }
  
  .format-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .format-cell {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  
  .format-header .format-cell {
    display: none;
  }
  
  .format-header .format-cell:first-child {
    display: block;
  }
  
  .format-cell::before {
    content: attr(data-label) ": ";
    font-weight: var(--font-weight-bold);
    display: inline-block;
    min-width: 80px;
  }
  
  .format-header .format-cell::before {
    content: "";
    display: none;
  }
  
  .type-item .example {
    margin-left: 0;
    margin-top: var(--spacing-xs);
  }
  
  .step {
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
  }
  
  .step-number {
    align-self: center;
  }
  
  .notification {
    left: var(--spacing-md);
    right: var(--spacing-md);
    max-width: none;
    bottom: var(--spacing-md);
  }
}

/* Styles pour les écrans très petits */
@media (max-width: 480px) {
  .app-header h1 {
    font-size: var(--font-size-xl);
  }
  
  .app-header p {
    font-size: var(--font-size);
  }
  
  .btn {
    width: 100%;
    padding: var(--spacing-sm);
  }
}
</style>
