/**
 * Performance monitoring and timeout effectiveness tracking
 */

import { getConfigValue, isDebugEnabled } from '../config/environment';

/**
 * Performance metrics collector
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: [],
      timeouts: [],
      errors: [],
      networkConditions: []
    };
    
    this.startTime = Date.now();
    this.sessionId = this.generateSessionId();
  }
  
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  /**
   * Track API call performance
   * @param {string} source - Data source (google, framacalc, local)
   * @param {string} url - Request URL
   * @param {number} startTime - Request start time
   * @param {number} endTime - Request end time
   * @param {boolean} success - Whether request succeeded
   * @param {string} error - Error message if failed
   */
  trackApiCall(source, url, startTime, endTime, success, error = null) {
    const duration = endTime - startTime;
    const timeout = getConfigValue.number('VITE_API_TIMEOUT');
    
    const metric = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      source,
      url: this.sanitizeUrl(url),
      duration,
      timeout,
      success,
      error,
      timeoutRatio: duration / timeout,
      environment: getConfigValue.string('VITE_APP_ENV'),
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo()
    };
    
    this.metrics.apiCalls.push(metric);
    
    // CRITICAL FIX: Prevent memory leaks by limiting collection size
    if (this.metrics.apiCalls.length > 1000) {
      this.metrics.apiCalls = this.metrics.apiCalls.slice(-500); // Keep last 500 metrics
    }
    
    // Log performance data
    if (isDebugEnabled()) {
      console.log(`⏱️  API Call Performance:`, {
        source,
        duration: `${duration}ms`,
        timeout: `${timeout}ms`,
        utilization: `${Math.round(duration / timeout * 100)}%`,
        success
      });
    }
    
    // Check for timeout effectiveness
    if (duration > timeout * 0.8) {
      console.warn(`⚠️  API call used ${Math.round(duration / timeout * 100)}% of timeout limit`);
    }
    
    // Send to monitoring service in production
    if (!isDebugEnabled()) {
      this.sendMetric('api_performance', metric);
    }
    
    return metric;
  }
  
  /**
   * Track timeout occurrences
   * @param {string} source - Data source
   * @param {string} url - Request URL
   * @param {number} timeoutValue - Timeout value used
   */
  trackTimeout(source, url, timeoutValue) {
    const metric = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      source,
      url: this.sanitizeUrl(url),
      timeout: timeoutValue,
      environment: getConfigValue.string('VITE_APP_ENV'),
      connection: this.getConnectionInfo()
    };
    
    this.metrics.timeouts.push(metric);
    
    // CRITICAL FIX: Prevent memory leaks for timeout tracking
    if (this.metrics.timeouts.length > 100) {
      this.metrics.timeouts = this.metrics.timeouts.slice(-50); // Keep last 50 timeouts
    }
    
    console.error(`⏰ Timeout occurred:`, {
      source,
      timeout: `${timeoutValue}ms`,
      connection: metric.connection
    });
    
    // Send alert for timeout in production
    if (!isDebugEnabled()) {
      this.sendMetric('timeout_alert', metric);
    }
    
    return metric;
  }
  
  /**
   * Track error occurrences
   * @param {string} type - Error type
   * @param {string} message - Error message
   * @param {string} source - Error source
   * @param {object} context - Additional context
   */
  trackError(type, message, source, context = {}) {
    const metric = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      type,
      message,
      source,
      context,
      environment: getConfigValue.string('VITE_APP_ENV'),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.metrics.errors.push(metric);
    
    // CRITICAL FIX: Prevent memory leaks for error tracking
    if (this.metrics.errors.length > 200) {
      this.metrics.errors = this.metrics.errors.slice(-100); // Keep last 100 errors
    }
    
    if (isDebugEnabled()) {
      console.error(`🚨 Error tracked:`, metric);
    }
    
    return metric;
  }
  
  /**
   * Get network connection information
   */
  getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      };
    }
    return null;
  }
  
  /**
   * Sanitize URL for logging (remove sensitive data)
   */
  sanitizeUrl(url) {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      // Remove query parameters that might contain sensitive data
      const sensitiveParams = ['key', 'token', 'auth', 'secret'];
      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      });
      return urlObj.toString();
    } catch {
      return url;
    }
  }
  
  /**
   * Generate performance report
   */
  generateReport() {
    const report = {
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
      environment: getConfigValue.string('VITE_APP_ENV'),
      timeout: getConfigValue.number('VITE_API_TIMEOUT'),
      metrics: {
        totalApiCalls: this.metrics.apiCalls.length,
        totalTimeouts: this.metrics.timeouts.length,
        totalErrors: this.metrics.errors.length,
        successRate: this.calculateSuccessRate(),
        averageDuration: this.calculateAverageDuration(),
        timeoutUtilization: this.calculateTimeoutUtilization(),
        performanceGrade: this.calculatePerformanceGrade()
      },
      breakdown: this.getSourceBreakdown(),
      recommendations: this.generateRecommendations()
    };
    
    if (isDebugEnabled()) {
      console.log('📊 Performance Report:', report);
    }
    
    return report;
  }
  
  /**
   * Calculate success rate
   */
  calculateSuccessRate() {
    if (this.metrics.apiCalls.length === 0) return 100;
    const successful = this.metrics.apiCalls.filter(call => call.success).length;
    return Math.round((successful / this.metrics.apiCalls.length) * 100);
  }
  
  /**
   * Calculate average API call duration
   */
  calculateAverageDuration() {
    if (this.metrics.apiCalls.length === 0) return 0;
    const totalDuration = this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0);
    return Math.round(totalDuration / this.metrics.apiCalls.length);
  }
  
  /**
   * Calculate timeout utilization
   */
  calculateTimeoutUtilization() {
    if (this.metrics.apiCalls.length === 0) return 0;
    const totalUtilization = this.metrics.apiCalls.reduce((sum, call) => sum + call.timeoutRatio, 0);
    return Math.round((totalUtilization / this.metrics.apiCalls.length) * 100);
  }
  
  /**
   * Calculate performance grade
   */
  calculatePerformanceGrade() {
    const successRate = this.calculateSuccessRate();
    const timeoutUtil = this.calculateTimeoutUtilization();
    const timeoutCount = this.metrics.timeouts.length;
    
    if (successRate >= 95 && timeoutUtil < 50 && timeoutCount === 0) return 'A';
    if (successRate >= 90 && timeoutUtil < 70 && timeoutCount <= 1) return 'B';
    if (successRate >= 80 && timeoutUtil < 90) return 'C';
    return 'D';
  }
  
  /**
   * Get breakdown by data source
   */
  getSourceBreakdown() {
    const breakdown = {};
    
    this.metrics.apiCalls.forEach(call => {
      if (!breakdown[call.source]) {
        breakdown[call.source] = {
          count: 0,
          averageDuration: 0,
          successRate: 0,
          timeouts: 0
        };
      }
      breakdown[call.source].count++;
    });
    
    // Calculate averages for each source
    Object.keys(breakdown).forEach(source => {
      const calls = this.metrics.apiCalls.filter(call => call.source === source);
      const successful = calls.filter(call => call.success);
      const timeouts = this.metrics.timeouts.filter(timeout => timeout.source === source);
      
      breakdown[source].averageDuration = Math.round(
        calls.reduce((sum, call) => sum + call.duration, 0) / calls.length
      );
      breakdown[source].successRate = Math.round((successful.length / calls.length) * 100);
      breakdown[source].timeouts = timeouts.length;
    });
    
    return breakdown;
  }
  
  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const avgDuration = this.calculateAverageDuration();
    const timeoutUtil = this.calculateTimeoutUtilization();
    const timeout = getConfigValue.number('VITE_API_TIMEOUT');
    
    if (timeoutUtil > 80) {
      recommendations.push({
        type: 'warning',
        message: `High timeout utilization (${timeoutUtil}%). Consider increasing timeout from ${timeout}ms.`
      });
    }
    
    if (timeoutUtil < 30 && avgDuration < timeout * 0.3) {
      recommendations.push({
        type: 'optimization',
        message: `Low timeout utilization (${timeoutUtil}%). Timeout could be reduced from ${timeout}ms.`
      });
    }
    
    if (this.metrics.timeouts.length > 0) {
      recommendations.push({
        type: 'critical',
        message: `${this.metrics.timeouts.length} timeout(s) occurred. Investigate network conditions or increase timeout.`
      });
    }
    
    if (this.calculateSuccessRate() < 95) {
      recommendations.push({
        type: 'warning',
        message: `Success rate below 95% (${this.calculateSuccessRate()}%). Check error patterns.`
      });
    }
    
    return recommendations;
  }
  
  /**
   * Send metric to monitoring service
   */
  sendMetric(type, data) {
    // In a real implementation, send to monitoring service
    // For now, just log to console in non-debug environments
    console.log(`📊 Metric [${type}]:`, data);
  }
  
  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      apiCalls: [],
      timeouts: [],
      errors: [],
      networkConditions: []
    };
    this.startTime = Date.now();
    this.sessionId = this.generateSessionId();
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Make available globally for console access in debug mode
if (isDebugEnabled() && typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor;
  console.log('📊 Performance monitor available at window.performanceMonitor');
}

export default performanceMonitor;