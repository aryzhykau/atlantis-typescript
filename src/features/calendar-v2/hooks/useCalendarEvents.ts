/**
 * Custom hook for managing calendar events and efficient slot mapping
 */

import { useMemo } from 'react';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from '../types';
import { CalendarViewMode } from '../components/desktop/layout/CalendarV2Page';
import { createEventSlotMap, getEventsForSlot } from '../utils/slotUtils';
import { debugLog } from '../utils/debug';

interface UseCalendarEventsReturn {
  eventSlotMap: Map<string, CalendarEvent[]>;
  getEventsForSlot: (day: Dayjs, time: string) => CalendarEvent[];
  totalEvents: number;
}

/**
 * Hook for managing calendar events with optimized slot mapping
 */
export const useCalendarEvents = (
  events: CalendarEvent[],
  viewMode: CalendarViewMode,
  currentDate: Dayjs
): UseCalendarEventsReturn => {
  
  // Pre-compute event slot mapping for O(1) lookups
  const eventSlotMap = useMemo(() => {
    const weekStart = currentDate.startOf('isoWeek');
    const slotMap = createEventSlotMap(events, viewMode, weekStart);
    
    debugLog(`📊 Event slot map created: ${slotMap.size} slots with events`, {
      totalEvents: events.length,
      viewMode,
      weekStart: weekStart.format('YYYY-MM-DD')
    });
    
    return slotMap;
  }, [events, viewMode, currentDate]);

  // Optimized slot lookup function
  const getEventsForSlotOptimized = useMemo(() => {
    return (day: Dayjs, time: string): CalendarEvent[] => {
      const slotEvents = getEventsForSlot(eventSlotMap, day, time);
      
      // Only log if there are events to avoid spam
      if (slotEvents.length > 0) {
        debugLog(`🎯 Slot ${day.format('ddd')} ${time}: ${slotEvents.length} events`, {
          eventIds: slotEvents.map(e => e.id)
        });
      }
      
      return slotEvents;
    };
  }, [eventSlotMap]);

  return {
    eventSlotMap,
    getEventsForSlot: getEventsForSlotOptimized,
    totalEvents: events.length
  };
};
