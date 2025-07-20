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
  onMarkAbsent,
  canMark,
  isUpdating,
}) => {
  const gradients = useGradients();

  return (
    <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
        <IconButton
          size="medium"
          onClick={() => onMarkAbsent(trainingId, studentId)}
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
    </Box>
  );
}; 