import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,

  useTheme,
  Link,
  Button,
  alpha,
  CircularProgress,
  TextField,
  Autocomplete,

} from '@mui/material';
import { useDispatch } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import dayjs from 'dayjs';
import { 
    useDeleteTrainingStudentTemplateMutation, 
    useCreateTrainingStudentTemplateMutation, 
    useGetTrainingTemplateByIdQuery, 
    useDeleteTrainingTemplateMutation, 
    useUpdateTrainingTemplateMutation, 
    useCreateTrainingTemplateMutation,
} from '../../../../../store/apis/calendarApi-v2';
import { calendarApiV2 } from '../../../../../store/apis/calendarApi-v2';
import { useGetStudentsQuery } from '../../../../../store/apis/studentsApi';
import { useGetTrainersQuery } from '../../../../../store/apis/trainersApi';
import { TrainingStudentTemplateCreate } from '../../../models/trainingStudentTemplate';
import { TrainingTemplateUpdate, TrainingTemplateCreate } from '../../../models/trainingTemplate';
import { useSnackbar } from '../../../../../hooks/useSnackBar';
import { getStartDateColorsAndStatus } from '../../../utils/studentStartDateHelper';

interface TrainingTemplateModalProps {
  open: boolean;
  onClose: () => void;
  templateId: number | null;
}

// Helper to format date and time for the input fields


const TrainingTemplateModal: React.FC<TrainingTemplateModalProps> = ({ open, onClose, templateId }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { displaySnackbar } = useSnackbar();

  // Мутации
  const [deleteTrainingStudentTemplate, { isLoading: isDeletingStudent }] =
    useDeleteTrainingStudentTemplateMutation();

  const [createTrainingStudentTemplate] = useCreateTrainingStudentTemplateMutation();
  const [deleteTrainingTemplate, { isLoading: isDeletingTemplate }] = useDeleteTrainingTemplateMutation();
  const [updateTrainingTemplate, { isLoading: isUpdatingTemplate }] = useUpdateTrainingTemplateMutation();
  const [createTrainingTemplate, { isLoading: isCreatingTemplate }] = useCreateTrainingTemplateMutation();
  
  const { data: students } = useGetStudentsQuery();
  const { data: trainersData } = useGetTrainersQuery();
  

  const trainers = trainersData?.trainers || [];
  
  const { data: templateData, isLoading: isLoadingTemplate } = useGetTrainingTemplateByIdQuery(
    templateId || 0, 
    { skip: !templateId }
  );
  
  const isLoading = isLoadingTemplate;

  // Состояния
  const [studentBeingDeleted, setStudentBeingDeleted] = useState<number | null>(null);
  const [isAddStudentFormOpen, setIsAddStudentFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const [editFormData, setEditFormData] = useState<{
    trainingTypeId: number | null;
    trainerId: number | null;
    dayNumber: number | null;
    startTime: string;
  }>({
    trainingTypeId: null,
    trainerId: null,
    dayNumber: null,
    startTime: '',
  });

  const [duplicateFormData, setDuplicateFormData] = useState<{
    trainingTypeId: number | null;
    trainerId: number | null;
    dayNumber: number | null;
    startTime: string;
  }>({
    trainingTypeId: null,
    trainerId: null,
    dayNumber: null,
    startTime: '',
  });

  const isDeletingTraining = isDeletingTemplate;
  const isUpdatingTraining = isUpdatingTemplate;
  const isCreatingTraining = isCreatingTemplate;

  useEffect(() => {
    if (templateData) {
      const baseData = {
        trainingTypeId: templateData.training_type?.id || null,
        trainerId: templateData.responsible_trainer?.id || null,
        dayNumber: templateData.day_number,
        startTime: templateData.start_time || '',
      };
      setEditFormData(baseData);
      
      const currentHour = parseInt(templateData.start_time?.substring(0,2) || '0');
      const newHour = Math.min(currentHour + 1, 22);
      const newTime = `${newHour.toString().padStart(2, '0')}:00:00`;
      
      setDuplicateFormData({
        ...baseData,
        startTime: newTime,
      });
    }
  }, [templateData]);

  // Handlers
  const handleDeleteTraining = async () => {
    if (!templateData) return;
    
    try {
      await deleteTrainingTemplate(templateData.id).unwrap();
      dispatch(calendarApiV2.util.invalidateTags(['TrainingTemplateV2']));
      displaySnackbar('Шаблон тренировки удален', 'success');
      onClose();
    } catch (err) {
      console.error('[TrainingTemplateModal] Failed to delete template:', err);
      displaySnackbar('Ошибка при удалении шаблона', 'error');
    } finally {
      setShowDeleteConfirmation(false);
    }
  };

  const handleSaveTraining = async () => {
    if (!templateData || !editFormData.trainingTypeId || !editFormData.trainerId) return;
    
    try {
      const updateData: TrainingTemplateUpdate = {
        training_type_id: editFormData.trainingTypeId,
        responsible_trainer_id: editFormData.trainerId,
        day_number: editFormData.dayNumber!,
        start_time: editFormData.startTime,
      };
      
      await updateTrainingTemplate({ id: templateData.id, data: updateData }).unwrap();
      dispatch(calendarApiV2.util.invalidateTags([{ type: 'TrainingTemplateV2', id: templateData.id }]));
      displaySnackbar('Шаблон обновлен', 'success');
      setIsEditing(false);
    } catch (err) {
      console.error('[TrainingTemplateModal] Failed to update template:', err);
      displaySnackbar('Ошибка при обновлении шаблона', 'error');
    }
  };

  const handleCreateDuplicate = async () => {
    if (!duplicateFormData.trainingTypeId || !duplicateFormData.trainerId) return;
    
    try {
      const createData: TrainingTemplateCreate = {
        training_type_id: duplicateFormData.trainingTypeId,
        responsible_trainer_id: duplicateFormData.trainerId,
        day_number: duplicateFormData.dayNumber!,
        start_time: duplicateFormData.startTime,
      };
      
      await createTrainingTemplate(createData).unwrap();
      dispatch(calendarApiV2.util.invalidateTags(['TrainingTemplateV2']));
      displaySnackbar('Копия шаблона создана', 'success');
      setIsDuplicating(false);
      onClose();
    } catch (err) {
      console.error('[TrainingTemplateModal] Failed to create duplicate:', err);
      displaySnackbar('Ошибка при создании копии', 'error');
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent || !templateData) return;
    
    try {
      const newStudentTemplate: TrainingStudentTemplateCreate = {
        training_template_id: templateData.id,
        student_id: selectedStudent.id,
        start_date: startDate,
      };
      await createTrainingStudentTemplate(newStudentTemplate).unwrap();
      dispatch(calendarApiV2.util.invalidateTags([{ type: 'TrainingTemplateV2', id: templateData.id }]));
      setIsAddStudentFormOpen(false);
      setSelectedStudent(null);
      displaySnackbar(`Ученик ${selectedStudent.first_name} ${selectedStudent.last_name} добавлен`, 'success');
    } catch (err) {
      console.error('[TrainingTemplateModal] Failed to add student:', err);
      displaySnackbar('Ошибка при добавлении ученика', 'error');
    }
  };

  const renderStudentList = () => {
    if (!templateData) {
        return <Typography>Загрузка данных об учениках...</Typography>;
    }
      
    const studentsToDisplay = templateData.assigned_students || [];

    if (studentsToDisplay.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4, px: 2, color: alpha(theme.palette.text.primary, 0.6) }}>
          <GroupIcon sx={{ fontSize: '3rem', mb: 1, opacity: 0.3 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>Нет записанных учеников</Typography>
          <Typography variant="body2">Добавьте учеников в этот шаблон</Typography>
        </Box>
      );
    }

    const handleRemoveStudentClick = async (trainingStudentTemplateId: number) => {
        if (!templateData) return;
        setStudentBeingDeleted(trainingStudentTemplateId);
        try {
            await deleteTrainingStudentTemplate(trainingStudentTemplateId).unwrap();
            dispatch(calendarApiV2.util.invalidateTags([{ type: 'TrainingTemplateV2', id: templateData.id }]));
        } catch (err) {
            console.error('[TrainingTemplateModal] Failed to delete student from template:', err);
        } finally {
            setStudentBeingDeleted(null);
        }
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {studentsToDisplay.map((s_template) => {
            const borderColor = templateData.training_type?.color || theme.palette.divider;
            
            return (
          <Box 
            key={s_template.id} 
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
                borderColor: alpha(borderColor, 0.5) 
              } 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  background: `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.7)} 100%)`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mr: 2 
                }}>
                  <PersonIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 0.5
                    }}
                  >
                    {`${s_template.student.first_name || ''} ${s_template.student.last_name || ''}`.trim()}
                  </Typography>
                  {s_template.student.client && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: alpha(theme.palette.text.primary, 0.7), 
                          mr: 1 
                        }}
                      >
                        Родитель: {`${s_template.student.client.first_name || ''} ${s_template.student.client.last_name || ''}`.trim()}
                      </Typography>
                      {s_template.student.client.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                          <PhoneIcon sx={{ fontSize: '0.9rem', mr: 0.5, color: alpha(theme.palette.text.primary, 0.5) }} />
                          <Link 
                            href={`tel:${s_template.student.client.phone}`} 
                            sx={{ 
                              color: theme.palette.primary.main, 
                              textDecoration: 'none', 
                              fontWeight: 500, 
                              '&:hover': { textDecoration: 'underline' } 
                            }}
                          >
                            {s_template.student.client.phone}
                          </Link>
                        </Box>
                      )}
                    </Box>
                  )}
                  {s_template.start_date && (() => {
                    const { icon, text, statusText, formattedDate } = getStartDateColorsAndStatus(s_template.start_date, theme);
                    
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarTodayIcon sx={{ 
                            fontSize: '0.9rem', 
                            mr: 0.5, 
                            color: alpha(icon, 0.6)
                          }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: alpha(text, 0.8), 
                              fontWeight: 500 
                            }}
                          >
                            Начало: {formattedDate}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: alpha(text, 0.8),
                            fontStyle: 'italic',
                            fontSize: '0.85rem'
                          }}
                        >
                          ({statusText})
                        </Typography>
                      </Box>
                    );
                  })()}
                </Box>
              </Box>
              
              <IconButton onClick={() => handleRemoveStudentClick(s_template.id)} disabled={isDeletingStudent} sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, width: 36, height: 36, '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.2), transform: 'scale(1.1)'}, transition: 'all 0.2s ease' }}>
                {isDeletingStudent && studentBeingDeleted === s_template.id ? <CircularProgress size={20} color="inherit" /> : <PersonRemoveIcon fontSize="small" />}
              </IconButton>
            </Box>
          </Box>
        )})}
      </Box>
    );
  };
  
  if (isLoading) return <Dialog open={open} onClose={onClose}><DialogContent><CircularProgress /></DialogContent></Dialog>;
  if (!templateData) return <Dialog open={open} onClose={onClose}><DialogContent><Typography>Шаблон не найден</Typography></DialogContent></Dialog>;

  const borderColor = templateData.training_type?.color || theme.palette.divider;
  const assignedStudentIds = templateData.assigned_students?.map(s => s.student.id) || [];
  const availableStudents = students?.filter(student => !assignedStudentIds.includes(student.id)) || [];

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, backgroundColor: theme.palette.background.paper, boxShadow: `0 25px 80px ${alpha(theme.palette.common.black, 0.3)}`, border: `1px solid ${alpha(borderColor, 0.3)}`, overflow: 'hidden' } }} BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}>
      <DialogTitle sx={{ background: `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.8)} 100%)`, color: 'white', py: 3, px: 3, position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 20% 80%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%)` } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {isEditing ? '✏️ Редактирование шаблона' : isDuplicating ? '📋 Дублирование шаблона' : templateData.training_type?.name || 'Шаблон тренировки'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
              {isEditing ? 'Внесите изменения и нажмите "Сохранить"' : isDuplicating ? 'Настройте параметры и нажмите "Создать копию"' : `Шаблон • ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][templateData.day_number - 1]} в ${templateData.start_time.substring(0,5)}`}
            </Typography>
          </Box>
          <IconButton onClick={onClose} disabled={isDeletingStudent} sx={{ color: 'white', backgroundColor: alpha('#ffffff', 0.1), backdropFilter: 'blur(10px)', '&:hover': { backgroundColor: alpha('#ffffff', 0.2), transform: 'scale(1.1)' }, transition: 'all 0.2s ease' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
        <Box sx={{ mb: 3, p: 2.5, borderRadius: 2, backgroundColor: theme.palette.background.paper, border: `2px solid ${alpha(borderColor, 0.3)}`, boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.8)} 100%)`, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: borderColor, mb: 0.5 }}>Тренер</Typography>
              {!isEditing ? (
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  {templateData.responsible_trainer ? `${templateData.responsible_trainer.first_name || ''} ${templateData.responsible_trainer.last_name || ''}`.trim() : 'Не назначен'}
                </Typography>
              ) : (
                <Autocomplete 
                  value={trainers.find(t => t.id === editFormData.trainerId) || null} 
                  onChange={(_, newValue) => setEditFormData(prev => ({ ...prev, trainerId: newValue?.id || null }))} 
                  options={trainers} 
                  getOptionLabel={(option) => `${option.first_name || ''} ${option.last_name || ''}`.trim()} 
                  renderInput={(params) => <TextField {...params} placeholder="Выберите тренера" variant="outlined" size="small" />} 
                  sx={{ minWidth: 250, mt: 0.5 }} 
                />
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={{ mb: 3, borderRadius: 2, backgroundColor: theme.palette.background.paper, border: `2px solid ${alpha(borderColor, 0.3)}`, boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, backgroundColor: alpha(borderColor, 0.1), borderBottom: `2px solid ${alpha(borderColor, 0.3)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GroupIcon sx={{ color: 'white', fontSize: '1.2rem', p: 1, borderRadius: 1.5, background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`, mr: 2 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: borderColor }}>Ученики</Typography>
                <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.7) }}>
                  {templateData.assigned_students?.length || 0} записано
                </Typography>
              </Box>
            </Box>
            {!isEditing && !isDuplicating && (
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
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}` 
                  }, 
                  transition: 'all 0.2s ease' 
                }}
              >
                <PersonAddIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Box sx={{ p: 2.5 }}>{renderStudentList()}</Box>
        </Box>
        {isAddStudentFormOpen && (
          <Box sx={{ mb: 3, p: 3, borderRadius: 2, backgroundColor: theme.palette.background.paper, border: `2px solid ${alpha(borderColor, 0.4)}` }}>
            <Typography variant="h6">Добавить ученика</Typography>
            <Autocomplete 
              value={selectedStudent} 
              onChange={(_, newValue) => setSelectedStudent(newValue)} 
              options={availableStudents} 
              getOptionLabel={(s) => `${s.first_name} ${s.last_name}`} 
              renderInput={(params) => <TextField {...params} label="Выберите ученика" />} 
            />
            <TextField 
              label="Дата начала" 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              InputLabelProps={{ shrink: true }} 
              fullWidth 
            />
            <Button onClick={handleAddStudent}>Добавить</Button>
            <Button onClick={() => setIsAddStudentFormOpen(false)}>Отмена</Button>
          </Box>
        )}
      </DialogContent>
      <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, borderTop: `2px solid ${alpha(borderColor, 0.3)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isEditing && !isDuplicating ? (
            <>
              <Button onClick={() => setIsEditing(true)} variant="contained" sx={{background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`}}>Редактировать</Button>
              <Button onClick={() => setIsDuplicating(true)} variant="contained" sx={{background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${alpha(theme.palette.info.main, 0.8)} 100%)`}}>Дублировать</Button>
              <Button onClick={() => setShowDeleteConfirmation(true)} variant="contained" color="error" sx={{background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${alpha(theme.palette.error.main, 0.8)} 100%)`}}>{isDeletingTraining ? <CircularProgress size={20} /> : 'Удалить'}</Button>
            </>
          ) : isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="outlined">Отменить</Button>
              <Button onClick={handleSaveTraining} variant="contained" color="success">{isUpdatingTraining ? <CircularProgress size={20} /> : 'Сохранить'}</Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsDuplicating(false)} variant="outlined">Отменить</Button>
              <Button onClick={handleCreateDuplicate} variant="contained" color="info">{isCreatingTraining ? <CircularProgress size={20} /> : 'Создать копию'}</Button>
            </>
          )}
        </Box>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: alpha(borderColor, 0.4), color: borderColor }}>Закрыть</Button>
      </Box>
    </Dialog>

    <Dialog open={showDeleteConfirmation} onClose={() => setShowDeleteConfirmation(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
            <Typography>Вы уверены, что хотите удалить шаблон тренировки?</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setShowDeleteConfirmation(false)}>Отмена</Button>
            <Button onClick={handleDeleteTraining} color="error" variant="contained">{isDeletingTraining ? <CircularProgress size={24} /> : 'Удалить'}</Button>
        </DialogActions>
    </Dialog>
    </>
  );
};

export default TrainingTemplateModal; 