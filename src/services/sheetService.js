/**
 * Service pour la récupération et le traitement des données depuis des tableurs en ligne
 */

/**
 * Extrait l'ID d'une feuille Google Sheets depuis une URL
 * @param {string} url - L'URL de la feuille Google Sheets
 * @returns {string|null} L'ID de la feuille ou null si non trouvé
 */
const extractGoogleSheetId = (url) => {
  try {
    // Format 1: https://docs.google.com/spreadsheets/d/ID/
    const match1 = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match1) return match1[1];
    
    // Format 2: https://docs.google.com/spreadsheets/d/ID/edit#gid=0
    const match2 = url.match(/[\/&]key=([^&#]+)/);
    if (match2) return match2[1];
    
    return null;
  } catch (e) {
    console.error('Erreur lors de l\'extraction de l\'ID Google Sheets:', e);
    return null;
  }
};

/**
 * Extrait l'ID d'une feuille Framacalc depuis une URL
 * @param {string} url - L'URL de la feuille Framacalc
 * @returns {string|null} L'ID de la feuille ou null si non trouvé
 */
const extractFramacalcId = (url) => {
  try {
    const urlObj = new URL(url);
    
    // Format: https://framacalc.org/ID
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      return pathParts[0];
    }
    
    return null;
  } catch (e) {
    console.error('Erreur lors de l\'extraction de l\'ID Framacalc:', e);
    return null;
  }
};

/**
 * Récupère les données d'une feuille Google Sheets
 * @param {string} sheetId - L'ID de la feuille Google Sheets
 * @param {string} apiKey - Clé API Google (optionnelle, nécessaire pour les feuilles privées)
 * @returns {Promise<Array<Object>>} Les données de la feuille
 */
const fetchGoogleSheetData = async (sheetId, apiKey = '') => {
  try {
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return parseSheetData(data.values || []);
  } catch (error) {
    console.error('Erreur lors de la récupération des données Google Sheets:', error);
    throw new Error('Impossible de charger les données depuis Google Sheets. Vérifiez l\'URL et assurez-vous que le document est public.');
  }
};

/**
 * Récupère les données d'une feuille Framacalc
 * @param {string} sheetId - L'ID de la feuille Framacalc
 * @returns {Promise<Array<Object>>} Les données de la feuille
 */
const fetchFramacalcData = async (sheetId) => {
  try {
    // Framacalc fournit une API simple qui renvoie les données au format CSV
    const response = await fetch(`https://framacalc.org/${sheetId}/csv`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const csvData = await response.text();
    return parseCSVData(csvData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données Framacalc:', error);
    throw new Error('Impossible de charger les données depuis Framacalc. Vérifiez l\'URL et assurez-vous que le document est public.');
  }
};

/**
 * Parse les données brutes d'une feuille de calcul au format tableau 2D
 * @param {Array<Array>} rows - Les lignes de la feuille de calcul
 * @returns {Array<Object>} Les données formatées
 */
const parseSheetData = (rows) => {
  if (!rows || rows.length === 0) return [];
  
  // La première ligne contient les en-têtes
  const headers = rows[0].map(h => h.trim().toLowerCase());
  
  // Vérification des colonnes requises
  const requiredColumns = ['type', 'date_début', 'titre'];
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    throw new Error(`Colonnes requises manquantes: ${missingColumns.join(', ')}`);
  }
  
  // Traitement des lignes de données
  return rows.slice(1).map((row, index) => {
    const item = {};
    
    headers.forEach((header, i) => {
      if (row[i] !== undefined) {
        item[header] = row[i];
      } else {
        item[header] = '';
      }
    });
    
    // Ajout d'un ID unique si non fourni
    if (!item.id) {
      item.id = `item-${index + 1}`;
    }
    
    // Normalisation des types
    if (item.type) {
      item.type = item.type.trim().toLowerCase();
    }
    
    // Formatage des dates
    if (item.date_début) {
      item.start = new Date(item.date_début).toISOString();
    }
    
    if (item.date_fin) {
      item.end = new Date(item.date_fin).toISOString();
    } else if (item.date_début) {
      // Si pas de date de fin, utiliser la date de début
      item.end = new Date(item.date_début).toISOString();
    }
    
    // Détermination de la classe CSS en fonction du type
    switch (item.type) {
      case 'événement_contextuel':
        item.className = 'event-context';
        break;
      case 'événement_déclencheur':
        item.className = 'event-trigger';
        break;
      case 'période_contextuelle':
        item.className = 'period-context';
        break;
      case 'période_activité':
        item.className = 'period-activity';
        break;
      default:
        item.className = '';
    }
    
    return item;
  }).filter(item => item.start); // Filtrer les éléments sans date de début valide
};

/**
 * Parse les données CSV en tableau d'objets
 * @param {string} csvData - Les données CSV brutes
 * @returns {Array<Object>} Les données formatées
 */
const parseCSVData = (csvData) => {
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) return [];
  
  // Détection du séparateur (virgule ou point-virgule)
  const delimiter = lines[0].includes(';') ? ';' : ',';
  
  // Extraction des en-têtes
  const headers = lines[0]
    .split(delimiter)
    .map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  
  // Traitement des lignes de données
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
    
    // Ajout d'un ID unique si non fourni
    if (!item.id) {
      item.id = `item-${index + 1}`;
    }
    
    return item;
  });
};

/**
 * Charge un fichier CSV local
 * @param {string} filename - Le nom du fichier CSV dans le répertoire public
 * @returns {Promise<Array<Object>>} Les données du fichier CSV
 */
/**
 * Charge un fichier CSV local depuis le répertoire public
 * @param {string} filename - Le nom du fichier CSV à charger
 * @returns {Promise<Array<Object>>} Les données parsées du fichier CSV
 */
const fetchLocalCSV = async (filename) => {
  try {
    console.log('Tentative de chargement du fichier local:', filename);
    
    // Nettoyer le nom de fichier pour éviter les attaques par traversée de répertoire
    const cleanFilename = filename.replace(/^[\\/]/, ''); // Supprimer uniquement le premier / ou \\
    
    // Construire l'URL du fichier dans le répertoire public
    const fileUrl = `/${cleanFilename}`;
    
    console.log('URL du fichier nettoyé:', fileUrl);
    
    // Vérifier que le fichier a l'extension .csv
    if (!fileUrl.toLowerCase().endsWith('.csv')) {
      throw new Error('Le fichier doit avoir l\'extension .csv');
    }
    
    // Récupérer le contenu du fichier
    console.log('Requête HTTP vers:', fileUrl);
    const response = await fetch(fileUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Réponse reçue, statut:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse:', errorText);
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const csvData = await response.text();
    console.log('Données CSV brutes reçues:', csvData.substring(0, 200) + '...');
    
    const parsedData = parseCSVData(csvData);
    console.log('Données parsées:', parsedData);
    
    return parsedData;
  } catch (error) {
    console.error('Erreur lors du chargement du fichier CSV local:', error);
    throw new Error(`Impossible de charger le fichier CSV: ${error.message}`);
  }

};

/**
 * Récupère les données d'une feuille de calcul à partir de son URL ou d'un fichier local
 * @param {string} url - L'URL de la feuille de calcul ou le nom du fichier local
 * @param {Object} options - Options supplémentaires
 * @param {string} options.apiKey - Clé API Google (optionnelle)
 * @returns {Promise<Array<Object>>} Les données de la feuille de calcul
 */
const fetchSheetData = async (url, options = {}) => {
  console.log('fetchSheetData appelé avec URL:', url);
  
  try {
    // Vérifier si l'URL est vide
    if (!url) {
      throw new Error('Aucune URL fournie');
    }

    // Nettoyer l'URL
    const cleanUrl = url.trim();
    
    // Vérifier si c'est un fichier CSV local
    if (cleanUrl.toLowerCase().endsWith('.csv')) {
      console.log('Détection d\'un fichier CSV local');
      return await fetchLocalCSV(cleanUrl);
    }

    // Vérifier si c'est une URL Google Sheets
    const googleSheetId = extractGoogleSheetId(cleanUrl);
    if (googleSheetId) {
      console.log('Détection d\'une feuille Google Sheets, ID:', googleSheetId);
      return await fetchGoogleSheetData(googleSheetId, options);
    }

    // Vérifier si c'est une URL Framacalc
    const framacalcId = extractFramacalcId(cleanUrl);
    if (framacalcId) {
      console.log('Détection d\'une feuille Framacalc, ID:', framacalcId);
      return await fetchFramacalcData(framacalcId);
    }

    // Si on arrive ici, le format n'est pas reconnu
    const errorMsg = 'Format de feuille de calcul non reconnu. Utilisez un lien Google Sheets, Framacalc ou un fichier CSV.';
    console.error(errorMsg, { url: cleanUrl });
    throw new Error(errorMsg);
  } catch (error) {
    console.error('Erreur dans fetchSheetData:', {
      error: error.message,
      stack: error.stack,
      url: url,
      options: options
    });
    throw error; // Propage l'erreur pour qu'elle puisse être gérée par le composant appelant
  }
};

/**
 * Filtre les données de la timeline en fonction d'une requête de recherche
 * @param {Array<Object>} data - Les données à filtrer
 * @param {string} query - La requête de recherche
 * @returns {Array<Object>} Les données filtrées
 */
const filterTimelineData = (data, query) => {
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
 * Trie les données de la timeline par date de début
 * @param {Array<Object>} data - Les données à trier
 * @param {string} order - L'ordre de tri ('asc' ou 'desc')
 * @returns {Array<Object>} Les données triées
 */
const sortTimelineData = (data, order = 'asc') => {
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

// Exporter les fonctions individuellement pour l'importation nommée
export { fetchSheetData, filterTimelineData, sortTimelineData };

// Exporter aussi par défaut pour la rétrocompatibilité
export default {
  fetchSheetData,
  filterTimelineData,
  sortTimelineData
};
