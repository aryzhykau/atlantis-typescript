/**
 * Mobile-specific drag and drop hook for calendar events
 * Handles touch-friendly drag operations with optimistic updates
 */

import { useCallback, useState } from 'react';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from '../types';
import { isTrainingTemplate, isRealTraining } from '../types/typeGuards';
import { 
  useMoveTrainingTemplateMutation, 
  useMoveRealTrainingMutation,
} from '../../../store/apis/calendarApi-v2';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { debugLog } from '../utils/debug';

export interface MobileDragDropState {
  isDragging: boolean;
  draggedEvent: CalendarEvent | null;
  optimisticUpdate: {
    eventId: number;
    newDay: Dayjs;
    newTime: string;
  } | null;
}

export interface UseMobileDragDropReturn {
  state: MobileDragDropState;
  handleEventDrop: (
    event: CalendarEvent, 
    sourceDay: Dayjs, 
    sourceTime: string, 
    targetDay: Dayjs, 
    targetTime: string
  ) => Promise<void>;
  startDrag: (event: CalendarEvent) => void;
  endDrag: () => void;
  cancelOptimisticUpdate: () => void;
}

/**
 * Hook for managing mobile calendar drag & drop operations
 */
export const useMobileDragDrop = (
  onEventUpdate?: () => void
): UseMobileDragDropReturn => {
  const { displaySnackbar } = useSnackbar();
  
  // Local state for drag operations
  const [state, setState] = useState<MobileDragDropState>({
    isDragging: false,
    draggedEvent: null,
    optimisticUpdate: null,
  });
  
  // API mutations
  const [moveTrainingTemplate] = useMoveTrainingTemplateMutation();
  const [moveRealTraining] = useMoveRealTrainingMutation();

  const startDrag = useCallback((event: CalendarEvent) => {
    setState(prev => ({
      ...prev,
      isDragging: true,
      draggedEvent: event,
    }));
    debugLog('📱 Mobile drag started:', { eventId: event.id });
  }, []);

  const endDrag = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      draggedEvent: null,
    }));
    debugLog('📱 Mobile drag ended');
  }, []);

  const cancelOptimisticUpdate = useCallback(() => {
    setState(prev => ({
      ...prev,
      optimisticUpdate: null,
    }));
    debugLog('📱 Optimistic update cancelled');
  }, []);

  const handleMove = useCallback(async (
    event: CalendarEvent,
    targetDay: Dayjs,
    targetTime: string
  ) => {
    if (isTrainingTemplate(event)) {
      const dayNumber = targetDay.day() === 0 ? 7 : targetDay.day();
      
      await moveTrainingTemplate({
        id: event.id,
        dayNumber,
        startTime: targetTime,
      }).unwrap();
      
      debugLog('📱 Template moved successfully');
      displaySnackbar(`✅ Шаблон тренировки "${event.training_type?.name}" перемещен`, 'success');
    } else if (isRealTraining(event)) {
      const trainingDate = targetDay.format('YYYY-MM-DD');
      
      await moveRealTraining({
        id: event.id,
        trainingDate,
        startTime: targetTime,
      }).unwrap();
      
      debugLog('📱 Real training moved successfully');
      displaySnackbar(`✅ Тренировка "${event.training_type?.name}" перемещена`, 'success');
    }
  }, [moveTrainingTemplate, moveRealTraining, displaySnackbar]);

  const handleEventDrop = useCallback(async (
    event: CalendarEvent, 
    sourceDay: Dayjs, 
    sourceTime: string, 
    targetDay: Dayjs, 
    targetTime: string
  ) => {
    // Check if position actually changed
    if (sourceDay.isSame(targetDay, 'day') && sourceTime === targetTime) {
      debugLog('📱 No position change, ignoring drop');
      return;
    }

    debugLog('📱 Starting mobile event drop:', { 
      eventId: event.id, 
      from: `${sourceDay.format('ddd')} ${sourceTime}`,
      to: `${targetDay.format('ddd')} ${targetTime}`,
    });

    // Apply optimistic update
    setState(prev => ({
      ...prev,
      optimisticUpdate: {
        eventId: event.id,
        newDay: targetDay,
        newTime: targetTime,
      },
    }));

    // Show an info snackbar with a loading indicator while the move request is in-flight
    // It will be replaced by success/error notification after the request completes
    try {
      displaySnackbar('Перемещение тренировки...', 'info');
    } catch (e) {
      // swallow - displaySnackbar should be stable, but avoid crashing if not
    }

    try {
      await handleMove(event, targetDay, targetTime);
      
      // Clear optimistic update on success
      setState(prev => ({
        ...prev,
        optimisticUpdate: null,
      }));

      // Trigger any parent updates
      onEventUpdate?.();
      
    } catch (error: any) {
      console.error('❌ Mobile drag drop error:', error);
      
      // Cancel optimistic update on error
      setState(prev => ({
        ...prev,
        optimisticUpdate: null,
      }));
      
      const errorMessage = error?.data?.detail || error?.message || 'Неизвестная ошибка';
      displaySnackbar(`❌ Не удалось переместить тренировку: ${errorMessage}`, 'error');
      
      // Trigger re-render to show original state
      onEventUpdate?.();
    }
  }, [handleMove, onEventUpdate]);

  return {
    state,
    handleEventDrop,
    startDrag,
    endDrag,
    cancelOptimisticUpdate,
  };
};
