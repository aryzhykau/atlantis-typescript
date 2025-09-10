import React from 'react';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from '../../types';
import EnhancedDraggableTrainingChip from '../EnhancedDraggableTrainingChip';
import CalendarTrainingChip from '../CalendarTrainingChip';
import { useTheme, useMediaQuery, Box } from '@mui/material';

interface CalendarEventChipProps {
  event: CalendarEvent;
  day: Dayjs;
  time: string;
  onEventClick: (event: CalendarEvent) => void;
}

/**
 * Wrapper for individual event chips with drag functionality
 */
export const CalendarEventChip: React.FC<CalendarEventChipProps> = ({
  event,
  day,
  time,
  onEventClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const handleEventClick = () => {
    onEventClick(event);
  };

  return (
    <EnhancedDraggableTrainingChip
      event={event}
      day={day}
      time={time}
    >
      <Box
        sx={{
          display: 'inline-block',
          transform: 'scale(1.08)',
          transformOrigin: 'left top',
          mr: 0.5,
          mb: 0.5,
        }}
      >
        <CalendarTrainingChip
          event={event}
          isMobile={isMobile}
          isTablet={isTablet}
          onEventClick={handleEventClick}
        />
      </Box>
    </EnhancedDraggableTrainingChip>
  );
};
