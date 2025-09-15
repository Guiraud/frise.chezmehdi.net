<template>
  <div class="timeline-comparison">
    <div class="comparison-header">
      <h2>🎨 Timeline Renderings Comparison</h2>
      <p>Compare different JavaScript approaches for rendering your {{ items.length }} events</p>
    </div>

    <div class="tabs-container">
      <div class="tabs-header" role="tablist" aria-label="Timeline rendering options">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          @keydown="handleKeyDown($event, tab.id)"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          :aria-selected="activeTab === tab.id"
          :tabindex="activeTab === tab.id ? 0 : -1"
          role="tab"
          :aria-controls="`panel-${tab.id}`"
          :title="tab.description"
        >
          {{ tab.icon }} {{ tab.name }}
        </button>
      </div>

      <div class="tab-content">
        <!-- D3 Timescale Timeline -->
        <div v-if="activeTab === 'd3'" class="tab-panel" role="tabpanel" :id="`panel-d3`" aria-labelledby="tab-d3">
          <div class="tab-info">
            <h3>📊 D3 Timescale Visualisation</h3>
            <p><strong>Advantages:</strong> Maximum customization, beautiful arrows, interactive, precise timescales</p>
            <p><strong>Use case:</strong> Custom designs, complex visualizations, scientific data presentation</p>
          </div>
          <D3Timeline :items="items" @select="handleItemSelect" />
        </div>

        <!-- Timesheet.js Timeline -->
        <div v-if="activeTab === 'timesheet'" class="tab-panel" role="tabpanel" :id="`panel-timesheet`" aria-labelledby="tab-timesheet">
          <div class="tab-info">
            <h3>📅 Timesheet.js Timeline</h3>
            <p><strong>Advantages:</strong> Simple, lightweight, clean design, easy integration</p>
            <p><strong>Use case:</strong> Basic timelines, project schedules, simple event tracking</p>
          </div>
          <TimesheetTimeline :items="items" @select="handleItemSelect" />
        </div>

        <!-- Vis Timeline -->
        <div v-if="activeTab === 'vistimeline'" class="tab-panel" role="tabpanel" :id="`panel-vistimeline`" aria-labelledby="tab-vistimeline">
          <div class="tab-info">
            <h3>📈 Vis Timeline</h3>
            <p><strong>Advantages:</strong> Interactive timeline with zoom, pan, clustering, highly configurable</p>
            <p><strong>Use case:</strong> Data analysis, event exploration, interactive dashboards</p>
          </div>
          <VisTimeline :items="items" @select="handleItemSelect" />
        </div>

        <!-- DHTMLX Gantt Timeline -->
        <div v-if="activeTab === 'dhtmlxgantt'" class="tab-panel" role="tabpanel" :id="`panel-dhtmlxgantt`" aria-labelledby="tab-dhtmlxgantt">
          <div class="tab-info">
            <h3>🗂️ DHTMLX Gantt Timeline</h3>
            <p><strong>Advantages:</strong> Professional Gantt charts, task dependencies, resource management</p>
            <p><strong>Use case:</strong> Project management, resource planning, professional timelines</p>
          </div>
          <DHtmlxGanttTimeline :items="items" @select="handleItemSelect" />
        </div>
      </div>
    </div>

    <!-- Comparison Summary -->
    <div class="comparison-summary">
      <h3>📊 Performance & Features Comparison</h3>
      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Library</th>
              <th>Bundle Size</th>
              <th>Customization</th>
              <th>Performance</th>
              <th>Learning Curve</th>
              <th>Best For</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>🎨 D3.js</td>
              <td class="size-small">204KB</td>
              <td class="rating-excellent">⭐⭐⭐⭐⭐</td>
              <td class="rating-excellent">⭐⭐⭐⭐⭐</td>
              <td class="rating-hard">⭐⭐</td>
              <td>Custom visualizations</td>
            </tr>
            <tr>
              <td>🎨 Pure CSS</td>
              <td class="size-minimal">~5KB</td>
              <td class="rating-good">⭐⭐⭐</td>
              <td class="rating-excellent">⭐⭐⭐⭐⭐</td>
              <td class="rating-easy">⭐⭐⭐⭐⭐</td>
              <td>Simple, fast loading</td>
            </tr>
            <tr>
              <td>📊 Chart.js</td>
              <td class="size-medium">~300KB</td>
              <td class="rating-good">⭐⭐⭐</td>
              <td class="rating-good">⭐⭐⭐⭐</td>
              <td class="rating-easy">⭐⭐⭐⭐</td>
              <td>Business dashboards</td>
            </tr>
            <tr>
              <td>📈 ApexCharts</td>
              <td class="size-medium">~350KB</td>
              <td class="rating-good">⭐⭐⭐⭐</td>
              <td class="rating-good">⭐⭐⭐⭐</td>
              <td class="rating-easy">⭐⭐⭐⭐</td>
              <td>Modern dashboards</td>
            </tr>
            <tr>
              <td>🕸️ Vis Network</td>
              <td class="size-large">~450KB</td>
              <td class="rating-good">⭐⭐⭐</td>
              <td class="rating-medium">⭐⭐⭐</td>
              <td class="rating-medium">⭐⭐⭐</td>
              <td>Network analysis</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Selected Item Display -->
    <div v-if="selectedItem" class="selected-item-display">
      <h3>🔍 Selected Event</h3>
      <div class="selected-item-content">
        <div class="item-title">{{ selectedItem.content }}</div>
        <div class="item-details">
          <span><strong>Date:</strong> {{ formatDate(selectedItem.start) }}</span>
          <span v-if="selectedItem.end && selectedItem.end !== selectedItem.start">
            → {{ formatDate(selectedItem.end) }}
          </span>
          <span><strong>Type:</strong> {{ selectedItem.originalType }}</span>
        </div>
        <div v-if="selectedItem.description" class="item-description">
          {{ selectedItem.description }}
        </div>
      </div>
    </div>

    <!-- Performance Monitor (Development) - Temporarily Disabled -->
    <!-- <PerformanceMonitor
      v-if="isDevelopment"
      :current-tab="activeTab"
      :item-count="items.length"
      ref="perfMonitor"
    /> -->
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

// Lazy load timeline components for better performance
const D3Timeline = defineAsyncComponent({
  loader: () => import('./D3Timeline.vue'),
  loadingComponent: { template: '<div class="timeline-loading">Loading D3 Timescale Timeline...</div>' },
  errorComponent: { template: '<div class="timeline-error">Failed to load D3 Timeline</div>' },
  delay: 200,
  timeout: 10000
})

const TimesheetTimeline = defineAsyncComponent({
  loader: () => import('./TimesheetTimeline.vue'),
  loadingComponent: { template: '<div class="timeline-loading">Loading Timesheet.js Timeline...</div>' },
  errorComponent: { template: '<div class="timeline-error">Failed to load Timesheet.js Timeline</div>' },
  delay: 200,
  timeout: 10000
})

const VisTimeline = defineAsyncComponent({
  loader: () => import('./VisTimeline.vue'),
  loadingComponent: { template: '<div class="timeline-loading">Loading Vis Timeline...</div>' },
  errorComponent: { template: '<div class="timeline-error">Failed to load Vis Timeline</div>' },
  delay: 200,
  timeout: 10000
})

const DHtmlxGanttTimeline = defineAsyncComponent({
  loader: () => import('./DHtmlxGanttTimeline.vue'),
  loadingComponent: { template: '<div class="timeline-loading">Loading DHTMLX Gantt Timeline...</div>' },
  errorComponent: { template: '<div class="timeline-error">Failed to load DHTMLX Gantt Timeline</div>' },
  delay: 200,
  timeout: 10000
})

export default {
  name: 'TimelineComparison',
  components: {
    D3Timeline,
    TimesheetTimeline,
    VisTimeline,
    DHtmlxGanttTimeline
  },
  props: {
    items: {
      type: Array,
      default: () => [],
      validator: (items) => {
        return items.every(item => 
          item && 
          typeof item === 'object' && 
          'id' in item && 
          'content' in item && 
          'start' in item
        )
      }
    }
  },
  data() {
    return {
      activeTab: 'd3',
      selectedItem: null,
      loadingStates: {},
      tabs: [
        {
          id: 'd3',
          name: 'D3 Timescale',
          icon: '📊',
          description: 'D3 timescale visualisation with custom arrows and interactions'
        },
        {
          id: 'timesheet',
          name: 'Timesheet.js',
          icon: '📅',
          description: 'Simple and lightweight timeline library'
        },
        {
          id: 'vistimeline',
          name: 'Vis Timeline',
          icon: '📈',
          description: 'Interactive timeline with zoom and pan capabilities'
        },
        {
          id: 'dhtmlxgantt',
          name: 'DHTMLX Gantt',
          icon: '🗂️',
          description: 'Professional Gantt chart and timeline visualization'
        }
      ]
    }
  },
  computed: {
    isDevelopment() {
      return import.meta.env.DEV
    }
  },
  methods: {
    handleItemSelect(item) {
      console.log('📌 Item selected in', this.activeTab, ':', item)
      this.selectedItem = item
      this.$emit('select', item)
    },

    handleKeyDown(event, tabId) {
      const tabs = this.tabs.map(t => t.id)
      const currentIndex = tabs.indexOf(tabId)
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
          this.activeTab = tabs[prevIndex]
          this.$nextTick(() => {
            document.querySelector(`[aria-controls="panel-${this.activeTab}"]`)?.focus()
          })
          break
        case 'ArrowRight':
          event.preventDefault()
          const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
          this.activeTab = tabs[nextIndex]
          this.$nextTick(() => {
            document.querySelector(`[aria-controls="panel-${this.activeTab}"]`)?.focus()
          })
          break
        case 'Home':
          event.preventDefault()
          this.activeTab = tabs[0]
          this.$nextTick(() => {
            document.querySelector(`[aria-controls="panel-${this.activeTab}"]`)?.focus()
          })
          break
        case 'End':
          event.preventDefault()
          this.activeTab = tabs[tabs.length - 1]
          this.$nextTick(() => {
            document.querySelector(`[aria-controls="panel-${this.activeTab}"]`)?.focus()
          })
          break
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.timeline-comparison {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 2rem 0;
}

.comparison-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.comparison-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
}

.comparison-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.tabs-container {
  background: white;
}

.tabs-header {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  overflow-x: auto;
  scrollbar-width: thin;
}

.tab-btn {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #666;
  white-space: nowrap;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.tab-btn.active {
  background: white;
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}

.tab-content {
  min-height: 600px;
}

.tab-panel {
  padding: 0;
}

.tab-info {
  background: #f8f9fa;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.tab-info h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.tab-info p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

.comparison-summary {
  background: #f8f9fa;
  padding: 2rem;
  border-top: 1px solid #e9ecef;
}

.comparison-summary h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  text-align: center;
}

.comparison-table {
  overflow-x: auto;
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comparison-table th,
.comparison-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.9rem;
}

.comparison-table th {
  background: #667eea;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.8rem;
}

.comparison-table tbody tr:hover {
  background: rgba(102, 126, 234, 0.05);
}

.comparison-table tbody tr:last-child td {
  border-bottom: none;
}

/* Size indicators */
.size-minimal { color: #27ae60; font-weight: 600; }
.size-small { color: #f39c12; font-weight: 600; }
.size-medium { color: #e67e22; font-weight: 600; }
.size-large { color: #e74c3c; font-weight: 600; }

/* Rating styles */
.rating-excellent { color: #27ae60; }
.rating-good { color: #f39c12; }
.rating-medium { color: #e67e22; }
.rating-hard { color: #e74c3c; }
.rating-easy { color: #27ae60; }

.selected-item-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  margin-top: 2rem;
}

.selected-item-display h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.item-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.item-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
  font-size: 0.95rem;
}

.item-description {
  opacity: 0.9;
  font-style: italic;
  font-size: 0.95rem;
}

/* Timeline Loading States */
.timeline-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--text-secondary, #666);
  font-style: italic;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.timeline-loading::before {
  content: "";
  width: 20px;
  height: 20px;
  margin-right: 1rem;
  border: 2px solid #e9ecef;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.timeline-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #e74c3c;
  font-weight: 500;
  background: #fdeaea;
  border: 1px solid #e74c3c;
  border-radius: 8px;
  margin: 1rem 0;
}

.timeline-error::before {
  content: "⚠️";
  margin-right: 0.5rem;
  font-size: 1.2em;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Focus management for accessibility */
.tab-btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .comparison-header {
    padding: 1.5rem 1rem;
  }

  .comparison-header h2 {
    font-size: 1.5rem;
  }

  .tabs-header {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: 1;
    min-width: 0;
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }

  .tab-info {
    padding: 1rem;
  }

  .comparison-summary {
    padding: 1.5rem 1rem;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }

  .item-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>