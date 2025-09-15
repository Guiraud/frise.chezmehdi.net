<template>
  <div v-if="showMonitor" class="performance-monitor">
    <div class="monitor-header">
      <h4>📊 Performance Monitor</h4>
      <button @click="showMonitor = false" class="close-btn">×</button>
    </div>
    <div class="monitor-content">
      <div class="metric">
        <span class="metric-label">Current Tab:</span>
        <span class="metric-value">{{ currentTab }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Render Time:</span>
        <span class="metric-value">{{ renderTime }}ms</span>
      </div>
      <div class="metric">
        <span class="metric-label">Items:</span>
        <span class="metric-value">{{ itemCount }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Memory Usage:</span>
        <span class="metric-value">{{ memoryUsage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PerformanceMonitor',
  props: {
    currentTab: String,
    itemCount: Number
  },
  data() {
    return {
      showMonitor: false,
      renderTime: 0,
      memoryUsage: 'N/A',
      startTime: 0
    }
  },
  watch: {
    currentTab: {
      handler() {
        this.startTime = performance.now()
        this.measurePerformance()
      },
      immediate: true
    }
  },
  methods: {
    measurePerformance() {
      this.$nextTick(() => {
        this.renderTime = Math.round(performance.now() - this.startTime)
        
        // Measure memory usage if available
        if (performance.memory) {
          const used = performance.memory.usedJSHeapSize / 1024 / 1024
          this.memoryUsage = `${used.toFixed(1)} MB`
        }
      })
    },
    
    toggle() {
      this.showMonitor = !this.showMonitor
    }
  },
  mounted() {
    // Add keyboard shortcut to toggle monitor
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        this.toggle()
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    
    this.$once('hook:beforeDestroy', () => {
      document.removeEventListener('keydown', handleKeyPress)
    })
  }
}
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  padding: 1rem;
  min-width: 200px;
  z-index: 9999;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.8rem;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
}

.monitor-header h4 {
  margin: 0;
  font-size: 0.9rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.metric {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.metric-label {
  color: #aaa;
}

.metric-value {
  font-weight: bold;
  color: #4CAF50;
}
</style>