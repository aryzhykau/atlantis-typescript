/**
 * Calendar development configuration
 * Control development features and debugging tools
 */

export const CALENDAR_DEV_CONFIG = {
  // Performance monitoring
  showPerformanceMonitor: false, // Set to true to enable performance monitoring
  
  // Auto-scroll debugging
  showAutoScrollZones: false, // Set to true to show visual scroll zones
  
  // General debugging
  enableDebugLogs: process.env.NODE_ENV === 'development',
  
  // Instructions
  instructions: {
    performanceMonitor: 'Set showPerformanceMonitor: true to enable real-time performance tracking',
    autoScrollDebug: 'Set showAutoScrollZones: true to visualize auto-scroll trigger areas',
    debugLogs: 'Debug logs are automatically enabled in development mode'
  }
};

// Quick toggles for development
export const enablePerformanceMonitor = () => {
  console.log('📊 Performance monitor enabled');
  return { ...CALENDAR_DEV_CONFIG, showPerformanceMonitor: true };
};

export const disablePerformanceMonitor = () => {
  console.log('📊 Performance monitor disabled');
  return { ...CALENDAR_DEV_CONFIG, showPerformanceMonitor: false };
};

export const enableAutoScrollDebug = () => {
  console.log('🎯 Auto-scroll debug zones enabled');
  return { ...CALENDAR_DEV_CONFIG, showAutoScrollZones: true };
};

export const disableAutoScrollDebug = () => {
  console.log('🎯 Auto-scroll debug zones disabled');
  return { ...CALENDAR_DEV_CONFIG, showAutoScrollZones: false };
};

// Enable all dev features
export const enableAllDevFeatures = () => {
  console.log('🚀 All calendar dev features enabled');
  return {
    ...CALENDAR_DEV_CONFIG,
    showPerformanceMonitor: true,
    showAutoScrollZones: true,
  };
};

// Disable all dev features (production mode)
export const disableAllDevFeatures = () => {
  console.log('✨ All calendar dev features disabled (production mode)');
  return {
    ...CALENDAR_DEV_CONFIG,
    showPerformanceMonitor: false,
    showAutoScrollZones: false,
  };
};
