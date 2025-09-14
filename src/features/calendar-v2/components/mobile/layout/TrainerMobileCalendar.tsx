import React, { useState, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import {
  useGetRealTrainingsQuery,
  useUpdateStudentAttendanceMutation,
  calendarApiV2,
} from '../../../../../store/apis/calendarApi-v2';
import { useDispatch } from 'react-redux';
import { useCurrentUser } from '../../../../../hooks/usePermissions';
import { useSnackbar } from '../../../../../hooks/useSnackBar';
import AnimatedLogoLoader from '../../common/loaders/AnimatedLogoLoader';
import { MobileTimeGrid } from '../time-grid';
import WeekdaySelector from '../controls/WeekdaySelector';
import MobileMonthPickerOverlay from '../controls/MobileMonthPickerOverlay';
import { normalizeEventsForWeek } from '../../../utils/normalizeEventsForWeek';

const TrainerMobileCalendar: React.FC = () => {
  const [weekStart, setWeekStart] = useState(dayjs().startOf('isoWeek'));
  const [selectedDay, setSelectedDay] = useState<Dayjs>(dayjs());
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const { displaySnackbar } = useSnackbar();
  const { user } = useCurrentUser();
  const [updateStudentAttendance] = useUpdateStudentAttendanceMutation();
  const dispatch = useDispatch();

  // Component render logging
  console.log('🎨 TrainerMobileCalendar render:', {
    weekStart: weekStart.format('YYYY-MM-DD'),
    selectedDay: selectedDay.format('YYYY-MM-DD'),
    user: user ? { id: user.id, name: `${user.first_name} ${user.last_name}` } : null
  });

  const realTrainingsParams = useMemo(() => ({
    startDate: weekStart.format('YYYY-MM-DD'),
    endDate: weekStart.endOf('isoWeek').format('YYYY-MM-DD'),
    trainerId: user?.id, // Only fetch current trainer's trainings
    withStudents: true, // Include student data for attendance management
  }), [weekStart, user?.id]);

  const { data: trainerTrainings, isLoading, error, isSuccess, isFetching } = useGetRealTrainingsQuery(realTrainingsParams, {
    skip: !user?.id, // Skip if no user ID available
  });


  // Normalize events for the week view - only trainer's own trainings
  const normalizedEvents = useMemo(() => {

    if (!trainerTrainings || !user?.id) {
      return {};
    }
    
    
    // Additional client-side filter to ensure only trainer's own events
      const filteredTrainings = trainerTrainings.filter(training => 
        training.trainer?.id === user.id
      );
    
    console.log('🎯 Filtered trainer trainings:', {
      originalCount: trainerTrainings.length,
      filteredCount: filteredTrainings.length,
      filteredTrainings: filteredTrainings
    });
    
    const normalized = normalizeEventsForWeek(filteredTrainings, weekStart);
    
    return normalized;
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
    let patchResult: any = null;
    try {
      // Find the training that contains this student
      const dayKey = selectedDay.format('YYYY-MM-DD');
      const dayEvents = normalizedEvents[dayKey] || [];
      
      let trainingId: number | null = null;
      let studentId: number | null = null;
      
      for (const event of dayEvents) {
        const student = event.raw?.students?.find((s: any) => {
          const attendanceId = s?.id ?? s?.real_training_id ?? s?.real_training_id;
          return attendanceId != null && attendanceId.toString() === studentTrainingId;
        });
        if (student) {
          trainingId = event.id;
          studentId = student.student?.id ?? student.student_id ?? null;
          break;
        }
      }
      
      if (!trainingId || !studentId) {
        console.error('TrainerMobileCalendar: Training or student not found', { trainingId, studentId, studentTrainingId });
        throw new Error('Тренировка не найдена');
      }
      console.log("showing snackbar")
      // Show loading snackbar while request is in-flight
      displaySnackbar('Отправка изменения...', 'info');

      // Optimistically update the cached getRealTrainings so UI updates immediately
  // declare patchResult in the function scope so rollback can reference it
  
      try {
        // dispatch a thunk - cast to any to avoid strict Dispatch typing
        patchResult = (dispatch as any)(
          calendarApiV2.util.updateQueryData('getRealTrainings', realTrainingsParams, (draft: any) => {
            const training = draft.find((t: any) => Number(t.id) === Number(trainingId));
            if (!training) return;
            const student = training.students?.find((s: any) => {
              return Number(s.id) === Number(studentTrainingId) || Number(s.student_id) === Number(studentId) || Number(s.student?.id) === Number(studentId);
            });
            if (student) {
              student.status = 'ABSENT';
              student.attendance_marked_at = new Date().toISOString();
            }
          })
        );
      } catch (e) {
        // if the optimistic patch fails, ensure patchResult is null so undo is not attempted
        patchResult = null;
      }

      // Call the RTK mutation
      const payload = {
        training_id: trainingId,
        student_id: studentId,
        status_of_presence: 'ABSENT',
      } as any;
      
      await updateStudentAttendance(payload).unwrap();

      // On success, show success snackbar
      displaySnackbar('Отмечено как пропуск', 'success');
    } catch (error: any) {
      // rollback optimistic update if applied
      try {
        if (patchResult && typeof patchResult.undo === 'function') patchResult.undo();
      } catch (undoErr) {
        console.warn('Failed to undo optimistic patch', undoErr);
      }

      // Show error and potentially rollback optimistic update
      console.error('TrainerMobileCalendar: Error in updateStudentAttendance', error);
      if (error?.status === 403 || error?.data?.detail?.includes('прав')) {
        displaySnackbar('Нет прав для изменения посещаемости', 'error');
      } else {
        displaySnackbar(error?.data?.detail || error?.message || 'Ошибка при обновлении посещаемости', 'error');
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
          <MobileTimeGrid
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
