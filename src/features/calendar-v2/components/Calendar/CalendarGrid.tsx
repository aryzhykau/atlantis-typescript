/**
 * Calendar Grid Component
 * Handles the main calendar grid layout with time slots and day columns
 */

import React, { memo, useMemo } from 'react';
import { Box, Typography, useTheme, Tooltip, alpha } from '@mui/material';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from '../CalendarShell';
import { CalendarViewMode } from '../CalendarV2Page';
import { useResponsiveCalendarStyles } from '../../hooks/useResponsiveCalendarStyles';
import DroppableSlotComponent from '../DroppableSlot';
import DraggableTrainingChip from '../DraggableTrainingChip';
import CalendarTrainingChip from '../CalendarTrainingChip';

interface CalendarGridProps {
  daysOfWeek: Dayjs[];
  timeSlots: string[];
  viewMode: CalendarViewMode;
  getEventsForSlot: (day: Dayjs, time: string) => CalendarEvent[];
  onSlotClick: (event: React.MouseEvent<HTMLElement>, day: Dayjs, time: string, eventsInSlot: CalendarEvent[]) => void;
  onEventClick: (eventData: CalendarEvent) => void;
  onDrop: (event: CalendarEvent, sourceDay: Dayjs, sourceTime: string, targetDay: Dayjs, targetTime: string, isDuplicate?: boolean) => Promise<void>;
  isDragging: boolean;
  isAltPressed: boolean;
  getCurrentAltState: () => boolean;
  forceResetAltState: () => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = memo(({
  daysOfWeek,
  timeSlots,
  viewMode,
  getEventsForSlot,
  onSlotClick,
  onEventClick,
  onDrop,
  isDragging,
  isAltPressed,
  getCurrentAltState,
  forceResetAltState,
}) => {
  const theme = useTheme();
  const responsiveStyles = useResponsiveCalendarStyles();

  // Memoize max chips calculation
  const maxChips = useMemo(() => {
    switch (responsiveStyles.breakpoint) {
      case 'mobile': return 2;
      case 'tablet': return 3;
      default: return 4;
    }
  }, [responsiveStyles.breakpoint]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: theme.spacing(0.5),
      flexGrow: 1
    }}>
      {/* Header Row - Days of Week */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: responsiveStyles.gridTemplateColumns,
        gap: theme.spacing(0.5),
        alignItems: 'center'
      }}>
        {/* Time Column Header */}
        <Box sx={{ 
          textAlign: 'center', 
          p: 1,
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="caption" sx={{ fontSize: responsiveStyles.fontSize }}>
            Время
          </Typography>
        </Box>

        {/* Day Headers */}
        {daysOfWeek.map(day => (
          <Box 
            key={day.toString()} 
            sx={{ 
              textAlign: 'center', 
              p: 1, 
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
              minHeight: '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: responsiveStyles.fontSize }}>
              {day.format('dd').toUpperCase()}
            </Typography>
            <Typography variant="h6" sx={{ fontSize: responsiveStyles.isMobile ? '1rem' : '1.2rem' }}>
              {day.format('D')}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Time Slots Grid */}
      <Box sx={{ flexGrow: 1 }}>
        {timeSlots.map(time => (
          <Box 
            key={time} 
            sx={{
              display: 'grid',
              gridTemplateColumns: responsiveStyles.gridTemplateColumns,
              gap: theme.spacing(0.5),
              alignItems: 'stretch',
              mb: 0.5
            }}
          >
            {/* Time Column */}
            <Box sx={{ 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: responsiveStyles.slotHeight
            }}>
              <Typography variant="caption" sx={{ fontSize: responsiveStyles.fontSize }}>
                {time}
              </Typography>
            </Box>
            
            {/* Day Slots */}
            {daysOfWeek.map(day => {
              const slotEvents = getEventsForSlot(day, time);
              const visibleEvents = slotEvents.slice(0, maxChips);
              const hiddenEventsCount = slotEvents.length - maxChips;
              const slotKey = `${day.format('YYYY-MM-DD')}-${time}`;

              return (
                <DroppableSlotComponent
                  key={slotKey}
                  day={day}
                  time={time}
                  onClick={(e) => onSlotClick(e, day, time, slotEvents)}
                  onDrop={onDrop}
                  isAltPressed={isAltPressed}
                  getCurrentAltState={getCurrentAltState}
                  forceResetAltState={forceResetAltState}
                  sx={{
                    minHeight: responsiveStyles.slotHeight,
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
                      backgroundColor: slotEvents.length === 0 
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
                  {/* Event Chips */}
                  {slotEvents.length > 0 && (
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                      height: '100%',
                      overflow: 'visible',
                      paddingRight: viewMode === 'scheduleTemplate' ? '28px' : '0px',
                    }}>
                      {visibleEvents.map((eventItem) => (
                        <DraggableTrainingChip
                          key={eventItem.id}
                          event={eventItem}
                          day={day}
                          time={time}
                        >
                          <CalendarTrainingChip 
                            event={eventItem} 
                            isMobile={responsiveStyles.isMobile}
                            isTablet={responsiveStyles.isTablet}
                            onEventClick={onEventClick}
                          />
                        </DraggableTrainingChip>
                      ))}
                      
                      {/* Hidden Events Indicator */}
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
                              textAlign: 'center',
                              transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out, background-color 0.15s ease-out',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                backgroundColor: theme.palette.background.paper,
                                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.12)}`,
                              },
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                              }}
                            >
                              ещё +{hiddenEventsCount}
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  )}

                  {/* Template Mode UI Elements */}
                  {viewMode === 'scheduleTemplate' && (
                    <>
                      {/* Empty Slot Hint */}
                      {slotEvents.length === 0 && (
                        <Box
                          className="create-hint"
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            opacity: 0,
                            transition: 'opacity 0.15s ease-out',
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontSize: '0.7rem',
                              color: theme.palette.text.secondary,
                              textAlign: 'center',
                            }}
                          >
                            + Создать
                          </Typography>
                        </Box>
                      )}

                      {/* Add Button for Occupied Slots */}
                      {slotEvents.length > 0 && (
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
                              onSlotClick(e, day, time, slotEvents);
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
                    </>
                  )}
                </DroppableSlotComponent>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
});

CalendarGrid.displayName = 'CalendarGrid';

export default CalendarGrid;
