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
    
    // Format 1: Published sheets - https://docs.google.com/spreadsheets/d/e/LONG_ID/pubhtml
    const publishedMatch = url.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
    if (publishedMatch) {
      console.log('Extracted Published Sheet ID:', publishedMatch[1]);
      return publishedMatch[1];
    }
    
    // Format 2: Regular sheets - https://docs.google.com/spreadsheets/d/ID/
    const regularMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (regularMatch) {
      console.log('Extracted Regular Sheet ID:', regularMatch[1]);
      return regularMatch[1];
    }
    
    // Format 3: Key parameter format - https://docs.google.com/spreadsheets/?key=ID
    const keyMatch = url.match(/[\/&]key=([^&#]+)/);
    if (keyMatch) {
      console.log('Extracted Sheet ID (key format):', keyMatch[1]);
      return keyMatch[1];
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
export const fetchGoogleSheetData = async (sheetId, apiKey = '', originalUrl = '') => {
  const startTime = performance.now();
  
  // Extract gid parameter from original URL if present
  const gidMatch = originalUrl.match(/[?&]gid=([^&#]+)/);
  const gid = gidMatch ? gidMatch[1] : '0';
  
  // Determine if this is a published sheet ID (long format starting with 2PACX)
  const isPublishedSheet = sheetId.startsWith('2PACX-');
  
  // Use appropriate CSV export URL format
  const csvUrl = isPublishedSheet 
    ? `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv&gid=${gid}`
    : `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  
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