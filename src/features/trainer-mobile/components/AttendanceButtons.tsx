import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { useGradients } from '../hooks/useGradients';

interface AttendanceButtonsProps {
  trainingId: number;
  studentId: number;
  currentStatus: string;
  trainingDate: string;
  canMark: boolean;
  isUpdating: boolean;
  onMarkPresent: (trainingId: number, studentId: number) => void;
  onMarkAbsent: (trainingId: number, studentId: number) => void;
}

export const AttendanceButtons: React.FC<AttendanceButtonsProps> = ({
  trainingId,
  studentId,
  currentStatus,
  trainingDate,
  canMark,
  isUpdating,
  onMarkPresent,
  onMarkAbsent,
}) => {
  const gradients = useGradients();

  const shouldShowAttendanceButtons = () => {
    return !['CANCELLED_SAFE', 'CANCELLED_PENALTY'].includes(currentStatus);
  };

  const showPresentButton = currentStatus === 'REGISTERED' || currentStatus === 'ABSENT';
  const showAbsentButton = currentStatus === 'REGISTERED' || currentStatus === 'PRESENT';

  if (!shouldShowAttendanceButtons()) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
      {showPresentButton && (
        <IconButton
          size="medium"
          onClick={() => canMark && onMarkPresent(trainingId, studentId)}
          disabled={isUpdating || !canMark}
          sx={{
            background: canMark ? gradients.success : 'grey.400',
            color: 'white',
            '&:hover': { 
              background: canMark ? gradients.success : 'grey.400',
              opacity: canMark ? 0.9 : 1,
            },
            '&.Mui-disabled': {
              bgcolor: 'grey.300',
              color: 'grey.500',
            },
            width: 44,
            height: 44,
            p: 1,
          }}
          title={!canMark ? 'Отметки доступны в день тренировки' : 'Отметить присутствие'}
        >
          <CheckIcon sx={{ fontSize: 20 }} />
        </IconButton>
      )}
      {showAbsentButton && (
        <IconButton
          size="medium"
          onClick={() => canMark && onMarkAbsent(trainingId, studentId)}
          disabled={isUpdating || !canMark}
          sx={{
            background: canMark ? gradients.warning : 'grey.400',
            color: 'white',
            '&:hover': { 
              background: canMark ? gradients.warning : 'grey.400',
              opacity: canMark ? 0.9 : 1,
            },
            '&.Mui-disabled': {
              bgcolor: 'grey.300',
              color: 'grey.500',
            },
            width: 44,
            height: 44,
            p: 1,
          }}
          title={!canMark ? 'Отметки доступны в день тренировки' : 'Отметить отсутствие'}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      )}
    </Box>
  );
}; 