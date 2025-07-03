import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Container,
  Button,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Person,
  AccessTime,
  Group,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);
import { useGetTrainerTrainingsQuery, useUpdateStudentAttendanceMutation } from '../api/trainerApi';
import { useSnackbar } from '../../../hooks/useSnackBar';

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

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // "HH:MM"
  };

  const getStudentCount = (training: any) => {
    return training.students?.filter((s: any) => 
      !['CANCELLED_SAFE', 'CANCELLED_PENALTY'].includes(s.status)
    ).length || 0;
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

  const shouldShowAttendanceButtons = (studentStatus: string) => {
    // Показываем кнопки для всех активных студентов (не отмененных)
    return !['CANCELLED_SAFE', 'CANCELLED_PENALTY'].includes(studentStatus);
  };

  const getAttendanceButtons = (
    trainingId: number,
    studentId: number, 
    currentStatus: string,
    trainingDate: string
  ) => {
    if (!shouldShowAttendanceButtons(currentStatus)) {
      return null;
    }

    const canMark = canMarkAttendance(trainingDate);
    const showPresentButton = currentStatus === 'REGISTERED' || currentStatus === 'ABSENT';
    const showAbsentButton = currentStatus === 'REGISTERED' || currentStatus === 'PRESENT';

    return (
      <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
        {showPresentButton && (
          <IconButton
            size="small"
            onClick={() => canMark && handleAttendanceUpdate(trainingId, studentId, 'PRESENT')}
            disabled={isUpdatingAttendance || !canMark}
            sx={{
              bgcolor: canMark ? 'success.main' : 'grey.400',
              color: 'white',
              '&:hover': { bgcolor: canMark ? 'success.dark' : 'grey.400' },
              '&.Mui-disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500',
              },
              width: 32,
              height: 32,
            }}
            title={!canMark ? 'Отметки доступны в день тренировки' : 'Отметить присутствие'}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
        )}
        {showAbsentButton && (
          <IconButton
            size="small"
            onClick={() => canMark && handleAttendanceUpdate(trainingId, studentId, 'ABSENT')}
            disabled={isUpdatingAttendance || !canMark}
            sx={{
              bgcolor: canMark ? 'error.main' : 'grey.400',
              color: 'white',
              '&:hover': { bgcolor: canMark ? 'error.dark' : 'grey.400' },
              '&.Mui-disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500',
              },
              width: 32,
              height: 32,
            }}
            title={!canMark ? 'Отметки доступны в день тренировки' : 'Отметить отсутствие'}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pb: 8 }}>
      {/* Date Navigation */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}>
        <IconButton onClick={handlePrevDay} size="large">
          <ChevronLeft />
        </IconButton>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {selectedDate.format('D MMMM')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedDate.format('dddd')}
          </Typography>
        </Box>
        
        <IconButton onClick={handleNextDay} size="large">
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Training List */}
      <Container sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        {!trainings || trainings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Нет тренировок на этот день
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {trainings.map((training) => (
              <Card key={training.id} sx={{ 
                borderLeft: 4, 
                borderColor: training.training_type?.color || 'primary.main',
                '&:hover': {
                  boxShadow: 3,
                },
              }}>
                <CardContent sx={{ pb: 2 }}>
                  {/* Training Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {training.training_type?.name || 'Тренировка'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(training.start_time)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Chip
                      icon={<Group />}
                      label={`${getStudentCount(training)} учеников`}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderColor: training.training_type?.color || 'primary.main',
                        color: training.training_type?.color || 'primary.main',
                      }}
                    />
                  </Box>

                  {/* Students */}
                  {training.students && training.students.length > 0 && (
                    <Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Ученики:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {training.students.map((studentTraining) => {
                          const isCancelled = ['CANCELLED_SAFE', 'CANCELLED_PENALTY'].includes(studentTraining.status);
                          return (
                            <Box key={studentTraining.student_id} sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              opacity: isCancelled ? 0.6 : 1,
                            }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                <Person fontSize="small" />
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 500,
                                    textDecoration: isCancelled ? 'line-through' : 'none',
                                  }}
                                >
                                  {studentTraining.student.first_name} {studentTraining.student.last_name}
                                </Typography>
                              </Box>
                              
                              {/* Status Chip */}
                              <Chip
                                label={
                                  studentTraining.status === 'REGISTERED' ? 'Записан' :
                                  studentTraining.status === 'PRESENT' ? 'Присутствовал' :
                                  studentTraining.status === 'ABSENT' ? 'Отсутствовал' :
                                  studentTraining.status === 'CANCELLED_SAFE' ? 'Отменено' :
                                  studentTraining.status === 'CANCELLED_PENALTY' ? 'Отменено (штраф)' :
                                  'Неизвестно'
                                }
                                size="small"
                                color={
                                  studentTraining.status === 'PRESENT' ? 'success' :
                                  studentTraining.status === 'ABSENT' ? 'error' :
                                  ['CANCELLED_SAFE', 'CANCELLED_PENALTY'].includes(studentTraining.status) ? 'default' :
                                  'primary'
                                }
                                variant={isCancelled ? 'outlined' : 'filled'}
                              />

                              {/* Attendance Buttons */}
                              {getAttendanceButtons(
                                training.id,
                                studentTraining.student_id,
                                studentTraining.status,
                                training.training_date
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}; 