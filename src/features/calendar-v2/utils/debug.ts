import { CALENDAR_FEATURE_FLAGS } from '../config/featureFlags';

/**
 * Calendar debug utilities
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info', 
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Enhanced debug logging with levels and categories
 */
export const debugLog = (message: string, data?: any, level: LogLevel = LogLevel.DEBUG) => {
  if (!CALENDAR_FEATURE_FLAGS.enableDebugLogging) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[Calendar ${level.toUpperCase()}] ${timestamp}`;
  
  switch (level) {
    case LogLevel.DEBUG:
      console.log(`${prefix} ${message}`, data || '');
      break;
    case LogLevel.INFO:
      console.info(`${prefix} ${message}`, data || '');
      break;
    case LogLevel.WARN:
      console.warn(`${prefix} ${message}`, data || '');
      break;
    case LogLevel.ERROR:
      console.error(`${prefix} ${message}`, data || '');
      break;
  }
};

/**
 * Performance measurement utilities
 */
export const measurePerformance = (name: string, fn: () => void) => {
  if (!CALENDAR_FEATURE_FLAGS.enableDebugLogging) {
    fn();
    return;
  }
  
  const startTime = performance.now();
  fn();
  const endTime = performance.now();
  
  debugLog(`Performance: ${name} took ${(endTime - startTime).toFixed(2)}ms`, undefined, LogLevel.INFO);
};

/**
 * Drag & drop specific debug logging
 */
export const dragDebug = (message: string, data?: any) => {
  debugLog(`🎯 Drag & Drop: ${message}`, data, LogLevel.DEBUG);
};

/**
 * API call debug logging
 */
export const apiDebug = (message: string, data?: any) => {
  debugLog(`🌐 API: ${message}`, data, LogLevel.DEBUG);
}; 