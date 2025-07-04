import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Dayjs } from 'dayjs';
import { useGradients } from '../hooks/useGradients';

interface DateNavigationProps {
  selectedDate: Dayjs;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  onPrevDay,
  onNextDay,
}) => {
  const gradients = useGradients();

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      p: 2,
      bgcolor: 'background.paper',
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
    }}>
      <IconButton 
        onClick={onPrevDay} 
        size="large"
        sx={{ 
          background: gradients.primary,
          color: 'white',
          '&:hover': {
            background: gradients.primary,
            opacity: 0.9,
          }
        }}
      >
        <ChevronLeft />
      </IconButton>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          {selectedDate.format('D MMMM')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {selectedDate.format('dddd')}
        </Typography>
      </Box>
      
      <IconButton 
        onClick={onNextDay} 
        size="large"
        sx={{ 
          background: gradients.primary,
          color: 'white',
          '&:hover': {
            background: gradients.primary,
            opacity: 0.9,
          }
        }}
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
}; 