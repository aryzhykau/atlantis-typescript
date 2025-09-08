import React from 'react';
import { Box, Avatar, Typography, Chip } from '@mui/material';
import { TouchApp } from '@mui/icons-material';
import { useGradients } from '../hooks/useGradients';
import { AttendanceButtons } from './AttendanceButtons';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { TrainerStudent } from '../models';

interface StudentAttendanceItemProps {
  studentTraining: TrainerStudent;
  trainingId: number;
  trainingDate: string;
  canMark: boolean;
  isUpdating: boolean;
  onMarkAbsent: (trainingId: number, studentId: number) => void;
}

export const StudentAttendanceItem: React.FC<StudentAttendanceItemProps> = ({
  studentTraining,
  trainingId,
  trainingDate,
  canMark,
  isUpdating,
  onMarkAbsent,
}) => {
  const gradients = useGradients();
  const theme = useTheme();
  
  const isCancelled = ['CANCELLED_SAFE', 'CANCELLED_PENALTY'].includes(studentTraining.status);
  const firstName = studentTraining.student.first_name;
  const lastName = studentTraining.student.last_name;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'REGISTERED': return 'Записан';
      case 'PRESENT': return 'Присутствовал';
      case 'ABSENT': return 'Отсутствовал';
      case 'CANCELLED_SAFE': return 'Отменено';
      case 'CANCELLED_PENALTY': return 'Отменено (штраф)';
      default: return 'Неизвестно';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTERED': return 'primary';
      case 'PRESENT': return 'success';
      case 'ABSENT': return 'error';
      case 'CANCELLED_SAFE':
      case 'CANCELLED_PENALTY': return 'default';
      default: return 'primary';
    }
  };

  const handleQuickMark = (status: 'ABSENT') => {
    if (canMark && !isUpdating) {
      if (status === 'ABSENT') {
        onMarkAbsent(trainingId, studentTraining.student_id);
      }
    }
  };

  // Only REGISTERED students can be quickly marked as ABSENT
  // PRESENT status is set automatically by cron job, not manually
  const canQuickMark = canMark && !isUpdating && 
    studentTraining.status === 'REGISTERED';

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1.5,
      p: 2,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      background: 'background.paper',
      opacity: isCancelled ? 0.6 : 1,
      transition: 'all 0.2s ease-in-out',
      cursor: canQuickMark ? 'pointer' : 'default',
      '&:hover': {
        borderColor: 'primary.main',
        boxShadow: 2,
        transform: 'translateY(-1px)',
        ...(canQuickMark && {
          background: alpha(theme.palette.primary.main, 0.05),
        }),
      },
      '&:active': canQuickMark ? {
        transform: 'translateY(0px)',
        boxShadow: 1,
      } : {},
    }}
    onClick={() => {
      // Быстрая отметка: только записанные студенты могут быть отмечены как отсутствующие
      if (studentTraining.status === 'REGISTERED') {
        handleQuickMark('ABSENT');
      }
    }}
    title={canQuickMark ? 'Нажмите, чтобы отметить отсутствие' : 
           studentTraining.status === 'PRESENT' ? 'Статус "Присутствовал" устанавливается автоматически' : ''}
    >
      <Avatar 
        sx={{ 
          width: 44, 
          height: 44, 
          background: gradients.success,
          fontSize: '1.1rem',
          fontWeight: 600,
        }}
      >
        {firstName[0]}{lastName[0]}
      </Avatar>
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            textDecoration: isCancelled ? 'line-through' : 'none',
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {firstName} {lastName}
        </Typography>
        {canQuickMark && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <TouchApp sx={{ fontSize: 12, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Нажмите для отметки отсутствия
            </Typography>
          </Box>
        )}
        {studentTraining.status === 'PRESENT' && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Автоматически отмечен системой
          </Typography>
        )}
      </Box>
      
      <Chip
        label={getStatusLabel(studentTraining.status)}
        size="small"
        color={getStatusColor(studentTraining.status) as any}
        variant={isCancelled ? 'outlined' : 'filled'}
        sx={{ 
          borderRadius: 2,
          fontWeight: 500,
          fontSize: '0.75rem',
          height: 28,
        }}
      />

      <AttendanceButtons
        trainingId={trainingId}
        studentId={studentTraining.student_id}
        currentStatus={studentTraining.status}
        trainingDate={trainingDate}
        canMark={canMark}
        isUpdating={isUpdating}
        onMarkAbsent={onMarkAbsent}
      />
    </Box>
  );
}; 