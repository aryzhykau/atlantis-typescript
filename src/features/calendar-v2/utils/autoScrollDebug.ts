/**
 * Auto-scroll debug configuration
 * Toggle this to visualize scroll zones during development
 */

export const AUTO_SCROLL_DEBUG_CONFIG = {
  // Set to true to see visual scroll zones on the screen
  showDebugZones: false,
  
  // Enhanced configuration for better UX
  topThreshold: 220, // Expanded top area (220px from top edge)
  threshold: 150,    // Other edges (150px)
  
  // Performance settings
  speed: 15,
  maxSpeed: 45,
  acceleration: 1.5,
  
  // Instructions
  instructions: `
  To enable debug mode:
  1. Set showDebugZones: true
  2. Reload the page
  3. You'll see colored zones showing auto-scroll areas:
     🔴 Red = Top area (${220}px) - Enlarged for easier scrolling
     🟢 Green = Bottom area (${150}px)
     🔵 Blue = Left area (${150}px) 
     🟡 Yellow = Right area (${150}px)
  `
};

// Quick toggle for development
export const enableAutoScrollDebug = () => {
  console.log('🎯 Auto-scroll debug zones enabled');
  console.log(AUTO_SCROLL_DEBUG_CONFIG.instructions);
  return { ...AUTO_SCROLL_DEBUG_CONFIG, showDebugZones: true };
};

export const disableAutoScrollDebug = () => {
  console.log('🎯 Auto-scroll debug zones disabled');
  return { ...AUTO_SCROLL_DEBUG_CONFIG, showDebugZones: false };
};
