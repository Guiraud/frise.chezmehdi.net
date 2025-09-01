import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { validateEnvironment } from './config/environment'

// Validate environment before starting the app
try {
  validateEnvironment();
} catch (error) {
  console.error('❌ Application startup failed:', error.message);
  
  // Show user-friendly error in development
  if (import.meta.env.DEV) {
    document.body.innerHTML = `
      <div style="
        padding: 20px; 
        font-family: monospace; 
        background: #fee; 
        color: #c33; 
        border: 1px solid #fcc;
        margin: 20px;
        border-radius: 8px;
      ">
        <h2>⚠️ Configuration Error</h2>
        <p>The application cannot start due to configuration issues:</p>
        <pre>${error.message}</pre>
        <p>Please check your environment variables in <code>.env</code> files.</p>
      </div>
    `;
  }
  throw error;
}

createApp(App)
  .use(router)
  .mount('#app')