import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { CalendarViewMode } from '../../desktop/layout/CalendarV2Page';

interface WeekdaySelectorProps {
  weekStart: Dayjs;
  selectedDay?: Dayjs;
  onDaySelect?: (day: Dayjs) => void;
  viewMode?: CalendarViewMode;
}

const WeekdaySelector: React.FC<WeekdaySelectorProps> = ({
  weekStart,
  selectedDay,
  onDaySelect,
  viewMode,
}) => {
  const theme = useTheme();
  const isTemplateMode = viewMode === 'scheduleTemplate';

  // Generate weekdays
  const weekdays = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
  }, [weekStart]);

  const handlePrevDay = () => {
    if (onDaySelect) {
      const currentDay = selectedDay || dayjs();
      const prevDay = currentDay.subtract(1, 'day');
      onDaySelect(prevDay);
    }
  };

  const handleNextDay = () => {
    if (onDaySelect) {
      const currentDay = selectedDay || dayjs();
      const nextDay = currentDay.add(1, 'day');
      onDaySelect(nextDay);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        p: 1,
        gap: 0.5,
        mb: 2,
        width: '100%',
        boxSizing: 'border-box',
        alignItems: 'center',
      }}
    >
      {/* Previous day button */}
      <IconButton
        onClick={handlePrevDay}
        size="small"
        sx={{
          width: 32,
          height: 32,
          background: theme.palette.action.hover,
          color: theme.palette.primary.main,
          borderRadius: theme.spacing(1),
          transition: theme.transitions.create(['background', 'transform'], {
            duration: theme.transitions.duration.short,
          }),
          '&:hover': {
            background: theme.palette.primary.main + '20',
            transform: 'translateX(-1px)',
          },
          '&:active': {
            transform: 'translateX(0px)',
          },
        }}
      >
        <ChevronLeftIcon fontSize="small" />
      </IconButton>

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          gap: 0.5,
          justifyContent: 'space-between',
          width: '100%',
          minWidth: 0,
        }}
      >
        {weekdays.map(day => {
          const isToday = day.isSame(dayjs(), 'day');
          const isSelected = selectedDay ? day.isSame(selectedDay, 'day') : false;
          const shouldHighlight = isSelected || (isToday && !selectedDay);
          
          return (
            <Box
              key={day.format('YYYY-MM-DD')}
              onClick={() => onDaySelect?.(day)}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: onDaySelect ? 'pointer' : 'default',
                borderRadius: theme.spacing(1.5),
                p: 0.5,
                minWidth: 0,
                transition: theme.transitions.create(['transform', 'background'], {
                  duration: theme.transitions.duration.short,
                }),
                '&:hover': onDaySelect ? {
                  transform: 'scale(1.05)',
                  backgroundColor: theme.palette.primary.main + '10',
                } : {},
                '&:active': onDaySelect ? {
                  transform: 'scale(0.95)',
                } : {},
              }}
            >
              {/* Day name */}
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: shouldHighlight 
                    ? theme.palette.primary.main 
                    : theme.palette.text.secondary,
                  mb: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {day.format('dd')}
              </Typography>
              
              {/* Day number in circle - Only shown in non-template mode */}
              {!isTemplateMode && (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: shouldHighlight
                      ? theme.palette.primary.main
                      : isToday
                      ? theme.palette.primary.main + '20'
                      : 'transparent',
                    border: isToday && !shouldHighlight
                      ? `1px solid ${theme.palette.primary.main}`
                      : shouldHighlight
                      ? 'none'
                      : `1px solid ${theme.palette.divider}`,
                    transition: theme.transitions.create(['background', 'border'], {
                      duration: theme.transitions.duration.short,
                    }),
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: shouldHighlight ? 700 : 600,
                      fontSize: '0.8rem',
                      color: shouldHighlight
                        ? 'white'
                        : isToday
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                    }}
                  >
                    {day.format('D')}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Next day button */}
      <IconButton
        onClick={handleNextDay}
        size="small"
        sx={{
          width: 32,
          height: 32,
          background: theme.palette.action.hover,
          color: theme.palette.primary.main,
          borderRadius: theme.spacing(1),
          transition: theme.transitions.create(['background', 'transform'], {
            duration: theme.transitions.duration.short,
          }),
          '&:hover': {
            background: theme.palette.primary.main + '20',
            transform: 'translateX(1px)',
          },
          '&:active': {
            transform: 'translateX(0px)',
          },
        }}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default WeekdaySelector;
