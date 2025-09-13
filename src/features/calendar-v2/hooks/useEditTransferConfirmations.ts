import { useState, useCallback } from 'react';
import { NormalizedEvent } from '../utils/normalizeEventsForWeek';

/**
 * useEditConfirmation - Custom hook for managing edit confirmation state
 * Single responsibility: Edit confirmation state management
 */
export const useEditConfirmation = (
  onEdit?: (event: NormalizedEvent) => void
) => {
  const [pendingEditEvent, setPendingEditEvent] = useState<NormalizedEvent | null>(null);

  const handleRequestEdit = useCallback((event: NormalizedEvent) => {
    setPendingEditEvent(event);
  }, []);

  const confirmEdit = useCallback(() => {
    if (!pendingEditEvent) return;
    onEdit?.(pendingEditEvent);
    setPendingEditEvent(null);
  }, [pendingEditEvent, onEdit]);

  const cancelEdit = useCallback(() => {
    setPendingEditEvent(null);
  }, []);

  return {
    pendingEditEvent,
    handleRequestEdit,
    confirmEdit,
    cancelEdit,
  };
};

/**
 * useTransferConfirmation - Custom hook for managing transfer confirmation state
 * Single responsibility: Transfer confirmation state management
 */
export const useTransferConfirmation = (
  onTransfer?: (event: NormalizedEvent) => void
) => {
  const [pendingTransferEvent, setPendingTransferEvent] = useState<NormalizedEvent | null>(null);

  const handleRequestTransfer = useCallback((event: NormalizedEvent) => {
    setPendingTransferEvent(event);
  }, []);

  const confirmTransfer = useCallback(() => {
    if (!pendingTransferEvent) return;
    onTransfer?.(pendingTransferEvent);
    setPendingTransferEvent(null);
  }, [pendingTransferEvent, onTransfer]);

  const cancelTransfer = useCallback(() => {
    setPendingTransferEvent(null);
  }, []);

  return {
    pendingTransferEvent,
    handleRequestTransfer,
    confirmTransfer,
    cancelTransfer,
  };
};
