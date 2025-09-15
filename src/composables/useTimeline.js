/**
 * Composable for timeline data management
 */
import { ref, computed } from 'vue';
import { fetchSheetData, filterTimelineData } from '../services/sheetService';

export function useTimeline() {
  const timelineData = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const searchQuery = ref('');

  // Computed filtered data
  const filteredData = computed(() => {
    return filterTimelineData(timelineData.value, searchQuery.value);
  });

  // Load timeline data from URL
  const loadTimelineData = async (url) => {
    if (!url) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const data = await fetchSheetData(url);
      timelineData.value = data;
      return data;
    } catch (err) {
      console.error('Error loading timeline data:', err);
      error.value = 'Error loading data: ' + (err.message || 'An error occurred');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Clear timeline data
  const clearTimeline = () => {
    timelineData.value = [];
    error.value = null;
    searchQuery.value = '';
  };

  return {
    // State - use raw data for timeline component to avoid readonly computed issues
    timelineData: computed(() => filterTimelineData(timelineData.value, searchQuery.value)),
    rawTimelineData: timelineData,
    loading,
    error,
    searchQuery,
    
    // Actions
    loadTimelineData,
    clearTimeline,
    
    // Add method to get filtered data without reactivity issues
    getFilteredData: () => filterTimelineData(timelineData.value, searchQuery.value)
  };
}