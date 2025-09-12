import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { calendarApiV2 } from '../../../store/apis/calendarApi-v2';
import { useSnackbar } from '../../../hooks/useSnackBar';
import ConfirmDeleteBottomSheet from './ConfirmDeleteBottomSheet';
import { useDeleteTrainingStudentTemplateMutation } from '../../../store/apis/calendarApi-v2';
import { NormalizedEvent } from '../utils/normalizeEventsForWeek';

interface EventBottomSheetProps {
  open: boolean;
  eventOrHourGroup: NormalizedEvent | NormalizedEvent[] | null;
  mode: 'event' | 'group';
  onClose: () => void;
  onSave?: (event: NormalizedEvent) => void;
  onMove?: (event: NormalizedEvent) => void;
  onRequestMove?: (event: NormalizedEvent) => void;
  onDelete?: (event: NormalizedEvent) => void;
  onRequestEdit?: (event: NormalizedEvent) => void;
  onAssignedStudentDeleted?: (trainingTemplateId: number, studentTemplateId: number) => void;
}

const EventBottomSheet: React.FC<EventBottomSheetProps> = ({
  open,
  eventOrHourGroup,
  mode,
  onClose,
  onDelete,
  onRequestEdit,
  onRequestMove,
  onAssignedStudentDeleted,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { displaySnackbar } = useSnackbar();
  const [deleteTrainingStudentTemplate, { isLoading: isDeletingAssigned }] = useDeleteTrainingStudentTemplateMutation();
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState<NormalizedEvent | null>(null);
  const [confirmingAssigned, setConfirmingAssigned] = useState<any | null>(null);

  const handleEdit = (evt?: NormalizedEvent) => {
    const event = evt ?? (Array.isArray(eventOrHourGroup) ? null : eventOrHourGroup);
    if (!event || Array.isArray(event)) return;
    onRequestEdit?.(event);
  };

  const handleDelete = (event: NormalizedEvent) => {
    setPendingDeleteEvent(event);
  };

  const confirmDelete = () => {
    if (!pendingDeleteEvent) return;
    onDelete?.(pendingDeleteEvent);
    setPendingDeleteEvent(null);
  };

  const cancelDelete = () => {
    setPendingDeleteEvent(null);
  };

  const handleMove = (evt?: NormalizedEvent) => {
    const event = evt ?? (Array.isArray(eventOrHourGroup) ? null : eventOrHourGroup);
    if (!event || Array.isArray(event)) return;
    onRequestMove?.(event);
  };



  const handleAssignedDeleteConfirm = async () => {
    if (!confirmingAssigned || !confirmingAssigned.assigned) return;
    const assignedId = confirmingAssigned.assigned.id;
    if (!assignedId) return setConfirmingAssigned(null);

    try {
      const deleted = await deleteTrainingStudentTemplate(assignedId).unwrap();
      setConfirmingAssigned(null);
      const templateId = (!Array.isArray(eventOrHourGroup) && eventOrHourGroup?.isTemplate) ? eventOrHourGroup.id : confirmingAssigned?.event?.id || confirmingAssigned?.assigned?.training_template_id;
      // Patch caches to remove the deleted assigned student
      if (deleted && deleted.id) {
        const tId = deleted.training_template_id || templateId;
        if (tId) {
          try {
            (dispatch as any)(calendarApiV2.util.updateQueryData('getTrainingTemplateById', tId, (draft: any) => {
              if (!draft) return;
              draft.assigned_students = (draft.assigned_students || []).filter((a: any) => a.id !== deleted.id);
            }));
          } catch (e) {}

          try {
            (dispatch as any)(calendarApiV2.util.updateQueryData('getTrainingTemplates', undefined, (draft: any[]) => {
              if (!Array.isArray(draft)) return;
              const template = draft.find(t => t.id === tId);
              if (!template) return;
              template.assigned_students = (template.assigned_students || []).filter((a: any) => a.id !== deleted.id);
            }));
          } catch (e) {}
        }
      }
      if (templateId) {
        dispatch(calendarApiV2.util.invalidateTags([{ type: 'TrainingTemplateV2', id: templateId }]));
      }
      // notify parent to update local UI state
      try {
        const tIdNum = Number(deleted.training_template_id || templateId);
        if (!Number.isNaN(tIdNum)) onAssignedStudentDeleted?.(tIdNum, deleted.id);
      } catch (e) {}
      displaySnackbar('Ученик удалён из шаблона', 'success');
    } catch (err) {
      console.error('[EventBottomSheet] Failed to delete assigned student:', err);
      displaySnackbar('Ошибка при удалении ученика из шаблона', 'error');
    }
  };

  const renderSingleEvent = (event: NormalizedEvent) => {
    const trainerName = event.trainer
      ? `${event.trainer.first_name || ''} ${event.trainer.last_name || ''}`.trim()
      : 'Не указан';

    const trainerInitials = event.trainer
      ? `${(event.trainer.first_name || '').charAt(0)}${(event.trainer.last_name || '').charAt(0)}`.toUpperCase()
      : '?';

    const typeColor = event.training_type?.color || theme.palette.primary.main;

    return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1, letterSpacing: 0.2 }}>
              {event.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TimeIcon sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
              <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>{event.raw?.start_time || ''}</Typography>
            </Box>
          </Box>

          <IconButton onClick={onClose} sx={{ color: theme.palette.text.secondary, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Trainer Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, backgroundColor: theme.palette.background.default, mb: 3 }}>
          <Avatar sx={{ bgcolor: typeColor, width: 48, height: 48, fontSize: '1.1rem', fontWeight: 600 }}>{trainerInitials}</Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>{trainerName}</Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Тренер</Typography>
          </Box>
        </Box>

        {/* Training Type */}
        {event.training_type && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1, textTransform: 'uppercase' }}>{event.training_type.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: typeColor }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>{event.training_type.name}</Typography>
              {event.training_type.max_participants && (
                <Chip label={`Макс: ${event.training_type.max_participants}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 24, ml: 1 }} />
              )}
            </Box>
          </Box>
        )}

        {/* Students Information */}
        {event.raw?.students && event.raw.students.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
              Ученики ({event.raw.students.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {event.raw.students.slice(0, 5).map((student: any, index: number) => (
                <Box key={student.id || index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 1, backgroundColor: theme.palette.background.default }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', backgroundColor: typeColor + '40', color: typeColor, fontWeight: 600 }}>
                    {student.student?.first_name?.charAt(0) || student.first_name?.charAt(0) || '?'}{student.student?.last_name?.charAt(0) || student.last_name?.charAt(0) || ''}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>{student.student?.first_name || student.first_name || 'Имя'} {student.student?.last_name || student.last_name || 'Фамилия'}</Typography>
                    {student.status && <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>Статус: {student.status}</Typography>}
                  </Box>
                  {student.requires_payment && <Chip label="Оплата" size="small" color="warning" variant="filled" sx={{ fontSize: '0.7rem', height: 20 }} />}
                </Box>
              ))}
              {event.raw.students.length > 5 && <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textAlign: 'center', fontStyle: 'italic' }}>И ещё {event.raw.students.length - 5} учеников...</Typography>}
            </Box>
          </Box>
        )}

        {/* Template Students Information */}
        {event.raw?.assigned_students && event.raw.assigned_students.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>Назначенные ученики ({event.raw.assigned_students.length})</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {event.raw.assigned_students.slice(0, 5).map((studentTemplate: any, index: number) => (
                  <Box key={studentTemplate.id || index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 1, backgroundColor: theme.palette.background.default }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', backgroundColor: typeColor + '40', color: typeColor, fontWeight: 600 }}>{studentTemplate.student?.first_name?.charAt(0) || '?'}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>{studentTemplate.student?.first_name || 'Имя'} {studentTemplate.student?.last_name || 'Фамилия'}</Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>В шаблоне</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => setConfirmingAssigned({ assigned: studentTemplate, event })}
                        sx={{ color: theme.palette.error.main, '&:hover': { backgroundColor: theme.palette.error.main + '10' } }}
                        aria-label="Удалить ученика"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              {event.raw.assigned_students.length > 5 && <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textAlign: 'center', fontStyle: 'italic' }}>И ещё {event.raw.assigned_students.length - 5} учеников...</Typography>}
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => handleEdit(event)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              flex: 1,
              minWidth: 'fit-content',
              height: 48,
              backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              boxShadow: '0 8px 20px rgba(16,24,40,0.14)',
              fontWeight: 700,
            }}
          >
            Редактировать
          </Button>
          <Button
            variant="contained"
            startIcon={<TimeIcon />}
            onClick={() => handleMove(event)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              flex: 1,
              minWidth: 'fit-content',
              height: 48,
              backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              boxShadow: '0 8px 20px rgba(16,24,40,0.14)',
              fontWeight: 700,
            }}
          >
            Перенести
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(event)}
            color="error"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              flex: 1,
              minWidth: 'fit-content',
              height: 48,
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
            }}
          >
            Удалить
          </Button>
        </Box>

        {/* Inline confirmation UI for delete */}
        {pendingDeleteEvent && eventOrHourGroup && !Array.isArray(eventOrHourGroup) && pendingDeleteEvent.id === eventOrHourGroup.id && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button variant="contained" color="error" onClick={confirmDelete} sx={{ flex: 1, textTransform: 'none', height: 48 }}>
              Подтвердить удаление
            </Button>
            <Button variant="outlined" onClick={cancelDelete} sx={{ flex: 1, textTransform: 'none', height: 48, borderColor: theme.palette.divider }}>
              Отмена
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const renderEventGroup = (events: NormalizedEvent[]) => {
    const hour = events[0]?.startHour || 0;
    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

    return (
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>{`Тренировки в ${timeLabel}`}</Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{events.length} {events.length === 1 ? 'тренировка' : 'тренировки'}</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: theme.palette.text.secondary, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Event List */}
        <List sx={{ p: 0 }}>
          {events.map((event, index) => {
            const trainerName = event.trainer ? `${event.trainer.first_name || ''} ${event.trainer.last_name || ''}`.trim() : 'Не указан';
            const trainerInitials = event.trainer ? `${(event.trainer.first_name || '').charAt(0)}${(event.trainer.last_name || '').charAt(0)}`.toUpperCase() : '?';
            const typeColor = event.training_type?.color || theme.palette.primary.main;

            return (
              <React.Fragment key={event.id}>
                <ListItem sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.background.default, mb: 1 }}>
                  <Avatar sx={{ bgcolor: typeColor, width: 40, height: 40, mr: 2, fontSize: '0.9rem' }}>{trainerInitials}</Avatar>
                  <ListItemText
                    primary={<Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>{event.title}</Typography>}
                    secondary={<Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{trainerName}</Typography>}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleMove(event)} sx={{ color: theme.palette.text.secondary, '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                      <TimeIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(event)} sx={{ color: theme.palette.error.main, '&:hover': { backgroundColor: theme.palette.error.main + '10' } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < events.length - 1 && <Divider sx={{ my: 1 }} />}
                {pendingDeleteEvent && pendingDeleteEvent.id === event.id && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button variant="contained" color="error" onClick={confirmDelete} sx={{ flex: 1, textTransform: 'none' }}>Подтвердить</Button>
                    <Button variant="outlined" onClick={cancelDelete} sx={{ flex: 1, textTransform: 'none' }}>Отмена</Button>
                  </Box>
                )}
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    );
  };

  if (!eventOrHourGroup) return null;

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          p: 3,
          zIndex: 1400,
          background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          boxShadow: '0px -12px 30px rgba(15,23,42,0.18)',
          backdropFilter: 'blur(6px)',
          maxHeight: '80vh',
        },
      }}
    >
      <Box sx={{ width: 56, height: 6, background: theme.palette.primary.light, borderRadius: 3, mx: 'auto', mt: 1, mb: 2, opacity: 0.95 }} />

      {mode === 'event' && !Array.isArray(eventOrHourGroup) ? renderSingleEvent(eventOrHourGroup) : Array.isArray(eventOrHourGroup) ? renderEventGroup(eventOrHourGroup) : null}
      {/* Confirm delete assigned student */}
      <ConfirmDeleteBottomSheet
        open={Boolean(confirmingAssigned)}
  onClose={() => setConfirmingAssigned(null)}
  onConfirm={handleAssignedDeleteConfirm}
  confirming={isDeletingAssigned}
      />
    </SwipeableDrawer>
  );
};

export default EventBottomSheet;

