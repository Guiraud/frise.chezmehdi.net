<template>
  <div class="chartjs-timeline-container">
    <div class="timeline-header" v-if="items.length > 0">
      <h3>Chart.js Timeline</h3>
      <div class="timeline-stats">
        {{ items.length }} événement{{ items.length > 1 ? 's' : '' }}
      </div>
    </div>
    
    <div class="chartjs-timeline">
      <div class="chart-info">
        <p><strong>Note:</strong> Chart.js ne supporte pas nativement les timelines. Cette implémentation simule une timeline avec un scatter plot.</p>
      </div>
      
      <div ref="chartContainer" class="chart-container">
        <canvas ref="timelineChart"></canvas>
      </div>
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
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'

Chart.register(...registerables)

export default {
  name: 'ChartJSTimeline',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedItem: null,
      chart: null
    }
  },
  watch: {
    items: {
      handler() {
        this.renderChart()
      },
      deep: true
    }
  },
  mounted() {
    this.renderChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    renderChart() {
      if (!this.items || this.items.length === 0) {
        console.log('📊 No items to render Chart.js timeline')
        return
      }

      console.log('📊 Rendering Chart.js timeline with', this.items.length, 'items')

      if (this.chart) {
        this.chart.destroy()
      }

      const ctx = this.$refs.timelineChart.getContext('2d')
      
      // Prepare data for Chart.js
      const datasets = this.prepareChartData()
      
      this.chart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'nearest'
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              callbacks: {
                title: (context) => {
                  const item = context[0].raw.item
                  return item.content
                },
                label: (context) => {
                  const item = context[0].raw.item
                  const date = new Date(item.start).toLocaleDateString('fr-FR')
                  const endDate = item.end && item.end !== item.start ? 
                    ` → ${new Date(item.end).toLocaleDateString('fr-FR')}` : ''
                  return `${date}${endDate}`
                },
                afterLabel: (context) => {
                  const item = context[0].raw.item
                  return item.description || ''
                }
              }
            }
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'year',
                displayFormats: {
                  year: 'yyyy'
                }
              },
              title: {
                display: true,
                text: 'Années'
              }
            },
            y: {
              type: 'category',
              labels: this.items.map((item, index) => `Event ${index + 1}`),
              title: {
                display: true,
                text: 'Événements'
              }
            }
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const element = elements[0]
              const item = this.chart.data.datasets[element.datasetIndex].data[element.index].item
              this.selectItem(item)
            }
          }
        }
      })

      console.log('✅ Chart.js timeline rendered successfully')
    },

    prepareChartData() {
      const colorMap = {
        'event-context': '#3498db',
        'event-trigger': '#e74c3c',
        'period-context': '#2ecc71',
        'period-activity': '#9b59b6'
      }

      const datasets = []
      
      // Group items by type for better legend
      const itemsByType = {}
      this.items.forEach((item, index) => {
        if (!itemsByType[item.className]) {
          itemsByType[item.className] = []
        }
        
        itemsByType[item.className].push({
          x: new Date(item.start),
          y: index,
          item: item
        })

        // Add end point for ranges
        if (item.type === 'range' && item.end && item.end !== item.start) {
          itemsByType[item.className].push({
            x: new Date(item.end),
            y: index,
            item: item
          })
        }
      })

      // Create datasets
      Object.entries(itemsByType).forEach(([className, data]) => {
        datasets.push({
          label: this.formatEventType(this.items.find(item => item.className === className)?.originalType) || className,
          data: data,
          backgroundColor: colorMap[className] || '#666',
          borderColor: colorMap[className] || '#666',
          pointRadius: 8,
          pointHoverRadius: 12,
          showLine: false
        })
      })

      return datasets
    },

    selectItem(item) {
      console.log('📊 Chart.js timeline item selected:', item)
      this.selectedItem = item
      this.$emit('select', item)
    },

    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
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
.chartjs-timeline-container {
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
  background: linear-gradient(135deg, #f39c12, #e67e22);
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

.chartjs-timeline {
  padding: 2rem;
}

.chart-info {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #856404;
  font-size: 0.9rem;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

.selected-item-display {
  background: linear-gradient(135deg, #f39c12, #e67e22);
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
  
  .chartjs-timeline {
    padding: 1rem;
  }
  
  .chart-container {
    height: 300px;
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