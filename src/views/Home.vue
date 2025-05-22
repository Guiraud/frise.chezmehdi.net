<template>
  <div class="home">
    <h1>Mon Application de Frise</h1>
    <SpreadsheetInput @submit="handleSpreadsheetSubmit" />
    <div v-if="loading" class="loading">Chargement en cours...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <pre v-if="csvData" class="debug">{{ csvData }}</pre>
  </div>
</template>

<script>
import SpreadsheetInput from '../components/SpreadsheetInput.vue';

export default {
  components: {
    SpreadsheetInput
  },
  data() {
    return {
      loading: false,
      error: null,
      csvData: null
    }
  },
  methods: {
    async handleSpreadsheetSubmit(url) {
      console.log('URL reçue :', url);
      this.loading = true;
      this.error = null;
      this.csvData = null;
      
      try {
        // Si c'est une URL de fichier local
        if (url.includes('example.csv')) {
          url = '/example.csv'; // Chemin relatif depuis le dossier public
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        this.csvData = await response.text();
        console.log('Données CSV :', this.csvData);
        
      } catch (error) {
        console.error('Erreur :', error);
        this.error = `Erreur lors du chargement : ${error.message}`;
      } finally {
        this.loading = false;
      }
    }
  }
}
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