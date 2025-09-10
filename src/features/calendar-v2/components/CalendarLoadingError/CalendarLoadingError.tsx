import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

interface CalendarLoadingErrorProps {
  isLoading: boolean;
  error?: any;
}

/**
 * Handles loading and error states for the calendar
 */
export const CalendarLoadingError: React.FC<CalendarLoadingErrorProps> = ({
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2,
          p: 3,
        }}
      >
        <CircularProgress size={24} />
        <Typography>Загрузка данных календаря...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
      >
        Ошибка загрузки календаря: {error?.message || JSON.stringify(error)}
      </Alert>
    );
  }

  return null;
};
