/**
 * Mobile Event Row Manager - handles event positioning and overlap detection
 * for mobile calendar layout
 */

import { NormalizedEvent } from '../utils/normalizeEventsForWeek';

export interface EventPosition {
  event: NormalizedEvent;
  rowIndex: number;
  isOptimistic?: boolean;
}

export interface MobileEventRow {
  events: EventPosition[];
  maxVisibleEvents: number;
}

/**
 * Manages event positioning and overlap handling for mobile calendar
 */
export class MobileEventRowManager {
  private maxEventsPerRow: number;
  
  constructor(maxEventsPerRow: number = 3) {
    this.maxEventsPerRow = maxEventsPerRow;
  }

  /**
   * Calculates optimal event positioning with overlap handling
   */
  calculateEventPositions(
    events: NormalizedEvent[],
    optimisticUpdate?: { eventId: number; newTime: string }
  ): MobileEventRow {
    // Apply optimistic update if present
    let processedEvents = [...events];
    
    if (optimisticUpdate) {
      // Remove original event and add optimistic version
      processedEvents = events.filter(e => e.id !== optimisticUpdate.eventId);
      
      const originalEvent = events.find(e => e.id === optimisticUpdate.eventId);
      if (originalEvent) {
        const optimisticEvent: NormalizedEvent = {
          ...originalEvent,
          startHour: parseInt(optimisticUpdate.newTime.split(':')[0]),
          // Keep other properties but mark as optimistic in positioning
        };
        processedEvents.push(optimisticEvent);
      }
    }

    // Sort events by start time, then by id for consistent ordering
    processedEvents.sort((a, b) => {
      if (a.startHour !== b.startHour) {
        return a.startHour - b.startHour;
      }
      return a.id - b.id;
    });

    // Calculate positions
    const eventPositions: EventPosition[] = processedEvents.map((event, index) => ({
      event,
      rowIndex: Math.floor(index / this.maxEventsPerRow),
      isOptimistic: optimisticUpdate?.eventId === event.id,
    }));

    return {
      events: eventPositions,
      maxVisibleEvents: this.maxEventsPerRow,
    };
  }

  /**
   * Checks if adding an event at a specific time would cause overlap
   */
  checkForOverlap(
    existingEvents: NormalizedEvent[],
    newEventTime: string,
    eventDuration: number = 60 // minutes
  ): boolean {
    const newEventHour = parseInt(newEventTime.split(':')[0]);
    const newEventMinute = parseInt(newEventTime.split(':')[1] || '0');
    const newEventStart = newEventHour * 60 + newEventMinute;
    const newEventEnd = newEventStart + eventDuration;

    return existingEvents.some(event => {
      const existingStart = event.startHour * 60; // Assuming events start at the hour
      const existingEnd = existingStart + event.durationMins;

      // Check if time ranges overlap
      return (newEventStart < existingEnd && newEventEnd > existingStart);
    });
  }

  /**
   * Finds the best row for a new event to minimize overlap
   */
  findBestRowForEvent(
    existingEvents: NormalizedEvent[],
    newEventTime: string
  ): number {
    const eventsByRow = this.groupEventsByRow(existingEvents);
    
    // Try to find a row with no conflicts
    for (let rowIndex = 0; rowIndex < Math.ceil(existingEvents.length / this.maxEventsPerRow); rowIndex++) {
      const rowEvents = eventsByRow[rowIndex] || [];
      
      if (!this.checkForOverlap(rowEvents, newEventTime)) {
        return rowIndex;
      }
    }

    // If no conflict-free row found, use next available row
    return Math.ceil(existingEvents.length / this.maxEventsPerRow);
  }

  /**
   * Groups events by their row positions
   */
  private groupEventsByRow(events: NormalizedEvent[]): Record<number, NormalizedEvent[]> {
    const eventsByRow: Record<number, NormalizedEvent[]> = {};
    
    events.forEach((event, index) => {
      const rowIndex = Math.floor(index / this.maxEventsPerRow);
      if (!eventsByRow[rowIndex]) {
        eventsByRow[rowIndex] = [];
      }
      eventsByRow[rowIndex].push(event);
    });

    return eventsByRow;
  }

  /**
   * Calculates visible event count for mobile display
   */
  getVisibleEventInfo(events: NormalizedEvent[]): {
    visibleEvents: NormalizedEvent[];
    hiddenCount: number;
    totalRows: number;
  } {
    const totalRows = Math.ceil(events.length / this.maxEventsPerRow);
    const visibleEvents = events.slice(0, this.maxEventsPerRow);
    const hiddenCount = Math.max(0, events.length - this.maxEventsPerRow);

    return {
      visibleEvents,
      hiddenCount,
      totalRows,
    };
  }

  /**
   * Applies mobile-specific event layout optimizations
   */
  optimizeForMobile(events: NormalizedEvent[]): NormalizedEvent[] {
    // Sort by priority: templates first, then by start time
    return events.sort((a, b) => {
      // Prioritize templates over real trainings
      if (a.isTemplate !== b.isTemplate) {
        return a.isTemplate ? -1 : 1;
      }
      
      // Then sort by start time
      if (a.startHour !== b.startHour) {
        return a.startHour - b.startHour;
      }
      
      // Finally by ID for consistency
      return a.id - b.id;
    });
  }
}
