import React from 'react';
import { Box, Typography } from '@mui/material';
import { EventBusy } from '@mui/icons-material';

export const EmptyState: React.FC = () => {
  return (
    <Box sx={{ 
      textAlign: 'center', 
      py: 4,
      px: 2,
    }}>
      <EventBusy 
        sx={{ 
          fontSize: 64, 
          color: 'text.secondary', 
          mb: 2,
          opacity: 0.6,
        }} 
      />
      <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
        Нет тренировок на этот день
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
        Выберите другую дату или создайте новую тренировку
      </Typography>
    </Box>
  );
}; 