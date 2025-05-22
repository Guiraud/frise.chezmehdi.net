<template>
  <div class="spreadsheet-input-container">
    <div class="input-group">
      <label for="spreadsheet-url">URL du tableur</label>
      <input
        id="spreadsheet-url"
        v-model="url"
        type="text"
        placeholder="https://docs.google.com/spreadsheets/..."
        @input="validateUrl"
      />
      <button @click="validateUrl" :disabled="isLoading">Valider</button>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="isValid" class="success-message">URL valide !</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      url: '',
      error: '',
      isValid: false,
      isLoading: false
    }
  },
  methods: {
    async validateUrl() {
      if (this.isLoading) return;
      
      this.error = '';
      this.isValid = false;
      this.isLoading = true;

      try {
        // Validation basique de l'URL
        const url = new URL(this.url);
        if (!url.hostname.includes('docs.google.com') && !url.hostname.includes('framacalc.org')) {
          throw new Error('L\'URL doit être un lien vers Google Sheets ou Framacalc');
        }

        // TODO: Validation plus approfondie avec requête API
        this.isValid = true;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.spreadsheet-input-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
}

.input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

label {
  flex: 0 0 120px;
  align-self: center;
}

input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff4444;
  margin-top: 0.5rem;
}

.success-message {
  color: #42b983;
  margin-top: 0.5rem;
}
</style>
