<template>
  <div class="timesheet-timeline-container">
    <div class="timeline-header" v-if="items.length > 0">
      <h3>Timesheet.js Timeline</h3>
      <div class="timeline-stats">
        {{ items.length }} événement{{ items.length > 1 ? 's' : '' }}
      </div>
    </div>
    
    <div class="timesheet-timeline">
      <div class="chart-info">
        <p><strong>Timesheet Style:</strong> Affichage en bandes horizontales pour visualiser les périodes et événements.</p>
      </div>
      
      <div ref="timesheetContainer" id="timesheet-container"></div>
    </div>

    <!-- Selected Item Display -->
    <div v-if="selectedItem" class="selected-item-display">
      <div class="detail-header">
        <h4>{{ selectedItem.content }}</h4>
        <button @click="selectedItem = null" class="close-btn">×</button>
      </div>
      <div class="detail-content">
        <div class="detail-date">
          <strong>Date:</strong> {{ formatDetailDate(selectedItem.start) }}
          <span v-if="selectedItem.end && selectedItem.end !== selectedItem.start">
            → {{ formatDetailDate(selectedItem.end) }}
          </span>
        </div>
        <div v-if="selectedItem.description" class="detail-description">
          <strong>Description:</strong> {{ selectedItem.description }}
        </div>
        <div class="detail-type">
          <strong>Type:</strong> 
          <span :class="'type-badge ' + selectedItem.className">
            {{ formatEventType(selectedItem.originalType) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimesheetTimeline',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedItem: null,
      timesheet: null,
      scriptLoaded: false
    }
  },
  watch: {
    items: {
      handler() {
        this.renderTimesheet()
      },
      deep: true
    }
  },
  async mounted() {
    await this.loadTimesheetLibrary()
    this.renderTimesheet()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    async loadTimesheetLibrary() {
      try {
        // Load CSS first
        if (!document.querySelector('link[href*="timesheet.min.css"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = '/libs/timesheet.min.css'
          document.head.appendChild(link)
        }

        // Load JavaScript
        if (!window.Timesheet && !document.querySelector('script[src*="timesheet.min.js"]')) {
          const script = document.createElement('script')
          script.src = '/libs/timesheet.min.js'
          script.onload = () => {
            this.scriptLoaded = true
            this.renderTimesheet()
          }
          script.onerror = () => {
            console.error('❌ Failed to load Timesheet.js library')
            this.renderFallback()
          }
          document.head.appendChild(script)
        } else if (window.Timesheet) {
          this.scriptLoaded = true
        }

        console.log('📅 Timesheet.js library loading...')
      } catch (error) {
        console.warn('⚠️ Timesheet.js not available:', error)
        this.renderFallback()
      }
    },

    renderTimesheet() {
      if (!this.items || this.items.length === 0) {
        console.log('📅 No items to render Timesheet timeline')
        return
      }

      if (!window.Timesheet || !this.scriptLoaded) {
        console.log('📅 Timesheet.js not loaded yet, waiting...')
        return
      }

      console.log('📅 Rendering Timesheet timeline with', this.items.length, 'items')

      try {
        // Clear previous timesheet
        if (this.$refs.timesheetContainer) {
          this.$refs.timesheetContainer.innerHTML = '<div id="timesheet-inner"></div>'
        }

        const timesheetData = this.prepareTimesheetData()
        
        // Find date range
        const allDates = this.items.flatMap(item => [new Date(item.start), item.end ? new Date(item.end) : null]).filter(Boolean)
        const minDate = new Date(Math.min(...allDates))
        const maxDate = new Date(Math.max(...allDates))
        
        const minYear = minDate.getFullYear()
        const maxYear = maxDate.getFullYear()

        // Initialize Timesheet
        this.timesheet = new window.Timesheet('timesheet-inner', minYear, maxYear, timesheetData)

        // Add click handlers
        this.addClickHandlers()

        console.log('✅ Timesheet timeline rendered successfully')

      } catch (error) {
        console.error('❌ Timesheet rendering error:', error)
        this.renderFallback()
      }
    },

    prepareTimesheetData() {
      const colorMap = {
        'event-context': 'blue',
        'event-trigger': 'red', 
        'period-context': 'green',
        'period-activity': 'purple'
      }

      return this.items.map(item => {
        const startDate = new Date(item.start)
        const endDate = item.end && item.end !== item.start ? new Date(item.end) : null
        
        // For point events, create a short duration (1 month)
        const finalEndDate = endDate || new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000))
        
        return [
          startDate.getFullYear(),
          finalEndDate.getFullYear(),
          item.content,
          colorMap[item.className] || 'gray'
        ]
      })
    },

    addClickHandlers() {
      // Add click event listeners to timesheet sections
      setTimeout(() => {
        const sections = this.$refs.timesheetContainer.querySelectorAll('.section')
        sections.forEach((section, index) => {
          section.style.cursor = 'pointer'
          section.addEventListener('click', () => {
            if (this.items[index]) {
              this.selectItem(this.items[index])
            }
          })
        })
      }, 100)
    },

    renderFallback() {
      if (this.$refs.timesheetContainer) {
        this.$refs.timesheetContainer.innerHTML = `
          <div class="timesheet-fallback">
            <h4>📅 Timesheet.js Timeline</h4>
            <p>Cette visualisation nécessite la bibliothèque Timesheet.js.</p>
            <p><strong>Note:</strong> La bibliothèque est en cours de chargement depuis GitHub.</p>
            <div class="fallback-timeline">
              ${this.items.map((item, index) => `
                <div class="fallback-item ${item.className}" data-item-index="${index}">
                  <div class="fallback-marker"></div>
                  <div class="fallback-content">
                    <div class="fallback-title">${item.content}</div>
                    <div class="fallback-date">${this.formatDate(item.start)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `

        // Add click handlers to fallback items
        this.$refs.timesheetContainer.querySelectorAll('.fallback-item').forEach((element) => {
          element.addEventListener('click', () => {
            const index = parseInt(element.dataset.itemIndex)
            this.selectItem(this.items[index])
          })
        })
      }
    },

    selectItem(item) {
      console.log('📅 Timesheet timeline item selected:', item)
      this.selectedItem = item
      this.$emit('select', item)
    },

    handleResize() {
      // Timesheet.js handles resizing automatically
      if (this.timesheet) {
        this.renderTimesheet()
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    formatDetailDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    formatEventType(type) {
      const typeNames = {
        'événement_contextuel': 'Événement contextuel',
        'événement_déclencheur': 'Événement déclencheur', 
        'période_contextuelle': 'Période contextuelle',
        'période_activité': 'Période d\'activité'
      }
      return typeNames[type] || type
    }
  }
}
</script>

<style scoped>
.timesheet-timeline-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 2rem 0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #1abc9c, #16a085);
  color: white;
}

.timeline-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.timeline-stats {
  font-size: 0.9rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.timesheet-timeline {
  padding: 2rem;
}

.chart-info {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #0c5460;
  font-size: 0.9rem;
}

#timesheet-container {
  min-height: 300px;
  width: 100%;
  overflow-x: auto;
}

.timesheet-fallback {
  padding: 2rem;
  text-align: center;
  background: #fff3cd;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.timesheet-fallback h4 {
  margin: 0 0 1rem 0;
  color: #856404;
}

.timesheet-fallback p {
  margin: 0.5rem 0;
  color: #856404;
}

.fallback-timeline {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.fallback-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.fallback-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.fallback-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 1rem;
  flex-shrink: 0;
}

.fallback-item.event-context .fallback-marker {
  background: #3498db;
}

.fallback-item.event-trigger .fallback-marker {
  background: #e74c3c;
}

.fallback-item.period-context .fallback-marker {
  background: #2ecc71;
}

.fallback-item.period-activity .fallback-marker {
  background: #9b59b6;
}

.fallback-content {
  text-align: left;
  flex: 1;
}

.fallback-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.fallback-date {
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.selected-item-display {
  background: linear-gradient(135deg, #1abc9c, #16a085);
  color: white;
  padding: 1.5rem 2rem;
  margin-top: 2rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.detail-header h4 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.detail-content {
  display: grid;
  gap: 1rem;
}

.detail-date,
.detail-description,
.detail-type {
  font-size: 0.95rem;
  line-height: 1.6;
}

.type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-badge.event-context {
  background: rgba(52, 152, 219, 0.2);
  color: #2980b9;
}

.type-badge.event-trigger {
  background: rgba(231, 76, 60, 0.2);
  color: #c0392b;
}

.type-badge.period-context {
  background: rgba(46, 204, 113, 0.2);
  color: #27ae60;
}

.type-badge.period-activity {
  background: rgba(155, 89, 182, 0.2);
  color: #8e44ad;
}

/* Timesheet.js styling overrides */
:deep(.timesheet) {
  font-family: inherit !important;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

:deep(.timesheet .scale) {
  background: #f8f9fa !important;
  border-bottom: 2px solid #dee2e6 !important;
}

:deep(.timesheet .section) {
  transition: all 0.3s ease;
  border-radius: 4px !important;
  margin: 2px !important;
}

:deep(.timesheet .section:hover) {
  opacity: 0.8;
  transform: scale(1.02);
}

/* Responsive */
@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .timesheet-timeline {
    padding: 1rem;
  }
  
  #timesheet-container {
    min-height: 250px;
  }
  
  .timesheet-fallback {
    padding: 1rem;
  }
  
  .selected-item-display {
    padding: 1rem;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .close-btn {
    align-self: flex-end;
  }
}
</style>