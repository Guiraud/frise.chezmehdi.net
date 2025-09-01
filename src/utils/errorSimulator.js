/**
 * Error simulation utilities for testing error boundaries
 * Only available in development mode
 */

import { isDebugEnabled } from '../config/environment';

/**
 * Simulated error types for testing
 */
export const ERROR_TYPES = {
  NETWORK_ERROR: 'network',
  TIMEOUT_ERROR: 'timeout', 
  PARSING_ERROR: 'parsing',
  SHEETS_ERROR: 'sheets',
  CSV_ERROR: 'csv',
  MEMORY_ERROR: 'memory',
  COMPONENT_ERROR: 'component',
  ASYNC_ERROR: 'async'
};

/**
 * Error simulation functions
 */
export const simulateError = {
  /**
   * Simulate network connectivity issues
   */
  network() {
    if (!isDebugEnabled()) return;
    throw new Error('Network Error: Unable to connect to remote server. Please check your internet connection and try again.');
  },

  /**
   * Simulate API timeout
   */
  timeout() {
    if (!isDebugEnabled()) return;
    throw new Error('Request timeout: The operation took too long to complete. This may be due to slow network conditions.');
  },

  /**
   * Simulate data parsing errors
   */
  parsing() {
    if (!isDebugEnabled()) return;
    throw new Error('Data parsing failed: The spreadsheet format is invalid or contains unexpected data structures.');
  },

  /**
   * Simulate Google Sheets API errors
   */
  sheets() {
    if (!isDebugEnabled()) return;
    throw new Error('Google Sheets API Error: Unable to access the spreadsheet. Please ensure the sheet is public and the URL is correct.');
  },

  /**
   * Simulate CSV processing errors
   */
  csv() {
    if (!isDebugEnabled()) return;
    throw new Error('CSV processing error: Invalid CSV format detected. Please check your file structure and encoding.');
  },

  /**
   * Simulate memory/resource errors
   */
  memory() {
    if (!isDebugEnabled()) return;
    throw new Error('Memory Error: Insufficient memory to process large dataset. Try reducing the data size.');
  },

  /**
   * Simulate component rendering errors
   */
  component() {
    if (!isDebugEnabled()) return;
    throw new Error('Component Error: Timeline component failed to render. This may be due to invalid data or browser compatibility issues.');
  },

  /**
   * Simulate async operation errors
   */
  async: async () => {
    if (!isDebugEnabled()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('Async Error: Asynchronous operation failed unexpectedly during execution.');
  }
};

/**
 * Test error boundary recovery
 * @param {Function} errorBoundaryRetry - Retry function from error boundary
 * @param {string} errorType - Type of error to simulate
 */
export const testErrorRecovery = async (errorBoundaryRetry, errorType) => {
  if (!isDebugEnabled()) {
    console.warn('Error simulation only available in debug mode');
    return;
  }

  console.log(`🧪 Testing error recovery for: ${errorType}`);
  
  try {
    if (simulateError[errorType]) {
      await simulateError[errorType]();
    }
  } catch (error) {
    console.log('✅ Error caught successfully:', error.message);
    
    // Test retry mechanism
    setTimeout(() => {
      console.log('🔄 Testing retry mechanism...');
      if (errorBoundaryRetry) {
        errorBoundaryRetry();
      }
    }, 2000);
  }
};

/**
 * Comprehensive error boundary test suite
 */
export const runErrorBoundaryTests = () => {
  if (!isDebugEnabled()) {
    console.warn('Error boundary tests only available in debug mode');
    return;
  }

  console.log('🧪 Starting Error Boundary Test Suite...\n');

  const testResults = [];

  // Test each error type
  Object.entries(ERROR_TYPES).forEach(([name, type]) => {
    try {
      console.log(`Testing ${name}...`);
      simulateError[type]();
      testResults.push({ type: name, status: 'FAILED', reason: 'Error not thrown' });
    } catch (error) {
      testResults.push({ 
        type: name, 
        status: 'PASSED', 
        message: error.message.substring(0, 50) + '...' 
      });
    }
  });

  // Display results
  console.log('\n📊 Error Boundary Test Results:');
  testResults.forEach(result => {
    const status = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`${status} ${result.type}: ${result.status}`);
    if (result.message) {
      console.log(`   Message: ${result.message}`);
    }
  });

  const passed = testResults.filter(r => r.status === 'PASSED').length;
  const total = testResults.length;
  
  console.log(`\n🎯 Test Summary: ${passed}/${total} tests passed`);
  
  return testResults;
};

/**
 * Add error simulation controls to development interface
 */
export const addErrorSimulationControls = () => {
  if (!isDebugEnabled() || typeof window === 'undefined') return;

  // Add to window for console access
  window.simulateError = simulateError;
  window.testErrorBoundary = runErrorBoundaryTests;
  
  console.log('🛠️  Error simulation tools available:');
  console.log('   window.simulateError.network()');
  console.log('   window.simulateError.timeout()');
  console.log('   window.simulateError.parsing()');
  console.log('   window.testErrorBoundary()');
};

// Auto-initialize in development
if (isDebugEnabled() && typeof window !== 'undefined') {
  addErrorSimulationControls();
}