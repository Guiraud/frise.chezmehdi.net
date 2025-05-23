<template>
  <div class="spreadsheet-input">
    <form @submit.prevent="handleSubmit" class="input-group">
      <input
        type="text"
        v-model="url"
        placeholder="Collez l'URL de votre tableur Google Sheets ou CSV"
        class="form-control"
      />
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading">Chargement...</span>
        <span v-else>Valider</span>
      </button>
    </form>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'SpreadsheetInput',
  emits: ['submit'],
  props: {
    initialUrl: {
      type: String,
      default: ''
    }
  },
  setup(props, { emit }) {
    const url = ref('');
    const loading = ref(false);
    const error = ref('');

    // Mettre à jour l'URL si initialUrl change
    watch(() => props.initialUrl, (newVal) => {
      if (newVal) {
        url.value = newVal;
      }
    }, { immediate: true });

    const handleSubmit = async () => {
      console.log('Soumission du formulaire avec l\'URL :', url.value);
      
      // Validation de l'URL
      if (!url.value) {
        error.value = 'Veuillez entrer une URL ou un nom de fichier';
        return;
      }
      
      // Nettoyer l'URL
      const cleanUrl = url.value.trim();
      
      // Validation du format
      if (!/^(https?:\/\/|\/|\w+\.csv$)/i.test(cleanUrl)) {
        error.value = 'Format non valide. Utilisez une URL complète ou un nom de fichier CSV';
        return;
      }
      
      loading.value = true;
      error.value = '';
      
      try {
        console.log('Émission de l\'événement submit avec l\'URL :', cleanUrl);
        await emit('submit', cleanUrl);
      } catch (err) {
        console.error('Erreur lors de la soumission :', err);
        error.value = err.message || 'Une erreur est survenue lors du chargement des données';
        // Émettre un événement d'erreur
        emit('error', error.value);
      } finally {
        loading.value = false;
      }
    };

    return {
      url,
      loading,
      error,
      handleSubmit
    };
  }
}
</script>

<style scoped>
.spreadsheet-input {
  margin: 20px 0;
}

.input-group {
  display: flex;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}

.form-control {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  margin-top: 10px;
  text-align: center;
}
</style>