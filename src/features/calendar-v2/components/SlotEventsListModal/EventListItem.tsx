import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Chip,
  Avatar,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { CalendarEvent } from '../../types';

interface EventListItemProps {
  event: CalendarEvent;
  onEventClick: (event: CalendarEvent) => void;
  isTemplate: boolean;
}

/**
 * Single event item component for the SlotEventsListModal
 * Displays event details with edit functionality
 */
export const EventListItem: React.FC<EventListItemProps> = ({
  event,
  onEventClick,
  isTemplate,
}) => {
  const theme = useTheme();
  
  // Type guard and event info extraction
  const eventColor = event.training_type?.color || theme.palette.primary.main;
  const eventName = event.training_type?.name || 'Тренировка';
  
  // Get trainer info based on event type
  const trainerName = (() => {
    if (isTemplate) {
      const templateEvent = event as any; // TrainingTemplate type
      return templateEvent.responsible_trainer 
        ? `${templateEvent.responsible_trainer.first_name || ''} ${templateEvent.responsible_trainer.last_name || ''}`.trim()
        : 'Тренер не назначен';
    } else {
      const realEvent = event as any; // RealTraining type  
      return realEvent.trainer
        ? `${realEvent.trainer.first_name || ''} ${realEvent.trainer.last_name || ''}`.trim()
        : 'Тренер не назначен';
    }
  })();

  // Get student count based on event type
  const studentCount = isTemplate 
    ? (event as any).assigned_students?.length || 0
    : (event as any).students?.filter((s: any) => s.attendance_status !== 'cancelled').length || 0;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick(event);
  };

  const isCancelled = !isTemplate && ((event as any).status === 'cancelled_by_coach' || (event as any).status === 'cancelled_by_admin');

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${alpha(eventColor, 0.2)}`,
        borderLeft: `6px solid ${eventColor}`,
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        // Visual for cancelled trainings
        opacity: isCancelled ? 0.6 : 1,
        filter: isCancelled ? 'grayscale(30%)' : 'none',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${alpha(theme.palette.common.black, 0.15)}`,
          borderColor: alpha(eventColor, 0.5),
        },
      }}
      onClick={() => onEventClick(event)}
    >
      {/* Header */}
      <Box 
      sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 2,
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: eventColor,
              mb: 0.5,
            }}
          >
            {eventName}
          </Typography>
          
          {/* Event type indicator */}
          <Chip 
            label={isTemplate ? 'Шаблон' : 'Тренировка'}
            size="small"
            sx={{
              backgroundColor: alpha(eventColor, 0.1),
              color: eventColor,
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Edit button */}
        <Tooltip title="Редактировать" placement="top">
          <IconButton
            onClick={handleEditClick}
            size="small"
            sx={{
              backgroundColor: alpha(eventColor, 0.1),
              color: eventColor,
              '&:hover': {
                backgroundColor: alpha(eventColor, 0.2),
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      <Stack spacing={2}>
        {/* Trainer info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: alpha(eventColor, 0.15),
              color: eventColor,
            }}
          >
            <PersonIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Тренер
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {trainerName}
            </Typography>
          </Box>
        </Box>

        {/* Students info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: alpha(theme.palette.secondary.main, 0.15),
              color: theme.palette.secondary.main,
            }}
          >
            <GroupIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Ученики
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {studentCount === 0 ? 'Нет записанных' : `${studentCount} записано`}
            </Typography>
          </Box>
        </Box>

        {/* Time info for real trainings */}
        {!isTemplate && (event as any).training_date && (
          <Box sx={{ pt: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
            <Typography variant="caption" color="text.secondary">
              📅 {new Date((event as any).training_date).toLocaleDateString('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
