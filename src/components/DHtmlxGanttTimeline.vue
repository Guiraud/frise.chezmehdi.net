<template>
  <div class="dhtmlx-gantt-timeline-container">
    <div class="timeline-header" v-if="items.length > 0">
      <h3>DHTMLX Gantt</h3>
      <div class="timeline-stats">
        {{ items.length }} événement{{ items.length > 1 ? 's' : '' }}
      </div>
    </div>
    
    <div class="dhtmlx-gantt-timeline">
      <div class="chart-info">
        <p><strong>DHTMLX Gantt:</strong> Diagramme de Gantt professionnel avec gestion des projets et dépendances.</p>
      </div>
      
      <div ref="ganttContainer" id="gantt-container"></div>
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
  name: 'DHtmlxGanttTimeline',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedItem: null,
      gantt: null,
      ganttLoaded: false
    }
  },
  watch: {
    items: {
      handler() {
        this.renderGantt()
      },
      deep: true
    }
  },
  async mounted() {
    await this.loadGanttLibrary()
    this.renderGantt()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    if (this.gantt) {
      this.gantt.destructor()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    async loadGanttLibrary() {
      try {
        // Import DHTMLX Gantt
        const ganttModule = await import('dhtmlx-gantt')
        this.gantt = ganttModule.gantt
        this.ganttLoaded = true
        
        console.log('🗂️ DHTMLX Gantt loaded successfully')
      } catch (error) {
        console.warn('⚠️ DHTMLX Gantt not available:', error)
        this.gantt = null
        this.ganttLoaded = false
      }
    },

    renderGantt() {
      if (!this.items || this.items.length === 0) {
        console.log('🗂️ No items to render DHTMLX Gantt timeline')
        return
      }

      if (!this.gantt || !this.ganttLoaded) {
        this.renderFallback()
        return
      }

      console.log('🗂️ Rendering DHTMLX Gantt timeline with', this.items.length, 'items')

      try {
        // Configure Gantt
        this.configureGantt()
        
        // Initialize Gantt
        this.gantt.init(this.$refs.ganttContainer)
        
        // Prepare and load data
        const ganttData = this.prepareGanttData()
        this.gantt.parse({
          data: ganttData,
          links: []
        })

        // Event handlers
        this.gantt.attachEvent('onTaskClick', (id, e) => {
          const task = this.gantt.getTask(id)
          if (task && task.originalItem) {
            this.selectItem(task.originalItem)
          }
          return true
        })

        console.log('✅ DHTMLX Gantt timeline rendered successfully')

      } catch (error) {
        console.error('❌ DHTMLX Gantt rendering error:', error)
        this.renderFallback()
      }
    },

    configureGantt() {
      // Configure layout and appearance
      this.gantt.config.date_format = '%Y-%m-%d'
      this.gantt.config.xml_date = '%Y-%m-%d'
      this.gantt.config.scale_unit = 'year'
      this.gantt.config.date_scale = '%Y'
      this.gantt.config.scale_height = 50
      this.gantt.config.row_height = 40
      this.gantt.config.task_height = 30
      this.gantt.config.fit_tasks = true
      this.gantt.config.readonly = true

      // French locale
      this.gantt.locale = {
        date: {
          month_full: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
          month_short: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"],
          day_full: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
          day_short: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
        }
      }

      // Color configuration
      this.gantt.templates.task_class = (start, end, task) => {
        return task.className || 'default'
      }

      // Task text template
      this.gantt.templates.task_text = (start, end, task) => {
        return task.text
      }

      // Progress template (disable)
      this.gantt.templates.progress_text = () => ''
      
      // Timeline template
      this.gantt.templates.timeline_cell_class = (task, date) => {
        return ''
      }

      // Tooltip template
      this.gantt.templates.tooltip_text = (start, end, task) => {
        const startDate = this.gantt.templates.tooltip_date_format(start)
        const endDate = end ? this.gantt.templates.tooltip_date_format(end) : ''
        return `<b>${task.text}</b><br/>
                Début: ${startDate}<br/>
                ${endDate ? `Fin: ${endDate}<br/>` : ''}
                ${task.description ? `Description: ${task.description}` : ''}`
      }

      this.gantt.templates.tooltip_date_format = this.gantt.date.date_to_str('%d/%m/%Y')
    },

    prepareGanttData() {
      const colorMap = {
        'event-context': '#3498db',
        'event-trigger': '#e74c3c',
        'period-context': '#2ecc71',
        'period-activity': '#9b59b6'
      }

      return this.items.map((item, index) => {
        const startDate = new Date(item.start)
        let endDate

        if (item.type === 'range' && item.end && item.end !== item.start) {
          endDate = new Date(item.end)
        } else {
          // For point events, create a 1-day duration
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
        }

        return {
          id: item.id || index + 1,
          text: item.content,
          start_date: this.formatDateForGantt(startDate),
          end_date: this.formatDateForGantt(endDate),
          duration: Math.max(1, Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000))),
          progress: 1,
          type: item.type === 'range' ? 'task' : 'milestone',
          color: colorMap[item.className] || '#666',
          className: item.className,
          description: item.description,
          originalItem: item
        }
      })
    },

    formatDateForGantt(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    renderFallback() {
      if (this.$refs.ganttContainer) {
        this.$refs.ganttContainer.innerHTML = `
          <div class="gantt-fallback">
            <h4>🗂️ DHTMLX Gantt Timeline</h4>
            <p>Cette visualisation nécessite la bibliothèque DHTMLX Gantt.</p>
            <p><strong>Statut:</strong> dhtmlx-gantt est installé mais n'a pas pu se charger correctement.</p>
            <div class="fallback-timeline">
              ${this.items.map((item, index) => `
                <div class="fallback-item ${item.className}" data-item-index="${index}">
                  <div class="fallback-marker"></div>
                  <div class="fallback-content">
                    <div class="fallback-title">${item.content}</div>
                    <div class="fallback-date">${this.formatDate(item.start)}</div>
                    ${item.end && item.end !== item.start ? 
                      `<div class="fallback-duration">→ ${this.formatDate(item.end)}</div>` : 
                      ''
                    }
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `

        // Add click handlers to fallback items
        this.$refs.ganttContainer.querySelectorAll('.fallback-item').forEach((element) => {
          element.addEventListener('click', () => {
            const index = parseInt(element.dataset.itemIndex)
            this.selectItem(this.items[index])
          })
        })
      }
    },

    selectItem(item) {
      console.log('🗂️ DHTMLX Gantt timeline item selected:', item)
      this.selectedItem = item
      this.$emit('select', item)
    },

    handleResize() {
      if (this.gantt) {
        this.gantt.setSizes()
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
.dhtmlx-gantt-timeline-container {
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
  background: linear-gradient(135deg, #e67e22, #d35400);
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

.dhtmlx-gantt-timeline {
  padding: 2rem;
}

.chart-info {
  background: #fff8e1;
  border: 1px solid #ffcc02;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #e65100;
  font-size: 0.9rem;
}

#gantt-container {
  height: 400px;
  width: 100%;
  border: 2px solid #f5f5f5;
  border-radius: 8px;
  background: white;
}

.gantt-fallback {
  padding: 2rem;
  text-align: center;
  background: #fff3cd;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 300px;
}

.gantt-fallback h4 {
  margin: 0 0 1rem 0;
  color: #856404;
}

.gantt-fallback p {
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

.fallback-duration {
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.15rem;
  font-style: italic;
}

.selected-item-display {
  background: linear-gradient(135deg, #e67e22, #d35400);
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

/* DHTMLX Gantt styling overrides */
:deep(.gantt_task_line.event-context) {
  background: #3498db !important;
  border-color: #2980b9 !important;
}

:deep(.gantt_task_line.event-trigger) {
  background: #e74c3c !important;
  border-color: #c0392b !important;
}

:deep(.gantt_task_line.period-context) {
  background: #2ecc71 !important;
  border-color: #27ae60 !important;
}

:deep(.gantt_task_line.period-activity) {
  background: #9b59b6 !important;
  border-color: #8e44ad !important;
}

:deep(.gantt_grid_scale) {
  background: #f8f9fa !important;
  border-color: #dee2e6 !important;
}

:deep(.gantt_task_row:hover) {
  background: #f8f9fa !important;
}

:deep(.gantt_selected .gantt_task_line) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .dhtmlx-gantt-timeline {
    padding: 1rem;
  }
  
  #gantt-container {
    height: 300px;
  }
  
  .gantt-fallback {
    padding: 1rem;
    min-height: 250px;
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