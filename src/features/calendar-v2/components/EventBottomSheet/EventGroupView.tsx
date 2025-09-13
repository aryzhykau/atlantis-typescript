import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Avatar,
  useTheme 
} from '@mui/material';
import { 
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { NormalizedEvent } from '../../utils/normalizeEventsForWeek';
import { useEventDeletion } from '../../hooks/useEventDeletion';
import DeleteConfirmation from './DeleteConfirmation';
import EditBottomSheet from './EditBottomSheet';
import TransferBottomSheet from './TransferBottomSheet';

interface EventGroupViewProps {
  events: NormalizedEvent[];
  onClose: () => void;
  onRequestMove?: (event: NormalizedEvent, transferData?: any) => void;
  onRequestEdit?: (event: NormalizedEvent) => void;
  onDelete?: (event: NormalizedEvent) => void;
}

/**
 * EventGroupView - Component for displaying multiple events grouped by hour
 * Single responsibility: Group event display and basic interactions
 */
const EventGroupView: React.FC<EventGroupViewProps> = ({
  events,
  onClose,
  onRequestMove,
  onRequestEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const { pendingDeleteEvent, handleDelete, confirmDelete, cancelDelete } = useEventDeletion(onDelete);

  // Inline form state
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [currentEditEvent, setCurrentEditEvent] = useState<NormalizedEvent | null>(null);
  const [currentTransferEvent, setCurrentTransferEvent] = useState<NormalizedEvent | null>(null);

  const hour = events[0]?.startHour || 0;
  const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

  const handleMove = useCallback((event: NormalizedEvent) => {
    setCurrentTransferEvent(event);
    setShowTransferForm(true);
  }, []);

  const handleEdit = useCallback((event: NormalizedEvent) => {
    setCurrentEditEvent(event);
    setShowEditForm(true);
  }, []);

  // Inline form handlers
  const handleEditSave = useCallback((event: NormalizedEvent, _updates: Partial<NormalizedEvent>) => {
    onRequestEdit?.(event);
    setShowEditForm(false);
    setCurrentEditEvent(null);
  }, [onRequestEdit]);

  const handleEditCancel = useCallback(() => {
    setShowEditForm(false);
    setCurrentEditEvent(null);
  }, []);

  const handleTransferSave = useCallback((event: NormalizedEvent, transferData: any) => {
    onRequestMove?.(event, transferData);
    setShowTransferForm(false);
    setCurrentTransferEvent(null);
  }, [onRequestMove]);

  const handleTransferCancel = useCallback(() => {
    setShowTransferForm(false);
    setCurrentTransferEvent(null);
  }, []);

  return (
    <>
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            {`Тренировки в ${timeLabel}`}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {events.length} {events.length === 1 ? 'тренировка' : 'тренировки'}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: theme.palette.text.secondary, 
            '&:hover': { backgroundColor: theme.palette.action.hover },
            width: 44,
            height: 44,
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Event List */}
      <List sx={{ p: 0, gap: 1, display: 'flex', flexDirection: 'column' }}>
        {events.map((event) => {
          const trainerName = event.trainer 
            ? `${event.trainer.first_name || ''} ${event.trainer.last_name || ''}`.trim() 
            : 'Не указан';
          const trainerInitials = event.trainer 
            ? `${(event.trainer.first_name || '').charAt(0)}${(event.trainer.last_name || '').charAt(0)}`.toUpperCase() 
            : '?';
          const typeColor = event.training_type?.color || theme.palette.primary.main;

          return (
            <ListItem 
              key={event.id}
              sx={{ 
                p: 2, 
                borderRadius: 3, 
                backgroundColor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                transition: 'background-color 0.2s ease',
              }}
            >
              <Avatar sx={{ 
                bgcolor: typeColor, 
                width: 44, 
                height: 44, 
                mr: 2, 
                fontSize: '0.9rem',
                fontWeight: 600,
              }}>
                {trainerInitials}
              </Avatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 600, 
                    color: theme.palette.text.primary,
                    mb: 0.5,
                  }}>
                    {event.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {trainerName}
                  </Typography>
                }
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleMove(event)} 
                  sx={{ 
                    color: theme.palette.primary.main, 
                    '&:hover': { 
                      backgroundColor: theme.palette.primary.main + '10',
                    },
                    width: 40,
                    height: 40,
                  }}
                  aria-label="Перенести тренировку"
                >
                  <TimeIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleEdit(event)} 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    '&:hover': { 
                      backgroundColor: theme.palette.secondary.main + '10',
                    },
                    width: 40,
                    height: 40,
                  }}
                  aria-label="Редактировать тренировку"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                
                {/* Use different action based on event type */}
                {event.isTemplate ? (
                  <IconButton 
                    size="small" 
                    onClick={() => handleDelete(event)} 
                    sx={{ 
                      color: theme.palette.error.main, 
                      '&:hover': { 
                        backgroundColor: theme.palette.error.main + '10',
                      },
                      width: 40,
                      height: 40,
                    }}
                    aria-label="Удалить тренировку"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                ) : (
                  // For real trainings, check if it's in the past
                  (() => {
                    const isPastTraining = event.raw?.training_date && event.raw?.start_time
                      ? dayjs(`${event.raw.training_date} ${event.raw.start_time}`).isBefore(dayjs())
                      : false;
                    
                    return (
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(event)} 
                        disabled={isPastTraining}
                        sx={{ 
                          color: isPastTraining ? theme.palette.text.disabled : theme.palette.warning.main, 
                          '&:hover': !isPastTraining ? { 
                            backgroundColor: theme.palette.warning.main + '10',
                          } : {},
                          width: 40,
                          height: 40,
                        }}
                        aria-label={isPastTraining ? "Нельзя отменить прошедшую тренировку" : "Отменить тренировку"}
                        title={isPastTraining ? "Нельзя отменить прошедшую тренировку" : "Отменить тренировку"}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    );
                  })()
                )}
              </Box>
            </ListItem>
          );
        })}
      </List>

      {/* Delete Confirmation Bottom Sheet */}
      <DeleteConfirmation
        show={Boolean(pendingDeleteEvent)}
        eventTitle={pendingDeleteEvent?.title}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
    
    {/* Edit Bottom Sheet */}
    <EditBottomSheet
      event={currentEditEvent}
      open={showEditForm}
      onSave={handleEditSave}
      onClose={handleEditCancel}
    />
    
    {/* Transfer Bottom Sheet */}
    <TransferBottomSheet
      event={currentTransferEvent}
      open={showTransferForm}
      onSave={handleTransferSave}
      onClose={handleTransferCancel}
    />
    </>
  );
};

export default EventGroupView;
