/**
 * Framacalc data fetcher
 */

/**
 * Extracts Framacalc sheet ID from URL
 * @param {string} url - Framacalc URL
 * @returns {string|null} Sheet ID or null if not found
 */
export const extractFramacalcId = (url) => {
  try {
    const urlObj = new URL(url);
    
    // Format: https://framacalc.org/ID
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      return pathParts[0];
    }
    
    return null;
  } catch (e) {
    console.error('Error extracting Framacalc ID:', e);
    return null;
  }
};

/**
 * Fetches data from Framacalc
 * @param {string} sheetId - Framacalc sheet ID
 * @returns {Promise<string>} CSV data
 */
export const fetchFramacalcData = async (sheetId) => {
  const startTime = performance.now();
  const apiUrl = `https://framacalc.org/${sheetId}/csv`;
  
  // Import performance monitor dynamically to avoid circular deps
  const { default: performanceMonitor } = await import('../../utils/performanceMonitor.js');
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const endTime = performance.now();
      performanceMonitor.trackApiCall('framacalc', apiUrl, startTime, endTime, false, `HTTP Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.text();
    const endTime = performance.now();
    
    performanceMonitor.trackApiCall('framacalc', apiUrl, startTime, endTime, true);
    
    return data;
  } catch (error) {
    const endTime = performance.now();
    
    // Track timeout specifically
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      performanceMonitor.trackTimeout('framacalc', apiUrl, 8000);
    }
    
    performanceMonitor.trackApiCall('framacalc', apiUrl, startTime, endTime, false, error.message);
    performanceMonitor.trackError('fetch_error', error.message, 'framacalc', { sheetId, apiUrl });
    
    console.error('Error fetching Framacalc data:', error);
    throw new Error('Unable to load data from Framacalc. Check the URL and ensure the document is public.');
  }
};