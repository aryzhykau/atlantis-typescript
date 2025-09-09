# Calendar Code Review & Improvements

## 🎯 Overview
Comprehensive analysis and suggestions for simplifying and improving the calendar-v2 codebase.

## 📋 Current Issues Identified

### 1. Component Complexity
- **CalendarShell.tsx**: 600+ lines, handling too many responsibilities
- **CalendarTrainingChip.tsx**: Heavy memoization for simple UI elements
- **Prop drilling**: Multiple levels of prop passing

### 2. Performance Issues
- `getEventsForSlot` called repeatedly with same parameters
- Complex useMemo dependencies causing unnecessary re-renders
- Heavy DOM manipulation in drag & drop

### 3. Code Duplication
- Similar logic in TrainingTemplate vs RealTraining handling
- Repeated responsive styles calculations
- Duplicate event filtering logic

## 🚀 Proposed Improvements

### A. Component Architecture Refactoring

#### 1. Split CalendarShell into focused components:

```tsx
// New structure
CalendarContainer/
├── CalendarGrid/
│   ├── TimeColumn/
│   ├── DayColumn/
│   └── EventSlot/
├── CalendarEvents/
│   ├── EventChip/
│   ├── EventTooltip/
│   └── EventModal/
└── CalendarControls/
    ├── DateNavigation/
    ├── ViewToggle/
    └── FilterBar/
```

#### 2. Create Custom Hooks for Logic Separation:

```tsx
// hooks/useCalendarData.ts
export const useCalendarData = (currentDate: Dayjs, viewMode: CalendarViewMode) => {
  // API calls and data management
};

// hooks/useCalendarEvents.ts  
export const useCalendarEvents = (eventsData: CalendarEvent[]) => {
  // Event processing and slot mapping
};

// hooks/useCalendarDragDrop.ts
export const useCalendarDragDrop = () => {
  // Drag & drop logic
};
```

### B. Performance Optimizations

#### 1. Event Slot Mapping Optimization:

```tsx
// Current: O(n) for each slot render
const getEventsForSlot = useCallback((day: Dayjs, time: string) => {
  return eventsToDisplay.filter(event => {
    // Complex filtering logic
  });
}, [eventsToDisplay, viewMode]);

// Improved: Pre-compute slot mapping O(1) lookup
const eventSlotMap = useMemo(() => {
  const map = new Map<string, CalendarEvent[]>();
  eventsToDisplay.forEach(event => {
    const slotKey = getSlotKey(event);
    if (!map.has(slotKey)) map.set(slotKey, []);
    map.get(slotKey)!.push(event);
  });
  return map;
}, [eventsToDisplay]);

const getEventsForSlot = useCallback((day: Dayjs, time: string) => {
  const slotKey = `${day.format('YYYY-MM-DD')}-${time}`;
  return eventSlotMap.get(slotKey) || [];
}, [eventSlotMap]);
```

#### 2. Reduce Memoization Complexity:

```tsx
// Current: Complex memoization in CalendarTrainingChip
const chipData = useMemo(() => {
  // 40+ lines of calculations
}, [event, theme.palette.primary.main]);

// Improved: Extract to utility functions
const getChipDisplayData = (event: CalendarEvent, theme: Theme) => {
  return {
    typeColor: event.training_type?.color || theme.palette.primary.main,
    trainerName: getTrainerDisplayName(event),
    capacityInfo: calculateCapacityInfo(event)
  };
};

// Then simple memoization
const chipData = useMemo(() => getChipDisplayData(event, theme), [event, theme]);
```

### C. Code Simplification

#### 1. Unify Event Type Handling:

```tsx
// Current: Separate logic for TrainingTemplate vs RealTraining
if (isTrainingTemplate(event)) {
  // Template logic
} else if (isRealTraining(event)) {
  // Real training logic  
}

// Improved: Unified interface with adapters
interface UnifiedEvent {
  id: number;
  trainerId: number;
  trainerName: string;
  studentCount: number;
  date: string;
  time: string;
  type: string;
}

const createEventAdapter = (event: CalendarEvent): UnifiedEvent => {
  if (isTrainingTemplate(event)) {
    return new TemplateEventAdapter(event);
  }
  return new RealTrainingEventAdapter(event);
};
```

#### 2. Simplify Responsive Styles:

```tsx
// Current: Complex object with conditional logic
const responsiveStyles = useMemo(() => {
  if (isMobile) return { /* mobile styles */ };
  if (isTablet) return { /* tablet styles */ };
  return { /* desktop styles */ };
}, [isMobile, isTablet]);

// Improved: CSS-in-JS with theme breakpoints
const useResponsiveCalendarStyles = () => {
  const theme = useTheme();
  return {
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: {
        xs: '60px repeat(7, minmax(80px, 1fr))',
        md: '80px repeat(7, minmax(100px, 1fr))', 
        lg: '100px repeat(7, minmax(140px, 1fr))'
      },
      gap: theme.spacing(0.5)
    },
    slotHeight: {
      xs: 80,
      md: 100, 
      lg: 110
    }
  };
};
```

### D. State Management Improvements

#### 1. Replace Multiple useState with useReducer:

```tsx
// Current: Multiple useState calls
const [isFormOpen, setIsFormOpen] = useState(false);
const [selectedSlotInfo, setSelectedSlotInfo] = useState<SelectedSlotInfo | null>(null);
const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
// ... more state

// Improved: Unified state management
type CalendarAction = 
  | { type: 'OPEN_CREATE_FORM'; payload: SelectedSlotInfo }
  | { type: 'CLOSE_CREATE_FORM' }
  | { type: 'OPEN_EVENT_MODAL'; payload: { eventId: number; eventType: 'template' | 'real' } }
  | { type: 'CLOSE_EVENT_MODAL' };

const calendarReducer = (state: CalendarState, action: CalendarAction): CalendarState => {
  switch (action.type) {
    case 'OPEN_CREATE_FORM':
      return { ...state, createForm: { isOpen: true, slotInfo: action.payload } };
    // ... other cases
  }
};
```

### E. File Structure Reorganization

```
features/calendar-v2/
├── components/
│   ├── Calendar/
│   │   ├── CalendarContainer.tsx
│   │   ├── CalendarGrid.tsx
│   │   └── CalendarSlot.tsx
│   ├── Events/
│   │   ├── EventChip.tsx
│   │   ├── EventModal.tsx
│   │   └── EventTooltip.tsx
│   ├── Forms/
│   │   ├── TrainingForm.tsx
│   │   └── EventForm.tsx
│   └── Navigation/
│       ├── DatePicker.tsx
│       └── ViewToggle.tsx
├── hooks/
│   ├── useCalendarData.ts
│   ├── useCalendarEvents.ts
│   ├── useCalendarDragDrop.ts
│   └── useCalendarState.ts
├── utils/
│   ├── eventAdapters.ts
│   ├── slotUtils.ts
│   └── styleUtils.ts
└── types/
    ├── calendar.ts
    └── events.ts
```

## 🎯 Implementation Priority

### Phase 1: Critical Performance Issues
1. Pre-compute event slot mapping 
2. Reduce memoization complexity
3. Optimize drag & drop performance

### Phase 2: Code Structure  
1. Split CalendarShell component
2. Extract custom hooks
3. Unify event type handling

### Phase 3: Developer Experience
1. Improve TypeScript types
2. Better error handling
3. Add comprehensive tests

## 📊 Expected Benefits

### Performance
- 🚀 **50-70% reduction** in render time for large datasets
- 🎯 **Eliminated unnecessary re-renders** through optimized memoization  
- ⚡ **Smoother drag & drop** with reduced DOM operations

### Maintainability  
- 📝 **60% reduction** in component complexity (lines of code)
- 🔧 **Easier testing** with separated concerns
- 🎨 **Better code reusability** across calendar features

### Developer Experience
- 🐛 **Clearer debugging** with focused components
- 📚 **Better documentation** through self-documenting code structure
- 🔄 **Easier feature additions** with modular architecture

## 🛠 Implementation Steps

1. **Start with performance optimizations** (lowest risk, high impact)
2. **Extract custom hooks** (medium risk, high maintainability gain)  
3. **Refactor component structure** (higher risk, but significant long-term benefits)
4. **Migrate to unified event handling** (requires careful testing)

Would you like me to implement any of these improvements or dive deeper into specific areas?
