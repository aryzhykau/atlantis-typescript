import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useGradients } from '../hooks/useGradients';

interface AttendanceButtonsProps {
  trainingId: number;
  studentId: number;
  currentStatus: string;
  trainingDate: string;
  onMarkAbsent: (trainingId: number, studentId: number) => void;
  canMark: boolean;
  isUpdating: boolean;
}

export const AttendanceButtons: React.FC<AttendanceButtonsProps> = ({
  trainingId,
  studentId,
  currentStatus,
  onMarkAbsent,
  canMark,
  isUpdating,
}) => {
  const gradients = useGradients();

  // Only allow marking REGISTERED students as ABSENT
  const canMarkAbsent = canMark && currentStatus === 'REGISTERED';

  const getButtonTitle = () => {
    if (!canMark) return 'Отметки доступны в день тренировки';
    if (currentStatus === 'PRESENT') return 'Статус "Присутствовал" устанавливается автоматически';
    if (currentStatus === 'ABSENT') return 'Студент уже отмечен как отсутствующий';
    if (currentStatus === 'REGISTERED') return 'Отметить отсутствие';
    return 'Недоступно для данного статуса';
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
        <IconButton
          size="medium"
          onClick={() => onMarkAbsent(trainingId, studentId)}
          disabled={isUpdating || !canMarkAbsent}
          sx={{
            background: canMarkAbsent ? gradients.warning : 'grey.400',
            color: 'white',
            '&:hover': { 
              background: canMarkAbsent ? gradients.warning : 'grey.400',
              opacity: canMarkAbsent ? 0.9 : 1,
            },
            '&.Mui-disabled': {
              bgcolor: 'grey.300',
              color: 'grey.500',
            },
            width: 44,
            height: 44,
            p: 1,
          }}
          title={getButtonTitle()}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
    </Box>
  );
}; 