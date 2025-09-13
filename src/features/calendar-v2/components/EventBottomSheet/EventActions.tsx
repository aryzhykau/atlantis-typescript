import React from 'react';
import { Box, Button, useTheme } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, AccessTime as TimeIcon } from '@mui/icons-material';
import { EventActionsProps } from './types';

/**
 * EventActions - Action buttons for event management
 * Single responsibility: Event action buttons (edit, move, delete)
 */
const EventActions: React.FC<EventActionsProps> = ({
  onEdit,
  onMove,
  onDelete
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' },
      gap: 2, 
      mt: 3,
      '& > button': {
        minHeight: 48,
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
      }
    }}>
      <Button
        variant="contained"
        startIcon={<EditIcon />}
        onClick={onEdit}
        sx={{ 
          flex: 1,
          backgroundColor: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          }
        }}
      >
        Редактировать
      </Button>
      
      <Button
        variant="contained"
        startIcon={<TimeIcon />}
        onClick={onMove}
        sx={{
          flex: 1,
          backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: theme.palette.getContrastText(theme.palette.secondary.main),
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        Перенести
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<DeleteIcon />}
        onClick={onDelete}
        color="error"
        sx={{
          flex: 1,
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: theme.palette.error.main + '10',
          }
        }}
      >
        Удалить
      </Button>
    </Box>
  );
};

export default EventActions;
