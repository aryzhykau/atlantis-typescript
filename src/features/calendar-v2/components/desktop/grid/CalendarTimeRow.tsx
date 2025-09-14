import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from '../../../types';
import { CalendarViewMode } from '../layout/CalendarV2Page';
import { CalendarSlot } from './CalendarSlot';

interface CalendarTimeRowProps {
  time: string;
  daysOfWeek: Dayjs[];
  viewMode: CalendarViewMode;
  getEventsForSlot: (day: Dayjs, time: string) => CalendarEvent[];
  onSlotClick: (day: Dayjs, time: string, events: CalendarEvent[]) => void;
  onEventClick: (event: CalendarEvent) => void;
  onViewAllEvents: (day: Dayjs, time: string, events: CalendarEvent[]) => void;
  responsiveStyles: any;
}

/**
 * Single time row across all days
 */
export const CalendarTimeRow: React.FC<CalendarTimeRowProps> = ({
  time,
  daysOfWeek,
  viewMode,
  getEventsForSlot,
  onSlotClick,
  onEventClick,
  onViewAllEvents,
  responsiveStyles,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const maxChips = isMobile ? 2 : (isTablet ? 3 : 2);

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: `${responsiveStyles.timeColumnWidth} repeat(7, 1fr)`,
      gap: 0.5,
      minHeight: responsiveStyles.slotHeight,
      mb: 0.5,
      width: '100%',
    }}>
      {/* Time label */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pr: 1,
        backgroundColor: 'transparent', // Inherit from parent
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: responsiveStyles.fontSize,
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {time}
        </Typography>
      </Box>
      
      {daysOfWeek.map(day => {
        const slotEvents = getEventsForSlot(day, time);
        const slotKey = `${day.format('YYYY-MM-DD')}-${time}`;

        return (
          <CalendarSlot
            key={slotKey}
            day={day}
            time={time}
            events={slotEvents}
            viewMode={viewMode}
            maxVisibleEvents={maxChips}
            onSlotClick={onSlotClick}
            onEventClick={onEventClick}
            onViewAllEvents={onViewAllEvents}
            responsiveStyles={responsiveStyles}
          />
        );
      })}
    </Box>
  );
};
