import React, { useState, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import {
  useGetRealTrainingsQuery,
} from '../../../store/apis/calendarApi-v2';
import { useCurrentUser } from '../../../hooks/usePermissions';
import AnimatedLogoLoader from './AnimatedLogoLoader';
import MobileWeekTimeGrid from './MobileWeekTimeGrid';
import WeekdaySelector from './WeekdaySelector';
import MobileMonthPickerOverlay from './MobileMonthPickerOverlay';
import { normalizeEventsForWeek } from '../utils/normalizeEventsForWeek';
import { markStudentAbsent } from '../api/attendance';
import { useSnackbar } from '../../../hooks/useSnackBar';

const TrainerMobileCalendar: React.FC = () => {
  const [weekStart, setWeekStart] = useState(dayjs().startOf('isoWeek'));
  const [selectedDay, setSelectedDay] = useState<Dayjs>(dayjs());
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const { displaySnackbar } = useSnackbar();
  const { user } = useCurrentUser();

  const realTrainingsParams = useMemo(() => ({
    startDate: weekStart.format('YYYY-MM-DD'),
    endDate: weekStart.endOf('isoWeek').format('YYYY-MM-DD'),
    trainerId: user?.id, // Only fetch current trainer's trainings
  }), [weekStart, user?.id]);

  const { data: trainerTrainings, isLoading } = useGetRealTrainingsQuery(realTrainingsParams, {
    skip: !user?.id, // Skip if no user ID available
  });

  // Normalize events for the week view - only trainer's own trainings
  const normalizedEvents = useMemo(() => {
    if (!trainerTrainings || !user?.id) return {};
    
    // Additional client-side filter to ensure only trainer's own events
    const filteredTrainings = trainerTrainings.filter(training => 
      training.responsible_trainer_id === user.id
    );
    
    return normalizeEventsForWeek(filteredTrainings, weekStart);
  }, [trainerTrainings, weekStart, user?.id]);

  // Ensure selected day is within the current week when week changes
  useEffect(() => {
    if (!selectedDay.isBetween(weekStart, weekStart.endOf('isoWeek'), 'day', '[]')) {
      // If selected day is outside current week, default to today if it's in the week, otherwise Monday
      const today = dayjs();
      if (today.isBetween(weekStart, weekStart.endOf('isoWeek'), 'day', '[]')) {
        setSelectedDay(today);
      } else {
        setSelectedDay(weekStart);
      }
    }
  }, [weekStart, selectedDay, setSelectedDay]);

  // Handle day selection
  const handleDaySelect = (day: Dayjs) => {
    setSelectedDay(day);
    // If selected day is outside current week, navigate to that week
    const dayWeekStart = day.startOf('isoWeek');
    if (!dayWeekStart.isSame(weekStart, 'day')) {
      setWeekStart(dayWeekStart);
    }
  };

  // Handle marking student as absent with optimistic updates
  const handleMarkStudentAbsent = async (studentTrainingId: string): Promise<void> => {
    if (!selectedDay) return;

    try {
      // Find the training that contains this student
      const dayKey = selectedDay.format('YYYY-MM-DD');
      const dayEvents = normalizedEvents[dayKey] || [];
      
      let trainingId: string | null = null;
      let studentTraining: any = null;
      
      for (const event of dayEvents) {
        const student = event.raw?.students?.find((s: any) => s.id === studentTrainingId);
        if (student) {
          trainingId = event.id.toString();
          studentTraining = student;
          break;
        }
      }
      
      if (!trainingId || !studentTraining) {
        throw new Error('Тренировка не найдена');
      }

      // Optimistic update: show success message immediately
      displaySnackbar('Отмечено как пропуск', 'success');      // Call the API
      await markStudentAbsent(trainingId, studentTrainingId);
      
      // Note: The cache will be updated via RTK Query invalidation tags
    } catch (error: any) {
      // Show error and potentially rollback optimistic update
      if (error?.message?.includes('403') || error?.message?.includes('permission')) {
        displaySnackbar('Нет прав для изменения посещаемости', 'error');
      } else {
        displaySnackbar(error?.message || 'Ошибка при обновлении посещаемости', 'error');
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh', // occupy the full viewport so inner scroll doesn't move page header
          overflow: 'hidden',
          p: 1,
          gap: 0.5,
        }}
      >
        {/* Sticky header: Only Weekday selector (no tabs or add button for trainers) */}
        <Box
          sx={(theme) => ({
            position: 'sticky',
            top: 0,
            zIndex: theme.zIndex.appBar + 2,
            bgcolor: theme.palette.background.paper,
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            px: 0.5,
            py: 0.5,
            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            '& > *': {
              marginBottom: 0,
            },
          })}
        >
          {/* Month Picker Button Row */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Box
              onClick={() => setMonthPickerOpen(true)}
              sx={(theme) => ({
                display: 'inline-flex',
                alignItems: 'center',
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              })}
            >
              {weekStart.format('MMMM YYYY')}
            </Box>
          </Box>

          <WeekdaySelector
            weekStart={weekStart}
            selectedDay={selectedDay}
            onDaySelect={handleDaySelect}
          />
        </Box>

        {/* Time Grid (only this area scrolls) */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <MobileWeekTimeGrid
            eventsMap={normalizedEvents}
            selectedDay={selectedDay}
            readOnlyForTrainer={true}
            onMarkStudentAbsent={handleMarkStudentAbsent}
          />
        </Box>

        {/* Loader overlay: blocks interactions when fetching trainings */}
        <AnimatedLogoLoader open={isLoading} message="Загружаются тренировки..." />

        {/* Month Picker Overlay */}
        <MobileMonthPickerOverlay
          open={monthPickerOpen}
          selectedDate={selectedDay}
          onSelect={(date) => {
            if (date) {
              handleDaySelect(date);
              setMonthPickerOpen(false);
            }
          }}
          onClose={() => setMonthPickerOpen(false)}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default TrainerMobileCalendar;
