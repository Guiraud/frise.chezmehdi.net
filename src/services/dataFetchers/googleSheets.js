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
    console.log('Extracting ID from URL:', url);
    
    // Format 1: https://docs.google.com/spreadsheets/d/ID/
    const match1 = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match1) {
      console.log('Extracted Sheet ID:', match1[1]);
      return match1[1];
    }
    
    // Format 2: https://docs.google.com/spreadsheets/d/ID/edit#gid=0
    const match2 = url.match(/[\/&]key=([^&#]+)/);
    if (match2) {
      console.log('Extracted Sheet ID (key format):', match2[1]);
      return match2[1];
    }
    
    console.log('No valid Google Sheets ID found in URL');
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
        throw new Error('❌ Google Sheets access denied. The document must be shared publicly.\n\n📋 Follow these steps:\n1. Open your Google Sheet\n2. Click "Share" (top right)\n3. Change access to "Anyone with the link"\n4. Set permission to "Viewer"\n5. Try again');
      }
      
      throw new Error(`❌ Cannot access Google Sheets (HTTP ${response.status}). Make sure the document is shared publicly.`);
    }

    const csvText = await response.text();
    
    // Check if we got HTML instead of CSV (redirect or login page)
    if (csvText.trim().toLowerCase().startsWith('<html') || csvText.includes('Temporary Redirect')) {
      const endTime = performance.now();
      performanceMonitor.trackApiCall('google', csvUrl, startTime, endTime, false, 'HTML Response (Not Public)');
      throw new Error('❌ Google Sheet is not publicly accessible.\n\n📋 To fix this:\n1. Open your Google Sheet\n2. Click "Share" button (top right)\n3. Change "Restricted" to "Anyone with the link"\n4. Set permission to "Viewer"\n5. Try again with the same URL');
    }
    
    const endTime = performance.now();
    
    performanceMonitor.trackApiCall('google', csvUrl, startTime, endTime, true);
    
    console.log('Successfully fetched Google Sheets CSV data');
    return csvText;
    
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