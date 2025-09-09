/**
 * Calendar feature flags configuration
 * Use this to easily enable/disable features during development
 */

export const CALENDAR_FEATURE_FLAGS = {
  // Performance monitoring - set to false to completely disable
  enablePerformanceMonitor: false,
  
  // Auto-scroll debug zones - set to true to see visual scroll areas
  showAutoScrollDebugZones: false,
  
  // Debug logging - set to false to disable all debug logs
  enableDebugLogging: true,
  
  // Other experimental features
  enableExperimentalAnimations: true,
  enableAdvancedDragEffects: true,
} as const;

// Quick toggles for development
export const disableAllDebugFeatures = () => ({
  ...CALENDAR_FEATURE_FLAGS,
  enablePerformanceMonitor: false,
  showAutoScrollDebugZones: false,
  enableDebugLogging: false,
});

export const enableAllDebugFeatures = () => ({
  ...CALENDAR_FEATURE_FLAGS,
  enablePerformanceMonitor: true,
  showAutoScrollDebugZones: true,
  enableDebugLogging: true,
});
