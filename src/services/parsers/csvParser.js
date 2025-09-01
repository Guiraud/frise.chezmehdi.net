/**
 * CSV data parser
 */

/**
 * Parses CSV data into array of objects
 * @param {string} csvData - Raw CSV data
 * @returns {Array<Object>} Parsed data
 */
export const parseCSVData = (csvData) => {
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) return [];
  
  // Detect delimiter (comma or semicolon)
  const delimiter = lines[0].includes(';') ? ';' : ',';
  
  // Extract headers
  const headers = lines[0]
    .split(delimiter)
    .map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  
  // Process data rows
  return lines.slice(1).map((line, index) => {
    const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    const item = {};
    
    headers.forEach((header, i) => {
      if (values[i] !== undefined) {
        item[header] = values[i];
      } else {
        item[header] = '';
      }
    });
    
    // Add unique ID if not provided
    if (!item.id) {
      item.id = `item-${index + 1}`;
    }
    
    return item;
  });
};