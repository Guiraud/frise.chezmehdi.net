<template>
  <div class="vis-network-timeline-container">
    <div class="timeline-header" v-if="items.length > 0">
      <h3>Vis.js Network Timeline</h3>
      <div class="timeline-stats">
        {{ items.length }} événement{{ items.length > 1 ? 's' : '' }}
      </div>
    </div>
    
    <div class="vis-network-timeline">
      <div class="chart-info">
        <p><strong>Network Approach:</strong> Représente les événements comme un réseau de nœuds connectés chronologiquement.</p>
      </div>
      
      <div ref="networkContainer" class="network-container"></div>
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
  name: 'VisNetworkTimeline',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedItem: null,
      network: null,
      vis: null
    }
  },
  watch: {
    items: {
      handler() {
        this.renderNetwork()
      },
      deep: true
    }
  },
  async mounted() {
    await this.loadVis()
    this.renderNetwork()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    if (this.network) {
      this.network.destroy()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    async loadVis() {
      try {
        // Try to load vis-network dynamically with correct import path
        const visModule = await import('vis-network')
        this.vis = visModule.default || visModule
        console.log('🕸️ Vis.js Network loaded successfully')
      } catch (error) {
        console.warn('⚠️ Vis.js Network not available:', error)
        this.vis = null
      }
    },

    renderNetwork() {
      if (!this.items || this.items.length === 0) {
        console.log('🕸️ No items to render Vis Network timeline')
        return
      }

      if (!this.vis) {
        this.renderFallback()
        return
      }

      console.log('🕸️ Rendering Vis Network timeline with', this.items.length, 'items')

      try {
        const { nodes, edges } = this.prepareNetworkData()

        const data = {
          nodes: new this.vis.DataSet(nodes),
          edges: new this.vis.DataSet(edges)
        }

        const options = {
          layout: {
            hierarchical: {
              direction: 'LR',
              sortMethod: 'directed',
              levelSeparation: 200
            }
          },
          physics: {
            enabled: false
          },
          nodes: {
            shape: 'box',
            margin: 10,
            font: {
              size: 14,
              face: 'arial'
            },
            borderWidth: 3,
            shadow: true
          },
          edges: {
            arrows: 'to',
            smooth: {
              type: 'cubicBezier',
              forceDirection: 'horizontal'
            },
            color: {
              color: '#848484',
              highlight: '#3498db',
              hover: '#3498db'
            },
            width: 2
          },
          interaction: {
            hover: true,
            selectConnectedEdges: false
          }
        }

        if (this.network) {
          this.network.destroy()
        }

        this.network = new this.vis.Network(this.$refs.networkContainer, data, options)

        // Event handlers
        this.network.on('click', (params) => {
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0]
            const item = this.items.find(item => item.id === nodeId)
            if (item) {
              this.selectItem(item)
            }
          }
        })

        console.log('✅ Vis Network timeline rendered successfully')

      } catch (error) {
        console.error('❌ Vis Network rendering error:', error)
        this.renderFallback()
      }
    },

    prepareNetworkData() {
      const colorMap = {
        'event-context': '#3498db',
        'event-trigger': '#e74c3c',
        'period-context': '#2ecc71',
        'period-activity': '#9b59b6'
      }

      // Sort items by date
      const sortedItems = [...this.items].sort((a, b) => new Date(a.start) - new Date(b.start))

      const nodes = sortedItems.map((item, index) => {
        const startDate = new Date(item.start).toLocaleDateString('fr-FR', { 
          year: 'numeric',
          month: 'short'
        })
        const endDate = item.end && item.end !== item.start ? 
          new Date(item.end).toLocaleDateString('fr-FR', { 
            year: 'numeric',
            month: 'short'
          }) : null

        return {
          id: item.id,
          label: `${item.content}\n${startDate}${endDate ? `\n→ ${endDate}` : ''}`,
          color: {
            background: colorMap[item.className] || '#666',
            border: colorMap[item.className] || '#666',
            highlight: {
              background: colorMap[item.className] || '#666',
              border: '#2c3e50'
            }
          },
          font: {
            color: 'white',
            size: 12
          },
          level: index
        }
      })

      // Create edges between consecutive events
      const edges = []
      for (let i = 0; i < sortedItems.length - 1; i++) {
        edges.push({
          from: sortedItems[i].id,
          to: sortedItems[i + 1].id,
          label: this.calculateTimeDifference(sortedItems[i].start, sortedItems[i + 1].start)
        })
      }

      return { nodes, edges }
    },

    calculateTimeDifference(date1, date2) {
      const d1 = new Date(date1)
      const d2 = new Date(date2)
      const diffTime = Math.abs(d2 - d1)
      const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25))
      
      if (diffYears > 0) {
        return `${diffYears} an${diffYears > 1 ? 's' : ''}`
      }
      
      const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44))
      if (diffMonths > 0) {
        return `${diffMonths} mois`
      }
      
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`
    },

    renderFallback() {
      this.$refs.networkContainer.innerHTML = `
        <div class="network-fallback">
          <h4>🕸️ Vis.js Network Timeline</h4>
          <p>Cette visualisation nécessite la bibliothèque vis-network.</p>
          <p><strong>Installation:</strong> <code>npm install vis-network</code></p>
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
      this.$refs.networkContainer.querySelectorAll('.fallback-item').forEach((element) => {
        element.addEventListener('click', () => {
          const index = parseInt(element.dataset.itemIndex)
          this.selectItem(this.items[index])
        })
      })
    },

    selectItem(item) {
      console.log('🕸️ Vis Network timeline item selected:', item)
      this.selectedItem = item
      this.$emit('select', item)
    },

    handleResize() {
      if (this.network) {
        this.network.fit()
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
.vis-network-timeline-container {
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
  background: linear-gradient(135deg, #34495e, #2c3e50);
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

.vis-network-timeline {
  padding: 2rem;
}

.chart-info {
  background: #ecf0f1;
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-size: 0.9rem;
}

.network-container {
  height: 400px;
  width: 100%;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  background: #f8f9fa;
}

.network-fallback {
  padding: 2rem;
  text-align: center;
  background: #fff3cd;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.network-fallback h4 {
  margin: 0 0 1rem 0;
  color: #856404;
}

.network-fallback p {
  margin: 0.5rem 0;
  color: #856404;
}

.network-fallback code {
  background: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
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
  background: linear-gradient(135deg, #34495e, #2c3e50);
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

/* Responsive */
@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .vis-network-timeline {
    padding: 1rem;
  }
  
  .network-container {
    height: 300px;
  }
  
  .network-fallback {
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