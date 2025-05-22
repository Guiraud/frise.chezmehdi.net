<template>
  <div class="spreadsheet-input">
    <form @submit.prevent="handleSubmit" class="input-group">
      <input
        type="text"
        v-model="url"
        placeholder="Collez l'URL de votre tableur"
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
export default {
  name: 'SpreadsheetInput',
  emits: ['submit'],
  data() {
    return {
      url: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleSubmit() {
      console.log('Bouton cliqué !'); // Ajoutez cette ligne
      if (!this.url) {
        this.error = 'Veuillez entrer une URL';
        return;
      }
      
      this.loading = true;
      this.error = '';
      
      console.log('URL soumise :', this.url); // Ajoutez cette ligne
      
      try {
        // Émettre l'événement avec l'URL
        this.$emit('submit', this.url);
      } catch (err) {
        console.error('Erreur lors du traitement :', err); // Ajoutez cette ligne
        this.error = 'Une erreur est survenue lors du chargement des données';
      } finally {
        this.loading = false;
      }
    }
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