import React, { useEffect, useState, useCallback } from 'react';
import { SwipeableDrawer, Box, useTheme } from '@mui/material';
import { EventBottomSheetProps } from './types';
import { useEventStudentManagement } from '../../../hooks/useEventStudentManagement';
import SingleEventView from './SingleEventView';
import EventGroupView from './EventGroupView';
import EditBottomSheet from './EditBottomSheet';
import TransferBottomSheet from './TransferBottomSheet';

/**
 * EventBottomSheetRefactored - Main container component for event details
import React, { useEffect, useState, useCallback } from 'react';
import { SwipeableDrawer, Box, useTheme } from '@mui/material';
import { EventBottomSheetProps } from './types';
import { useEventStudentManagement } from '../../../hooks/useEventStudentManagement';
import SingleEventView from './SingleEventView';
import EventGroupView from './EventGroupView';
import EditBottomSheet from './EditBottomSheet';
import TransferBottomSheet from './TransferBottomSheet';

/**
 * EventBottomSheetRefactored - Main container component for event details
 * Single responsibility: Container orchestration and modal behavior
 */
const EventBottomSheetRefactored: React.FC<EventBottomSheetProps> = ({
  open,
  eventOrHourGroup,
  mode,
  onClose,
  onDelete,
  onRequestEdit,
  onRequestMove,
  onAssignedStudentDeleted,
}) => {
  const theme = useTheme();

  const {
    setLocalEvent
  } = useEventStudentManagement(eventOrHourGroup, onAssignedStudentDeleted);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [currentEditEvent, setCurrentEditEvent] = useState<any | null>(null);
  const [currentTransferEvent, setCurrentTransferEvent] = useState<any | null>(null);

  const handleOpenEdit = useCallback((evt?: any) => {
    const ev = evt ?? (!Array.isArray(eventOrHourGroup) ? eventOrHourGroup : null);
    if (!ev || Array.isArray(ev)) return;
    setCurrentEditEvent(ev);
    setShowEditForm(true);
  }, [eventOrHourGroup]);

  const handleCloseEdit = useCallback(() => {
    setShowEditForm(false);
    setCurrentEditEvent(null);
  }, []);

  // Accept the same signature as EditBottomSheet: (event, updates)
  const handleSaveEdit = useCallback((evOrUpdated: any, maybeUpdates?: any) => {
    // evOrUpdated may be either the original event (first arg) when child passes two args,
    // or the updates object (when child passed single arg). Normalize and forward properly.
    try {
      const sourceEvent = evOrUpdated && evOrUpdated.id ? evOrUpdated : currentEditEvent;
      const updates = maybeUpdates ?? (evOrUpdated && !evOrUpdated.id ? evOrUpdated : undefined);
      console.debug('EventBottomSheetRefactored.handleSaveEdit', { sourceEvent, updates });
      onRequestEdit?.(sourceEvent, updates);
    } catch (e) {
      console.warn('Failed to forward edit save', e);
    }
    handleCloseEdit();
  }, [onRequestEdit, currentEditEvent, handleCloseEdit]);

  const handleOpenTransfer = useCallback((evt?: any) => {
    const ev = evt ?? (!Array.isArray(eventOrHourGroup) ? eventOrHourGroup : null);
    if (!ev || Array.isArray(ev)) return;
    setCurrentTransferEvent(ev);
    setShowTransferForm(true);
  }, [eventOrHourGroup]);

  const handleCloseTransfer = useCallback(() => {
    setShowTransferForm(false);
    setCurrentTransferEvent(null);
  }, []);

  const handleSaveTransfer = useCallback((ev: any, transferData: any) => {
    try {
      const sourceEvent = currentTransferEvent || ev;
      console.debug('EventBottomSheetRefactored.handleSaveTransfer', { sourceEvent, transferData });
      onRequestMove?.(sourceEvent, transferData);
    } catch (e) {
      console.warn('Failed to forward transfer save', e);
    }
    handleCloseTransfer();
  }, [onRequestMove, currentTransferEvent, handleCloseTransfer]);

  // Update local event when prop changes
  useEffect(() => {
    if (!Array.isArray(eventOrHourGroup)) {
      setLocalEvent(eventOrHourGroup);
    } else {
      setLocalEvent(null);
    }
  }, [eventOrHourGroup, setLocalEvent]);

  if (!eventOrHourGroup) return null;

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            zIndex: 1400,
            background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
            boxShadow: '0px -12px 30px rgba(15,23,42,0.18)',
            backdropFilter: 'blur(8px)',
            maxHeight: '85vh',
            overflow: 'hidden',
          },
        }}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
      >
        {/* Handle bar for visual feedback */}
        <Box sx={{ 
          width: 48, 
          height: 4, 
          background: theme.palette.divider, 
          borderRadius: 2, 
          mx: 'auto', 
          mt: 2, 
          mb: 1,
          opacity: 0.6,
        }} />

        {/* Content container with proper padding */}
        <Box sx={{ 
          overflowY: 'auto',
          height: '100%',
        }}>
          {/* Render SingleEventView or EventGroupView based on mode */}
          {mode === 'event' && !Array.isArray(eventOrHourGroup) ? (
            <SingleEventView
              event={eventOrHourGroup}
              eventOrHourGroup={eventOrHourGroup}
              onClose={onClose}
              // override: let SingleEventView call this to open inline forms
              onRequestEdit={handleOpenEdit}
              onRequestMove={handleOpenTransfer}
              onDelete={onDelete}
              onAssignedStudentDeleted={onAssignedStudentDeleted}
            />
          ) : Array.isArray(eventOrHourGroup) ? (
            <EventGroupView
              events={eventOrHourGroup}
              onClose={onClose}
              onRequestMove={onRequestMove}
              onDelete={onDelete}
            />
          ) : null}
        </Box>
      </SwipeableDrawer>

      {/* Edit Bottom Sheet - Only for non-trainer users */}
      <EditBottomSheet
        event={currentEditEvent}
        open={showEditForm}
        onSave={handleSaveEdit}
        onClose={handleCloseEdit}
      />

      {/* Transfer Bottom Sheet - Only for non-trainer users */}
      <TransferBottomSheet
        event={currentTransferEvent}
        open={showTransferForm}
        onSave={handleSaveTransfer}
        onClose={handleCloseTransfer}
      />
    </>
  );
};

export default EventBottomSheetRefactored;
