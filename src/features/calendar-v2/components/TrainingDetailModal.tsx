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
import WarningIcon from '@mui/icons-material/Warning'; // Иконка для диалога удаления
import { CalendarEvent, isRealTraining, isTrainingTemplate } from './CalendarShell'; // Нужны type guards
import dayjs from 'dayjs';
import { useDeleteTrainingStudentTemplateMutation, useCreateTrainingStudentTemplateMutation, useGetTrainingTemplateByIdQuery, useGetRealTrainingByIdQuery, useDeleteTrainingTemplateMutation, useDeleteRealTrainingMutation, useUpdateTrainingTemplateMutation, useUpdateRealTrainingMutation, useCreateTrainingTemplateMutation, useCreateRealTrainingMutation } from '../../../store/apis/calendarApi-v2';
import { calendarApiV2 } from '../../../store/apis/calendarApi-v2';
import { useGetStudentsQuery } from '../../../store/apis/studentsApi';
import { useGetTrainingTypesQuery } from '../../../store/apis/trainingTypesApi';
import { useGetTrainersQuery } from '../../../store/apis/trainersApi';
import { TrainingStudentTemplateCreate } from '../models/trainingStudentTemplate';
import { TrainingTemplateUpdate, TrainingTemplateCreate } from '../models/trainingTemplate';
import { RealTrainingUpdate, RealTrainingCreate } from '../models/realTraining';
import { useSnackbar } from '../../../hooks/useSnackBar';

interface TrainingDetailModalProps {
  open: boolean;
  onClose: () => void;
  eventId: number | null;
  eventType: 'template' | 'real' | null;
}

const TrainingDetailModal: React.FC<TrainingDetailModalProps> = ({ open, onClose, eventId, eventType }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { displaySnackbar } = useSnackbar();

  // Мутации для удаления студентов
  const [deleteTrainingStudentTemplate, { isLoading: isDeletingStudent, error: deleteStudentError }] = 
    useDeleteTrainingStudentTemplateMutation();
  const [createTrainingStudentTemplate, { error: addStudentError }] = useCreateTrainingStudentTemplateMutation();
  
  // Мутации для удаления тренировок
  const [deleteTrainingTemplate, { isLoading: isDeletingTemplate }] = useDeleteTrainingTemplateMutation();
  const [deleteRealTraining, { isLoading: isDeletingReal }] = useDeleteRealTrainingMutation();
  
  // Мутации для обновления тренировок
  const [updateTrainingTemplate, { isLoading: isUpdatingTemplate }] = useUpdateTrainingTemplateMutation();
  const [updateRealTraining, { isLoading: isUpdatingReal }] = useUpdateRealTrainingMutation();
  
  // Мутации для создания тренировок (дублирование)
  const [createTrainingTemplate, { isLoading: isCreatingTemplate }] = useCreateTrainingTemplateMutation();
  const [createRealTraining, { isLoading: isCreatingReal }] = useCreateRealTrainingMutation();
  
  const { data: allStudents } = useGetStudentsQuery();
  const { data: trainingTypesData } = useGetTrainingTypesQuery({});
  const { data: trainersData } = useGetTrainersQuery();
  
  const trainingTypes = trainingTypesData || [];
  const trainers = trainersData?.trainers || [];
  
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

  // Состояние для диалога подтверждения удаления
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Состояние для режима редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    trainingTypeId: number | null;
    trainerId: number | null;
    dayNumber: number | null;
    startTime: string;
    trainingDate: string;
  }>({
    trainingTypeId: null,
    trainerId: null,
    dayNumber: null,
    startTime: '',
    trainingDate: '',
  });

  // Состояние для дублирования
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [duplicateFormData, setDuplicateFormData] = useState<{
    trainingTypeId: number | null;
    trainerId: number | null;
    dayNumber: number | null;
    startTime: string;
    trainingDate: string;
  }>({
    trainingTypeId: null,
    trainerId: null,
    dayNumber: null,
    startTime: '',
    trainingDate: '',
  });

  // Определяем состояние загрузки операций
  const isDeletingTraining = isDeletingTemplate || isDeletingReal;
  const isUpdatingTraining = isUpdatingTemplate || isUpdatingReal;
  const isCreatingTraining = isCreatingTemplate || isCreatingReal;

  useEffect(() => {
    if (event && isTrainingTemplate(event)) {
      console.log('[TrainingDetailModal] Event updated, assigned_students:', JSON.parse(JSON.stringify(event.assigned_students)));
    }
  }, [event, templateData, realTrainingData]); // Зависимость от свежих данных

  // Инициализация формы при загрузке события
  useEffect(() => {
    if (event) {
      const baseData = {
        trainingTypeId: event.training_type?.id || null,
        trainerId: isTrainingTemplate(event) ? event.responsible_trainer?.id || null : event.trainer?.id || null,
        dayNumber: isTrainingTemplate(event) ? event.day_number : null,
        startTime: event.start_time || '',
        trainingDate: isRealTraining(event) ? event.training_date : '',
      };
      
      setEditFormData(baseData);
      
      // Для дублирования устанавливаем те же данные, но с измененным временем (+1 час)
      const currentHour = parseInt(event.start_time?.substring(0,2) || '0');
      const newHour = Math.min(currentHour + 1, 22); // Не позже 22:00
      const newTime = `${newHour.toString().padStart(2, '0')}:00:00`;
      
      setDuplicateFormData({
        ...baseData,
        startTime: newTime,
        // Для реальных тренировок устанавливаем завтрашнюю дату
        trainingDate: isRealTraining(event) ? dayjs(event.training_date).add(1, 'day').format('YYYY-MM-DD') : '',
      });
    }
  }, [event]);

  // Функция для обработки удаления тренировки
  const handleDeleteTraining = async () => {
    if (!event || !eventId) return;
    
    try {
      if (eventType === 'template') {
        await deleteTrainingTemplate(eventId).unwrap();
        displaySnackbar('Шаблон тренировки удален!', 'success');
      } else if (eventType === 'real') {
        await deleteRealTraining(eventId).unwrap();
        displaySnackbar('Тренировка удалена!', 'success');
      }
      
      // Закрываем модал и диалог подтверждения
      setShowDeleteConfirmation(false);
      onClose();
      
    } catch (err: any) {
      console.error('[TrainingDetailModal] Failed to delete training:', err);
      const errorMessage = err?.data?.detail || err?.message || 'Ошибка при удалении тренировки';
      displaySnackbar(errorMessage, 'error');
    }
  };

  // Функция для входа в режим редактирования
  const handleEditTraining = () => {
    setIsEditing(true);
  };

  // Функция для сохранения изменений
  const handleSaveTraining = async () => {
    if (!event || !eventId) return;
    
    try {
      if (eventType === 'template') {
        const updateData: TrainingTemplateUpdate = {};
        
        if (editFormData.trainingTypeId && editFormData.trainingTypeId !== event.training_type?.id) {
          updateData.training_type_id = editFormData.trainingTypeId;
        }
        if (editFormData.trainerId && editFormData.trainerId !== (event as any).responsible_trainer?.id) {
          updateData.responsible_trainer_id = editFormData.trainerId;
        }
        if (editFormData.dayNumber && editFormData.dayNumber !== (event as any).day_number) {
          updateData.day_number = editFormData.dayNumber;
        }
        if (editFormData.startTime && editFormData.startTime !== event.start_time) {
          updateData.start_time = editFormData.startTime;
        }
        
        if (Object.keys(updateData).length > 0) {
          await updateTrainingTemplate({ id: eventId, data: updateData }).unwrap();
          displaySnackbar('Шаблон тренировки обновлен!', 'success');
        }
      } else if (eventType === 'real') {
        const updateData: RealTrainingUpdate = {};
        
        if (editFormData.trainingTypeId && editFormData.trainingTypeId !== event.training_type?.id) {
          updateData.training_type_id = editFormData.trainingTypeId;
        }
        if (editFormData.trainerId && editFormData.trainerId !== (event as any).trainer?.id) {
          updateData.responsible_trainer_id = editFormData.trainerId;
        }
        if (editFormData.trainingDate && editFormData.trainingDate !== (event as any).training_date) {
          updateData.training_date = editFormData.trainingDate;
        }
        if (editFormData.startTime && editFormData.startTime !== event.start_time) {
          updateData.start_time = editFormData.startTime;
        }
        
        if (Object.keys(updateData).length > 0) {
          await updateRealTraining({ id: eventId, data: updateData }).unwrap();
          displaySnackbar('Тренировка обновлена!', 'success');
        }
      }
      
      setIsEditing(false);
      
    } catch (err: any) {
      console.error('[TrainingDetailModal] Failed to update training:', err);
      const errorMessage = err?.data?.detail || err?.message || 'Ошибка при обновлении тренировки';
      displaySnackbar(errorMessage, 'error');
    }
  };

  // Функция для отмены редактирования
  const handleCancelEdit = () => {
    // Восстанавливаем исходные данные
    if (event) {
      setEditFormData({
        trainingTypeId: event.training_type?.id || null,
        trainerId: isTrainingTemplate(event) ? event.responsible_trainer?.id || null : event.trainer?.id || null,
        dayNumber: isTrainingTemplate(event) ? event.day_number : null,
        startTime: event.start_time || '',
        trainingDate: isRealTraining(event) ? event.training_date : '',
      });
    }
    setIsEditing(false);
  };

  // Функция для начала дублирования
  const handleDuplicateTraining = () => {
    setIsDuplicating(true);
  };

  // Функция для создания дубликата
  const handleCreateDuplicate = async () => {
    if (!event) return;
    
    try {
      if (eventType === 'template') {
        const createData: TrainingTemplateCreate = {
          training_type_id: duplicateFormData.trainingTypeId!,
          responsible_trainer_id: duplicateFormData.trainerId!,
          day_number: duplicateFormData.dayNumber!,
          start_time: duplicateFormData.startTime,
        };
        
        await createTrainingTemplate(createData).unwrap();
        displaySnackbar('Шаблон тренировки продублирован!', 'success');
      } else if (eventType === 'real') {
        const createData: RealTrainingCreate = {
          training_type_id: duplicateFormData.trainingTypeId!,
          responsible_trainer_id: duplicateFormData.trainerId!,
          training_date: duplicateFormData.trainingDate,
          start_time: duplicateFormData.startTime,
        };
        
        await createRealTraining(createData).unwrap();
        displaySnackbar('Тренировка продублирована!', 'success');
      }
      
      setIsDuplicating(false);
      onClose(); // Закрываем модал после успешного создания
      
    } catch (err: any) {
      console.error('[TrainingDetailModal] Failed to duplicate training:', err);
      const errorMessage = err?.data?.detail || err?.message || 'Ошибка при дублировании тренировки';
      displaySnackbar(errorMessage, 'error');
    }
  };

  // Функция для отмены дублирования
  const handleCancelDuplicate = () => {
    // Восстанавливаем исходные данные для дублирования
    if (event) {
      const currentHour = parseInt(event.start_time?.substring(0,2) || '0');
      const newHour = Math.min(currentHour + 1, 22);
      const newTime = `${newHour.toString().padStart(2, '0')}:00:00`;
      
      setDuplicateFormData({
        trainingTypeId: event.training_type?.id || null,
        trainerId: isTrainingTemplate(event) ? event.responsible_trainer?.id || null : event.trainer?.id || null,
        dayNumber: isTrainingTemplate(event) ? event.day_number : null,
        startTime: newTime,
        trainingDate: isRealTraining(event) ? dayjs(event.training_date).add(1, 'day').format('YYYY-MM-DD') : '',
      });
    }
    setIsDuplicating(false);
  };

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
      return (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 4,
            px: 2,
            color: alpha(theme.palette.text.primary, 0.6),
          }}
        >
          <GroupIcon sx={{ fontSize: '3rem', mb: 1, opacity: 0.3 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
            Нет записанных учеников
          </Typography>
          <Typography variant="body2">
            {isTrainingTemplate(event) ? 'Добавьте студентов в этот шаблон' : 'На эту тренировку никто не записан'}
          </Typography>
        </Box>
      );
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {studentsToDisplay.map((s_item) => (
          <Box 
            key={s_item.id} 
            sx={{ 
              p: 2,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(borderColor, 0.2)}`,
              position: 'relative',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.common.black, 0.15)}`,
                borderColor: alpha(borderColor, 0.5),
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Box 
                  sx={{ 
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.7)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <PersonIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {`${s_item.studentInfo.first_name || ''} ${s_item.studentInfo.last_name || ''}`.trim()}
                  </Typography>
                  
                  {s_item.studentInfo.client && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.7), mr: 1 }}>
                        Родитель: {`${s_item.studentInfo.client.first_name || ''} ${s_item.studentInfo.client.last_name || ''}`.trim()}
                      </Typography>
                      {s_item.studentInfo.client.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                          <PhoneIcon sx={{ fontSize: '0.9rem', mr: 0.5, color: alpha(theme.palette.text.primary, 0.5) }} />
                          <Link 
                            href={`tel:${s_item.studentInfo.client.phone}`} 
                            sx={{ 
                              color: theme.palette.primary.main,
                              textDecoration: 'none',
                              fontWeight: 500,
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {s_item.studentInfo.client.phone}
                          </Link>
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  {isRealTraining(event) && s_item.status_of_presence && (
                    <Chip 
                      label={`Статус: ${s_item.status_of_presence}`}
                      size="small"
                      sx={{ 
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        fontWeight: 500,
                      }}
                    />
                  )}
                </Box>
              </Box>
              
              {isTrainingTemplate(event) && (
                <IconButton 
                  onClick={() => handleRemoveStudentClick(s_item.id)}
                  disabled={isDeletingStudent} 
                  sx={{ 
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    width: 36,
                    height: 36,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.2),
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isDeletingStudent && studentBeingDeleted === s_item.id ? 
                    <CircularProgress size={20} color="inherit" /> : 
                    <PersonRemoveIcon fontSize="small" />
                  }
                </IconButton>
              )}
            </Box>
          </Box>
        ))}
        
        {deleteStudentError && (
          <Box 
            sx={{ 
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            }}
          >
            <Typography color="error" variant="body2" sx={{ fontWeight: 500 }}>
              {/* @ts-ignore */} 
              Ошибка удаления ученика: {deleteStudentError?.data?.detail || deleteStudentError?.error || 'Неизвестная ошибка'}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };



  return (
    <>
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
          border: `1px solid ${alpha(borderColor, 0.3)}`,
          overflow: 'hidden',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)', // Сильное затемнение фона
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          background: `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.8)} 100%)`,
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
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {isEditing ? (
                <>✏️ Редактирование тренировки</>
              ) : isDuplicating ? (
                <>📋 Дублирование тренировки</>
              ) : (
                event.training_type?.name || 'Тренировка'
              )}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
              {isEditing ? (
                <>Внесите изменения в поля ниже и нажмите "Сохранить"</>
              ) : isDuplicating ? (
                <>Настройте параметры новой тренировки и нажмите "Создать копию"</>
              ) : (
                isTrainingTemplate(event) ? (
                  <>Шаблон • {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][event.day_number - 1]} в {event.start_time.substring(0,5)}</>
                ) : (
                  <>Тренировка • {dayjs(event.training_date).format('D MMMM YYYY')} в {event.start_time.substring(0,5)}</>
                )
              )}
            </Typography>
          </Box>
        <IconButton 
          onClick={onClose} 
            disabled={isDeletingStudent}
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
      <DialogContent sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
        {/* Карточка с информацией о тренере */}
        <Box 
          sx={{ 
            mb: 3,
            p: 2.5,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${alpha(borderColor, 0.3)}`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box 
              sx={{ 
                p: 1.5,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.8)} 100%)`,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: borderColor, mb: 0.5 }}>
                Тренер
              </Typography>
              
              {!isEditing ? (
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  {(isTrainingTemplate(event) && event.responsible_trainer) ? 
                    `${event.responsible_trainer.first_name || ''} ${event.responsible_trainer.last_name || ''}`.trim() :
                   (isRealTraining(event) && event.trainer) ? 
                    `${event.trainer.first_name || ''} ${event.trainer.last_name || ''}`.trim() :
                   'Не назначен'}
                </Typography>
              ) : (
                <Autocomplete
                  value={trainers.find(t => t.id === editFormData.trainerId) || null}
                  onChange={(_, newValue) => {
                    setEditFormData(prev => ({ ...prev, trainerId: newValue?.id || null }));
                  }}
                  options={trainers}
                  getOptionLabel={(option) => `${option.first_name || ''} ${option.last_name || ''}`.trim()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Выберите тренера"
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                          '&:hover fieldset': {
                            borderColor: borderColor,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: borderColor,
                          },
                        },
                      }}
                    />
                  )}
                  sx={{ minWidth: 250, mt: 0.5 }}
                />
              )}
            </Box>
        </Box>

        {isRealTraining(event) && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(borderColor, 0.2)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EventNoteIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>Статус:</Typography>
                <Chip 
                  label={event.status || 'Не указан'} 
                  size="small" 
                  sx={{ 
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                    fontWeight: 500,
                  }} 
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Карточка для редактирования деталей тренировки */}
        {isEditing && (
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
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 2 }}>
              Редактирование тренировки
            </Typography>
            
            {/* Тип тренировки */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.secondary }}>
                Тип тренировки
              </Typography>
              <Autocomplete
                value={trainingTypes.find(t => t.id === editFormData.trainingTypeId) || null}
                onChange={(_, newValue) => {
                  setEditFormData(prev => ({ ...prev, trainingTypeId: newValue?.id || null }));
                }}
                options={trainingTypes}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Выберите тип тренировки"
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                )}
                fullWidth
              />
            </Box>

            {/* Время и дата/день недели */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.secondary }}>
                  Время начала
                  <Typography component="span" variant="caption" sx={{ ml: 1, fontStyle: 'italic', color: alpha(theme.palette.text.secondary, 0.7) }}>
                    (только полные часы: 6:00-22:00)
                  </Typography>
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={editFormData.startTime?.substring(0,5) || ''}
                    onChange={(e) => {
                      setEditFormData(prev => ({ ...prev, startTime: e.target.value + ':00' }));
                    }}
                    sx={{
                      borderRadius: 1,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    {Array.from({ length: 17 }, (_, i) => {
                      const hour = (i + 6).toString().padStart(2, '0'); // С 6:00 до 22:00
                      const timeValue = `${hour}:00`;
                      return (
                        <MenuItem key={timeValue} value={timeValue}>
                          {timeValue}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>

              {isTrainingTemplate(event) ? (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.secondary }}>
                    День недели
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={editFormData.dayNumber || ''}
                      onChange={(e) => {
                        setEditFormData(prev => ({ ...prev, dayNumber: Number(e.target.value) }));
                      }}
                      sx={{
                        borderRadius: 1,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
                        <MenuItem key={index + 1} value={index + 1}>
                          {day}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              ) : (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.secondary }}>
                    Дата тренировки
                  </Typography>
                  <TextField
                    type="date"
                    value={editFormData.trainingDate || ''}
                    onChange={(e) => {
                      setEditFormData(prev => ({ ...prev, trainingDate: e.target.value }));
                    }}
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Карточка для дублирования тренировки */}
        {isDuplicating && (
          <Box 
            sx={{ 
              mb: 3,
              p: 2.5,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
              boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.info.main, mb: 2 }}>
              Настройки дубликата тренировки
            </Typography>
            
            {/* Тренер */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.secondary }}>
                Тренер
              </Typography>
              <Autocomplete
                value={trainers.find(t => t.id === duplicateFormData.trainerId) || null}
                onChange={(_, newValue) => {
                  setDuplicateFormData(prev => ({ ...prev, trainerId: newValue?.id || null }));
                }}
                options={trainers}
                getOptionLabel={(option) => `${option.first_name || ''} ${option.last_name || ''}`.trim()}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Выберите тренера"
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        '&:hover fieldset': {
                          borderColor: theme.palette.info.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.info.main,
                        },
                      },
                    }}
                  />
                )}
                fullWidth
              />
            </Box>
            
            {/* Тип тренировки */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.secondary }}>
                Тип тренировки
              </Typography>
              <Autocomplete
                value={trainingTypes.find(t => t.id === duplicateFormData.trainingTypeId) || null}
                onChange={(_, newValue) => {
                  setDuplicateFormData(prev => ({ ...prev, trainingTypeId: newValue?.id || null }));
                }}
                options={trainingTypes}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Выберите тип тренировки"
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        '&:hover fieldset': {
                          borderColor: theme.palette.info.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.info.main,
                        },
                      },
                    }}
                  />
                )}
                fullWidth
              />
            </Box>

            {/* Время и дата/день недели */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.secondary }}>
                  Время начала
                  <Typography component="span" variant="caption" sx={{ ml: 1, fontStyle: 'italic', color: alpha(theme.palette.text.secondary, 0.7) }}>
                    (только полные часы: 6:00-22:00)
                  </Typography>
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={duplicateFormData.startTime?.substring(0,5) || ''}
                    onChange={(e) => {
                      setDuplicateFormData(prev => ({ ...prev, startTime: e.target.value + ':00' }));
                    }}
                    sx={{
                      borderRadius: 1,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.info.main,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.info.main,
                      },
                    }}
                  >
                    {Array.from({ length: 17 }, (_, i) => {
                      const hour = (i + 6).toString().padStart(2, '0'); // С 6:00 до 22:00
                      const timeValue = `${hour}:00`;
                      return (
                        <MenuItem key={timeValue} value={timeValue}>
                          {timeValue}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>

              {isTrainingTemplate(event) ? (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.secondary }}>
                    День недели
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={duplicateFormData.dayNumber || ''}
                      onChange={(e) => {
                        setDuplicateFormData(prev => ({ ...prev, dayNumber: Number(e.target.value) }));
                      }}
                      sx={{
                        borderRadius: 1,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.info.main,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.info.main,
                        },
                      }}
                    >
                      {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
                        <MenuItem key={index + 1} value={index + 1}>
                          {day}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              ) : (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.secondary }}>
                    Дата тренировки
                    <Typography component="span" variant="caption" sx={{ ml: 1, fontStyle: 'italic', color: alpha(theme.palette.text.secondary, 0.7) }}>
                      (по умолчанию: завтра)
                    </Typography>
                  </Typography>
                  <TextField
                    type="date"
                    value={duplicateFormData.trainingDate || ''}
                    onChange={(e) => {
                      setDuplicateFormData(prev => ({ ...prev, trainingDate: e.target.value }));
                    }}
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        '&:hover fieldset': {
                          borderColor: theme.palette.info.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.info.main,
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Карточка со студентами */}
        <Box 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${alpha(borderColor, 0.3)}`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
            overflow: 'hidden',
          }}
        >
          {/* Заголовок секции студентов */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 2.5,
              backgroundColor: alpha(borderColor, 0.1),
              borderBottom: `2px solid ${alpha(borderColor, 0.3)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  p: 1,
                  borderRadius: 1.5,
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GroupIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: borderColor }}>
                  Ученики
                </Typography>
                <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.7) }}>
                  {isTrainingTemplate(event) ? event.assigned_students?.length || 0 : event.students?.length || 0} записано
                </Typography>
              </Box>
            </Box>
            {isTrainingTemplate(event) && !isEditing && !isDuplicating && (
              <IconButton 
                onClick={() => setIsAddStudentFormOpen(true)}
                disabled={isDeletingStudent}
                sx={{ 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                  color: 'white',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <PersonAddIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          
          {/* Список студентов */}
          <Box sx={{ p: 2.5 }}>
            {renderStudentList()}
          </Box>
        </Box>

        {/* Форма добавления студента */}
        {isAddStudentFormOpen && isTrainingTemplate(event) && (
          <Box 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              border: `2px solid ${alpha(borderColor, 0.4)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
              overflow: 'hidden',
            }}
          >
            <Box 
              sx={{ 
                p: 2.5,
                background: `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.8)} 100%)`,
                color: 'white',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <PersonAddIcon sx={{ mr: 1.5 }} />
                Добавить студента в шаблон
              </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Autocomplete
                  value={selectedStudent}
                  onChange={(_, newValue) => setSelectedStudent(newValue)}
                  options={availableStudents}
                  getOptionLabel={(student) => `${student.first_name} ${student.last_name}`}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Выберите студента" 
                      variant="outlined"
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: borderColor,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: borderColor,
                          },
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} style={{ padding: 0 }}>
                      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', '&:hover': { backgroundColor: alpha(borderColor, 0.08) } }}>
                        <Box 
                          sx={{ 
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.7)} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                          }}
                        >
                          <PersonIcon sx={{ color: 'white', fontSize: '1rem' }} />
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {option.first_name} {option.last_name}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  noOptionsText="Нет доступных студентов"
                />
                
                <TextField
                  label="Дата начала"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: borderColor,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: borderColor,
                      },
                    },
                  }}
                />
                
                {addStudentError && (
                  <Box 
                    sx={{ 
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    }}
                  >
                    <Typography color="error" variant="body2" sx={{ fontWeight: 500 }}>
                      {/* @ts-ignore */}
                      Ошибка добавления студента: {addStudentError?.data?.detail || addStudentError?.error || 'Неизвестная ошибка'}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsAddStudentFormOpen(false);
                      setSelectedStudent(null);
                      setStartDate(dayjs().format('YYYY-MM-DD'));
                    }}
                    sx={{
                      borderColor: alpha(theme.palette.text.primary, 0.3),
                      color: theme.palette.text.primary,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: alpha(theme.palette.text.primary, 0.5),
                        backgroundColor: alpha(theme.palette.text.primary, 0.05),
                      }
                    }}
                  >
                    Отмена
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddStudent}
                    disabled={!selectedStudent}
                    sx={{
                      background: `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.8)} 100%)`,
                      color: 'white',
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      boxShadow: `0 4px 15px ${alpha(borderColor, 0.3)}`,
                      '&:hover': {
                        boxShadow: `0 6px 20px ${alpha(borderColor, 0.4)}`,
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        background: alpha(theme.palette.text.primary, 0.3),
                        color: alpha(theme.palette.text.primary, 0.5),
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Добавить студента
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

      </DialogContent>
      
      <Box 
        sx={{ 
          p: 3,
          backgroundColor: theme.palette.background.default,
          borderTop: `2px solid ${alpha(borderColor, 0.3)}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isEditing && !isDuplicating ? (
            <>
              <Button 
                onClick={handleEditTraining} 
                variant="contained" 
                disabled={isDeletingStudent || isDeletingTraining || isUpdatingTraining || isCreatingTraining}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
                  color: 'white',
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.secondary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: alpha(theme.palette.text.primary, 0.3),
                    color: alpha(theme.palette.text.primary, 0.5),
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Редактировать
              </Button>
              <Button 
                onClick={handleDuplicateTraining} 
                variant="contained" 
                disabled={isDeletingStudent || isDeletingTraining || isUpdatingTraining || isCreatingTraining}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${alpha(theme.palette.info.main, 0.8)} 100%)`,
                  color: 'white',
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.info.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(theme.palette.info.main, 0.4)}`,
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: alpha(theme.palette.text.primary, 0.3),
                    color: alpha(theme.palette.text.primary, 0.5),
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Дублировать
              </Button>
              <Button 
                onClick={() => setShowDeleteConfirmation(true)} 
                variant="contained" 
                disabled={isDeletingStudent || isDeletingTraining || isUpdatingTraining || isCreatingTraining}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${alpha(theme.palette.error.main, 0.8)} 100%)`,
                  color: 'white',
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.error.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(theme.palette.error.main, 0.4)}`,
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: alpha(theme.palette.text.primary, 0.3),
                    color: alpha(theme.palette.text.primary, 0.5),
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {isDeletingTraining ? <CircularProgress size={20} color="inherit" /> : 'Удалить'}
              </Button>
            </>
          ) : isEditing ? (
            <>
              <Button 
                onClick={handleCancelEdit} 
                variant="outlined" 
                disabled={isUpdatingTraining}
                sx={{
                  borderColor: alpha(theme.palette.text.primary, 0.3),
                  color: theme.palette.text.primary,
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: alpha(theme.palette.text.primary, 0.5),
                    backgroundColor: alpha(theme.palette.text.primary, 0.05),
                  },
                  '&:disabled': {
                    borderColor: alpha(theme.palette.text.primary, 0.2),
                    color: alpha(theme.palette.text.primary, 0.3),
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Отменить
              </Button>
              <Button 
                onClick={handleSaveTraining} 
                variant="contained" 
                disabled={isUpdatingTraining}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.8)} 100%)`,
                  color: 'white',
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.success.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.4)}`,
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: alpha(theme.palette.text.primary, 0.3),
                    color: alpha(theme.palette.text.primary, 0.5),
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {isUpdatingTraining ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} color="inherit" />
                    Сохранение...
                  </Box>
                ) : (
                  'Сохранить'
                )}
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handleCancelDuplicate} 
                variant="outlined" 
                disabled={isCreatingTraining}
                sx={{
                  borderColor: alpha(theme.palette.text.primary, 0.3),
                  color: theme.palette.text.primary,
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: alpha(theme.palette.text.primary, 0.5),
                    backgroundColor: alpha(theme.palette.text.primary, 0.05),
                  },
                  '&:disabled': {
                    borderColor: alpha(theme.palette.text.primary, 0.2),
                    color: alpha(theme.palette.text.primary, 0.3),
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Отменить
              </Button>
              <Button 
                onClick={handleCreateDuplicate} 
                variant="contained" 
                disabled={isCreatingTraining}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${alpha(theme.palette.info.main, 0.8)} 100%)`,
                  color: 'white',
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.info.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(theme.palette.info.main, 0.4)}`,
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: alpha(theme.palette.text.primary, 0.3),
                    color: alpha(theme.palette.text.primary, 0.5),
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {isCreatingTraining ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} color="inherit" />
                    Создание...
                  </Box>
                ) : (
                  'Создать копию'
                )}
              </Button>
            </>
          )}
        </Box>
        
        <Button 
          onClick={onClose} 
          variant="outlined" 
          disabled={isDeletingStudent || isDeletingTraining || isUpdatingTraining || isCreatingTraining || isEditing || isDuplicating}
          sx={{ 
            borderColor: alpha(borderColor, 0.4),
            color: borderColor, 
            px: 4,
            py: 1.2,
            borderRadius: 2,
            fontWeight: 600,
            '&:hover': {
              borderColor: borderColor, 
              backgroundColor: alpha(borderColor, 0.08),
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              borderColor: alpha(theme.palette.text.primary, 0.3),
              color: alpha(theme.palette.text.primary, 0.5),
            },
            transition: 'all 0.2s ease',
          }}
          autoFocus={!isEditing && !isDuplicating}
        >
            Закрыть
        </Button>
      </Box>
    </Dialog>

    {/* Диалог подтверждения удаления */}
    <Dialog
      open={showDeleteConfirmation}
      onClose={() => setShowDeleteConfirmation(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        backgroundColor: alpha(theme.palette.error.main, 0.05),
        borderTop: `4px solid ${theme.palette.error.main}`,
      }}>
        <WarningIcon sx={{ color: theme.palette.error.main, fontSize: '2rem' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Подтверждение удаления
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Вы уверены, что хотите удалить {eventType === 'template' ? 'шаблон тренировки' : 'тренировку'}?
        </Typography>
        
        {event && (
          <Box sx={{ 
            p: 2, 
            backgroundColor: alpha(theme.palette.error.main, 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.error.dark }}>
              {event.training_type?.name || 'Тренировка'}
            </Typography>
                         <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
               Тренер: {isTrainingTemplate(event) ? 
                 `${event.responsible_trainer?.first_name || ''} ${event.responsible_trainer?.last_name || ''}`.trim() :
                 `${event.trainer?.first_name || ''} ${event.trainer?.last_name || ''}`.trim()
               }
             </Typography>
            {isRealTraining(event) && (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Дата: {dayjs(event.training_date).format('DD.MM.YYYY')} в {event.start_time}
              </Typography>
            )}
            {isTrainingTemplate(event) && (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                День недели: {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][event.day_number - 1]} в {event.start_time}
              </Typography>
            )}
          </Box>
        )}
        
        <Typography variant="body2" sx={{ mt: 2, color: theme.palette.error.dark, fontWeight: 500 }}>
          ⚠️ Это действие нельзя отменить!
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={() => setShowDeleteConfirmation(false)}
          variant="outlined"
          disabled={isDeletingTraining}
          sx={{
            borderColor: alpha(theme.palette.text.primary, 0.3),
            color: theme.palette.text.primary,
            px: 3,
            py: 1,
            borderRadius: 2,
            '&:hover': {
              borderColor: alpha(theme.palette.text.primary, 0.5),
              backgroundColor: alpha(theme.palette.text.primary, 0.05),
            }
          }}
        >
          Отмена
        </Button>
        
        <Button
          onClick={handleDeleteTraining}
          variant="contained"
          disabled={isDeletingTraining}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${alpha(theme.palette.error.main, 0.8)} 100%)`,
            color: 'white',
            px: 3,
            py: 1,
            borderRadius: 2,
            boxShadow: `0 4px 15px ${alpha(theme.palette.error.main, 0.3)}`,
            '&:hover': {
              boxShadow: `0 6px 20px ${alpha(theme.palette.error.main, 0.4)}`,
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              background: alpha(theme.palette.text.primary, 0.3),
              color: alpha(theme.palette.text.primary, 0.5),
            },
            transition: 'all 0.2s ease',
          }}
        >
          {isDeletingTraining ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              Удаление...
            </Box>
          ) : (
            'Удалить'
          )}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default TrainingDetailModal; 