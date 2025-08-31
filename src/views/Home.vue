<template>
  <div class="home">
    <h1>Frise Chronologique</h1>
    <div class="instructions">
      <p>Collez l'URL d'un Google Sheets ou d'un fichier CSV pour générer une frise chronologique.</p>
    </div>
    <SpreadsheetInput 
      @submit="handleSpreadsheetSubmit" 
      :initial-url="initialUrl"
    />
    <div v-if="loading" class="loading">Chargement en cours...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="debugInfo" class="debug-info">
      <h3>Informations de débogage :</h3>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SpreadsheetInput from '../components/SpreadsheetInput.vue';

export default {
  name: 'HomeView',
  components: {
    SpreadsheetInput
  },
  setup() {
    const route = useRoute();
    const loading = ref(false);
    const error = ref(null);
    const debugInfo = ref(null);
    const initialUrl = ref('');

    // Fonction pour extraire les paramètres de l'URL
    const getUrlParameter = (name) => {
      const params = new URLSearchParams(window.location.search);
      return params.get(name);
    };

    // Vérifier si une URL est fournie dans les paramètres au chargement
    onMounted(() => {
      const urlParam = getUrlParameter('url');
      if (urlParam) {
        const decodedUrl = decodeURIComponent(urlParam);
        initialUrl.value = decodedUrl;
        handleSpreadsheetSubmit(decodedUrl);
      }
    });

    // Fonction pour formater l'URL Google Sheets pour l'export CSV
    const formatGoogleSheetsUrl = (url) => {
      try {
        const urlObj = new URL(url);
        
        // Vérifier si c'est une URL Google Sheets
        if (url.includes('docs.google.com/spreadsheets/')) {
          // Extraire l'ID du document
          const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
          if (match && match[1]) {
            const sheetId = match[1];
            // Créer une URL d'export CSV
            return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
          }
        }
        return url;
      } catch (e) {
        console.error('Erreur de formatage de l\'URL :', e);
        return url;
      }
    };

    // Gestion de la soumission du formulaire de tableur
    const handleSpreadsheetSubmit = async (url) => {
      console.log('Tentative de chargement avec l\'URL :', url);
      loading.value = true;
      error.value = null;
      
      try {
        // Mettre à jour l'URL avec le paramètre
        const params = new URLSearchParams();
        params.set('url', encodeURIComponent(url));
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
        
        // Charger les données
        console.log('Appel à fetchSheetData...');
        const data = await fetchSheetData(url);
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error('Aucune donnée valide n\'a été retournée');
        }
        
        console.log('Données chargées avec succès :', data);
        
        // Mettre à jour les données de la timeline
        timelineData.value = data;
        
        // Afficher une notification de succès
        showNotification('Données chargées avec succès', 'success');
      } catch (err) {
        console.error('Erreur lors du chargement des données :', err);
        
        // Message d'erreur plus convivial
        let errorMessage = 'Une erreur est survenue lors du chargement des données';
        
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion Internet.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Fichier non trouvé. Vérifiez que l\'URL est correcte.';
        } else if (err.message.includes('CSV')) {
          errorMessage = 'Erreur de format CSV. Vérifiez que le fichier est correctement formaté.';
        } else {
          errorMessage = `Erreur : ${err.message}`;
        }
        
        error.value = errorMessage;
        showNotification(errorMessage, 'error');
        
        // Réinitialiser les données en cas d'erreur
        timelineData.value = [];
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      error,
      debugInfo,
      initialUrl,
      handleSpreadsheetSubmit
    };
  }
};
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  color: #42b983;
  margin: 20px 0;
}

.error {
  color: #e74c3c;
  margin: 20px 0;
  padding: 10px;
  background: #fde8e8;
  border-radius: 4px;
}

.debug {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
}
</style>