# Calendar Feature Control Guide

## 🎛️ How to Control Calendar Features

All calendar debug and performance features can be easily controlled through the **feature flags configuration**.

### 📍 Location
```
/src/features/calendar-v2/config/featureFlags.ts
```

### 🔧 Available Controls

```typescript
export const CALENDAR_FEATURE_FLAGS = {
  // 🚫 SET TO FALSE to remove performance monitor completely
  enablePerformanceMonitor: false,
  
  // 🚫 SET TO FALSE to disable auto-scroll debug zones  
  showAutoScrollDebugZones: false,
  
  // 🚫 SET TO FALSE to disable debug logging
  enableDebugLogging: true,
  
  // Other features
  enableExperimentalAnimations: true,
  enableAdvancedDragEffects: true,
}
```

## 🚨 **QUICK FIX for Infinite Renders**

**The performance monitor was causing infinite re-renders!** 

✅ **FIXED:** 
- Set `enablePerformanceMonitor: false` by default
- Added throttled updates (100ms intervals) instead of on every render
- Made it completely removable via feature flag

## 🛠️ Quick Actions

### ❌ **Disable All Debug Features**
```typescript
// In featureFlags.ts, set all to false:
enablePerformanceMonitor: false,
showAutoScrollDebugZones: false,
enableDebugLogging: false,
```

### ✅ **Enable Only What You Need**
```typescript
// For production - all debug off:
enablePerformanceMonitor: false,
showAutoScrollDebugZones: false,

// For testing auto-scroll areas:
showAutoScrollDebugZones: true,
```

### 🗑️ **Complete Removal** (if needed)
1. Set `enablePerformanceMonitor: false` in `featureFlags.ts`
2. Optionally remove the `<PerformanceMonitor>` JSX from `CalendarShell.tsx`
3. Optionally delete `PerformanceMonitor.tsx` file

## 🎯 **Current Status**
- ✅ Performance monitor: **DISABLED** (no more infinite renders)
- ✅ Auto-scroll debug zones: **DISABLED** 
- ✅ Enhanced auto-scroll: **ENABLED** (220px top area)
- ✅ All drag & drop optimizations: **ENABLED**

## 📝 **Notes**
- Changes take effect immediately on page reload
- All performance optimizations remain active regardless of debug settings
- The enhanced auto-scroll (220px top area) works independently of debug features
