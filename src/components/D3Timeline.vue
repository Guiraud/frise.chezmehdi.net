<template>
  <div class="d3-timeline-container">
    <div class="timeline-header" v-if="items.length > 0">
      <h3>Timeline Interactive</h3>
      <div class="timeline-stats">
        {{ items.length }} événement{{ items.length > 1 ? 's' : '' }}
      </div>
    </div>
    
    <div ref="timeline" class="d3-timeline"></div>
    
    <div v-if="selectedItem" class="timeline-details">
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
import * as d3 from 'd3'

export default {
  name: 'D3Timeline',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedItem: null,
      svg: null,
      xScale: null,
      yScale: null,
      margin: {
        top: 40,
        right: 40,
        bottom: 60,
        left: 40
      }
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
  mounted() {
    this.renderTimeline()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    if (this.svg) {
      this.svg.remove()
    }
  },
  methods: {
    renderTimeline() {
      if (!this.items || this.items.length === 0) {
        console.log('🎨 No items to render timeline')
        return
      }

      console.log('🎨 Rendering D3 timeline with', this.items.length, 'items')

      // Clear existing timeline
      if (this.svg) {
        this.svg.remove()
      }

      const container = this.$refs.timeline
      const containerRect = container.getBoundingClientRect()
      
      // Timeline dimensions - augmenté pour meilleure lisibilité
      const width = Math.max(800, containerRect.width || 800)
      const height = 700 // Augmenté de 400px à 700px
      const innerWidth = width - this.margin.left - this.margin.right
      const innerHeight = height - this.margin.top - this.margin.bottom

      console.log('📐 Timeline dimensions:', { width, height, innerWidth, innerHeight })

      // Create SVG
      this.svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'd3-timeline-svg')

      // Define arrow markers
      const defs = this.svg.append('defs')
      
      // Start arrow (pointing right)
      defs.append('marker')
        .attr('id', 'arrow-start')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#333')
        .attr('opacity', 0.7)

      // End arrow (pointing right)  
      defs.append('marker')
        .attr('id', 'arrow-end')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 2)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#333')
        .attr('opacity', 0.7)

      const g = this.svg.append('g')
        .attr('transform', `translate(${this.margin.left},${this.margin.top})`)

      // Parse dates and create scales
      const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.%fZ')
      
      const processedItems = this.items.map(item => ({
        ...item,
        startDate: parseTime(item.start),
        endDate: item.end ? parseTime(item.end) : parseTime(item.start)
      }))

      console.log('📊 Processed timeline items:', processedItems)

      // Create time scale
      const timeExtent = d3.extent([
        ...processedItems.map(d => d.startDate),
        ...processedItems.map(d => d.endDate)
      ])

      console.log('📅 Time extent:', timeExtent)

      this.xScale = d3.scaleTime()
        .domain(timeExtent)
        .range([0, innerWidth])

      // Y scale for vertical positioning - augmenté padding pour éviter superpositions
      this.yScale = d3.scaleBand()
        .domain(processedItems.map((d, i) => i))
        .range([0, innerHeight])
        .padding(0.4) // Augmenté de 0.2 à 0.4 pour plus d'espace entre items

      // Create time axis
      const xAxis = d3.axisBottom(this.xScale)
        .tickFormat(d3.timeFormat('%Y'))
        .ticks(d3.timeYear.every(5))

      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)

      // Create timeline items
      const itemGroups = g.selectAll('.timeline-item')
        .data(processedItems)
        .enter()
        .append('g')
        .attr('class', 'timeline-item')
        .attr('transform', (d, i) => `translate(0,${this.yScale(i)})`)

      // Draw timeline items
      processedItems.forEach((item, i) => {
        const itemGroup = itemGroups.filter((d, idx) => idx === i)
        
        if (item.type === 'range' && item.startDate.getTime() !== item.endDate.getTime()) {
          // Draw range (period)
          const x = this.xScale(item.startDate)
          const width = Math.max(4, this.xScale(item.endDate) - this.xScale(item.startDate))
          const y = this.yScale(i)
          const height = this.yScale.bandwidth()

          // Main range bar
          itemGroup.append('rect')
            .attr('x', x)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .attr('class', `timeline-bar ${item.className}`)
            .attr('rx', 4)
            .style('cursor', 'pointer')

          // Start arrow line
          itemGroup.append('line')
            .attr('x1', x)
            .attr('y1', height / 2)
            .attr('x2', x - 15)
            .attr('y2', height / 2)
            .attr('stroke', '#666')
            .attr('stroke-width', 2)
            .attr('marker-start', 'url(#arrow-start)')

          // End arrow line  
          itemGroup.append('line')
            .attr('x1', x + width)
            .attr('y1', height / 2)
            .attr('x2', x + width + 15)
            .attr('y2', height / 2)
            .attr('stroke', '#666')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrow-end)')

          // Add label for ranges - taille de police augmentée
          itemGroup.append('text')
            .attr('x', x + width / 2)
            .attr('y', height / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('class', 'timeline-label')
            .style('pointer-events', 'none')
            .style('font-size', '14px') // Augmenté de 12px à 14px
            .style('fill', 'white')
            .style('font-weight', 'bold')
            .text(item.content.length > 20 ? item.content.substring(0, 20) + '...' : item.content)

        } else {
          // Draw point event
          const x = this.xScale(item.startDate)
          const y = this.yScale(i) + this.yScale.bandwidth() / 2

          // Point circle
          itemGroup.append('circle')
            .attr('cx', x)
            .attr('cy', this.yScale.bandwidth() / 2)
            .attr('r', 8)
            .attr('class', `timeline-point ${item.className}`)
            .style('cursor', 'pointer')

          // Point label - taille de police augmentée
          itemGroup.append('text')
            .attr('x', x + 15)
            .attr('y', this.yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('class', 'timeline-label')
            .style('pointer-events', 'none')
            .style('font-size', '15px') // Augmenté de 14px à 15px
            .style('font-weight', 'bold')
            .text(item.content)
        }

        // Add click interaction
        itemGroup
          .style('cursor', 'pointer')
          .on('click', () => {
            console.log('🖱️ Timeline item clicked:', item)
            this.selectedItem = item
            this.$emit('select', item)
          })
          .on('mouseover', function() {
            d3.select(this).style('opacity', 0.8)
          })
          .on('mouseout', function() {
            d3.select(this).style('opacity', 1)
          })
      })

      // Add timeline line
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', innerHeight + 20)
        .attr('y2', innerHeight + 20)
        .attr('class', 'timeline-axis-line')
        .style('stroke', '#ddd')
        .style('stroke-width', 2)

      console.log('✅ D3 timeline rendered successfully')
    },

    handleResize() {
      // Debounce resize
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(() => {
        this.renderTimeline()
      }, 300)
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
.d3-timeline-container {
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
  background: linear-gradient(135deg, #42b983, #369f6b);
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

.d3-timeline {
  min-height: 700px; /* Augmenté de 400px à 700px */
  padding: 2rem;
  overflow-x: auto;
}

.timeline-details {
  border-top: 1px solid #eee;
  background: #f8f9fa;
  padding: 1.5rem 2rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.detail-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #666;
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

/* D3 Timeline Styles */
:deep(.d3-timeline-svg) {
  width: 100%;
  background: white;
}

:deep(.timeline-bar.event-context) {
  fill: #3498db;
  opacity: 0.8;
}

:deep(.timeline-bar.event-trigger) {
  fill: #e74c3c;
  opacity: 0.8;
}

:deep(.timeline-bar.period-context) {
  fill: #2ecc71;
  opacity: 0.8;
}

:deep(.timeline-bar.period-activity) {
  fill: #9b59b6;
  opacity: 0.8;
}

:deep(.timeline-point.event-context) {
  fill: #3498db;
  stroke: #2980b9;
  stroke-width: 3;
}

:deep(.timeline-point.event-trigger) {
  fill: #e74c3c;
  stroke: #c0392b;
  stroke-width: 3;
}

:deep(.timeline-point.period-context) {
  fill: #2ecc71;
  stroke: #27ae60;
  stroke-width: 3;
}

:deep(.timeline-point.period-activity) {
  fill: #9b59b6;
  stroke: #8e44ad;
  stroke-width: 3;
}

:deep(.timeline-label) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
}

:deep(.x-axis) {
  font-size: 12px;
  color: #666;
}

:deep(.x-axis path,
.x-axis line) {
  stroke: #ddd;
  stroke-width: 1;
}

:deep(.x-axis text) {
  fill: #666;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .d3-timeline {
    padding: 1rem;
  }
  
  .timeline-details {
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