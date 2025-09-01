/**
 * Composable for URL state management
 */
import { ref, watch } from 'vue';

export function useUrlState() {
  const spreadsheetUrl = ref('');

  // Load initial URL from query parameters
  const loadFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    
    if (urlParam) {
      const url = decodeURIComponent(urlParam);
      spreadsheetUrl.value = url;
      return url;
    }
    return null;
  };

  // Update URL with spreadsheet parameter
  const updateUrlWithSpreadsheet = (url) => {
    const params = new URLSearchParams(window.location.search);
    if (url) {
      params.set('url', encodeURIComponent(url));
    } else {
      params.delete('url');
    }
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    spreadsheetUrl.value = url;
  };

  // Update URL with selected item
  const updateUrlWithSelection = (itemId) => {
    if (itemId) {
      window.location.hash = `event-${itemId}`;
    } else {
      window.location.hash = '';
    }
  };

  // Update URL with date range
  const updateUrlWithDateRange = (range) => {
    const params = new URLSearchParams(window.location.search);
    if (range) {
      params.set('start', range.start.toISOString());
      params.set('end', range.end.toISOString());
    } else {
      params.delete('start');
      params.delete('end');
    }
    
    const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState({}, '', newUrl);
  };

  // Get shareable link
  const getShareableLink = () => {
    return window.location.href.split('?')[0] + (spreadsheetUrl.value ? `?url=${encodeURIComponent(spreadsheetUrl.value)}` : '');
  };

  return {
    // State
    spreadsheetUrl,
    
    // Actions
    loadFromUrl,
    updateUrlWithSpreadsheet,
    updateUrlWithSelection,
    updateUrlWithDateRange,
    getShareableLink
  };
}