import React, { useMemo } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from '../../types';
import { CalendarViewMode } from '../CalendarV2Page';

import { CalendarDaysHeader } from './CalendarDaysHeader';
import { CalendarTimeRow } from './CalendarTimeRow';
import { generateTimeSlots } from '../../utils/slotUtils';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { useResponsiveCalendarStyles } from '../../hooks/useResponsiveCalendarStyles';

interface CalendarGridProps {
  currentDate: Dayjs;
  viewMode: CalendarViewMode;
  eventsToDisplay: CalendarEvent[];
  onSlotClick: (day: Dayjs, time: string, events: CalendarEvent[]) => void;
  onEventClick: (event: CalendarEvent) => void;
}

/**
 * Main calendar grid component
 * Renders the time slots and days grid
 */
export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  viewMode,
  eventsToDisplay,
  onSlotClick,
  onEventClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const responsiveStyles = useResponsiveCalendarStyles();

  const daysOfWeek = useMemo(() => {
    const startOfWeek = currentDate.startOf('isoWeek');
    return Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'));
  }, [currentDate]);

  const timeSlots = useMemo(() => generateTimeSlots(6, 22), []);
  const { getEventsForSlot } = useCalendarEvents(eventsToDisplay, viewMode, currentDate);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      minHeight: 0,
      backgroundColor: 'transparent',
      overflow: 'hidden', // Prevent individual scrolling
    }}>
      {/* Scrollable container for both header and body */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden', // No horizontal scroll
      }}>
        {/* Header with days */}
        <CalendarDaysHeader 
          daysOfWeek={daysOfWeek} 
          isMobile={isMobile}
          responsiveStyles={responsiveStyles}
        />
        
        {/* Calendar body */}
        {timeSlots.map(time => (
          <CalendarTimeRow
            key={time}
            time={time}
            daysOfWeek={daysOfWeek}
            viewMode={viewMode}
            getEventsForSlot={getEventsForSlot}
            onSlotClick={onSlotClick}
            onEventClick={onEventClick}
            responsiveStyles={responsiveStyles}
          />
        ))}
      </Box>
    </Box>
  );
};
