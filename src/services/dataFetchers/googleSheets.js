/**
 * Google Sheets data fetcher
 */

/**
 * Extracts Google Sheet ID from URL
 * @param {string} url - Google Sheets URL
 * @returns {string|null} Sheet ID or null if not found
 */
export const extractGoogleSheetId = (url) => {
  try {
    // Format 1: https://docs.google.com/spreadsheets/d/ID/
    const match1 = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match1) return match1[1];
    
    // Format 2: https://docs.google.com/spreadsheets/d/ID/edit#gid=0
    const match2 = url.match(/[\/&]key=([^&#]+)/);
    if (match2) return match2[1];
    
    return null;
  } catch (e) {
    console.error('Error extracting Google Sheets ID:', e);
    return null;
  }
};

/**
 * Fetches data from Google Sheets
 * @param {string} sheetId - Google Sheets ID
 * @param {string} apiKey - Google API key (optional)
 * @returns {Promise<Array<Array>>} Raw sheet data
 */
export const fetchGoogleSheetData = async (sheetId, apiKey = '') => {
  const startTime = performance.now();
  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`;
  
  // Import performance monitor dynamically to avoid circular deps
  const { default: performanceMonitor } = await import('../../utils/performanceMonitor.js');
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const endTime = performance.now();
      performanceMonitor.trackApiCall('google', apiUrl, startTime, endTime, false, `HTTP Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.json();
    const endTime = performance.now();
    
    performanceMonitor.trackApiCall('google', apiUrl, startTime, endTime, true);
    
    return data.values || [];
  } catch (error) {
    const endTime = performance.now();
    
    // Track timeout specifically
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      performanceMonitor.trackTimeout('google', apiUrl, 8000); // Current timeout value
    }
    
    performanceMonitor.trackApiCall('google', apiUrl, startTime, endTime, false, error.message);
    performanceMonitor.trackError('fetch_error', error.message, 'googleSheets', { sheetId, apiUrl });
    
    console.error('Error fetching Google Sheets data:', error);
    throw new Error('Unable to load data from Google Sheets. Check the URL and ensure the document is public.');
  }
};