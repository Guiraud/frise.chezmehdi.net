<template>
  <div class="apex-timeline-container">
    <div class="timeline-header" v-if="items.length > 0">
      <h3>ApexCharts Timeline</h3>
      <div class="timeline-stats">
        {{ items.length }} événement{{ items.length > 1 ? 's' : '' }}
      </div>
    </div>
    
    <div class="apex-timeline">
      <div class="chart-info">
        <p><strong>Timeline Range Chart:</strong> Utilise les graphiques de plage d'ApexCharts pour représenter les événements dans le temps.</p>
      </div>
      
      <div ref="chartContainer" class="chart-container">
        <div ref="apexChart"></div>
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
import VueApexCharts from 'vue3-apexcharts'

export default {
  name: 'ApexTimeline',
  components: {
    apexchart: VueApexCharts
  },
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedItem: null,
      chart: null,
      chartOptions: {
        chart: {
          type: 'rangeBar',
          height: 400,
          fontFamily: 'inherit',
          events: {
            dataPointSelection: (event, chartContext, config) => {
              const item = this.chartData.series[config.seriesIndex].data[config.dataPointIndex].item
              this.selectItem(item)
            }
          }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: '50%',
            rangeBarGroupRows: false
          }
        },
        colors: ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6'],
        xaxis: {
          type: 'datetime',
          labels: {
            datetimeUTC: false,
            format: 'yyyy'
          }
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        },
        tooltip: {
          custom: ({ series, seriesIndex, dataPointIndex, w }) => {
            const item = this.chartData.series[seriesIndex].data[dataPointIndex].item
            const startDate = new Date(item.start).toLocaleDateString('fr-FR')
            const endDate = item.end && item.end !== item.start ? 
              new Date(item.end).toLocaleDateString('fr-FR') : null
            
            return `
              <div class="apex-tooltip">
                <div class="tooltip-title">${item.content}</div>
                <div class="tooltip-date">
                  ${startDate}${endDate ? ` → ${endDate}` : ''}
                </div>
                ${item.description ? `<div class="tooltip-desc">${item.description}</div>` : ''}
              </div>
            `
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left'
        },
        grid: {
          borderColor: '#f1f1f1'
        }
      }
    }
  },
  computed: {
    chartData() {
      if (!this.items || this.items.length === 0) {
        return { series: [] }
      }

      // Group items by type
      const groupedItems = {}
      this.items.forEach(item => {
        const type = this.formatEventType(item.originalType)
        if (!groupedItems[type]) {
          groupedItems[type] = []
        }

        const startTime = new Date(item.start).getTime()
        const endTime = item.end && item.end !== item.start ? 
          new Date(item.end).getTime() : 
          startTime + (24 * 60 * 60 * 1000) // Add one day for point events

        groupedItems[type].push({
          x: item.content,
          y: [startTime, endTime],
          item: item
        })
      })

      const series = Object.entries(groupedItems).map(([type, data]) => ({
        name: type,
        data: data
      }))

      return { series }
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
  async mounted() {
    await this.$nextTick()
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
    async renderChart() {
      if (!this.items || this.items.length === 0) {
        console.log('📈 No items to render ApexCharts timeline')
        return
      }

      console.log('📈 Rendering ApexCharts timeline with', this.items.length, 'items')

      // Dynamic import of ApexCharts
      try {
        const ApexCharts = (await import('apexcharts')).default
        
        if (this.chart) {
          this.chart.destroy()
        }

        this.chart = new ApexCharts(
          this.$refs.apexChart, 
          {
            ...this.chartOptions,
            series: this.chartData.series
          }
        )

        await this.chart.render()
        console.log('✅ ApexCharts timeline rendered successfully')
        
      } catch (error) {
        console.error('❌ ApexCharts rendering error:', error)
        this.$refs.apexChart.innerHTML = `
          <div class="chart-error">
            <h4>📈 ApexCharts Timeline</h4>
            <p>Erreur de rendu: ${error.message}</p>
            <p><small>ApexCharts peut nécessiter une installation : npm install apexcharts vue3-apexcharts</small></p>
          </div>
        `
      }
    },

    selectItem(item) {
      console.log('📈 ApexCharts timeline item selected:', item)
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
.apex-timeline-container {
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

.apex-timeline {
  padding: 2rem;
}

.chart-info {
  background: #f4e6ff;
  border: 1px solid #d4a4f4;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #6d1f86;
  font-size: 0.9rem;
}

.chart-container {
  position: relative;
  min-height: 400px;
  width: 100%;
}

.chart-error {
  padding: 2rem;
  text-align: center;
  background: #ffeaea;
  border-radius: 8px;
  border: 1px solid #e74c3c;
  color: #c0392b;
}

.chart-error h4 {
  margin: 0 0 1rem 0;
  color: #e74c3c;
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

/* Tooltip styles (global) */
:global(.apex-tooltip) {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
}

:global(.tooltip-title) {
  font-weight: 600;
  font-size: 1rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

:global(.tooltip-date) {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

:global(.tooltip-desc) {
  color: #666;
  font-style: italic;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .apex-timeline {
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