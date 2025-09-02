/**
 * Sheet service orchestrator - coordinates data fetching and parsing
 */
import { extractGoogleSheetId, fetchGoogleSheetData } from './dataFetchers/googleSheets.js';
import { extractFramacalcId, fetchFramacalcData } from './dataFetchers/framacalc.js';
import { fetchLocalCSV } from './dataFetchers/localCSV.js';
import { parseCSVData } from './parsers/csvParser.js';
import { parseSheetData } from './parsers/timelineParser.js';

/**
 * Fetches sheet data from URL or local file and returns timeline-formatted data
 * @param {string} url - Sheet URL or local filename
 * @param {Object} options - Additional options
 * @param {string} options.apiKey - Google API key (optional)
 * @returns {Promise<Array<Object>>} Timeline-formatted data
 */
export const fetchSheetData = async (url, options = {}) => {
  console.log('fetchSheetData called with URL:', url);
  
  try {
    if (!url) {
      throw new Error('No URL provided');
    }

    const cleanUrl = url.trim();
    
    // Handle local CSV files
    if (cleanUrl.toLowerCase().endsWith('.csv')) {
      console.log('Detected local CSV file');
      const csvData = await fetchLocalCSV(cleanUrl);
      const parsedData = parseCSVData(csvData);
      return parseSheetData([Object.keys(parsedData[0] || {}), ...parsedData.map(Object.values)]);
    }

    // Handle Google Sheets
    const googleSheetId = extractGoogleSheetId(cleanUrl);
    if (googleSheetId) {
      console.log('Detected Google Sheets, ID:', googleSheetId);
      const csvText = await fetchGoogleSheetData(googleSheetId, options.apiKey);
      const parsedData = parseCSVData(csvText);
      return parseSheetData([Object.keys(parsedData[0] || {}), ...parsedData.map(Object.values)]);
    }

    // Handle Framacalc
    const framacalcId = extractFramacalcId(cleanUrl);
    if (framacalcId) {
      console.log('Detected Framacalc sheet, ID:', framacalcId);
      const csvData = await fetchFramacalcData(framacalcId);
      const parsedData = parseCSVData(csvData);
      return parseSheetData([Object.keys(parsedData[0] || {}), ...parsedData.map(Object.values)]);
    }

    // Unrecognized format
    const errorMsg = 'Unrecognized spreadsheet format. Use Google Sheets, Framacalc, or CSV file.';
    console.error(errorMsg, { url: cleanUrl });
    throw new Error(errorMsg);
  } catch (error) {
    console.error('Error in fetchSheetData:', {
      error: error.message,
      stack: error.stack,
      url: url,
      options: options
    });
    throw error;
  }
};

// Re-export functions from parsers for convenience
export { filterTimelineData, sortTimelineData } from './parsers/timelineParser.js';

// Default export for backward compatibility
import { filterTimelineData, sortTimelineData } from './parsers/timelineParser.js';

export default {
  fetchSheetData,
  filterTimelineData,
  sortTimelineData
};
