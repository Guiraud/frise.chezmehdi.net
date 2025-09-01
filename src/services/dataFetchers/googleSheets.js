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
 * Fetches data from Google Sheets using CSV export
 * @param {string} sheetId - Google Sheets ID
 * @param {string} apiKey - Google API key (optional, not used with CSV method)
 * @returns {Promise<Array<Array>>} Raw sheet data
 */
export const fetchGoogleSheetData = async (sheetId, apiKey = '') => {
  const startTime = performance.now();
  // Use CSV export URL which works without API key for public sheets
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
  
  // Import performance monitor dynamically to avoid circular deps
  const { default: performanceMonitor } = await import('../../utils/performanceMonitor.js');
  
  try {
    console.log('Fetching Google Sheets via CSV export:', csvUrl);
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      const endTime = performance.now();
      performanceMonitor.trackApiCall('google', csvUrl, startTime, endTime, false, `HTTP Error: ${response.status}`);
      
      if (response.status === 403) {
        throw new Error('Unable to access Google Sheets. Make sure the document is shared publicly with "Anyone with the link" can view.');
      }
      
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const csvText = await response.text();
    const endTime = performance.now();
    
    performanceMonitor.trackApiCall('google', csvUrl, startTime, endTime, true);
    
    // Parse CSV text into array of arrays
    const lines = csvText.split('\n').filter(line => line.trim());
    const data = lines.map(line => {
      // Simple CSV parsing - handle quoted values
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      // Add the last field
      result.push(current.trim());
      
      return result;
    });
    
    console.log('Successfully parsed Google Sheets CSV data:', data.length, 'rows');
    return data;
    
  } catch (error) {
    const endTime = performance.now();
    
    // Track timeout specifically
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      performanceMonitor.trackTimeout('google', csvUrl, 8000);
    }
    
    performanceMonitor.trackApiCall('google', csvUrl, startTime, endTime, false, error.message);
    performanceMonitor.trackError('fetch_error', error.message, 'googleSheets', { sheetId, csvUrl });
    
    console.error('Error fetching Google Sheets data:', error);
    
    // If it's already our custom error message, re-throw it
    if (error.message.includes('shared publicly')) {
      throw error;
    }
    
    throw new Error('Unable to load data from Google Sheets. Check the URL and ensure the document is public.');
  }
};