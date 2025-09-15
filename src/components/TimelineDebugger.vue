<template>
  <div v-if="isDebugMode" class="timeline-debugger">
    <div class="debug-header">
      <h3>📊 Timeline Data Debugger</h3>
      <button @click="toggleExpanded" class="toggle-btn">
        {{ expanded ? '▼' : '▶' }}
      </button>
    </div>
    
    <div v-if="expanded" class="debug-content">
      <!-- Data Summary -->
      <div class="debug-section">
        <h4>Data Summary</h4>
        <div class="summary-stats">
          <div class="stat">
            <label>Items Count:</label>
            <span :class="{ 'error': items.length === 0 }">{{ items.length }}</span>
          </div>
          <div class="stat">
            <label>Loading:</label>
            <span :class="{ 'active': loading }">{{ loading ? 'Yes' : 'No' }}</span>
          </div>
          <div class="stat">
            <label>Error:</label>
            <span :class="{ 'error': !!error }">{{ error || 'None' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Raw Data Preview -->
      <div class="debug-section" v-if="items.length > 0">
        <h4>Raw Timeline Items</h4>
        <div class="data-preview">
          <div v-for="(item, index) in items" :key="item.id || index" class="item-preview">
            <div class="item-header">
              <strong>Item {{ index + 1 }}: {{ item.content || item.titre || 'No Title' }}</strong>
              <span class="item-id">ID: {{ item.id }}</span>
            </div>
            <div class="item-details">
              <div class="detail">
                <label>Start:</label>
                <span :class="{ 'valid': isValidDate(item.start), 'invalid': !isValidDate(item.start) }">
                  {{ item.start || 'Missing' }}
                </span>
              </div>
              <div class="detail">
                <label>End:</label>
                <span>{{ item.end || 'None' }}</span>
              </div>
              <div class="detail">
                <label>Type:</label>
                <span>{{ item.type || 'Missing' }}</span>
              </div>
              <div class="detail">
                <label>Class:</label>
                <span>{{ item.className || 'None' }}</span>
              </div>
              <div class="detail">
                <label>Content:</label>
                <span>{{ item.content || 'Missing' }}</span>
              </div>
            </div>
            <div class="item-validation">
              <span v-if="validateItem(item).isValid" class="valid">✅ Valid</span>
              <span v-else class="invalid">
                ❌ Invalid: {{ validateItem(item).errors.join(', ') }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Data Source Info -->
      <div class="debug-section">
        <h4>Data Source</h4>
        <div class="source-info">
          <div class="detail">
            <label>URL:</label>
            <span>{{ spreadsheetUrl || 'Not set' }}</span>
          </div>
          <div class="detail">
            <label>Last Load:</label>
            <span>{{ lastLoadTime || 'Never' }}</span>
          </div>
          <div class="detail">
            <label>Search Query:</label>
            <span>{{ searchQuery || 'None' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="debug-actions">
        <button @click="reloadData" class="action-btn" :disabled="!spreadsheetUrl">
          🔄 Reload Data
        </button>
        <button @click="validateAllData" class="action-btn">
          ✅ Validate All
        </button>
        <button @click="exportDebugData" class="action-btn">
          💾 Export Debug Data
        </button>
        <button @click="testTimelineRender" class="action-btn">
          🧪 Test Timeline Render
        </button>
      </div>
      
      <!-- Validation Results -->
      <div v-if="validationResults.length > 0" class="debug-section">
        <h4>Validation Results</h4>
        <div class="validation-results">
          <div v-for="result in validationResults" :key="result.id" class="validation-item">
            <span :class="result.type">{{ result.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { isDebugEnabled } from '../config/environment'

export default {
  name: 'TimelineDebugger',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    spreadsheetUrl: {
      type: String,
      default: ''
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['reload-data', 'test-render'],
  setup(props, { emit }) {
    const expanded = ref(false)
    const validationResults = ref([])
    const lastLoadTime = ref(null)
    
    const isDebugMode = computed(() => isDebugEnabled())
    
    // Watch for data changes to update load time
    watch(() => props.items, (newItems) => {
      if (newItems && newItems.length > 0) {
        lastLoadTime.value = new Date().toLocaleTimeString()
        validateAllData()
      }
    })
    
    const toggleExpanded = () => {
      expanded.value = !expanded.value
    }
    
    const isValidDate = (dateString) => {
      if (!dateString) return false
      const date = new Date(dateString)
      return !isNaN(date.getTime())
    }
    
    const validateItem = (item) => {
      const errors = []
      
      if (!item.id) errors.push('Missing ID')
      if (!item.start) errors.push('Missing start date')
      if (!isValidDate(item.start)) errors.push('Invalid start date')
      if (!item.content && !item.titre) errors.push('Missing content/title')
      if (!item.type) errors.push('Missing type')
      
      return {
        isValid: errors.length === 0,
        errors
      }
    }
    
    const reloadData = () => {
      emit('reload-data')
      addValidationResult('Data reload requested', 'info')
    }
    
    const validateAllData = () => {
      validationResults.value = []
      
      if (props.items.length === 0) {
        addValidationResult('No items to validate', 'warning')
        return
      }
      
      let validCount = 0
      let invalidCount = 0
      
      props.items.forEach((item, index) => {
        const validation = validateItem(item)
        if (validation.isValid) {
          validCount++
        } else {
          invalidCount++
          addValidationResult(`Item ${index + 1}: ${validation.errors.join(', ')}`, 'error')
        }
      })
      
      addValidationResult(`Validation complete: ${validCount} valid, ${invalidCount} invalid`, 'success')
    }
    
    const exportDebugData = () => {
      const debugData = {
        timestamp: new Date().toISOString(),
        itemsCount: props.items.length,
        loading: props.loading,
        error: props.error,
        spreadsheetUrl: props.spreadsheetUrl,
        searchQuery: props.searchQuery,
        items: props.items,
        validationResults: validationResults.value
      }
      
      const dataStr = JSON.stringify(debugData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `timeline-debug-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      addValidationResult('Debug data exported', 'success')
    }
    
    const testTimelineRender = () => {
      emit('test-render')
      addValidationResult('Timeline render test triggered', 'info')
    }
    
    const addValidationResult = (message, type = 'info') => {
      validationResults.value.unshift({
        id: Date.now(),
        message,
        type,
        timestamp: new Date().toLocaleTimeString()
      })
      
      // Keep only last 20 results
      if (validationResults.value.length > 20) {
        validationResults.value = validationResults.value.slice(0, 20)
      }
    }
    
    return {
      expanded,
      validationResults,
      lastLoadTime,
      isDebugMode,
      toggleExpanded,
      isValidDate,
      validateItem,
      reloadData,
      validateAllData,
      exportDebugData,
      testTimelineRender
    }
  }
}
</script>

<style scoped>
.timeline-debugger {
  position: fixed;
  top: 80px;
  left: 20px;
  max-width: 400px;
  background: white;
  border: 2px solid #42b983;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #42b983;
  color: white;
  border-radius: 6px 6px 0 0;
}

.debug-header h3 {
  margin: 0;
  font-size: 14px;
}

.toggle-btn {
  background: transparent;
  border: 1px solid white;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.debug-content {
  max-height: 500px;
  overflow-y: auto;
  padding: 12px;
}

.debug-section {
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}

.debug-section h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-stats {
  display: grid;
  gap: 4px;
}

.stat {
  display: flex;
  justify-content: space-between;
}

.stat label {
  font-weight: bold;
  color: #666;
}

.stat .error {
  color: #e74c3c;
  font-weight: bold;
}

.stat .active {
  color: #f39c12;
  font-weight: bold;
}

.data-preview {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
}

.item-preview {
  margin-bottom: 12px;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #f9f9f9;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.item-id {
  color: #666;
  font-size: 10px;
}

.item-details {
  display: grid;
  gap: 2px;
  margin-bottom: 4px;
}

.detail {
  display: flex;
  gap: 8px;
}

.detail label {
  min-width: 50px;
  font-weight: bold;
  color: #666;
}

.valid {
  color: #27ae60;
  font-weight: bold;
}

.invalid {
  color: #e74c3c;
  font-weight: bold;
}

.source-info {
  display: grid;
  gap: 4px;
}

.debug-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  transition: background 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: #2980b9;
}

.action-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.validation-results {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
}

.validation-item {
  padding: 2px 0;
  border-bottom: 1px solid #f0f0f0;
}

.validation-item:last-child {
  border-bottom: none;
}

.validation-item .success {
  color: #27ae60;
}

.validation-item .error {
  color: #e74c3c;
}

.validation-item .warning {
  color: #f39c12;
}

.validation-item .info {
  color: #3498db;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .timeline-debugger {
    left: 10px;
    right: 10px;
    max-width: none;
  }
  
  .debug-actions {
    grid-template-columns: 1fr;
  }
}
</style>