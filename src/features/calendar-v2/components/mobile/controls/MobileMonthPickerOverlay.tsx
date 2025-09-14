import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  Drawer,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';

interface MobileMonthPickerOverlayProps {
  open: boolean;
  selectedDate: Dayjs;
  onSelect: (date: Dayjs | null) => void;
  onClose: () => void;
}

const MobileMonthPickerOverlay: React.FC<MobileMonthPickerOverlayProps> = ({
  open,
  selectedDate,
  onSelect,
  onClose,
}) => {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(selectedDate.startOf('month'));

  // Sync current month with selected date when the overlay opens
  useEffect(() => {
    if (open) {
      setCurrentMonth(selectedDate.startOf('month'));
    }
  }, [open, selectedDate]);

  const handleDateSelect = (date: Dayjs) => {
    onSelect(date);
    onClose(); // Close the calendar after selection
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'));
  };

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    
    // Get the Monday of the week containing the first day of the month
    const startOfCalendar = startOfMonth.startOf('isoWeek');
    // Get the Sunday of the week containing the last day of the month
    const endOfCalendar = endOfMonth.endOf('isoWeek');

    const days: Dayjs[] = [];
    let current = startOfCalendar;

    while (current.isBefore(endOfCalendar) || current.isSame(endOfCalendar, 'day')) {
      days.push(current);
      current = current.add(1, 'day');
    }

    return days;
  }, [currentMonth]);

  // Week day labels
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxHeight: '75vh',
          borderTopLeftRadius: theme.spacing(3),
          borderTopRightRadius: theme.spacing(3),
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            Выберите дату
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Month Navigation */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <IconButton
            onClick={handlePreviousMonth}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ChevronLeft />
          </IconButton>
          
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              textAlign: 'center',
              minWidth: 200,
            }}
          >
            {currentMonth.format('MMMM YYYY')}
          </Typography>
          
          <IconButton
            onClick={handleNextMonth}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Calendar Grid */}
        <Box sx={{ width: '100%' }}>
          {/* Week Day Headers */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: 1, 
            mb: 1 
          }}>
            {weekDays.map((day) => (
              <Box key={day} sx={{ textAlign: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem',
                    display: 'block',
                    py: 1,
                  }}
                >
                  {day}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Calendar Days */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: 1 
          }}>
            {calendarDays.map((day) => {
              const isCurrentMonth = day.isSame(currentMonth, 'month');
              const isSelected = day.isSame(selectedDate, 'day');
              const isToday = day.isSame(dayjs(), 'day');

              return (
                <Box key={day.format('YYYY-MM-DD')} sx={{ textAlign: 'center' }}>
                  <Button
                    onClick={() => handleDateSelect(day)}
                    sx={{
                      width: '100%',
                      height: 40,
                      minWidth: 40,
                      borderRadius: theme.spacing(1),
                      color: isCurrentMonth
                        ? isSelected
                          ? 'white'
                          : isToday
                          ? theme.palette.primary.main
                          : theme.palette.text.primary
                        : theme.palette.text.disabled,
                      backgroundColor: isSelected
                        ? theme.palette.primary.main
                        : 'transparent',
                      border: isToday && !isSelected
                        ? `2px solid ${theme.palette.primary.main}`
                        : 'none',
                      fontWeight: isSelected || isToday ? 600 : 400,
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: isSelected
                          ? theme.palette.primary.dark
                          : theme.palette.primary.light + '20',
                      },
                      transition: theme.transitions.create(['background-color', 'color'], {
                        duration: theme.transitions.duration.short,
                      }),
                    }}
                  >
                    {day.format('D')}
                  </Button>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default MobileMonthPickerOverlay;
