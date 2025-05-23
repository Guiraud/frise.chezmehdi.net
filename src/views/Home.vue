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

    const handleSpreadsheetSubmit = async (url) => {
      console.log('URL reçue :', url);
      loading.value = true;
      error.value = null;
      debugInfo.value = null;
      
      try {
        // Mettre à jour l'URL avec le paramètre
        const params = new URLSearchParams();
        params.set('url', encodeURIComponent(url));
        window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
        
        // Formater l'URL pour Google Sheets si nécessaire
        const formattedUrl = formatGoogleSheetsUrl(url);
        console.log('URL formatée :', formattedUrl);
        
        const response = await fetch(formattedUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/csv',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const csvData = await response.text();
        debugInfo.value = {
          url: url,
          formattedUrl: formattedUrl,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          dataPreview: csvData.substring(0, 500) + (csvData.length > 500 ? '...' : '')
        };
        
        console.log('Données CSV :', csvData);
        
      } catch (err) {
        console.error('Erreur :', err);
        error.value = `Erreur lors du chargement : ${err.message}`;
        debugInfo.value = {
          error: err.toString(),
          stack: err.stack,
          url: url
        };
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