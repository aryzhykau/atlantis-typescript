import React, { useEffect, useState } from 'react';
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
  TextField,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group'; // Для списка студентов
import PersonIcon from '@mui/icons-material/Person'; // Для тренера
import EventNoteIcon from '@mui/icons-material/EventNote'; // Для даты/времени/статуса
import PhoneIcon from '@mui/icons-material/Phone'; // Иконка для телефона
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'; // Новая иконка
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // Иконка для добавления студентов
import { CalendarEvent, isRealTraining, isTrainingTemplate } from './CalendarShell'; // Нужны type guards
import dayjs from 'dayjs';
import { useDeleteTrainingStudentTemplateMutation, useCreateTrainingStudentTemplateMutation, useGetTrainingTemplateByIdQuery, useGetRealTrainingByIdQuery } from '../../../store/apis/calendarApi-v2';
import { calendarApiV2 } from '../../../store/apis/calendarApi-v2';
import { useGetStudentsQuery } from '../../../store/apis/studentsApi';
import { TrainingStudentTemplateCreate } from '../models/trainingStudentTemplate';

interface TrainingDetailModalProps {
  open: boolean;
  onClose: () => void;
  eventId: number | null;
  eventType: 'template' | 'real' | null;
}

const TrainingDetailModal: React.FC<TrainingDetailModalProps> = ({ open, onClose, eventId, eventType }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [deleteTrainingStudentTemplate, { isLoading: isDeletingStudent, error: deleteStudentError }] = 
    useDeleteTrainingStudentTemplateMutation();
  const [createTrainingStudentTemplate, { error: addStudentError }] = useCreateTrainingStudentTemplateMutation();
  const { data: allStudents } = useGetStudentsQuery();
  
  // Загружаем свежие данные в зависимости от типа события
  const { data: templateData, isLoading: isLoadingTemplate } = useGetTrainingTemplateByIdQuery(
    eventId || 0, 
    { 
      skip: !eventId || eventType !== 'template',
    }
  );
  
  const { data: realTrainingData, isLoading: isLoadingReal } = useGetRealTrainingByIdQuery(
    eventId || 0, 
    { 
      skip: !eventId || eventType !== 'real',
    }
  );
  
  // Определяем текущее событие
  const event: CalendarEvent | null = eventType === 'template' ? (templateData || null) : (realTrainingData || null);
  
  // Показываем загрузку если данные загружаются
  const isLoading = isLoadingTemplate || isLoadingReal;



  // Состояние для отслеживания ID студента, который удаляется
  const [studentBeingDeleted, setStudentBeingDeleted] = useState<number | null>(null);
  
  // Состояние для формы добавления студента
  const [isAddStudentFormOpen, setIsAddStudentFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    if (event && isTrainingTemplate(event)) {
      console.log('[TrainingDetailModal] Event updated, assigned_students:', JSON.parse(JSON.stringify(event.assigned_students)));
    }
  }, [event, templateData, realTrainingData]); // Зависимость от свежих данных

  // Функция для добавления студента
  const handleAddStudent = async () => {
    if (!event || !isTrainingTemplate(event) || !selectedStudent) return;
    
    try {
      const studentTemplateData: TrainingStudentTemplateCreate = {
        training_template_id: event.id,
        student_id: selectedStudent.id,
        start_date: startDate,
      };
      
      await createTrainingStudentTemplate(studentTemplateData).unwrap();
      
      // Инвалидируем кэш для обновления данных
      dispatch(
        calendarApiV2.util.invalidateTags([
          { type: 'TrainingTemplateV2', id: event.id },
          { type: 'TrainingTemplateV2', id: 'LIST' },
          { type: 'TrainingStudentTemplateV2', id: 'LIST' },
        ])
      );
      
      // Сбрасываем форму и закрываем её
      setSelectedStudent(null);
      setStartDate(dayjs().format('YYYY-MM-DD'));
      setIsAddStudentFormOpen(false);
    } catch (err) {
      console.error('[TrainingDetailModal] Failed to add student to template:', err);
    }
  };

  // Получаем студентов которые уже есть в шаблоне
  const assignedStudentIds = event && isTrainingTemplate(event) && event.assigned_students 
    ? event.assigned_students.map(s => s.student.id) 
    : [];
  
  // Фильтруем студентов чтобы не показывать уже добавленных
  const availableStudents = allStudents?.filter(student => 
    !assignedStudentIds.includes(student.id)
  ) || [];

  if (!eventId || !eventType) {
    return null;
  }

  if (isLoading) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (!event) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogContent sx={{ py: 4 }}>
          <Typography variant="h6" align="center">
            Событие не найдено
          </Typography>
        </DialogContent>
      </Dialog>
    );
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

        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
            <Typography variant="subtitle1" sx={{fontWeight: 'medium'}}>Ученики ({isTrainingTemplate(event) ? event.assigned_students?.length || 0 : event.students?.length || 0}):</Typography>
          </Box>
          {isTrainingTemplate(event) && (
            <IconButton 
              size="small"
              onClick={() => setIsAddStudentFormOpen(true)}
              disabled={isDeletingStudent}
              sx={{ 
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08)
                }
              }}
            >
              <PersonAddIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        {renderStudentList()}

        {/* Форма добавления студента */}
        {isAddStudentFormOpen && isTrainingTemplate(event) && (
          <Box sx={{ mt: 2, p: 2, border: `1px solid ${alpha(borderColor, 0.3)}`, borderRadius: 2, backgroundColor: alpha(borderColor, 0.05) }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'medium' }}>
              Добавить студента в шаблон
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Autocomplete
                value={selectedStudent}
                onChange={(_, newValue) => setSelectedStudent(newValue)}
                options={availableStudents}
                getOptionLabel={(student) => `${student.first_name} ${student.last_name}`}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Выберите студента" 
                    size="small"
                    fullWidth
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="Нет доступных студентов"
              />
              
              <TextField
                label="Дата начала"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              {addStudentError && (
                <Typography color="error" variant="caption">
                  {/* @ts-ignore */}
                  Ошибка добавления студента: {addStudentError?.data?.detail || addStudentError?.error || 'Неизвестная ошибка'}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setIsAddStudentFormOpen(false);
                    setSelectedStudent(null);
                    setStartDate(dayjs().format('YYYY-MM-DD'));
                  }}
                >
                  Отмена
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddStudent}
                  disabled={!selectedStudent}
                  sx={{
                    backgroundColor: borderColor,
                    '&:hover': {
                      backgroundColor: alpha(borderColor, 0.8),
                    }
                  }}
                >
                  Добавить
                </Button>
              </Box>
            </Box>
          </Box>
        )}

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