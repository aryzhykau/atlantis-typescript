import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Dayjs } from 'dayjs';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import MobileDropZone from '../drag-drop/MobileDropZone';
import MobileEventCard from './MobileEventCard';

interface MobileTimeRowProps {
  hour: number;
  hourHeightPx: number;
  selectedDay: Dayjs;
  dayEvents: NormalizedEvent[];
  readOnlyForTrainer?: boolean;
  onEventClick: (event: NormalizedEvent, slotEvents: NormalizedEvent[]) => void;
  onGroupClick: (events: NormalizedEvent[]) => void;
  onEventDrop: (
    event: any,
    sourceDay: Dayjs,
    sourceTime: string,
    targetDay: Dayjs,
    targetTime: string
  ) => void;
}

/**
 * Single hour row in the mobile time grid
 * Contains time label and horizontally scrollable events
 */
const MobileTimeRow: React.FC<MobileTimeRowProps> = ({
  hour,
  hourHeightPx,
  selectedDay,
  dayEvents,
  readOnlyForTrainer = false,
  onEventClick,
  onGroupClick,
  onEventDrop,
}) => {
  const theme = useTheme();
  const [visibleEvents, setVisibleEvents] = useState<Set<string>>(new Set());

  const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

  // Track which events are visible in the scroll container
  const handleIntersectionChange = (eventKey: string, ratio: number) => {
    setVisibleEvents(prev => {
      const newSet = new Set(prev);
      if (ratio > 0.5) {
        newSet.add(eventKey);
      } else {
        newSet.delete(eventKey);
      }
      return newSet;
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: `${hourHeightPx}px`,
        borderBottom: `1px solid ${theme.palette.divider}`,
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Time label */}
      <Box
        sx={{
          width: 60,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 2,
            height: '20%',
            background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            borderRadius: '0 2px 2px 0',
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.secondary,
            fontSize: '0.75rem',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {timeLabel}
        </Typography>
      </Box>

      {/* Event cards for this hour */}
      <MobileDropZone
        day={selectedDay}
        time={timeLabel}
        onDrop={onEventDrop}
        sx={{
          flex: 1,
          px: 0.5,
          py: 0,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(0.5),
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          touchAction: 'manipulation',
          minWidth: 0,
          position: 'relative',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          // Add subtle shadow hints when there are multiple events
          '&::before': dayEvents.length > 1 ? {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '50%',
            background: `linear-gradient(to right, ${theme.palette.primary.main}40, transparent)`,
            borderRadius: '0 2px 2px 0',
            pointerEvents: 'none',
            zIndex: 1,
          } : {},
          '&::after': dayEvents.length > 1 ? {
            content: '""',
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '50%',
            background: `linear-gradient(to left, ${theme.palette.primary.main}40, transparent)`,
            borderRadius: '2px 0 0 2px',
            pointerEvents: 'none',
            zIndex: 1,
          } : {},
        }}
      >
        {/* All event cards */}
        {dayEvents.map((event: NormalizedEvent, index: number) => {
          const eventKey = `${selectedDay.format('YYYY-MM-DD')}-${hour}-${event.id}`;
          const isInView = visibleEvents.has(eventKey);
          
          // Determine if event is partially hidden based on scroll position
          const totalEvents = dayEvents.length;
          const isPartiallyHidden = totalEvents > 1 && (
            index === 0 || // First event can be hidden when scrolled right
            index === totalEvents - 1 // Last event can be hidden when scrolled left
          );

          return (
            <MobileEventCard
              key={eventKey}
              event={event}
              isVisible={isInView}
              isPartiallyHidden={isPartiallyHidden}
              onClick={() => {
                onEventClick(event, dayEvents);
              }}
              onIntersectionChange={(ratio: number) => handleIntersectionChange(eventKey, ratio)}
              day={selectedDay}
              time={timeLabel}
              isDragAndDropEnabled={!readOnlyForTrainer}
            />
          );
        })}

        {dayEvents.length > 3 && !readOnlyForTrainer && (
          <Box
            onClick={() => onGroupClick(dayEvents)}
            sx={{
              minWidth: 64,
              height: 'calc(var(--hour-row-h, 44px) - 8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              backgroundColor: theme.palette.action.hover,
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            +{dayEvents.length - 3}
          </Box>
        )}
      </MobileDropZone>
    </Box>
  );
};

export default MobileTimeRow;
