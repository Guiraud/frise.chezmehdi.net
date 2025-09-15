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
import { DataSet } from 'vis-data/esnext';

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
        showCurrentTime: false,  // Disable current time line for debugging
        zoomable: true,
        moveable: true,
        orientation: 'top',
        margin: {
          item: {
            horizontal: 10,
            vertical: 10
          },
          axis: 40
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
        },
        // Force timeline to fit window properly
        start: new Date(1970, 0, 1),
        end: new Date(2030, 0, 1),
        // Ensure items are visible
        verticalScroll: false,
        horizontalScroll: true,
        // CRITICAL: Force immediate rendering
        autoResize: true,
        throttleRedraw: 0  // No throttling
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
        if (this.timeline && newItems && newItems.length > 0) {
          console.log('🔄 Updating timeline with new items:', newItems.length);
          const newDataSet = new DataSet(newItems);
          this.timeline.setItems(newDataSet);
          
          // Force redraw after update
          setTimeout(() => {
            this.timeline.fit();
          }, 100);
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
    // Ensure the container has proper dimensions before initializing
    this.$nextTick(() => {
      const container = this.$refs.timeline;
      console.log('📐 Container dimensions before init:', {
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight
      });
      
      // Force container dimensions if needed
      if (container.clientHeight === 0) {
        console.log('🔧 Fixing container height...');
        container.style.height = '500px';
        container.style.width = '100%';
        container.style.minHeight = '500px';
      }
      
      setTimeout(() => {
        this.initTimeline();
      }, 100);
    });
    
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
      
      // Enhanced debugging for each item
      if (this.items.length > 0) {
        this.items.forEach((item, index) => {
          console.log(`📋 Item ${index + 1}:`, {
            id: item.id,
            content: item.content,
            titre: item.titre,
            start: item.start,
            end: item.end,
            type: item.type,
            className: item.className,
            hasValidStart: !!item.start && !isNaN(new Date(item.start).getTime()),
            hasContent: !!(item.content || item.titre)
          });
        });
      }
      
      // Use real items - remove fallback logic that's interfering
      let timelineItems = this.items;
      
      // Only create test data if we truly have no items at all
      if (this.items.length === 0) {
        console.log('⚠️ No items provided, using test data for debugging');
        timelineItems = [
          {
            id: 'test-1',
            content: 'Test Event 1',
            start: '2024-01-01',
            type: 'point',
            className: 'event-trigger'
          }
        ];
      } else {
        console.log('✅ Using real timeline items:', timelineItems.length);
      }
      
      console.log('🏗️ Creating Timeline with options:', this.options);
      console.log('🏗️ Timeline items to render:', timelineItems);
      
      // Create DataSet for better performance and debugging
      const itemsDataSet = new DataSet(timelineItems);
      console.log('📊 DataSet created with', itemsDataSet.length, 'items');
      
      this.timeline = new Timeline(
        container,
        itemsDataSet,
        this.groups,
        this.options
      );
      
      console.log('📊 Timeline created successfully');
      
      // Debug: Check if timeline container has content
      setTimeout(() => {
        const timelineElement = this.$refs.timeline;
        const visTimelineDiv = timelineElement.querySelector('.vis-timeline');
        const visItems = timelineElement.querySelectorAll('.vis-item');
        
        console.log('🔍 Timeline DOM after creation:', {
          containerExists: !!timelineElement,
          hasChildren: timelineElement.children.length > 0,
          innerHTML: timelineElement.innerHTML.length,
          clientHeight: timelineElement.clientHeight,
          scrollHeight: timelineElement.scrollHeight,
          visTimelineExists: !!visTimelineDiv,
          visItemsCount: visItems.length,
          containerHTML: timelineElement.innerHTML.substring(0, 200) + '...'
        });
        
        if (visItems.length > 0) {
          console.log('✅ Vis items found in DOM:', visItems.length);
          visItems.forEach((item, index) => {
            console.log(`📋 Vis item ${index}:`, {
              className: item.className,
              style: item.style.cssText,
              visible: item.offsetHeight > 0 && item.offsetWidth > 0,
              innerHTML: item.innerHTML
            });
          });
        } else {
          console.log('❌ No vis-items found in DOM - timeline not rendering properly');
          console.log('🔄 Trying to force visibility...');
          
          // Force timeline visibility
          if (visTimelineDiv) {
            visTimelineDiv.style.visibility = 'visible';
            visTimelineDiv.style.opacity = '1';
            visTimelineDiv.style.display = 'block';
          }
          
          // Remove loading screens
          const loadingScreens = timelineElement.querySelectorAll('.vis-loading-screen');
          loadingScreens.forEach(screen => screen.remove());
        }
        
        // Safely force redraw
        console.log('🔄 Force timeline redraw...');
        try {
          this.timeline.redraw();
          this.timeline.fit();
        } catch (error) {
          console.log('⚠️ Timeline operation error (loading screen issue):', error.message);
          // Timeline will still work, just logging the error
        }
      }, 1000);

      // Wait for timeline to be ready before checking DOM
      this.timeline.on('ready', () => {
        console.log('📊 Timeline ready event fired');
        setTimeout(() => this.checkTimelineRendering(), 500);
      });

      // Gestion des événements
      this.timeline.on('select', this.handleSelect);
      this.timeline.on('rangechanged', this.handleRangeChange);
      
      // Force fit to show all items
      if (timelineItems.length > 0) {
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
    },

    checkTimelineRendering() {
      const timelineElement = this.$refs.timeline;
      const visTimelineDiv = timelineElement.querySelector('.vis-timeline');
      const visItems = timelineElement.querySelectorAll('.vis-item');
      
      console.log('🔍 Final timeline check:', {
        visTimelineExists: !!visTimelineDiv,
        visItemsCount: visItems.length,
        timelineVisible: visTimelineDiv?.style.visibility !== 'hidden'
      });

      if (visItems.length === 0) {
        console.log('⚡ Applying aggressive timeline fixes...');
        
        // Force show timeline
        if (visTimelineDiv) {
          visTimelineDiv.style.visibility = 'visible !important';
          visTimelineDiv.style.opacity = '1 !important';
          visTimelineDiv.style.display = 'block !important';
        }
        
        // Safely remove loading screens that are still in DOM
        const loadingScreens = timelineElement.querySelectorAll('.vis-loading-screen');
        loadingScreens.forEach(screen => {
          if (screen.parentNode) {
            console.log('🗑️ Safely removing loading screen');
            screen.parentNode.removeChild(screen);
          }
        });
        
        // Safely force timeline refresh
        try {
          this.timeline.redraw();
          this.timeline.fit();
        } catch (error) {
          console.log('⚠️ Timeline redraw error (expected):', error.message);
        }
        
        // One more check after 1 second
        setTimeout(() => {
          const finalItems = timelineElement.querySelectorAll('.vis-item');
          console.log('🏁 Final check - vis items found:', finalItems.length);
          
          if (finalItems.length === 0) {
            console.error('🚨 Timeline failed to render items completely');
          } else {
            console.log('✅ Timeline finally rendered successfully!');
          }
        }, 1000);
      } else {
        console.log('✅ Timeline rendered successfully with', visItems.length, 'items');
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
  overflow: visible;  /* Changed from hidden to allow timeline to render */
  position: relative;
  z-index: 1;
}

.timeline-vis {
  width: 100% !important;
  min-height: 500px !important;
  height: 500px !important;
  border-bottom: 1px solid #eee;
  background-color: #fff !important;
  overflow: visible !important;
  position: relative !important;
  /* Force layout */
  display: block !important;
  box-sizing: border-box !important;
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

/* AGGRESSIVE: Force vis-timeline container visibility and layout */
:deep(.vis-timeline) {
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  width: 100% !important;
  height: 500px !important;
  position: relative !important;
  background: white !important;
}

/* CRITICAL: Override any hidden states */
:deep(.vis-timeline[style*="visibility: hidden"]) {
  visibility: visible !important;
}

:deep(.vis-timeline[style*="display: none"]) {
  display: block !important;
}

/* Don't hide loading screens with CSS - let vis-timeline handle them properly */

:deep(.vis-panel) {
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
}

:deep(.vis-panel.vis-center) {
  background: white !important;
}

:deep(.vis-panel.vis-bottom) {
  background: white !important;
  height: auto !important;
}

/* Ensure axis is visible */
:deep(.vis-time-axis) {
  background: #f8f9fa !important;
  border-top: 1px solid #e9ecef !important;
}

/* Styles spécifiques pour la timeline */
:deep(.vis-item) {
  border-radius: 4px;
  border-width: 2px;
  font-size: 0.9em;
  color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  visibility: visible !important;
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
