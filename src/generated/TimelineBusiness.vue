<template>
  <div class="timeline-business">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Chargement de la frise chronologique...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <div v-else class="timeline-container">
      <!-- Contrôles de la timeline -->
      <div class="timeline-controls">
        <div class="controls-group">
          <button @click="zoomIn" class="btn btn-sm">
            <i class="icon-zoom-in"></i> Zoom +
          </button>
          <button @click="zoomOut" class="btn btn-sm">
            <i class="icon-zoom-out"></i> Zoom -
          </button>
          <button @click="resetZoom" class="btn btn-sm">
            <i class="icon-reset"></i> Reset
          </button>
        </div>
        
        <div class="controls-group">
          <button @click="exportTimeline('png')" class="btn btn-sm">
            <i class="icon-download"></i> PNG
          </button>
          <button @click="exportTimeline('svg')" class="btn btn-sm">
            <i class="icon-download"></i> SVG
          </button>
        </div>
      </div>
      
      <!-- Container de la timeline -->
      <div ref="timelineContainer" class="timeline-vis"></div>
      
      <!-- Informations sur la sélection -->
      <div v-if="selectedItem" class="selection-info">
        <h4>{{ selectedItem.content }}</h4>
        <p>{{ formatDate(selectedItem.start) }} - {{ selectedItem.end ? formatDate(selectedItem.end) : 'En cours' }}</p>
        <div v-if="selectedItem.description" class="description">
          {{ selectedItem.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue';
import { Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.css';

export default {
  name: 'TimelineBusiness',
  props: {
    items: {
      type: Array,
      required: true,
      default: () => []
    },
    options: {
      type: Object,
      default: () => ({
  "responsive": true,
  "interactive": true,
  "animation": true,
  "export_formats": [
    "png",
    "svg",
    "pdf"
  ]
})
    },
    groups: {
      type: Array,
      default: () => []
    }
  },
  emits: ['select', 'rangechanged', 'timechanged'],
  setup(props, { emit }) {
    const timelineContainer = ref(null);
    const timeline = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const selectedItem = ref(null);
    
    // Configuration par défaut
    const defaultOptions = {
  "responsive": true,
  "interactive": true,
  "animation": true,
  "export_formats": [
    "png",
    "svg",
    "pdf"
  ]
};
    
    // Styles et couleurs
    const styles = undefined;
    
    // Initialisation de la timeline
    const initTimeline = async () => {
      if (!timelineContainer.value) return;
      
      try {
        loading.value = true;
        error.value = null;
        
        // Configuration spécifique à vis-timeline
        const timelineOptions = {
          ...defaultOptions,
          ...props.options
        };
        
        // Initialisation avec la bibliothèque vis-timeline
        timeline.value = await initializeTimelineLibrary(
          timelineContainer.value,
          props.items,
          timelineOptions,
          props.groups
        );
        
        // Gestionnaires d'événements
        setupEventHandlers();
        
      } catch (err) {
        console.error('Erreur lors de l\'initialisation:', err);
        error.value = 'Erreur lors de l\'initialisation de la timeline';
      } finally {
        loading.value = false;
      }
    };
    
    // Configuration des événements
    const setupEventHandlers = () => {
      if (!timeline.value) return;
      
      // Événement de sélection
      timeline.value.on('select', (properties) => {
        if (properties.items && properties.items.length > 0) {
          const itemId = properties.items[0];
          const item = props.items.find(i => i.id === itemId);
          selectedItem.value = item;
          emit('select', properties);
        } else {
          selectedItem.value = null;
        }
      });
      
      // Événement de changement de plage
      timeline.value.on('rangechanged', (properties) => {
        emit('rangechanged', properties);
      });
      
      // Événement de changement de temps
      timeline.value.on('timechanged', (properties) => {
        emit('timechanged', properties);
      });
    };
    
    // Contrôles de zoom
    const zoomIn = () => {
      if (timeline.value && timeline.value.zoomIn) {
        timeline.value.zoomIn(0.2);
      }
    };
    
    const zoomOut = () => {
      if (timeline.value && timeline.value.zoomOut) {
        timeline.value.zoomOut(0.2);
      }
    };
    
    const resetZoom = () => {
      if (timeline.value && timeline.value.fit) {
        timeline.value.fit();
      }
    };
    
    // Export
    const exportTimeline = (format) => {
      if (!timeline.value) return;
      
      // Implémentation de l'export selon le format
      console.log(`Export en format ${format}`);
      // TODO: Implémenter l'export réel
    };
    
    // Formatage des dates
    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // Watchers
    watch(() => props.items, () => {
      if (timeline.value) {
        updateTimelineData();
      }
    }, { deep: true });
    
    const updateTimelineData = () => {
      if (timeline.value && timeline.value.setItems) {
        timeline.value.setItems(props.items);
      }
    };
    
    // Fonction d'initialisation spécifique à la bibliothèque
    const initializeTimelineLibrary = async (container, items, options, groups) => {
      // Cette fonction sera personnalisée selon la bibliothèque
      switch ('vis-timeline') {
        case 'vis-timeline':
          return initVisTimeline(container, items, options, groups);
        case 'd3js':
          return initD3Timeline(container, items, options, groups);
        case 'timelinejs':
          return initTimelineJS(container, items, options, groups);
        case 'chartjs':
          return initChartJS(container, items, options, groups);
        case 'plotlyjs':
          return initPlotlyJS(container, items, options, groups);
        default:
          throw new Error(`Bibliothèque non supportée: vis-timeline`);
      }
    };
    
    // Implémentations spécifiques par bibliothèque
    const initVisTimeline = (container, items, options, groups) => {
      const timeline = new Timeline(container, items, options);
      if (groups && groups.length > 0) {
        timeline.setGroups(groups);
      }
      return timeline;
    };
    
    const initD3Timeline = (container, items, options, groups) => {
      // Implémentation D3.js personnalisée
      const margin = { top: 20, right: 50, bottom: 30, left: 50 };
      const width = container.clientWidth - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
      
      const svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
      
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      // Échelles
      const xScale = d3.scaleTime()
        .domain(d3.extent(items, d => new Date(d.start)))
        .range([0, width]);
      
      const yScale = d3.scaleBand()
        .domain(items.map((d, i) => i))
        .range([0, height])
        .padding(0.1);
      
      // Axes
      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
      
      // Items
      g.selectAll('.timeline-item')
        .data(items)
        .enter().append('circle')
        .attr('class', 'timeline-item')
        .attr('cx', d => xScale(new Date(d.start)))
        .attr('cy', (d, i) => yScale(i) + yScale.bandwidth() / 2)
        .attr('r', 5)
        .style('fill', styles.colors[0]);
      
      return {
        on: (event, callback) => {
          if (event === 'select') {
            g.selectAll('.timeline-item').on('click', callback);
          }
        },
        zoomIn: () => {
          // Implémentation du zoom
        },
        zoomOut: () => {
          // Implémentation du zoom
        },
        fit: () => {
          // Reset du zoom
        },
        setItems: (newItems) => {
          // Mise à jour des données
        }
      };
    };
    
    const initTimelineJS = (container, items, options, groups) => {
      // Implémentation TimelineJS
      const timelineData = {
        events: items.map(item => ({
          start_date: {
            year: new Date(item.start).getFullYear(),
            month: new Date(item.start).getMonth() + 1,
            day: new Date(item.start).getDate()
          },
          end_date: item.end ? {
            year: new Date(item.end).getFullYear(),
            month: new Date(item.end).getMonth() + 1,
            day: new Date(item.end).getDate()
          } : null,
          text: {
            headline: item.content,
            text: item.description || ''
          }
        }))
      };
      
      const timeline = new TL.Timeline(container, timelineData, options);
      
      return {
        on: (event, callback) => {
          // Adapter les événements TimelineJS
        },
        zoomIn: () => {},
        zoomOut: () => {},
        fit: () => {},
        setItems: (newItems) => {
          // Mise à jour des données TimelineJS
        }
      };
    };
    
    const initChartJS = (container, items, options, groups) => {
      // Implémentation Chart.js pour timeline
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);
      
      const chart = new Chart(canvas, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Timeline',
            data: items.map(item => ({
              x: new Date(item.start),
              y: 1,
              label: item.content
            })),
            backgroundColor: styles.colors[0],
            borderColor: styles.colors[1]
          }]
        },
        options: {
          scales: {
            x: {
              type: 'time',
              time: {
                displayFormats: {
                  quarter: 'MMM YYYY'
                }
              }
            },
            y: {
              display: false
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                title: function(context) {
                  return context[0].raw.label;
                }
              }
            }
          }
        }
      });
      
      return {
        on: (event, callback) => {
          if (event === 'select') {
            canvas.onclick = callback;
          }
        },
        zoomIn: () => {
          chart.zoom(1.1);
        },
        zoomOut: () => {
          chart.zoom(0.9);
        },
        fit: () => {
          chart.resetZoom();
        },
        setItems: (newItems) => {
          chart.data.datasets[0].data = newItems.map(item => ({
            x: new Date(item.start),
            y: 1,
            label: item.content
          }));
          chart.update();
        }
      };
    };
    
    const initPlotlyJS = (container, items, options, groups) => {
      // Implémentation Plotly.js pour timeline
      const trace = {
        x: items.map(item => new Date(item.start)),
        y: items.map((item, index) => index),
        mode: 'markers+text',
        type: 'scatter',
        text: items.map(item => item.content),
        textposition: 'middle right',
        marker: {
          size: 10,
          color: styles.colors[0]
        }
      };
      
      const layout = {
        title: 'Timeline',
        xaxis: {
          type: 'date',
          title: 'Date'
        },
        yaxis: {
          title: 'Événements',
          showticklabels: false
        },
        hovermode: 'closest'
      };
      
      Plotly.newPlot(container, [trace], layout, {
        responsive: true,
        displayModeBar: true
      });
      
      return {
        on: (event, callback) => {
          if (event === 'select') {
            container.on('plotly_click', callback);
          }
        },
        zoomIn: () => {
          Plotly.relayout(container, {
            'xaxis.range': [
              // Calculer la nouvelle plage
            ]
          });
        },
        zoomOut: () => {
          Plotly.relayout(container, {
            'xaxis.autorange': true
          });
        },
        fit: () => {
          Plotly.relayout(container, {
            'xaxis.autorange': true,
            'yaxis.autorange': true
          });
        },
        setItems: (newItems) => {
          const newTrace = {
            x: newItems.map(item => new Date(item.start)),
            y: newItems.map((item, index) => index),
            text: newItems.map(item => item.content)
          };
          Plotly.restyle(container, newTrace, 0);
        }
      };
    };
    
    // Cycle de vie
    onMounted(async () => {
      await nextTick();
      await initTimeline();
    });
    
    return {
      timelineContainer,
      loading,
      error,
      selectedItem,
      zoomIn,
      zoomOut,
      resetZoom,
      exportTimeline,
      formatDate
    };
  }
};
</script>

<style scoped>
.timeline-business {
  width: 100%;
  height: 100%;
  position: relative;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: #dc3545;
  padding: 20px;
  text-align: center;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin: 20px 0;
}

.timeline-container {
  width: 100%;
}

.timeline-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.controls-group {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn:hover {
  background-color: #f5f5f5;
  border-color: #aaa;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 11px;
}

.timeline-vis {
  width: 100%;
  height: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.selection-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-left: 4px solid #007bff;
  border-radius: 4px;
}

.selection-info h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.selection-info p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.description {
  font-size: 14px;
  line-height: 1.5;
  color: #555;
}

/* Styles spécifiques selon le template */
.timeline-historical .timeline-vis {
  background: linear-gradient(to bottom, #faf7f2, #ffffff);
}

.timeline-scientific .timeline-vis {
  background: linear-gradient(to bottom, #f0f8ff, #ffffff);
}

.timeline-business .timeline-vis {
  background: linear-gradient(to bottom, #f0fff0, #ffffff);
}

.timeline-personal .timeline-vis {
  background: linear-gradient(to bottom, #f8f8ff, #ffffff);
}

.timeline-project .timeline-vis {
  background: linear-gradient(to bottom, #fff8dc, #ffffff);
}

/* Responsive */
@media (max-width: 768px) {
  .timeline-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .controls-group {
    justify-content: center;
  }
  
  .timeline-vis {
    height: 300px;
  }
}
</style>
