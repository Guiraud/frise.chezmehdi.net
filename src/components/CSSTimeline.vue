<template>
  <div class="css-timeline-container">
    <div class="timeline-header" v-if="items.length > 0">
      <h3>Pure CSS Timeline</h3>
      <div class="timeline-stats">
        {{ items.length }} événement{{ items.length > 1 ? 's' : '' }}
      </div>
    </div>
    
    <div class="css-timeline">
      <div class="timeline-line"></div>
      
      <div 
        v-for="(item, index) in sortedItems" 
        :key="item.id"
        :class="['timeline-item', item.className]"
        :style="getItemStyle(item, index)"
        @click="selectItem(item)"
      >
        <div class="timeline-marker">
          <div class="marker-dot"></div>
        </div>
        
        <div class="timeline-content">
          <div class="timeline-date">
            {{ formatDate(item.start) }}
            <span v-if="item.end && item.end !== item.start">
              → {{ formatDate(item.end) }}
            </span>
          </div>
          <div class="timeline-title">{{ item.content }}</div>
          <div v-if="item.description" class="timeline-description">
            {{ item.description }}
          </div>
          <div class="timeline-type">
            <span :class="'type-badge ' + item.className">
              {{ formatEventType(item.originalType) }}
            </span>
          </div>
        </div>
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
export default {
  name: 'CSSTimeline',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedItem: null
    }
  },
  computed: {
    sortedItems() {
      return [...this.items].sort((a, b) => new Date(a.start) - new Date(b.start))
    }
  },
  methods: {
    getItemStyle(item, index) {
      return {
        '--item-index': index
      }
    },

    selectItem(item) {
      console.log('🎨 CSS Timeline item selected:', item)
      this.selectedItem = item
      this.$emit('select', item)
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
.css-timeline-container {
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
  background: linear-gradient(135deg, #16a085, #1abc9c);
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

.css-timeline {
  position: relative;
  padding: 3rem 2rem;
  min-height: 400px;
}

.timeline-line {
  position: absolute;
  left: 2rem;
  top: 3rem;
  bottom: 3rem;
  width: 4px;
  background: linear-gradient(180deg, #16a085, #1abc9c);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(22, 160, 133, 0.3);
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  margin-bottom: 3rem;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeInSlide 0.6s ease calc(var(--item-index) * 0.1s) both;
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.timeline-item:hover {
  transform: translateX(10px);
}

.timeline-marker {
  position: relative;
  z-index: 2;
  margin-right: 2rem;
}

.marker-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.timeline-item:hover .marker-dot {
  transform: scale(1.3);
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.3);
}

/* Event Type Colors */
.timeline-item.event-context .marker-dot {
  background: #3498db;
}

.timeline-item.event-trigger .marker-dot {
  background: #e74c3c;
}

.timeline-item.period-context .marker-dot {
  background: #2ecc71;
}

.timeline-item.period-activity .marker-dot {
  background: #9b59b6;
}

.timeline-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.timeline-item.event-context .timeline-content {
  border-left-color: #3498db;
}

.timeline-item.event-trigger .timeline-content {
  border-left-color: #e74c3c;
}

.timeline-item.period-context .timeline-content {
  border-left-color: #2ecc71;
}

.timeline-item.period-activity .timeline-content {
  border-left-color: #9b59b6;
}

.timeline-item:hover .timeline-content {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.timeline-date {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timeline-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.timeline-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-style: italic;
}

.timeline-type {
  margin-top: 1rem;
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

.selected-item-display {
  background: linear-gradient(135deg, #16a085, #1abc9c);
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

/* Responsive */
@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .css-timeline {
    padding: 2rem 1rem;
  }
  
  .timeline-line {
    left: 1rem;
  }
  
  .timeline-marker {
    margin-right: 1rem;
  }
  
  .timeline-content {
    padding: 1rem;
  }
  
  .timeline-title {
    font-size: 1.1rem;
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