import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

import { useGetTrainerTrainingsQuery, useUpdateStudentAttendanceMutation } from '../api/trainerApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { TrainerScheduleHeader } from './TrainerScheduleHeader';
import { DateNavigation } from './DateNavigation';
import { TrainingCard } from './TrainingCard';
import { EmptyState } from './EmptyState';

export const TrainerSchedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const { displaySnackbar } = useSnackbar();
  
  const { data: trainings, isLoading, error } = useGetTrainerTrainingsQuery({
    date: selectedDate.format('YYYY-MM-DD'),
  });

  const [updateAttendance, { isLoading: isUpdatingAttendance }] = useUpdateStudentAttendanceMutation();

  const handlePrevDay = () => {
    setSelectedDate(prev => prev.subtract(1, 'day'));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => prev.add(1, 'day'));
  };

  const handleAttendanceUpdate = async (
    trainingId: number, 
    studentId: number, 
    status: 'PRESENT' | 'ABSENT'
  ) => {
    try {
      await updateAttendance({
        training_id: trainingId,
        student_id: studentId,
        data: { status }
      }).unwrap();
      
      displaySnackbar(
        `Отметка обновлена: ${status === 'PRESENT' ? 'Присутствовал' : 'Отсутствовал'}`,
        'success'
      );
    } catch (error: any) {
      displaySnackbar(
        error?.data?.detail || 'Ошибка при обновлении посещаемости',
        'error'
      );
    }
  };

  const canMarkAttendance = (trainingDate: string) => {
    // Можно отмечать только в день тренировки или после
    const trainingDay = dayjs(trainingDate);
    const today = dayjs();
    return trainingDay.isBefore(today, 'day') || trainingDay.isSame(today, 'day');
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        p: 2,
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Ошибка загрузки расписания</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'background.default',
    }}>
      {/* Фиксированный хедер */}
      <Box sx={{ 
        p: 2, 
        pb: 0,
        background: 'background.default',
        flexShrink: 0, // Не сжимается
      }}>
        <TrainerScheduleHeader />
      </Box>

      {/* Фиксированный селектор дат */}
      <Box sx={{ 
        p: 2, 
        pt: 2, // Отступ сверху
        background: 'background.default',
        flexShrink: 0, // Не сжимается
      }}>
        <DateNavigation
          selectedDate={selectedDate}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
        />
      </Box>

      {/* Скроллируемые карточки тренировок */}
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        p: 2,
        pt: 0,
        pb: 10, // Отступ для нижнего меню
        WebkitOverflowScrolling: 'touch',
        minHeight: 0, // КРИТИЧНО для flex контейнера
      }}>
        {!trainings || trainings.length === 0 ? (
          <EmptyState />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {trainings.map((training) => (
              <TrainingCard
                key={training.id}
                training={training}
                canMark={canMarkAttendance(training.training_date)}
                isUpdating={isUpdatingAttendance}
                onMarkPresent={(trainingId, studentId) => 
                  handleAttendanceUpdate(trainingId, studentId, 'PRESENT')
                }
                onMarkAbsent={(trainingId, studentId) => 
                  handleAttendanceUpdate(trainingId, studentId, 'ABSENT')
                }
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}; 