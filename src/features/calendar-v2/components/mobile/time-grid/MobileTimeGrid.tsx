import React, { useState, useMemo, useCallback } from 'react';
import TrainerEventBottomSheet from '../../shared/bottom-sheets/TrainerEventBottomSheet';
import EventBottomSheetRefactored from '../../shared/bottom-sheets/EventBottomSheetRefactored';
import { Box } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import { useSnackbar } from '../../../../../hooks/useSnackBar';
import {
  useMoveTrainingTemplateMutation,
  useMoveRealTrainingMutation,
  useUpdateTrainingTemplateMutation,
  useUpdateRealTrainingMutation,
  useDeleteTrainingTemplateMutation,
  useDeleteRealTrainingMutation,
} from '../../../../../store/apis/calendarApi-v2';
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

  // API mutations for bottom-sheet actions (edit / move / delete)
  const [moveTrainingTemplate] = useMoveTrainingTemplateMutation();
  const [moveRealTraining] = useMoveRealTrainingMutation();
  const [updateTrainingTemplate] = useUpdateTrainingTemplateMutation();
  const [updateRealTraining] = useUpdateRealTrainingMutation();
  const [deleteTrainingTemplate] = useDeleteTrainingTemplateMutation();
  const [deleteRealTraining] = useDeleteRealTrainingMutation();
  const { displaySnackbar } = useSnackbar();

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

  // Handler invoked from EventBottomSheet when user requests a transfer
  const handleRequestMove = useCallback(async (event: NormalizedEvent, transferData?: any) => {
  console.debug('MobileTimeGrid.handleRequestMove', { eventId: event?.id, transferData });
  if (!event || !transferData) return;
    displaySnackbar('Перемещение...', 'info');
    try {
      if (event.isTemplate) {
        // support both dayOfWeek and dayNumber keys
        const dow = transferData.dayOfWeek ?? transferData.dayNumber;
        const dayOfWeek = dow === 0 ? 7 : dow;
        const hour = Number(transferData.hour ?? event.start.hour());
        const startTime = `${String(hour).padStart(2, '0')}:00`;
        console.debug('MobileTimeGrid.moveTrainingTemplate payload', { id: event.id, dayNumber: dayOfWeek, startTime });
        await moveTrainingTemplate({ id: event.id, dayNumber: dayOfWeek, startTime }).unwrap();
        // optimistic local update: move template within localEventsMap if present
        try {
          setLocalEventsMap(prev => {
            const next = { ...prev } as typeof prev;
            // templates are keyed by date strings (YYYY-MM-DD) in eventsMap; best-effort: find and move
            Object.keys(next).forEach(dayKey => {
              next[dayKey] = next[dayKey].filter(e => e.id !== event.id);
            });
            // Place into a best-guess day: keep using existing activeDay as target if mapping unclear
            const targetDay = activeDay.format('YYYY-MM-DD');
            next[targetDay] = next[targetDay] || [];
            next[targetDay].push({ ...event, startHour: hour });
            return next;
          });
        } catch (e) {
          console.warn('Failed optimistic update for template move', e);
        }
        displaySnackbar('Шаблон перемещён', 'success');
      } else {
        // accept both `trainingDate` and `date` keys from the transfer form
        const trainingDate = transferData.trainingDate ?? transferData.date ?? event.start.format('YYYY-MM-DD');
        const hour = Number(transferData.hour ?? event.start.hour());
        const startTime = `${String(hour).padStart(2, '0')}:00`;
        console.debug('MobileTimeGrid.moveRealTraining payload', { id: event.id, trainingDate, startTime });
        await moveRealTraining({ id: event.id, trainingDate, startTime }).unwrap();
        // optimistic local update: move real training in localEventsMap
        try {
          setLocalEventsMap(prev => {
            const next = { ...prev } as typeof prev;
            // remove from any slot where it exists
            Object.keys(next).forEach(dayKey => {
              next[dayKey] = next[dayKey].filter(e => e.id !== event.id);
            });
            // target dayKey
            const targetDay = (trainingDate) as string;
            next[targetDay] = next[targetDay] || [];
            // Reconstruct a minimal NormalizedEvent to place in UI
            const moved: NormalizedEvent = {
              ...event,
              start: event.start.set('hour', hour).set('date', dayjs(trainingDate).date()).set('month', dayjs(trainingDate).month()).set('year', dayjs(trainingDate).year()),
              end: event.start.set('hour', hour).add(event.durationMins, 'minute'),
              startHour: hour,
            } as NormalizedEvent;
            next[targetDay].push(moved);
            return next;
          });
          // update selectedEvent if it was open
          setSelectedEvent(prev => {
            if (!prev) return prev;
            const isArray = Array.isArray(prev);
            const ev = isArray ? prev[0] : prev;
            if (ev.id === event.id) {
              const movedSelected: NormalizedEvent = {
                ...event,
                start: event.start.set('hour', hour).set('date', dayjs(trainingDate).date()).set('month', dayjs(trainingDate).month()).set('year', dayjs(trainingDate).year()),
                end: event.start.set('hour', hour).add(event.durationMins, 'minute'),
                startHour: hour,
              } as NormalizedEvent;
              return isArray ? [movedSelected] : movedSelected;
            }
            return prev;
          });
        } catch (e) {
          console.warn('Failed optimistic update for real training move', e);
        }
        displaySnackbar('Тренировка перемещена', 'success');
      }
    } catch (err: any) {
      console.error('Failed to move event:', err);
      const msg = err?.data?.detail || err?.message || 'Ошибка при перемещении';
      displaySnackbar(msg, 'error');
    }
  }, [moveTrainingTemplate, moveRealTraining, displaySnackbar]);

  // Handler invoked from EventBottomSheet when user requests an edit/save
  const handleRequestEdit = useCallback(async (event: NormalizedEvent, updates?: Partial<NormalizedEvent>) => {
  console.debug('MobileTimeGrid.handleRequestEdit', { eventId: event?.id, updates });
  if (!event) return;
    displaySnackbar('Сохранение изменений...', 'info');
    try {
      // If the EditBottomSheet provided an `updates` object prefer those values
      const start = updates?.start ?? event.start;
      const raw = { ...(event.raw || {}), ...(updates?.raw || {}) } as any;
      if (event.isTemplate) {
        const dayNumber = start.day() === 0 ? 7 : start.day();
        const data: any = {
          start_time: raw.start_time || `${String(start.hour()).padStart(2, '0')}:00`,
          day_number: dayNumber,
        };
        if (raw.responsible_trainer_id) data.responsible_trainer_id = raw.responsible_trainer_id;
        if (raw.training_type_id) data.training_type_id = raw.training_type_id;
        await updateTrainingTemplate({ id: event.id, data }).unwrap();
        displaySnackbar('Шаблон обновлён', 'success');
      } else {
        const data: any = {
          start_time: raw.start_time || `${String(start.hour()).padStart(2, '0')}:00`,
          training_date: start.format('YYYY-MM-DD'),
        };
        if (raw.responsible_trainer_id) data.responsible_trainer_id = raw.responsible_trainer_id;
        if (raw.training_type_id) data.training_type_id = raw.training_type_id;
        await updateRealTraining({ id: event.id, data }).unwrap();
        displaySnackbar('Тренировка обновлена', 'success');
      }
    } catch (err: any) {
      console.error('Failed to update event:', err);
      const msg = err?.data?.detail || err?.message || 'Ошибка при сохранении';
      displaySnackbar(msg, 'error');
    }
  }, [updateTrainingTemplate, updateRealTraining, displaySnackbar]);

  // Handler invoked when deleting an event from bottom sheet
  const handleDelete = useCallback(async (event: NormalizedEvent) => {
    if (!event) return;
    displaySnackbar('Удаление...', 'info');
    try {
      if (event.isTemplate) {
        await deleteTrainingTemplate(event.id).unwrap();
        displaySnackbar('Шаблон удалён', 'success');
      } else {
        await deleteRealTraining(event.id).unwrap();
        displaySnackbar('Тренировка удалена', 'success');
      }
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      const msg = err?.data?.detail || err?.message || 'Ошибка при удалении';
      displaySnackbar(msg, 'error');
    }
  }, [deleteTrainingTemplate, deleteRealTraining, displaySnackbar]);

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

      {/* Event Bottom Sheet: show Trainer-specific bottom sheet for trainers, full EventBottomSheet for admins/owners */}
      {readOnlyForTrainer ? (
        <TrainerEventBottomSheet
          open={bottomSheetOpen}
          event={Array.isArray(selectedEvent) ? selectedEvent[0] : selectedEvent}
          onClose={handleBottomSheetClose}
          onMarkStudentAbsent={onMarkStudentAbsent}
        />
      ) : (
        <EventBottomSheetRefactored
          open={bottomSheetOpen}
          eventOrHourGroup={Array.isArray(selectedEvent) ? selectedEvent : selectedEvent}
          mode="event"
          onClose={handleBottomSheetClose}
          onRequestMove={handleRequestMove}
          onRequestEdit={handleRequestEdit}
          onDelete={handleDelete}
        />
      )}
    </DndProvider>
  );
};

export default MobileTimeGrid;
