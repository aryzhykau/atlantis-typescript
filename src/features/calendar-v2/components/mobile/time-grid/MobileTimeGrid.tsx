import React, { useState, useMemo, useCallback } from 'react';
import TrainerEventBottomSheet from '../../shared/bottom-sheets/TrainerEventBottomSheet';
import { Box } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import MobileTimeRow from './MobileTimeRow';
import { useMobileDragDrop } from '../../../hooks/useMobileDragDrop';
// TODO: Fix import path for TrainerEventBottomSheet
// import TrainerEventBottomSheet from '../../shared/bottom-sheets/EventBottomSheet/TrainerEventBottomSheet';

interface MobileTimeGridProps {
  eventsMap: Record<string, NormalizedEvent[]>;
  selectedDay?: Dayjs;
  hourStart?: number;
  hourEnd?: number;
  hourHeightPx?: number;
  readOnlyForTrainer?: boolean;
  onMarkStudentAbsent?: (studentTrainingId: string) => Promise<void>;
}

/**
 * Mobile time grid displaying events in horizontal scrollable rows by hour
 * Simplified and focused version of the original MobileWeekTimeGrid
 */
const MobileTimeGrid: React.FC<MobileTimeGridProps> = ({
  eventsMap,
  selectedDay,
  hourStart = 6,
  hourEnd = 23,
  hourHeightPx = 64,
  readOnlyForTrainer = false,
  onMarkStudentAbsent,
}) => {
  const [localEventsMap, setLocalEventsMap] = useState(eventsMap);
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | NormalizedEvent[] | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [viewportOffset, setViewportOffset] = useState<number>(0);

  // Update local events when eventsMap changes
  React.useEffect(() => {
    setLocalEventsMap(eventsMap);
  }, [eventsMap]);

  // Keep selectedEvent in sync with incoming events so BottomSheet reflects optimistic changes
  React.useEffect(() => {
    if (!selectedEvent) return;
    try {
      const eventObj = Array.isArray(selectedEvent) ? selectedEvent[0] : selectedEvent;
      if (!eventObj) return;
      const dayKey = (eventObj.start && typeof eventObj.start.format === 'function') ? eventObj.start.format('YYYY-MM-DD') : '';
      const updatedForDay = eventsMap[dayKey] || [];
      const updated = updatedForDay.find((e: NormalizedEvent) => e.id === eventObj.id);
      if (updated) {
        setSelectedEvent(updated);
      }
    } catch (err) {
      // ignore sync errors
      console.warn('Failed to sync selectedEvent with eventsMap', err);
    }
  }, [eventsMap, selectedEvent]);

  // Integrate mobile drag & drop hook for movement only (no duplication)
  const { handleEventDrop, state } = useMobileDragDrop(() => {
    // Optionally, update localEventsMap or refetch events here if needed
    // For true optimistic UI, you may want to update localEventsMap based on state.optimisticUpdate
  });

  // Generate hour array
  const hours = useMemo(() => {
    return Array.from({ length: hourEnd - hourStart + 1 }, (_, i) => hourStart + i);
  }, [hourStart, hourEnd]);

  // Get selected day or default to today
  const activeDay = selectedDay || dayjs();
  const activeDayKey = activeDay.format('YYYY-MM-DD');

  // Handle event click - open bottom sheet with selected event
  const handleEventClick = useCallback((event: NormalizedEvent | NormalizedEvent[]) => {
    setSelectedEvent(event);
    setBottomSheetOpen(true);
    console.log('Event clicked:', event);
    console.log('BottomSheet open:', true);
  }, []);

  // Handle bottom sheet close
  const handleBottomSheetClose = useCallback(() => {
    setBottomSheetOpen(false);
    setSelectedEvent(null);
    console.log('BottomSheet closed');
  }, []);

  // Dynamic viewport offset for mobile browsers (handles address bar)
  React.useEffect(() => {
    const update = () => {
      const visualViewport = (window as any).visualViewport;
      if (visualViewport) {
        const offset = Math.max(0, window.innerHeight - visualViewport.height);
        setViewportOffset(offset);
      }
    };

    if ((window as any).visualViewport) {
      (window as any).visualViewport.addEventListener('resize', update);
      (window as any).visualViewport.addEventListener('scroll', update);
      update();
    }
    window.addEventListener('resize', update);

    return () => {
      if ((window as any).visualViewport) {
        (window as any).visualViewport.removeEventListener('resize', update);
        (window as any).visualViewport.removeEventListener('scroll', update);
      }
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <Box
        data-scroll-container
        sx={{
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 84px + ${viewportOffset}px)`,
          '--event-card-w': readOnlyForTrainer ? '100%' : '160px',
          '--peek-w': '20px',
          '--hour-row-h': `${hourHeightPx}px`,
        }}
      >
        {/* Hour rows */}
        {hours.map(hour => {
          const dayEvents = localEventsMap[activeDayKey]?.filter((e: NormalizedEvent) => e.startHour === hour) || [];
          // Optionally apply optimistic update for UI feedback
          let updatedDayEvents = dayEvents;
          const optimisticUpdate = state.optimisticUpdate;
          if (optimisticUpdate) {
            const optimisticHour = parseInt(optimisticUpdate.newTime.split(':')[0], 10);
            updatedDayEvents = dayEvents.map(ev => {
              if (
                ev.id === optimisticUpdate.eventId &&
                hour === optimisticHour
              ) {
                // Move event visually to new time slot
                return { ...ev, startHour: optimisticHour };
              }
              return ev;
            });
          }
          return (
            <MobileTimeRow
              key={hour}
              hour={hour}
              hourHeightPx={hourHeightPx}
              selectedDay={activeDay}
              dayEvents={updatedDayEvents}
              readOnlyForTrainer={readOnlyForTrainer}
              onEventClick={handleEventClick}
              onEventDrop={handleEventDrop}
            />
          );
        })}

        {/* Bottom spacer for mobile browsers */}
        <Box sx={{ height: `calc(env(safe-area-inset-bottom, 0px) + ${72 + viewportOffset}px)`, flexShrink: 0 }} />
      </Box>

      {/* Event Bottom Sheet */}
      <TrainerEventBottomSheet
        open={bottomSheetOpen}
        event={Array.isArray(selectedEvent) ? selectedEvent[0] : selectedEvent}
        onClose={handleBottomSheetClose}
        onMarkStudentAbsent={onMarkStudentAbsent}
      />
    </DndProvider>
  );
};

export default MobileTimeGrid;
