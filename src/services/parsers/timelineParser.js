/**
 * Timeline data parser and formatter
 */

/**
 * Parses raw sheet data into timeline format
 * @param {Array<Array>} rows - Raw sheet rows
 * @returns {Array<Object>} Timeline-formatted data
 */
export const parseSheetData = (rows) => {
  if (!rows || rows.length === 0) return [];
  
  // First row contains headers
  const headers = rows[0].map(h => h.trim().toLowerCase());
  
  // Validate required columns
  const requiredColumns = ['type', 'date_début', 'titre'];
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }
  
  // Process data rows
  return rows.slice(1).map((row, index) => {
    const item = {};
    
    headers.forEach((header, i) => {
      if (row[i] !== undefined) {
        item[header] = row[i];
      } else {
        item[header] = '';
      }
    });
    
    // Add unique ID if not provided
    if (!item.id) {
      item.id = `item-${index + 1}`;
    }
    
    // Normalize types
    if (item.type) {
      item.type = item.type.trim().toLowerCase();
    }
    
    // Format dates
    if (item.date_début) {
      item.start = new Date(item.date_début).toISOString();
    }
    
    if (item.date_fin) {
      item.end = new Date(item.date_fin).toISOString();
    } else if (item.date_début) {
      // If no end date, use start date
      item.end = new Date(item.date_début).toISOString();
    }
    
    // Determine CSS class based on type
    item.className = getEventTypeClass(item.type);
    
    return item;
  }).filter(item => item.start); // Filter items without valid start date
};

/**
 * Gets CSS class for event type
 * @param {string} type - Event type
 * @returns {string} CSS class name
 */
export const getEventTypeClass = (type) => {
  const typeClassMap = {
    'événement_contextuel': 'event-context',
    'événement_déclencheur': 'event-trigger',
    'période_contextuelle': 'period-context',
    'période_activité': 'period-activity'
  };
  
  return typeClassMap[type] || '';
};

/**
 * Filters timeline data based on search query
 * @param {Array<Object>} data - Timeline data
 * @param {string} query - Search query
 * @returns {Array<Object>} Filtered data
 */
export const filterTimelineData = (data, query) => {
  if (!query) return data;
  
  const searchTerm = query.toLowerCase();
  
  return data.filter(item => {
    return (
      (item.titre && item.titre.toLowerCase().includes(searchTerm)) ||
      (item.description && item.description.toLowerCase().includes(searchTerm)) ||
      (item.type && item.type.toLowerCase().includes(searchTerm))
    );
  });
};

/**
 * Sorts timeline data by start date
 * @param {Array<Object>} data - Timeline data
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array<Object>} Sorted data
 */
export const sortTimelineData = (data, order = 'asc') => {
  return [...data].sort((a, b) => {
    const dateA = new Date(a.start);
    const dateB = new Date(b.start);
    
    if (order === 'asc') {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });
};