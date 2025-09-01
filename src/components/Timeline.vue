<template>
  <div class="timeline-container">
    <div ref="timeline" class="timeline-vis"></div>
    
    <div v-if="selectedItem" class="timeline-details">
      <h2>{{ selectedItem.title }}</h2>
      <div class="timeline-date">
        {{ formatDate(selectedItem.start) }}
        <span v-if="selectedItem.end"> - {{ formatDate(selectedItem.end) }}</span>
      </div>
      <div 
        class="timeline-description" 
        v-html="selectedItem.description || 'Aucune description disponible'"
      ></div>
      <div v-if="selectedItem.url" class="timeline-actions">
        <a :href="selectedItem.url" target="_blank" class="btn">
          Voir plus
        </a>
        <button 
          @click="copyShareLink(selectedItem.id)" 
          class="btn btn-outline"
        >
          Copier le lien de partage
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.css';

export default {
  name: 'Timeline',
  props: {
    items: {
      type: Array,
      required: true
    },
    groups: {
      type: Array,
      default: () => []
    },
    options: {
      type: Object,
      default: () => ({
        width: '100%',
        height: '500px',
        stack: true,
        showMajorLabels: true,
        showCurrentTime: true,
        zoomable: true,
        moveable: true,
        orientation: 'top',
        margin: {
          item: {
            horizontal: 0,
            vertical: 10
          }
        },
        format: {
          minorLabels: {
            month: 'MMM',
            year: 'YYYY'
          },
          majorLabels: {
            year: 'YYYY',
            month: 'MMMM YYYY'
          }
        }
      })
    }
  },
  data() {
    return {
      timeline: null,
      selectedItem: null
    };
  },
  watch: {
    items: {
      handler(newItems) {
        if (this.timeline) {
          this.timeline.setItems(newItems);
        }
      },
      deep: true
    },
    groups: {
      handler(newGroups) {
        if (this.timeline) {
          this.timeline.setGroups(newGroups);
        }
      },
      deep: true
    }
  },
  mounted() {
    this.initTimeline();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    if (this.timeline) {
      this.timeline.destroy();
    }
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    initTimeline() {
      const container = this.$refs.timeline;
      
      console.log('🔍 Timeline items received:', this.items);
      console.log('📊 Items count:', this.items.length);
      
      // Vérifier le format des items
      if (this.items.length > 0) {
        console.log('📋 First item structure:', this.items[0]);
        console.log('📋 Required fields check:', {
          hasId: !!this.items[0].id,
          hasStart: !!this.items[0].start,
          hasContent: !!(this.items[0].content || this.items[0].titre),
          hasType: !!this.items[0].type
        });
      }
      
      // Force test data if no items work
      let testItems = this.items;
      if (this.items.length > 0 && !this.items.some(item => item.start && item.content)) {
        console.log('⚠️ Creating fallback test data because items seem malformed');
        testItems = [
          {
            id: 'test-1',
            content: 'Test Event 1',
            start: '2024-01-01',
            type: 'point',
            className: 'event-trigger'
          },
          {
            id: 'test-2', 
            content: 'Test Event 2',
            start: '2024-06-01',
            end: '2024-12-01',
            type: 'range',
            className: 'period-activity'
          }
        ];
        console.log('🧪 Using test items:', testItems);
      }
      
      console.log('🏗️ Creating Timeline with options:', this.options);
      
      this.timeline = new Timeline(
        container,
        testItems,
        this.groups,
        this.options
      );
      
      console.log('📊 Timeline created successfully');

      // Gestion des événements
      this.timeline.on('select', this.handleSelect);
      this.timeline.on('rangechanged', this.handleRangeChange);
      
      // Force fit to show all items
      if (testItems.length > 0) {
        setTimeout(() => {
          console.log('🎯 Fitting timeline to show all items');
          this.timeline.fit();
        }, 100);
      }
      
      // Ajustement automatique de la hauteur
      this.adjustHeight();
    },
    
    handleSelect(properties) {
      if (properties.items && properties.items.length > 0) {
        const itemId = properties.items[0];
        this.selectedItem = this.items.find(item => item.id === itemId);
        
        // Faire défiler jusqu'à l'élément sélectionné
        this.timeline.focus(itemId, { animation: true });
      } else {
        this.selectedItem = null;
      }
    },
    
    handleRangeChange(properties) {
      // Mettre à jour l'URL avec la plage de dates actuelle
      this.$emit('range-change', {
        start: properties.start,
        end: properties.end
      });
    },
    
    adjustHeight() {
      // Ajuster la hauteur en fonction du nombre d'éléments
      const itemCount = this.items.length;
      const baseHeight = 500;
      const itemHeight = 60;
      const maxHeight = window.innerHeight * 0.7;
      
      const newHeight = Math.min(baseHeight + (itemCount * itemHeight), maxHeight);
      this.timeline.setOptions({
        height: `${newHeight}px`
      });
    },
    
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    copyShareLink(itemId) {
      const url = `${window.location.origin}${window.location.pathname}#event-${itemId}`;
      navigator.clipboard.writeText(url).then(() => {
        // Afficher un message de succès
        this.$emit('notify', 'Lien copié dans le presse-papiers');
      }).catch(err => {
        console.error('Erreur lors de la copie du lien:', err);
        this.$emit('notify', 'Erreur lors de la copie du lien', 'error');
      });
    },
    
    handleResize() {
      if (this.timeline) {
        this.timeline.redraw();
      }
    }
  }
};
</script>

<style scoped>
.timeline-container {
  margin: 2rem 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.timeline-vis {
  width: 100%;
  min-height: 500px;
  border-bottom: 1px solid #eee;
}

.timeline-details {
  padding: 1.5rem;
  background: #f9f9f9;
}

.timeline-details h2 {
  margin: 0 0 0.5rem 0;
  color: var(--secondary-color);
}

.timeline-date {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.timeline-description {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.timeline-description :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.timeline-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background: rgba(66, 185, 131, 0.1);
}

/* Styles spécifiques pour la timeline */
:deep(.vis-item) {
  border-radius: 4px;
  border-width: 2px;
  font-size: 0.9em;
  color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

:deep(.vis-item.vis-box) {
  text-align: center;
  padding: 5px;
}

:deep(.vis-item.vis-point) {
  border-radius: 50%;
  width: 10px !important;
  height: 10px !important;
  margin-left: -5px !important;
}

:deep(.vis-item.vis-point .vis-item-content) {
  position: relative;
  left: 12px;
  top: -0.5em;
  white-space: nowrap;
  color: var(--text-color);
  font-weight: bold;
}

:deep(.vis-time-axis .vis-text) {
  color: var(--text-color);
  padding-top: 10px;
  padding-bottom: 5px;
}

:deep(.vis-panel.vis-left) {
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
}

:deep(.vis-item.vis-selected) {
  border-color: #ffc107;
  background-color: #fff3cd;
  color: #856404;
  box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.5);
}

/* Styles pour les différents types d'événements */
:deep(.event-context) {
  background-color: #3498db;
  border-color: #2980b9;
}

:deep(.event-trigger) {
  background-color: #e74c3c;
  border-color: #c0392b;
}

:deep(.period-context) {
  background-color: #2ecc71;
  border-color: #27ae60;
}

:deep(.period-activity) {
  background-color: #9b59b6;
  border-color: #8e44ad;
}

/* Responsive */
@media (max-width: 768px) {
  .timeline-vis {
    min-height: 400px;
  }
  
  .timeline-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
