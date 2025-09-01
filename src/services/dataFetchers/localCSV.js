/**
 * Local CSV file fetcher
 */

/**
 * Fetches local CSV file from public directory
 * @param {string} filename - CSV filename
 * @returns {Promise<string>} CSV data
 */
export const fetchLocalCSV = async (filename) => {
  const startTime = performance.now();
  
  // Import performance monitor dynamically to avoid circular deps
  const { default: performanceMonitor } = await import('../../utils/performanceMonitor.js');
  
  try {
    console.log('Loading local file:', filename);
    
    // Clean filename to prevent directory traversal attacks
    const cleanFilename = filename.replace(/^[\\/]/, '');
    const fileUrl = `/${cleanFilename}`;
    
    console.log('Cleaned file URL:', fileUrl);
    
    // Validate CSV extension
    if (!fileUrl.toLowerCase().endsWith('.csv')) {
      const endTime = performance.now();
      performanceMonitor.trackApiCall('local', fileUrl, startTime, endTime, false, 'Invalid file extension');
      throw new Error('File must have .csv extension');
    }
    
    // Fetch file content
    console.log('HTTP request to:', fileUrl);
    const response = await fetch(fileUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Response received, status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      const endTime = performance.now();
      performanceMonitor.trackApiCall('local', fileUrl, startTime, endTime, false, `HTTP Error: ${response.status} - ${response.statusText}`);
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }
    
    const csvData = await response.text();
    const endTime = performance.now();
    
    console.log('Raw CSV data received:', csvData.substring(0, 200) + '...');
    
    performanceMonitor.trackApiCall('local', fileUrl, startTime, endTime, true);
    
    return csvData;
  } catch (error) {
    const endTime = performance.now();
    
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      performanceMonitor.trackTimeout('local', filename, 8000);
    }
    
    performanceMonitor.trackApiCall('local', filename, startTime, endTime, false, error.message);
    performanceMonitor.trackError('fetch_error', error.message, 'localCSV', { filename });
    
    console.error('Error loading local CSV file:', error);
    throw new Error(`Unable to load CSV file: ${error.message}`);
  }
};