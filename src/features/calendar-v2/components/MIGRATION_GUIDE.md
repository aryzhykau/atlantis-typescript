# Calendar V2 Components Migration Guide

## 📋 Overview

This document outlines the migration from the original `components/` directory to the new organized `components-new/` structure.

## 🔄 Component Migrations

### Mobile Components

#### Time Grid Components
- **Original**: `MobileWeekTimeGrid.tsx` (845 lines)
- **New Structure**:
  ```
  mobile/time-grid/
  ├── MobileTimeGrid.tsx      # Main grid component (simplified)
  ├── MobileTimeRow.tsx       # Individual hour row
  ├── MobileEventCard.tsx     # Event card with visual effects
  └── index.ts               # Barrel exports
  ```

#### Layout Components
- **Moved to**: `mobile/layout/`
  - `MobileFullCalendarV2Page.tsx`
  - `TrainerMobileCalendar.tsx`
  - `MobileWeekCalendar.tsx`
  - `TrainingChip.tsx`

#### Controls
- **Moved to**: `mobile/controls/`
  - `WeekdaySelector.tsx`
  - `TabsContainer.tsx`
  - `MobileMonthPickerOverlay.tsx`

#### Drag & Drop
- **Moved to**: `mobile/drag-drop/`
  - `MobileDraggableEventCard.tsx`
  - `MobileDropZone.tsx`
  - `MobileDragHandle.tsx`

### Desktop Components

#### Layout
- **Moved to**: `desktop/layout/`
  - `CalendarV2Page.tsx`
  - `CalendarSearchBar.tsx`
  - `CalendarShell.tsx`

#### Grid System
- **Moved to**: `desktop/grid/`
  - All `CalendarGrid/` components
  - Calendar grid, slots, headers, etc.

### Shared Components

#### Event Cards
- **Moved to**: `shared/event-cards/`
  - `CalendarTrainingChip.tsx`
  - `TrainingCard.tsx`

#### Bottom Sheets
- **Moved to**: `shared/bottom-sheets/`
  - All `EventBottomSheet/` components
  - `EditEventBottomSheet.tsx`
  - `TransferEventBottomSheet.tsx`
  - `ConfirmDeleteBottomSheet.tsx`

#### Modals
- **Moved to**: `shared/modals/`
  - All `CalendarModals/` components
  - `RealTrainingModal.tsx`
  - `TrainingTemplateModal.tsx`
  - All `SlotEventsListModal/` components

#### Forms
- **Moved to**: `shared/forms/`
  - `TrainingTemplateForm.tsx`

### Common Components

#### Loaders
- **Moved to**: `common/loaders/`
  - `AnimatedLoader.tsx` (new, simplified version)
  - `AnimatedLogoLoader.tsx` (original)

#### Error Handling
- **Moved to**: `common/error-handling/`
  - `CalendarErrors.tsx` (new component)
  - `CalendarErrorBoundary.tsx` (original)
  - All `CalendarLoadingError/` components

## 🎯 Key Improvements

### 1. Component Splitting
- **MobileWeekTimeGrid** (845 lines) → 3 focused components:
  - `MobileTimeGrid` (~150 lines)
  - `MobileTimeRow` (~150 lines)  
  - `MobileEventCard` (~120 lines)

### 2. Clear Platform Separation
- Mobile components are touch-optimized
- Desktop components use mouse/keyboard patterns
- Shared components work across both platforms

### 3. Better Organization
- Components grouped by functionality
- Clear import paths
- Barrel exports for clean imports

### 4. Improved Maintainability
- Smaller, focused components
- Single responsibility principle
- Easier testing and debugging

## 📝 Migration Steps

### Step 1: Update Imports
```tsx
// Old imports
import MobileWeekTimeGrid from './components/MobileWeekTimeGrid';
import CalendarV2Page from './components/CalendarV2Page';

// New imports
import { MobileTimeGrid } from './components-new/mobile';
import { CalendarV2Page } from './components-new/desktop';
```

### Step 2: Component Props (if changed)
Most components maintain the same props interface, with some simplifications:

```tsx
// MobileTimeGrid props are largely the same as MobileWeekTimeGrid
<MobileTimeGrid
  eventsMap={eventsMap}
  selectedDay={selectedDay}
  readOnlyForTrainer={readOnlyForTrainer}
  onMarkStudentAbsent={onMarkStudentAbsent}
/>
```

### Step 3: Test Individual Components
Each component can now be tested in isolation:

```tsx
// Test mobile event card separately
import { MobileEventCard } from './components-new/mobile/time-grid';

// Test mobile time row separately  
import { MobileTimeRow } from './components-new/mobile/time-grid';
```

## 🔧 Development Benefits

### Easier Navigation
- Find components by platform or functionality
- Clear naming conventions
- Logical directory structure

### Better Code Reuse
- Shared components eliminate duplication
- Platform-specific optimizations
- Common utilities centralized

### Enhanced Performance
- Smaller bundle sizes through tree-shaking
- Focused component loading
- Reduced re-renders

### Improved Developer Experience
- Clear component boundaries
- Better TypeScript support
- Easier debugging and profiling

## 🚀 Next Steps

1. **Phase 1**: Test new component structure
2. **Phase 2**: Update all imports throughout the app
3. **Phase 3**: Remove old components directory
4. **Phase 4**: Add additional features to new structure

## 📊 File Count Comparison

### Before
```
components/
├── 35+ files at root level
├── Mixed mobile/desktop components
├── Large complex components (500+ lines)
└── Unclear component relationships
```

### After
```
components-new/
├── common/ (6 components)
├── mobile/ (15+ components, organized)
├── desktop/ (10+ components, organized) 
├── shared/ (20+ components, organized)
└── Clear hierarchy and relationships
```

## 🎯 Success Metrics

- ✅ Reduced component complexity (max 300 lines per component)
- ✅ Clear platform separation
- ✅ Improved code reusability
- ✅ Better developer experience
- ✅ Enhanced maintainability
