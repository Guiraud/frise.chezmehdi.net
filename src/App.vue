<script>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SpreadsheetInput from './components/SpreadsheetInput.vue';
import Timeline from './components/Timeline.vue';
import { fetchSheetData, filterTimelineData } from './services/sheetService';

export default {
  name: 'App',
  components: {
    SpreadsheetInput,
    Timeline
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    // États
    const timelineData = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const searchQuery = ref('');
    const spreadsheetUrl = ref('');
    const notification = ref({ show: false, message: '', type: 'info' });
    
    // Données filtrées en fonction de la recherche
    const filteredData = computed(() => {
      return filterTimelineData(timelineData.value, searchQuery.value);
    });
    
    // Gestion de la soumission de l'URL du tableur
    const handleUrlSubmit = async (url) => {
      if (!url) return;
      
      loading.value = true;
      error.value = null;
      spreadsheetUrl.value = url;
      
      try {
        // Mise à jour de l'URL avec le paramètre de recherche
        const params = new URLSearchParams(window.location.search);
        params.set('url', encodeURIComponent(url));
        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
        
        // Récupération des données
        const data = await fetchSheetData(url);
        timelineData.value = data;
        showNotification('Données chargées avec succès', 'success');
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        error.value = 'Erreur lors du chargement des données: ' + (err.message || 'Une erreur est survenue');
        showNotification(error.value, 'error');
      } finally {
        loading.value = false;
      }
    };
    
    // Gestion de la sélection d'un élément
    const handleItemSelect = (properties) => {
      if (properties.items && properties.items.length > 0) {
        const itemId = properties.items[0];
        // Mise à jour de l'URL avec l'ancre de l'élément sélectionné
        window.location.hash = `event-${itemId}`;
      }
    };
    
    // Gestion du changement de plage de dates
    const handleRangeChange = (range) => {
      // Mise à jour de l'URL avec la plage de dates
      const params = new URLSearchParams(window.location.search);
      params.set('start', range.start.toISOString());
      params.set('end', range.end.toISOString());
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    };
    
    // Affichage d'une notification
    const showNotification = (message, type = 'info') => {
      notification.value = {
        show: true,
        message,
        type
      };
      
      // Masquer la notification après 5 secondes
      setTimeout(() => {
        notification.value.show = false;
      }, 5000);
    };
    
    // Copie du lien de partage
    const copyShareLink = () => {
      const url = window.location.href.split('?')[0];
      navigator.clipboard.writeText(url).then(() => {
        showNotification('Lien copié dans le presse-papiers', 'success');
      }).catch(err => {
        console.error('Erreur lors de la copie du lien:', err);
        showNotification('Erreur lors de la copie du lien', 'error');
      });
    };
    
    // Chargement initial depuis l'URL si présente
    const loadFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('url');
      
      if (urlParam) {
        const url = decodeURIComponent(urlParam);
        spreadsheetUrl.value = url;
        handleUrlSubmit(url);
      }
    };
    
    // Chargement initial
    loadFromUrl();
    
    return {
      // États
      timelineData: filteredData,
      loading,
      error,
      searchQuery,
      spreadsheetUrl,
      notification,
      
      // Méthodes
      handleUrlSubmit,
      handleItemSelect,
      handleRangeChange,
      showNotification,
      copyShareLink
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
        
        <!-- Barre de recherche -->
        <div v-if="timelineData.length > 0" class="card search-container">
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
            {{ filteredData.length }} événement{{ filteredData.length > 1 ? 's' : '' }}
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

        <!-- Contenu principal -->
        <div v-else-if="timelineData.length > 0" class="timeline-wrapper">
          <!-- Composant Timeline -->
          <Timeline 
            :items="filteredData"
            @select="handleItemSelect"
            @rangechanged="handleRangeChange"
            class="timeline-card"
          />
          
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
        
        <!-- État vide -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="icon-timeline"></i>
          </div>
          <h3>Commencez par charger un tableur</h3>
          <p>Collez l'URL d'un tableur Google Sheets ou Framacalc pour générer votre frise chronologique.</p>
        </div>
      </div>
    </main>

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
