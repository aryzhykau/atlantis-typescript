import React from 'react';
import { Box, Typography, Avatar, useTheme } from '@mui/material';
import { TrainerInfoProps } from './types';

/**
 * TrainerInfo - Displays trainer information with avatar
 * Single responsibility: Trainer information display
 */
const TrainerInfo: React.FC<TrainerInfoProps> = ({ trainer, typeColor }) => {
  const theme = useTheme();

  const trainerName = trainer
    ? `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim()
    : 'Не указан';

  const trainerInitials = trainer
    ? `${(trainer.first_name || '').charAt(0)}${(trainer.last_name || '').charAt(0)}`.toUpperCase()
    : '?';

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2, 
      p: 2, 
      borderRadius: 2, 
      backgroundColor: theme.palette.background.default, 
      mb: 3 
    }}>
      <Avatar sx={{ 
        bgcolor: typeColor, 
        width: 48, 
        height: 48, 
        fontSize: '1.1rem', 
        fontWeight: 600 
      }}>
        {trainerInitials}
      </Avatar>
      <Box>
        <Typography 
          variant="subtitle1" 
          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
        >
          {trainerName}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ color: theme.palette.text.secondary }}
        >
          Тренер
        </Typography>
      </Box>
    </Box>
  );
};

export default TrainerInfo;
