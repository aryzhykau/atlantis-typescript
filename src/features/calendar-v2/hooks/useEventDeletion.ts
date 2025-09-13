import { useState, useCallback } from 'react';
import { NormalizedEvent } from '../utils/normalizeEventsForWeek';

/**
 * useEventDeletion - Custom hook for managing event deletion state
 * Single responsibility: Delete operation state management
 */
export const useEventDeletion = (
  onDelete?: (event: NormalizedEvent) => void
) => {
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState<NormalizedEvent | null>(null);

  const handleDelete = useCallback((event: NormalizedEvent) => {
    setPendingDeleteEvent(event);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!pendingDeleteEvent) return;
    onDelete?.(pendingDeleteEvent);
    setPendingDeleteEvent(null);
  }, [pendingDeleteEvent, onDelete]);

  const cancelDelete = useCallback(() => {
    setPendingDeleteEvent(null);
  }, []);

  return {
    pendingDeleteEvent,
    handleDelete,
    confirmDelete,
    cancelDelete,
  };
};
