<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-boundary-card">
      <!-- Error Icon -->
      <div class="error-icon">
        <i class="icon-error"></i>
      </div>
      
      <!-- Error Title -->
      <h2 class="error-title">Quelque chose s'est mal passé</h2>
      
      <!-- Error Description -->
      <p class="error-description">
        {{ userFriendlyMessage }}
      </p>
      
      <!-- Error Details (Development Only) -->
      <details v-if="isDevelopment && errorDetails" class="error-details">
        <summary>Détails techniques</summary>
        <pre class="error-stack">{{ errorDetails }}</pre>
      </details>
      
      <!-- Action Buttons -->
      <div class="error-actions">
        <button @click="retryAction" class="btn btn-primary">
          <i class="icon-refresh"></i>
          Réessayer
        </button>
        
        <button @click="resetError" class="btn btn-outline">
          <i class="icon-home"></i>
          Retour à l'accueil
        </button>
        
        <button v-if="canGoBack" @click="goBack" class="btn btn-outline">
          <i class="icon-arrow-left"></i>
          Page précédente
        </button>
      </div>
      
      <!-- Help Text -->
      <div class="error-help">
        <p>
          Si le problème persiste, essayez de :
        </p>
        <ul>
          <li>Vérifier votre connexion internet</li>
          <li>Recharger complètement la page (Ctrl+F5)</li>
          <li>Vider le cache de votre navigateur</li>
        </ul>
      </div>
    </div>
  </div>
  
  <!-- Normal content when no error -->
  <slot v-else></slot>
</template>

<script>
import { ref, onErrorCaptured, computed } from 'vue';
import { useRouter } from 'vue-router';
import { isDebugEnabled } from '../config/environment';

export default {
  name: 'ErrorBoundary',
  emits: ['error', 'retry'],
  props: {
    fallbackMessage: {
      type: String,
      default: 'Une erreur inattendue est survenue. Veuillez réessayer.'
    },
    showRetry: {
      type: Boolean,
      default: true
    },
    retryCallback: {
      type: Function,
      default: null
    }
  },
  setup(props, { emit }) {
    const hasError = ref(false);
    const errorInfo = ref(null);
    const router = useRouter();
    
    // Computed properties
    const isDevelopment = computed(() => isDebugEnabled());
    
    const errorDetails = computed(() => {
      if (!errorInfo.value) return null;
      return `${errorInfo.value.message}\n\nStack trace:\n${errorInfo.value.stack}`;
    });
    
    const userFriendlyMessage = computed(() => {
      if (!errorInfo.value) return props.fallbackMessage;
      
      // Map technical errors to user-friendly messages
      const error = errorInfo.value;
      
      if (error.message?.includes('Network')) {
        return 'Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.';
      }
      
      if (error.message?.includes('timeout')) {
        return 'La requête a pris trop de temps. Vérifiez votre connexion et réessayez.';
      }
      
      if (error.message?.includes('Sheets')) {
        return 'Impossible d\'accéder au tableur. Vérifiez que le lien est correct et public.';
      }
      
      if (error.message?.includes('CSV')) {
        return 'Erreur lors du chargement du fichier CSV. Vérifiez le format du fichier.';
      }
      
      if (error.message?.includes('parsing')) {
        return 'Erreur lors de l\'analyse des données. Vérifiez le format de votre tableur.';
      }
      
      // Generic fallback
      return props.fallbackMessage;
    });
    
    const canGoBack = computed(() => {
      return window.history.length > 1;
    });
    
    // Error capture
    onErrorCaptured((error, instance, errorInfo) => {
      console.error('🚨 Error Boundary caught error:', error);
      console.error('📍 Component instance:', instance);
      console.error('ℹ️ Error info:', errorInfo);
      
      hasError.value = true;
      errorInfo.value = {
        message: error.message,
        stack: error.stack,
        componentInfo: errorInfo
      };
      
      // Emit error for parent handling
      emit('error', {
        error,
        instance,
        errorInfo
      });
      
      // Prevent error propagation
      return false;
    });
    
    // Actions
    const resetError = () => {
      hasError.value = false;
      errorInfo.value = null;
      router.push('/');
    };
    
    const retryAction = () => {
      if (props.retryCallback) {
        props.retryCallback();
      }
      
      hasError.value = false;
      errorInfo.value = null;
      emit('retry');
    };
    
    const goBack = () => {
      window.history.back();
    };
    
    return {
      hasError,
      errorInfo,
      errorDetails,
      userFriendlyMessage,
      canGoBack,
      isDevelopment,
      resetError,
      retryAction,
      goBack
    };
  }
};
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: var(--spacing-lg);
  background-color: var(--background-color);
}

.error-boundary-card {
  max-width: 600px;
  width: 100%;
  background: var(--surface-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: var(--spacing-xl);
  text-align: center;
  border: 1px solid var(--border-color);
}

.error-icon {
  font-size: 4rem;
  color: var(--error-color);
  margin-bottom: var(--spacing-lg);
}

.error-title {
  font-size: var(--font-size-xl);
  color: var(--error-color);
  margin-bottom: var(--spacing-md);
  font-weight: var(--font-weight-bold);
}

.error-description {
  font-size: var(--font-size-lg);
  color: var(--text-color);
  margin-bottom: var(--spacing-lg);
  line-height: var(--line-height);
}

.error-details {
  text-align: left;
  margin: var(--spacing-lg) 0;
  padding: var(--spacing-md);
  background: #f8f9fa;
  border-radius: var(--border-radius);
  border: 1px solid #dee2e6;
}

.error-details summary {
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.error-stack {
  font-family: 'Courier New', monospace;
  font-size: var(--font-size-sm);
  color: var(--error-color);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  margin-top: var(--spacing-sm);
}

.error-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--spacing-lg);
}

.error-help {
  text-align: left;
  background: var(--primary-light);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--primary-color);
}

.error-help p {
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-sm);
  color: var(--text-color);
}

.error-help ul {
  margin: 0;
  padding-left: var(--spacing-lg);
  color: var(--text-secondary);
}

.error-help li {
  margin-bottom: var(--spacing-xs);
  line-height: var(--line-height);
}

/* Button styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  white-space: nowrap;
  min-width: 120px;
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
  border: 1px solid var(--text-secondary);
  color: var(--text-secondary);
}

.btn-outline:hover {
  background-color: var(--text-secondary);
  color: white;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .error-boundary {
    padding: var(--spacing-md);
    min-height: 50vh;
  }
  
  .error-boundary-card {
    padding: var(--spacing-lg);
  }
  
  .error-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn {
    width: 100%;
    min-width: auto;
  }
  
  .error-icon {
    font-size: 3rem;
  }
  
  .error-title {
    font-size: var(--font-size-lg);
  }
}
</style>