import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Schedule } from '@mui/icons-material';
import { useGradients } from '../hooks/useGradients';

export const TrainerScheduleHeader: React.FC = () => {
  const gradients = useGradients();

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        background: gradients.primary,
        borderRadius: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center' }}>
          📅 Расписание
          <Schedule sx={{ ml: 1, fontSize: 32 }} />
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
          Управление тренировками и посещаемостью
        </Typography>
      </Box>
    </Paper>
  );
}; 