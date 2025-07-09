import React from 'react';
import { Box, Avatar, Typography, Chip } from '@mui/material';
import { TouchApp } from '@mui/icons-material';
import { useGradients } from '../hooks/useGradients';
import { AttendanceButtons } from './AttendanceButtons';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

interface StudentAttendanceItemProps {
  studentTraining: any;
  trainingId: number;
  trainingDate: string;
  canMark: boolean;
  isUpdating: boolean;
  onMarkPresent: (trainingId: number, studentId: number) => void;
  onMarkAbsent: (trainingId: number, studentId: number) => void;
}

export const StudentAttendanceItem: React.FC<StudentAttendanceItemProps> = ({
  studentTraining,
  trainingId,
  trainingDate,
  canMark,
  isUpdating,
  onMarkPresent,
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
      case 'PRESENT': return 'success';
      case 'ABSENT': return 'error';
      case 'CANCELLED_SAFE':
      case 'CANCELLED_PENALTY': return 'default';
      default: return 'primary';
    }
  };

  const handleQuickMark = (status: 'PRESENT' | 'ABSENT') => {
    if (canMark && !isUpdating) {
      if (status === 'PRESENT') {
        onMarkPresent(trainingId, studentTraining.student_id);
      } else {
        onMarkAbsent(trainingId, studentTraining.student_id);
      }
    }
  };

  const canQuickMark = canMark && !isUpdating && 
    (studentTraining.status === 'REGISTERED' || 
     studentTraining.status === 'PRESENT' ||
     studentTraining.status === 'ABSENT');

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
      // Быстрая отметка: если ученик записан, отмечаем как присутствующий
      if (studentTraining.status === 'REGISTERED') {
        handleQuickMark('PRESENT');
      }
      // Если ученик присутствовал, отмечаем как отсутствующий
      else if (studentTraining.status === 'PRESENT') {
        handleQuickMark('ABSENT');
      }
      // Если ученик отсутствовал, отмечаем как присутствующий
      else if (studentTraining.status === 'ABSENT') {
        handleQuickMark('PRESENT');
      }
    }}
    title={canQuickMark ? 'Нажмите для быстрой отметки' : ''}
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
              Нажмите для отметки
            </Typography>
          </Box>
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
        onMarkPresent={onMarkPresent}
        onMarkAbsent={onMarkAbsent}
      />
    </Box>
  );
}; 