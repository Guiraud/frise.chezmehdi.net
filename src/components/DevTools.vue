<template>
  <div v-if="isDebugMode" class="dev-tools">
    <button @click="togglePanel" class="dev-tools-toggle">
      🛠️ Dev Tools
    </button>
    
    <div v-if="showPanel" class="dev-tools-panel">
      <h3>🧪 Error Boundary Testing</h3>
      
      <div class="test-section">
        <h4>Simulate Errors</h4>
        <div class="button-grid">
          <button 
            v-for="(type, key) in errorTypes" 
            :key="key"
            @click="simulateError(type)"
            class="test-btn error-btn"
          >
            {{ formatErrorType(key) }}
          </button>
        </div>
      </div>
      
      <div class="test-section">
        <h4>Timeout Testing</h4>
        <div class="timeout-controls">
          <button @click="testTimeout(2000)" class="test-btn">2s Delay</button>
          <button @click="testTimeout(5000)" class="test-btn">5s Delay</button>
          <button @click="testTimeout(10000)" class="test-btn">10s Delay</button>
        </div>
      </div>
      
      <div class="test-section">
        <h4>Performance Testing</h4>
        <div class="perf-controls">
          <button @click="testLargeData" class="test-btn">Large Dataset</button>
          <button @click="testMemoryUsage" class="test-btn">Memory Usage</button>
          <button @click="measureRenderTime" class="test-btn">Render Time</button>
        </div>
      </div>
      
      <div class="test-results" v-if="testResults.length > 0">
        <h4>📊 Test Results</h4>
        <div v-for="result in testResults" :key="result.id" class="result-item">
          <span :class="['result-status', result.success ? 'success' : 'error']">
            {{ result.success ? '✅' : '❌' }}
          </span>
          <span class="result-text">{{ result.message }}</span>
          <span class="result-time">{{ result.timestamp }}</span>
        </div>
        <button @click="clearResults" class="clear-btn">Clear Results</button>
      </div>
      
      <div class="environment-info">
        <h4>🔧 Environment Info</h4>
        <div class="info-grid">
          <div>Environment: {{ environment }}</div>
          <div>Timeout: {{ apiTimeout }}ms</div>
          <div>Debug Mode: {{ isDebugMode ? 'ON' : 'OFF' }}</div>
          <div>User Agent: {{ userAgent }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { simulateError, ERROR_TYPES, runErrorBoundaryTests } from '../utils/errorSimulator';
import { isDebugEnabled, getConfigValue } from '../config/environment';

export default {
  name: 'DevTools',
  emits: ['error-simulated', 'test-completed'],
  setup(props, { emit }) {
    const showPanel = ref(false);
    const testResults = ref([]);
    const nextResultId = ref(1);
    
    // Computed properties
    const isDebugMode = computed(() => isDebugEnabled());
    const environment = computed(() => getConfigValue.string('VITE_APP_ENV'));
    const apiTimeout = computed(() => getConfigValue.number('VITE_API_TIMEOUT'));
    const userAgent = computed(() => navigator.userAgent.split(' ')[0]);
    
    // Error types for testing
    const errorTypes = ERROR_TYPES;
    
    // Methods
    const togglePanel = () => {
      showPanel.value = !showPanel.value;
    };
    
    const addTestResult = (message, success = true) => {
      testResults.value.unshift({
        id: nextResultId.value++,
        message,
        success,
        timestamp: new Date().toLocaleTimeString()
      });
      
      // Keep only last 10 results
      if (testResults.value.length > 10) {
        testResults.value = testResults.value.slice(0, 10);
      }
    };
    
    const clearResults = () => {
      testResults.value = [];
    };
    
    const formatErrorType = (key) => {
      return key.replace(/_ERROR$/, '').replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
    };
    
    // Error simulation
    const simulateErrorWrapper = async (errorType) => {
      try {
        console.log(`🧪 Simulating ${errorType} error...`);
        
        if (simulateError[errorType]) {
          await simulateError[errorType]();
        } else {
          throw new Error(`Unknown error type: ${errorType}`);
        }
        
        addTestResult(`Error ${errorType} simulated but not caught`, false);
      } catch (error) {
        addTestResult(`${formatErrorType(errorType)} error caught: ${error.message}`, true);
        emit('error-simulated', { type: errorType, error });
        
        // Re-throw to trigger error boundary
        throw error;
      }
    };
    
    // Timeout testing
    const testTimeout = async (delay) => {
      const start = performance.now();
      
      try {
        addTestResult(`Starting ${delay}ms timeout test...`);
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Timeout after ${delay}ms`)), delay);
        });
        
        await timeoutPromise;
      } catch (error) {
        const elapsed = Math.round(performance.now() - start);
        addTestResult(`Timeout test completed: ${elapsed}ms (expected: ${delay}ms)`, 
                     Math.abs(elapsed - delay) < 100);
      }
    };
    
    // Performance testing
    const testLargeData = () => {
      const start = performance.now();
      
      // Generate large dataset
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        title: `Event ${i}`,
        start: new Date(2020 + Math.random() * 4, Math.random() * 12, Math.random() * 28).toISOString(),
        type: 'test_event'
      }));
      
      const elapsed = Math.round(performance.now() - start);
      addTestResult(`Generated ${largeData.length} items in ${elapsed}ms`, elapsed < 1000);
      
      emit('test-completed', { type: 'large-data', data: largeData, time: elapsed });
    };
    
    const testMemoryUsage = () => {
      if (performance.memory) {
        const memory = performance.memory;
        const used = Math.round(memory.usedJSHeapSize / 1048576); // MB
        const total = Math.round(memory.totalJSHeapSize / 1048576); // MB
        const limit = Math.round(memory.jsHeapSizeLimit / 1048576); // MB
        
        addTestResult(`Memory: ${used}MB used, ${total}MB total, ${limit}MB limit`, used < limit * 0.8);
      } else {
        addTestResult('Memory API not available in this browser', false);
      }
    };
    
    const measureRenderTime = () => {
      const start = performance.now();
      
      // Force a render cycle
      requestAnimationFrame(() => {
        const elapsed = Math.round(performance.now() - start);
        addTestResult(`Render cycle: ${elapsed}ms`, elapsed < 16); // 60fps = 16.67ms
      });
    };
    
    // Run comprehensive test suite
    const runAllTests = () => {
      addTestResult('Starting comprehensive test suite...');
      
      try {
        const results = runErrorBoundaryTests();
        const passed = results.filter(r => r.status === 'PASSED').length;
        addTestResult(`Test suite completed: ${passed}/${results.length} passed`, 
                     passed === results.length);
      } catch (error) {
        addTestResult(`Test suite failed: ${error.message}`, false);
      }
    };
    
    // Initialize development tools
    onMounted(() => {
      if (isDebugMode.value) {
        console.log('🛠️  Development tools initialized');
        console.log('Available methods:');
        console.log('  - simulateError(type)');
        console.log('  - testTimeout(ms)');
        console.log('  - runAllTests()');
        
        // Make methods available globally for console access
        window.devTools = {
          simulateError: simulateErrorWrapper,
          testTimeout,
          runAllTests,
          testLargeData,
          measureRenderTime
        };
      }
    });
    
    return {
      // State
      showPanel,
      testResults,
      errorTypes,
      
      // Computed
      isDebugMode,
      environment,
      apiTimeout,
      userAgent,
      
      // Methods
      togglePanel,
      simulateError: simulateErrorWrapper,
      testTimeout,
      testLargeData,
      testMemoryUsage,
      measureRenderTime,
      runAllTests,
      clearResults,
      formatErrorType
    };
  }
};
</script>

<style scoped>
.dev-tools {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: monospace;
}

.dev-tools-toggle {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
}

.dev-tools-toggle:hover {
  background: #34495e;
  transform: translateY(-1px);
}

.dev-tools-panel {
  position: absolute;
  bottom: 40px;
  right: 0;
  width: 350px;
  max-height: 500px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  overflow-y: auto;
  padding: 16px;
}

.dev-tools-panel h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 14px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.dev-tools-panel h4 {
  margin: 16px 0 8px 0;
  color: #666;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.test-section {
  margin-bottom: 16px;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.timeout-controls,
.perf-controls {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.test-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.test-btn:hover {
  background: #2980b9;
}

.error-btn {
  background: #e74c3c;
}

.error-btn:hover {
  background: #c0392b;
}

.test-results {
  margin-top: 16px;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
  font-size: 10px;
  gap: 6px;
}

.result-status.success {
  color: #27ae60;
}

.result-status.error {
  color: #e74c3c;
}

.result-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-time {
  color: #999;
  font-size: 9px;
}

.clear-btn {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  margin-top: 8px;
}

.environment-info {
  margin-top: 16px;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  font-size: 9px;
  color: #666;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .dev-tools-panel {
    width: 280px;
    right: -50px;
  }
  
  .button-grid {
    grid-template-columns: 1fr;
  }
}</style>