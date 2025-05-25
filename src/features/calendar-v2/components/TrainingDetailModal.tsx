import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  useTheme,
  Link,
  Button,
  alpha,
  CircularProgress,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group'; // Для списка студентов
import PersonIcon from '@mui/icons-material/Person'; // Для тренера
import EventNoteIcon from '@mui/icons-material/EventNote'; // Для даты/времени/статуса
import PhoneIcon from '@mui/icons-material/Phone'; // Иконка для телефона
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'; // Новая иконка
import { CalendarEvent, isRealTraining, isTrainingTemplate } from './CalendarShell'; // Нужны type guards
import dayjs from 'dayjs';
import { useDeleteTrainingStudentTemplateMutation } from '../../../store/apis/calendarApi-v2';
import { calendarApiV2 } from '../../../store/apis/calendarApi-v2';

interface TrainingDetailModalProps {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

const TrainingDetailModal: React.FC<TrainingDetailModalProps> = ({ open, onClose, event }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [deleteTrainingStudentTemplate, { isLoading: isDeletingStudent, error: deleteStudentError }] = 
    useDeleteTrainingStudentTemplateMutation();

  // Состояние для отслеживания ID студента, который удаляется
  const [studentBeingDeleted, setStudentBeingDeleted] = React.useState<number | null>(null);

  useEffect(() => {
    if (event && isTrainingTemplate(event)) {
      console.log('[TrainingDetailModal] Event updated, assigned_students:', JSON.parse(JSON.stringify(event.assigned_students)));
    }
  }, [event]); // Зависимость от event

  if (!event) {
    return null;
  }

  const borderColor = event.training_type?.color || theme.palette.divider;

  const renderStudentList = () => {
    interface StudentListItem {
      id: number;
      studentInfo: {
        first_name?: string;
        last_name?: string;
        client?: {
          first_name?: string;
          last_name?: string;
          phone?: string;
        };
      };
      status_of_presence?: string;
    }

    let studentsToDisplay: StudentListItem[] = [];
    if (isTrainingTemplate(event) && event.assigned_students) {
      console.log('[TrainingDetailModal - renderStudentList] Rendering with assigned_students:', JSON.parse(JSON.stringify(event.assigned_students)));
      studentsToDisplay = event.assigned_students.map(s_template => ({ 
        id: s_template.id,
        studentInfo: s_template.student,
      }));
    } else if (isRealTraining(event) && event.students) {
      studentsToDisplay = event.students.map(s_real => ({ 
        id: s_real.student.id,
        studentInfo: s_real.student,
        status_of_presence: s_real.status_of_presence 
      }));
    }

    if (studentsToDisplay.length === 0) {
      return <Typography variant="body2" color="text.secondary">Нет записанных учеников.</Typography>;
    }

    const handleRemoveStudentClick = async (trainingStudentTemplateId: number) => {
      if (!isTrainingTemplate(event)) return;
      setStudentBeingDeleted(trainingStudentTemplateId);
      console.log(`[TrainingDetailModal] Attempting to remove trainingStudentTemplate: ${trainingStudentTemplateId} from template: ${event.id}`);
      try {
        const deleteResult = await deleteTrainingStudentTemplate(trainingStudentTemplateId).unwrap();
        console.log('[TrainingDetailModal] Deletion result:', deleteResult);
        console.log('[TrainingDetailModal] Dispatching invalidateTags for TrainingTemplateV2 id:', event.id, 'and LIST');
        dispatch(
          calendarApiV2.util.invalidateTags([
            { type: 'TrainingTemplateV2', id: event.id },
            { type: 'TrainingTemplateV2', id: 'LIST' },
            { type: 'TrainingStudentTemplateV2', id: 'LIST' }, 
            { type: 'TrainingStudentTemplateV2', id: trainingStudentTemplateId }
          ])
        );
        console.log('[TrainingDetailModal] Invalidation dispatched.');
      } catch (err) {
        console.error('[TrainingDetailModal] Failed to delete student from template:', err);
      } finally {
        setStudentBeingDeleted(null);
      }
    };

    return (
      <List dense>
        {studentsToDisplay.map((s_item) => (
          <ListItem 
            key={s_item.id} 
            disableGutters 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'flex-start', 
              mb: 0.5, 
              width: '100%'
            }}
            secondaryAction={
              isTrainingTemplate(event) ? (
                <IconButton 
                  edge="end" 
                  aria-label="remove student from template" 
                  onClick={() => handleRemoveStudentClick(s_item.id)}
                  size="small"
                  disabled={isDeletingStudent} 
                  sx={{ 
                    color: borderColor,
                    '&:hover': {
                      backgroundColor: alpha(borderColor, 0.08)
                    }
                  }}
                >
                  {isDeletingStudent && studentBeingDeleted === s_item.id ? <CircularProgress size={20} color="inherit" /> : <PersonRemoveIcon fontSize="small" />}
                </IconButton>
              ) : null
            }
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
              <ListItemText 
                primary={`${s_item.studentInfo.first_name || ''} ${s_item.studentInfo.last_name || ''}`.trim()} 
                secondary={isRealTraining(event) && s_item.status_of_presence ? `Статус: ${s_item.status_of_presence}` : null}
                sx={{mb: 0, pr: 1 }}
              />
              {s_item.studentInfo.client && (
                <Typography variant="caption" color="text.secondary" component="div" sx={{pl:0, display: 'flex', alignItems: 'center'}}>
                  Родитель: {`${s_item.studentInfo.client.first_name || ''} ${s_item.studentInfo.client.last_name || ''}`.trim()}
                  {s_item.studentInfo.client.phone && (
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5 }}>
                      (
                      <PhoneIcon sx={{ fontSize: '0.8rem', mr: 0.3, ml: 0.3, color: 'inherit' }} />
                      <Link href={`tel:${s_item.studentInfo.client.phone}`} sx={{color: 'inherit'}}>
                        {s_item.studentInfo.client.phone}
                      </Link>
                      )
                    </Box>
                  )}
                </Typography>
              )}
            </Box>
          </ListItem>
        ))}
        {deleteStudentError && (
          <ListItem>
            <Typography color="error" variant="caption">
              {/* @ts-ignore */} 
              Ошибка удаления ученика: {deleteStudentError?.data?.detail || deleteStudentError?.error || 'Неизвестная ошибка'}
            </Typography>
          </ListItem>
        )}
      </List>
    );
  };

  const getEventTitle = () => {
    let title = event.training_type?.name || 'Детали тренировки';
    if (isRealTraining(event)) {
      title += ` - ${dayjs(event.training_date).format('D MMMM YYYY')} в ${event.start_time.substring(0,5)}`;
    } else if (isTrainingTemplate(event)) {
      const dayOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][event.day_number - 1];
      title += ` - Шаблон (${dayOfWeek}, ${event.start_time.substring(0,5)})`;
    }
    return title;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{
        sx: {
          border: `1px solid ${borderColor}`,
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb:1 }}>
        {getEventTitle()}
        <IconButton 
          onClick={onClose} 
          edge="end"
          disabled={isDeletingStudent} // Дизейблим кнопку закрытия во время удаления студента
          sx={{
            color: borderColor,
            '&:hover': {
              backgroundColor: alpha(borderColor, 0.08)
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{pt: 2}}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="subtitle1" component="span" sx={{fontWeight: 'medium'}}>Тренер:</Typography>
          <Typography variant="body1" component="span" sx={{ ml: 1}}>
            {(isTrainingTemplate(event) && event.responsible_trainer) ? 
              `${event.responsible_trainer.first_name || ''} ${event.responsible_trainer.last_name || ''}`.trim() :
             (isRealTraining(event) && event.trainer) ? 
              `${event.trainer.first_name || ''} ${event.trainer.last_name || ''}`.trim() :
             'Не назначен'}
          </Typography>
        </Box>

        {isRealTraining(event) && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <EventNoteIcon sx={{ mr: 1, color: theme.palette.info.main }} />
            <Typography variant="subtitle1" component="span" sx={{fontWeight: 'medium'}}>Статус тренировки:</Typography>
            <Chip label={event.status || 'Не указан'} size="small" sx={{ ml: 1 }} />
          </Box>
        )}

        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
            <Typography variant="subtitle1" sx={{fontWeight: 'medium'}}>Ученики ({isTrainingTemplate(event) ? event.assigned_students?.length || 0 : event.students?.length || 0}):</Typography>
        </Box>
        {renderStudentList()}

        {/* TODO: Добавить другую релевантную информацию: 
            - для шаблона: training_type_id, responsible_trainer_id
            - для реальной: template_id, cancellation_reason (если есть)
        */}
      </DialogContent>
      <Divider />
      <DialogActions sx={{p:2, justifyContent: 'space-between'}}>
        <Box>
          <Button 
            onClick={() => {console.log('Edit clicked', event)}} 
            variant="contained" 
            color="secondary"
            sx={{mr:1}}
            disabled={isDeletingStudent} // Дизейблим во время удаления студента
          >
            Редактировать
          </Button>
          <Button 
            onClick={() => {console.log('Delete clicked', event)}} 
            variant="contained" 
            color="error"
            disabled={isDeletingStudent} // Дизейблим во время удаления студента
          >
            Удалить
          </Button>
        </Box>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          sx={{ 
            color: borderColor, 
            borderColor: borderColor,
            '&:hover': {
              borderColor: borderColor, 
              backgroundColor: alpha(borderColor, 0.08) 
            }
          }}
          autoFocus
          disabled={isDeletingStudent} // Дизейблим во время удаления студента
        >
            Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrainingDetailModal; 