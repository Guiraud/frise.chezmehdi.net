<template>
  <div class="vis-timeline-container">
    <div class="timeline-header" v-if="items.length > 0">
      <h3>Vis Timeline - Événements Groupés</h3>
      <div class="timeline-stats">
        {{ items.length }} événement{{ items.length > 1 ? 's' : '' }}
      </div>
    </div>
    
    <div class="vis-timeline">
      <div class="chart-info">
        <p><strong>Vis Timeline Améliorée:</strong> Événements organisés par groupes selon leur type, comme dans l'exemple Bétharram.</p>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color event-context"></div>
            <span>Événements contextuels</span>
          </div>
          <div class="legend-item">
            <div class="legend-color event-trigger"></div>
            <span>Événements déclencheurs</span>
          </div>
          <div class="legend-item">
            <div class="legend-color period-context"></div>
            <span>Périodes contextuelles</span>
          </div>
          <div class="legend-item">
            <div class="legend-color period-activity"></div>
            <span>Périodes d'activité</span>
          </div>
        </div>
      </div>
      
      <div ref="timelineContainer" class="timeline-container"></div>
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
  name: 'VisTimeline',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedItem: null,
      timeline: null,
      visTimeline: null,
      visDataSet: null
    }
  },
  watch: {
    items: {
      handler() {
        this.renderTimeline()
      },
      deep: true
    }
  },
  async mounted() {
    await this.loadVisLibraries()
    this.renderTimeline()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    if (this.timeline) {
      this.timeline.destroy()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    async loadVisLibraries() {
      try {
        const [timelineModule, dataModule] = await Promise.all([
          import('vis-timeline'),
          import('vis-data')
        ])
        
        this.visTimeline = timelineModule.Timeline
        this.visDataSet = dataModule.DataSet
        
        console.log('📈 Vis Timeline loaded successfully')
      } catch (error) {
        console.warn('⚠️ Vis Timeline not available:', error)
        this.visTimeline = null
        this.visDataSet = null
      }
    },

    renderTimeline() {
      if (!this.items || this.items.length === 0) {
        console.log('📈 No items to render Vis Timeline')
        return
      }

      if (!this.visTimeline || !this.visDataSet) {
        this.renderFallback()
        return
      }

      console.log('📈 Rendering Vis Timeline with groups for', this.items.length, 'items')

      try {
        // Créer les groupes et items
        const { groups, items } = this.prepareTimelineData()
        
        const groupsDataset = new this.visDataSet(groups)
        const itemsDataset = new this.visDataSet(items)
        
        const options = {
          width: '100%',
          height: '500px',
          margin: {
            item: {
              horizontal: 10,
              vertical: 10
            }
          },
          orientation: 'both',
          stack: false, // Permet l'empilement automatique dans les groupes
          zoomable: true,
          moveable: true,
          showCurrentTime: false,
          groupOrder: 'order', // Ordre des groupes
          format: {
            minorLabels: {
              millisecond: 'SSS',
              second: 's',
              minute: 'HH:mm',
              hour: 'HH:mm',
              weekday: 'ddd D',
              day: 'D',
              week: 'w',
              month: 'MMM',
              year: 'YYYY'
            },
            majorLabels: {
              millisecond: 'HH:mm:ss',
              second: 'D MMMM HH:mm',
              minute: 'ddd D MMMM',
              hour: 'ddd D MMMM',
              weekday: 'MMMM YYYY',
              day: 'MMMM YYYY',
              week: 'MMMM YYYY',
              month: 'YYYY',
              year: ''
            }
          },
          locale: 'fr',
          tooltip: {
            followMouse: true,
            overflowMethod: 'cap'
          },
          groupsChangeable: false,
          groupsOnTop: true
        }

        if (this.timeline) {
          this.timeline.destroy()
        }

        this.timeline = new this.visTimeline(this.$refs.timelineContainer, itemsDataset, options)
        this.timeline.setGroups(groupsDataset)
        
        // Event handlers
        this.timeline.on('select', (properties) => {
          if (properties.items.length > 0) {
            const itemId = properties.items[0]
            const item = this.items.find(item => item.id === itemId)
            if (item) {
              this.selectItem(item)
            }
          }
        })

        this.timeline.on('click', (properties) => {
          if (properties.item) {
            const item = this.items.find(item => item.id === properties.item)
            if (item) {
              this.selectItem(item)
            }
          }
        })

        // Ajuster la vue pour montrer tous les éléments
        this.timeline.fit()

        console.log('✅ Vis Timeline with groups rendered successfully')

      } catch (error) {
        console.error('❌ Vis Timeline rendering error:', error)
        this.renderFallback()
      }
    },

    prepareTimelineData() {
      const colorMap = {
        'event-context': '#3498db',
        'event-trigger': '#e74c3c',
        'period-context': '#2ecc71',
        'period-activity': '#9b59b6'
      }

      // Définir les groupes selon les types d'événements
      const groups = [
        {
          id: 'event-context',
          content: 'Événements contextuels',
          order: 1,
          style: `background-color: ${colorMap['event-context']}20; color: ${colorMap['event-context']};`
        },
        {
          id: 'event-trigger',
          content: 'Événements déclencheurs',
          order: 2,
          style: `background-color: ${colorMap['event-trigger']}20; color: ${colorMap['event-trigger']};`
        },
        {
          id: 'period-context',
          content: 'Périodes contextuelles',
          order: 3,
          style: `background-color: ${colorMap['period-context']}20; color: ${colorMap['period-context']};`
        },
        {
          id: 'period-activity',
          content: 'Périodes d\'activité',
          order: 4,
          style: `background-color: ${colorMap['period-activity']}20; color: ${colorMap['period-activity']};`
        }
      ]

      // Préparer les items avec assignation aux groupes
      const items = this.items.map(item => {
        const timelineItem = {
          id: item.id,
          content: item.content,
          start: new Date(item.start),
          group: item.className, // Assigner au groupe correspondant
          title: `${item.content}${item.description ? '\n' + item.description : ''}`,
          className: `timeline-item ${item.className}`,
          style: `background-color: ${colorMap[item.className] || '#666'}; border-color: ${colorMap[item.className] || '#666'}; color: white;`
        }

        // Gérer les périodes et événements ponctuels
        if (item.type === 'range' && item.end && item.end !== item.start) {
          timelineItem.end = new Date(item.end)
          timelineItem.type = 'range'
        } else {
          timelineItem.type = 'point'
        }

        return timelineItem
      })

      return { groups, items }
    },

    renderFallback() {
      if (this.$refs.timelineContainer) {
        this.$refs.timelineContainer.innerHTML = `
          <div class="timeline-fallback">
            <h4>📈 Vis Timeline - Groupes</h4>
            <p>Cette visualisation nécessite la bibliothèque vis-timeline.</p>
            <p><strong>Statut:</strong> vis-timeline est installé mais n'a pas pu se charger correctement.</p>
            <div class="fallback-groups">
              ${this.renderFallbackGroups()}
            </div>
          </div>
        `

        // Add click handlers to fallback items
        this.$refs.timelineContainer.querySelectorAll('.fallback-item').forEach((element) => {
          element.addEventListener('click', () => {
            const index = parseInt(element.dataset.itemIndex)
            this.selectItem(this.items[index])
          })
        })
      }
    },

    renderFallbackGroups() {
      const groupedItems = {
        'event-context': [],
        'event-trigger': [],
        'period-context': [],
        'period-activity': []
      }

      // Grouper les items par type
      this.items.forEach((item, index) => {
        if (groupedItems[item.className]) {
          groupedItems[item.className].push({ ...item, index })
        }
      })

      const groupNames = {
        'event-context': 'Événements contextuels',
        'event-trigger': 'Événements déclencheurs',
        'period-context': 'Périodes contextuelles',
        'period-activity': 'Périodes d\'activité'
      }

      return Object.entries(groupedItems)
        .filter(([_, items]) => items.length > 0)
        .map(([groupId, items]) => `
          <div class="fallback-group">
            <h5 class="fallback-group-title ${groupId}">${groupNames[groupId]}</h5>
            <div class="fallback-group-items">
              ${items.map(item => `
                <div class="fallback-item ${item.className}" data-item-index="${item.index}">
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
        `).join('')
    },

    selectItem(item) {
      console.log('📈 Vis Timeline item selected:', item)
      this.selectedItem = item
      this.$emit('select', item)
    },

    handleResize() {
      if (this.timeline) {
        this.timeline.redraw()
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
.vis-timeline-container {
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
  background: linear-gradient(135deg, #8e44ad, #9b59b6);
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

.vis-timeline {
  padding: 2rem;
}

.chart-info {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #495057;
  font-size: 0.9rem;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 0.85rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.event-context {
  background: #3498db;
}

.legend-color.event-trigger {
  background: #e74c3c;
}

.legend-color.period-context {
  background: #2ecc71;
}

.legend-color.period-activity {
  background: #9b59b6;
}

.timeline-container {
  width: 100%;
  height: 500px;
  border: 2px solid #f8f9fa;
  border-radius: 8px;
  background: white;
}

.timeline-fallback {
  padding: 2rem;
  text-align: center;
  background: #fff3cd;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 400px;
}

.timeline-fallback h4 {
  margin: 0 0 1rem 0;
  color: #856404;
}

.timeline-fallback p {
  margin: 0.5rem 0;
  color: #856404;
}

.fallback-groups {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: left;
}

.fallback-group {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fallback-group-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: white;
}

.fallback-group-title.event-context {
  background: #3498db;
}

.fallback-group-title.event-trigger {
  background: #e74c3c;
}

.fallback-group-title.period-context {
  background: #2ecc71;
}

.fallback-group-title.period-activity {
  background: #9b59b6;
}

.fallback-group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fallback-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fallback-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.fallback-marker {
  width: 12px;
  height: 12px;
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
  background: linear-gradient(135deg, #8e44ad, #9b59b6);
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

/* Vis Timeline deep styling pour les groupes */
:deep(.vis-timeline) {
  font-family: inherit;
  border-radius: 8px;
}

:deep(.vis-group) {
  border-radius: 6px;
  margin: 2px 0;
  padding: 5px 10px;
  font-weight: 600;
  font-size: 0.9rem;
}

:deep(.vis-item) {
  border-radius: 4px !important;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.vis-item:hover) {
  opacity: 0.9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

:deep(.vis-item.vis-selected) {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
  border-width: 3px !important;
}

:deep(.vis-time-axis .vis-text) {
  font-size: 0.85rem;
  color: #666;
}

:deep(.vis-time-axis .vis-text.vis-major) {
  font-weight: 600;
  color: #333;
}

:deep(.vis-panel.vis-center) {
  border-radius: 8px;
}

:deep(.vis-panel.vis-left) {
  border-right: 2px solid #dee2e6;
  background: #f8f9fa;
}

/* Responsive */
@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .vis-timeline {
    padding: 1rem;
  }
  
  .timeline-container {
    height: 400px;
  }
  
  .legend {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .timeline-fallback {
    padding: 1rem;
    min-height: 300px;
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