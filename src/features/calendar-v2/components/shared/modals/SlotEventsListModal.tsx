import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
  useTheme,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from '../../../types';
import { EventListItem } from './EventListItem';

interface SlotEventsListModalProps {
  open: boolean;
  onClose: () => void;
  day: Dayjs;
  time: string;
  events: CalendarEvent[];
  isTemplate: boolean;
  onEventClick: (event: CalendarEvent) => void;
  onAddNewEvent?: () => void;
}

/**
 * Modal component for viewing all events in a specific calendar slot
 * Shows a list of all events with details and allows editing
 */
export const SlotEventsListModal: React.FC<SlotEventsListModalProps> = ({
  open,
  onClose,
  day,
  time,
  events,
  isTemplate,
  onEventClick,
  onAddNewEvent,
}) => {
  const theme = useTheme();

  const handleEventClick = (event: CalendarEvent) => {
    onEventClick(event);
    onClose(); // Close this modal and open the edit modal
  };

  const handleAddNew = () => {
    if (onAddNewEvent) {
      onAddNewEvent();
      onClose(); // Close this modal and open the add modal
    }
  };

  // Format the time display
  const timeDisplay = time.substring(0, 5); // Remove seconds
  
  // Format the date display
  const dateDisplay = day.format('dddd, D MMMM YYYY');
  
  // Modal title based on context
  const modalTitle = isTemplate 
    ? `Шаблоны тренировок` 
    : `Тренировки`;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          boxShadow: `0 25px 80px ${alpha(theme.palette.common.black, 0.3)}`,
          overflow: 'hidden',
          maxHeight: '90vh',
        }
      }}
      BackdropProps={{
        sx: { 
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
          color: 'white',
          py: 3,
          px: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 80%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%)`,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {modalTitle}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
              Все события в выбранном слоте
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              backgroundColor: alpha('#ffffff', 0.1),
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.2),
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
        {/* Time and Date Info */}
        <Box
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontSize: '1.2rem',
                }} 
              />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Дата
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {dateDisplay}
                </Typography>
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontSize: '1.2rem',
                }} 
              />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Время
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {timeDisplay}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Events List */}
        {events.length > 0 ? (
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              События ({events.length})
            </Typography>
            
            {events.map((event) => (
              <EventListItem
                key={event.id}
                event={event}
                onEventClick={handleEventClick}
                isTemplate={isTemplate}
              />
            ))}
          </Stack>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              px: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.grey[100], 0.5),
              border: `2px dashed ${theme.palette.grey[300]}`,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              В этом слоте нет событий
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isTemplate 
                ? 'Вы можете создать новый шаблон тренировки'
                : 'В это время тренировки не запланированы'
              }
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          p: 3,
          backgroundColor: theme.palette.background.default,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          {onAddNewEvent && isTemplate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
                },
                transition: 'all 0.2s ease',
              }}
            >
              Добавить тренировку
            </Button>
          )}
        </Box>

        <Button
          onClick={onClose}
          color="inherit"
          size="large"
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};
