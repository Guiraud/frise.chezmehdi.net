/**
 * Environment configuration and validation
 */

/**
 * Required environment variables for the application to function
 */
const REQUIRED_ENV_VARS = [
  'VITE_APP_ENV',
  'VITE_APP_BASE_URL',
  'VITE_APP_NAME'
];

/**
 * Optional environment variables with default values
 */
const DEFAULT_VALUES = {
  VITE_DEBUG: 'false',
  VITE_DEFAULT_TIMELINE_HEIGHT: '500',
  VITE_MAX_TIMELINE_ITEMS: '1000',
  VITE_API_TIMEOUT: '8000', // 8 seconds - reduced from dangerous 30s
  VITE_GOOGLE_SHEETS_API_ENABLED: 'true',
  VITE_FRAMACALC_API_ENABLED: 'true',
  VITE_LOCAL_CSV_ENABLED: 'true'
};

/**
 * Environment variable validation rules
 */
const VALIDATION_RULES = {
  VITE_APP_ENV: (value) => ['development', 'staging', 'production'].includes(value),
  VITE_APP_BASE_URL: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  VITE_DEFAULT_TIMELINE_HEIGHT: (value) => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 200 && num <= 2000;
  },
  VITE_MAX_TIMELINE_ITEMS: (value) => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 10 && num <= 10000;
  },
  VITE_API_TIMEOUT: (value) => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 1000 && num <= 10000; // 1-10 seconds max (15s was dangerous)
  },
  VITE_DEBUG: (value) => ['true', 'false'].includes(value.toLowerCase())
};

/**
 * Validates all environment variables
 * @throws {Error} If validation fails
 */
export const validateEnvironment = () => {
  const errors = [];
  
  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = import.meta.env[envVar];
    if (!value) {
      errors.push(`Missing required environment variable: ${envVar}`);
    } else if (VALIDATION_RULES[envVar] && !VALIDATION_RULES[envVar](value)) {
      errors.push(`Invalid value for ${envVar}: ${value}`);
    }
  }
  
  // Validate optional variables if present
  for (const [envVar, validator] of Object.entries(VALIDATION_RULES)) {
    const value = import.meta.env[envVar];
    if (value && !validator(value)) {
      errors.push(`Invalid value for ${envVar}: ${value}`);
    }
  }
  
  if (errors.length > 0) {
    const errorMessage = `Environment validation failed:\n${errors.join('\n')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  console.log('✅ Environment validation passed');
  return true;
};

/**
 * Gets environment configuration with defaults applied
 */
export const getConfig = () => {
  const config = {};
  
  // Apply defaults for missing optional variables
  for (const [key, defaultValue] of Object.entries(DEFAULT_VALUES)) {
    config[key] = import.meta.env[key] || defaultValue;
  }
  
  // Add all other environment variables
  for (const key of Object.keys(import.meta.env)) {
    if (key.startsWith('VITE_')) {
      config[key] = import.meta.env[key];
    }
  }
  
  return config;
};

/**
 * Type conversion utilities
 */
export const getConfigValue = {
  string: (key) => getConfig()[key] || '',
  number: (key) => parseInt(getConfig()[key] || '0', 10),
  boolean: (key) => getConfig()[key]?.toLowerCase() === 'true',
  url: (key) => {
    const value = getConfig()[key];
    try {
      return new URL(value);
    } catch {
      throw new Error(`Invalid URL for ${key}: ${value}`);
    }
  }
};

/**
 * Environment-specific configurations
 */
export const isDevelopment = () => getConfig().VITE_APP_ENV === 'development';
export const isStaging = () => getConfig().VITE_APP_ENV === 'staging';
export const isProduction = () => getConfig().VITE_APP_ENV === 'production';
export const isDebugEnabled = () => getConfigValue.boolean('VITE_DEBUG');

// Log environment info (safe for production)
console.log(`🚀 Application starting in ${getConfig().VITE_APP_ENV} mode`);
if (isDebugEnabled()) {
  console.log('🐛 Debug mode enabled');
}