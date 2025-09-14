import React, { useEffect } from 'react';
import { SwipeableDrawer, Box, useTheme } from '@mui/material';
import { EventBottomSheetProps } from './types';
import { useEventStudentManagement } from '../../../hooks/useEventStudentManagement';
import SingleEventView from './SingleEventView';
import EventGroupView from './EventGroupView';

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
            onRequestEdit={onRequestEdit}
            onRequestMove={onRequestMove}
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
  );
};

export default EventBottomSheetRefactored;
