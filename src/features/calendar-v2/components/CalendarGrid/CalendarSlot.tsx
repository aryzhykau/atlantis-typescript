import React from 'react';
import { Box, Typography, Tooltip, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from '../../types';
import { CalendarViewMode } from '../CalendarV2Page';
import { CalendarEventChip } from './CalendarEventChip';
import EnhancedDroppableSlot from '../EnhancedDroppableSlot';
import { useCalendarDragDrop } from '../../hooks/useCalendarDragDrop';
import { useAltKey } from '../../hooks/useAltKey';
import { useDragState } from '../../hooks/useDragState';

interface CalendarSlotProps {
  day: Dayjs;
  time: string;
  events: CalendarEvent[];
  viewMode: CalendarViewMode;
  maxVisibleEvents: number;
  onSlotClick: (day: Dayjs, time: string, events: CalendarEvent[]) => void;
  onEventClick: (event: CalendarEvent) => void;
  responsiveStyles: any;
}

/**
 * Individual calendar slot component
 * Handles events display and interactions for a specific time slot
 */
export const CalendarSlot: React.FC<CalendarSlotProps> = ({
  day,
  time,
  events,
  viewMode,
  maxVisibleEvents,
  onSlotClick,
  onEventClick,
  responsiveStyles,
}) => {
  const theme = useTheme();
  const { handleTrainingDrop } = useCalendarDragDrop(viewMode, day);
  const { isAltPressed, getCurrentAltState, forceResetAltState } = useAltKey();
  const { state: dragState } = useDragState();
  
  const visibleEvents = events.slice(0, maxVisibleEvents);
  const hiddenEventsCount = events.length - maxVisibleEvents;
  const isDragging = dragState.isDragging;

  const handleSlotClickInternal = (e: React.MouseEvent) => {
    e.preventDefault();
    onSlotClick(day, time, events);
  };

  return (
    <EnhancedDroppableSlot
      day={day}
      time={time}
      onClick={handleSlotClickInternal}
      onDrop={handleTrainingDrop}
      isAltPressed={isAltPressed}
      getCurrentAltState={getCurrentAltState}
      forceResetAltState={forceResetAltState}
      sx={{
        minHeight: responsiveStyles.slotHeight,
        width: '100%',
        minWidth: 0, // Allow shrinking
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        p: responsiveStyles.cardPadding,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        cursor: viewMode === 'scheduleTemplate' ? 'pointer' : 'default',
        transition: 'background-color 0.15s ease-out, box-shadow 0.15s ease-out',
        overflow: 'visible',
        '&:hover': viewMode === 'scheduleTemplate' ? {
          backgroundColor: events.length === 0 
            ? theme.palette.background.default 
            : alpha(theme.palette.primary.main, 0.04),
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.4)}`,
          '& .create-hint': {
            opacity: 0.6,
          },
          '& .add-button': {
            opacity: 1,
          },
        } : {},
      }}
    >
      {/* Events display */}
      {events.length > 0 ? (
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          height: '100%',
          overflow: 'visible',
          paddingRight: viewMode === 'scheduleTemplate' ? '28px' : '0px',
        }}>
          {/* Visible events */}
          {visibleEvents.map((event) => (
            <CalendarEventChip
              key={event.id}
              event={event}
              day={day}
              time={time}
              onEventClick={onEventClick}
            />
          ))}
          
          {/* Overflow indicator */}
          {hiddenEventsCount > 0 && (
            <Tooltip 
              title={isDragging ? '' : `Ещё ${hiddenEventsCount} тренировок. Кликните чтобы увидеть все.`}
              arrow 
              placement="top"
              disableHoverListener={isDragging}
              disableFocusListener={isDragging}
              disableTouchListener={isDragging}
              open={isDragging ? false : undefined}
            >
              <Box
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.95),
                  borderLeft: `3px solid ${theme.palette.primary.main}`,
                  borderRadius: 2,
                  px: 1,
                  py: 0.5,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-out',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
                onClick={handleSlotClickInternal}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    color: theme.palette.primary.main,
                  }}
                >
                  +{hiddenEventsCount} ещё
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Box>
      ) : (
        // Empty slot with create hint
        viewMode === 'scheduleTemplate' && (
          <Box
            className="create-hint"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              opacity: 0,
              transition: 'opacity 0.15s ease-out',
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
              }}
            >
              + Создать
            </Typography>
          </Box>
        )
      )}

      {/* Add button for occupied slots */}
      {events.length > 0 && viewMode === 'scheduleTemplate' && (
        <Tooltip 
          title={isDragging ? '' : "Добавить ещё одну тренировку в этот слот"} 
          arrow 
          placement="top"
          disableHoverListener={isDragging}
          disableFocusListener={isDragging}
          disableTouchListener={isDragging}
          open={isDragging ? false : undefined}
        >
          <Box
            className="add-button"
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.primary.main, 0.9),
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.15s ease-out, background-color 0.15s ease-out',
              cursor: 'pointer',
              zIndex: 10,
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSlotClick(day, time, events);
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              +
            </Typography>
          </Box>
        </Tooltip>
      )}
    </EnhancedDroppableSlot>
  );
};
