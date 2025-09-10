/**
 * Calendar constants and configuration
 */

// Time configuration
export const TIME_SLOTS = {
  START_HOUR: 6,
  END_HOUR: 23,
  INTERVAL_MINUTES: 30,
} as const;

// Display limits
export const DISPLAY_LIMITS = {
  MOBILE_MAX_CHIPS: 2,
  TABLET_MAX_CHIPS: 3,
  DESKTOP_MAX_CHIPS: 4,
} as const;

// Animation and interaction
export const INTERACTION_CONFIG = {
  DRAG_OPACITY: 0.5,
  HOVER_TRANSITION: '0.15s ease',
  ALT_KEY_FILTER: 'brightness(1.1) drop-shadow(0 0 8px rgba(33, 150, 243, 0.6))',
} as const;

// Breakpoints (should match theme breakpoints)
export const BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 960,
} as const;

// Calendar grid configuration
export const GRID_CONFIG = {
  DAYS_PER_WEEK: 7,
  TIME_COLUMN_WIDTH: '80px',
  MIN_SLOT_HEIGHT: '60px',
} as const;

// DnD types
export const DND_TYPES = {
  TRAINING: 'TRAINING',
} as const;
