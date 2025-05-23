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
      console.log('Bouton cliqué !');
      if (!url.value) {
        error.value = 'Veuillez entrer une URL';
        return;
      }
      
      loading.value = true;
      error.value = '';
      
      console.log('URL soumise :', url.value);
      
      try {
        // Émettre l'événement avec l'URL
        emit('submit', url.value);
      } catch (err) {
        console.error('Erreur lors du traitement :', err);
        error.value = 'Une erreur est survenue lors du chargement des données : ' + (err.message || 'Erreur inconnue');
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