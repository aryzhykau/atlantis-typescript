import { useMemo, useRef } from 'react';
import { Dayjs } from 'dayjs';
import { CalendarViewMode } from '../components/desktop/layout/CalendarV2Page';
import { TrainingTemplate } from '../models/trainingTemplate';
import { RealTraining } from '../models/realTraining';
import { CalendarEvent } from '../types';
import { useCalendarState } from './useCalendarState';
import { useCalendarDragDrop } from './useCalendarDragDrop';
import { debugLog } from '../utils/debug';

interface UseCalendarContainerProps {
  currentDate: Dayjs;
  viewMode: CalendarViewMode;
  templatesData?: TrainingTemplate[];
  actualData?: RealTraining[];
}

/**
 * Main container hook that orchestrates calendar functionality
 */
export const useCalendarContainer = ({
  currentDate,
  viewMode,
  templatesData,
  actualData,
}: UseCalendarContainerProps) => {
  const paperScrollRef = useRef<HTMLDivElement>(null);
  
  // State management
  const { state: calendarState, actions: calendarActions } = useCalendarState();
  
  // Drag and drop functionality
  const { handleTrainingDrop } = useCalendarDragDrop(viewMode, currentDate);

  // Compute events to display based on view mode
  const eventsToDisplay: CalendarEvent[] = useMemo(() => {
    let events: CalendarEvent[] = [];
    if (viewMode === 'scheduleTemplate') {
      events = templatesData || [];
      debugLog(`📊 Данные шаблонов обновились: ${events.length} элементов`);
    } else {
      events = actualData || [];
      debugLog(`📊 Данные тренировок обновились: ${events.length} элементов`);
    }
    return events;
  }, [viewMode, templatesData, actualData]);

  // Event handlers
  const handleSlotClick = (day: Dayjs, time: string, _events: CalendarEvent[]) => {
    if (viewMode === 'scheduleTemplate') {
      calendarActions.openCreateForm({ date: day, time });
    } else {
      calendarActions.openCreateRealTrainingForm({ date: day, time });
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    const eventType = 'day_number' in event ? 'template' : 'real';
    calendarActions.openEventModal(event.id, eventType);
  };

  const handleViewAllEventsClick = (day: Dayjs, time: string, events: CalendarEvent[]) => {
    const isTemplate = viewMode === 'scheduleTemplate';
    calendarActions.openSlotEventsList(day, time, events, isTemplate);
  };

  const handlers = {
    handleSlotClick,
    handleEventClick,
    handleViewAllEventsClick,
    handleTrainingDrop,
  };

  return {
    eventsToDisplay,
    calendarState,
    calendarActions,
    handlers,
    paperScrollRef,
  };
};
