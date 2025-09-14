import React from 'react';
import { Box, Typography, IconButton, Chip, useTheme } from '@mui/material';
import { Close as CloseIcon, AccessTime as TimeIcon } from '@mui/icons-material';
import { EventHeaderProps } from './types';

/**
 * EventHeader - Displays event title, type info, and close button
 * Single responsibility: Event header information display
 */
const EventHeader: React.FC<EventHeaderProps> = ({ event, onClose }) => {
  const theme = useTheme();
  const typeColor = event.training_type?.color || theme.palette.primary.main;

  const formatTime = (time?: string) => {
    if (!time) return '';
    const parts = time.split(':');
    if (parts.length >= 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    return time;
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
      <Box sx={{ flex: 1 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 800, 
            color: theme.palette.text.primary, 
            mb: 1, 
            letterSpacing: 0.2 
          }}
        >
          {event.title}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {event.training_type && (
              <Box sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                backgroundColor: typeColor 
              }} />
            )}
            {event.training_type && (
              <Typography sx={{ 
                fontSize: '0.875rem', 
                color: theme.palette.text.secondary 
              }}>
                {event.training_type.name}
              </Typography>
            )}
            {event.training_type?.max_participants && (
              <Chip 
                label={`Макс: ${event.training_type.max_participants}`} 
                size="small" 
                variant="outlined" 
                sx={{ fontSize: '0.65rem', height: 22, ml: 1 }} 
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
            <Typography sx={{ 
              fontSize: '0.875rem', 
              color: theme.palette.text.secondary 
            }}>
              {formatTime(event.raw?.start_time)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <IconButton 
        onClick={onClose} 
        sx={{ 
          color: theme.palette.text.secondary, 
          '&:hover': { backgroundColor: theme.palette.action.hover } 
        }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

export default EventHeader;
