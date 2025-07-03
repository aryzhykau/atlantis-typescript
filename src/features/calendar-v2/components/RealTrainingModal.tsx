import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Chip,
  useTheme,
  Link,
  Button,
  alpha,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import { 
    useGetRealTrainingByIdQuery, 
    useDeleteRealTrainingMutation, 
    useUpdateRealTrainingMutation, 
    useCreateRealTrainingMutation,
    useCancelStudentFromTrainingMutation
} from '../../../store/apis/calendarApi-v2';
import { calendarApiV2 } from '../../../store/apis/calendarApi-v2';
import { RealTrainingUpdate, RealTrainingCreate, StudentCancellationRequest } from '../models/realTraining';
import { useSnackbar } from '../../../hooks/useSnackBar';

interface RealTrainingModalProps {
  open: boolean;
  onClose: () => void;
  trainingId: number | null;
}

// Helper to format date and time for the input fields
const toDatetimeLocal = (isoString: string) => {
    const date = dayjs(isoString);
    return date.format('YYYY-MM-DDTHH:mm');
};

const RealTrainingModal: React.FC<RealTrainingModalProps> = ({ open, onClose, trainingId }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { displaySnackbar } = useSnackbar();

  // Мутации
  const [cancelStudentFromTraining, { isLoading: isCancellingStudent }] = useCancelStudentFromTrainingMutation();
  const [deleteRealTraining, { isLoading: isDeletingReal }] = useDeleteRealTrainingMutation();
  const [updateRealTraining, { isLoading: isUpdatingReal }] = useUpdateRealTrainingMutation();
  const [createRealTraining, { isLoading: isCreatingReal }] = useCreateRealTrainingMutation();
  
  const { data: realTrainingData, isLoading: isLoadingReal } = useGetRealTrainingByIdQuery(
    trainingId || 0, 
    { skip: !trainingId }
  );
  
  const isLoading = isLoadingReal;

  // Состояния
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  
  // Состояние для диалога отмены
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [studentToCancel, setStudentToCancel] = useState<{ id: number; name: string } | null>(null);
  const [cancellationData, setCancellationData] = useState({
      reason: '',
      notification_time: toDatetimeLocal(new Date().toISOString()),
  });

  const [editFormData, setEditFormData] = useState<{
    trainerId: number | null;
    trainingDate: string;
    startTime: string;
  }>({
    trainerId: null,
    trainingDate: '',
    startTime: '',
  });

  const [duplicateFormData, setDuplicateFormData] = useState<{
    trainerId: number | null;
    trainingDate: string;
    startTime: string;
  }>({
    trainerId: null,
    trainingDate: '',
    startTime: '',
  });

  const isDeletingTraining = isDeletingReal;
  const isUpdatingTraining = isUpdatingReal;
  const isCreatingTraining = isCreatingReal;

  const isStudentCancelled = (status?: string) => {
    return status === 'CANCELLED_SAFE' || status === 'CANCELLED_PENALTY';
  };

  useEffect(() => {
    if (realTrainingData) {
      const baseData = {
        trainerId: realTrainingData.trainer?.id || null,
        trainingDate: realTrainingData.training_date,
        startTime: realTrainingData.start_time || '',
      };
      setEditFormData(baseData);
      
      const currentHour = parseInt(realTrainingData.start_time?.substring(0,2) || '0');
      const newHour = Math.min(currentHour + 1, 22);
      const newTime = `${newHour.toString().padStart(2, '0')}:00:00`;
      
      setDuplicateFormData({
        ...baseData,
        startTime: newTime,
        trainingDate: dayjs(realTrainingData.training_date).add(1, 'day').format('YYYY-MM-DD'),
      });
    }
  }, [realTrainingData]);

  // Handlers
  const handleOpenCancelDialog = (studentId: number, studentName: string) => {
    setStudentToCancel({ id: studentId, name: studentName });
    setCancellationData({
        reason: '',
        notification_time: toDatetimeLocal(new Date().toISOString()),
    });
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setStudentToCancel(null);
    setCancellationData({ reason: '', notification_time: toDatetimeLocal(new Date().toISOString()) });
  };

  const handleConfirmCancellation = async () => {
    if (!studentToCancel || !realTrainingData) return;
    
    try {
        const request: StudentCancellationRequest = {
            reason: cancellationData.reason,
            notification_time: cancellationData.notification_time
        };
        
        await cancelStudentFromTraining({
            training_id: realTrainingData.id,
            student_id: studentToCancel.id,
            data: request
        }).unwrap();
        
        dispatch(calendarApiV2.util.invalidateTags([{ type: 'RealTrainingV2', id: realTrainingData.id }]));
        displaySnackbar(`Отмена для ${studentToCancel.name} обработана`, 'success');
        handleCloseCancelDialog();
    } catch (err) {
        console.error('[RealTrainingModal] Failed to cancel student:', err);
        displaySnackbar('Ошибка при отмене записи', 'error');
    }
  };

  const handleDeleteTraining = async () => {
    if (!realTrainingData) return;
    
    try {
      await deleteRealTraining(realTrainingData.id).unwrap();
      dispatch(calendarApiV2.util.invalidateTags(['RealTrainingV2']));
      displaySnackbar('Тренировка удалена', 'success');
      onClose();
    } catch (err) {
      console.error('[RealTrainingModal] Failed to delete training:', err);
      displaySnackbar('Ошибка при удалении тренировки', 'error');
    } finally {
      setShowDeleteConfirmation(false);
    }
  };

  const getStatusChip = (status: string) => {
    const statusStyles: { [key: string]: any } = {
        // Активные статусы
        REGISTERED: { label: 'Записан', color: 'primary', variant: 'outlined', icon: <PersonIcon /> },
        PRESENT: { label: 'Присутствовал', color: 'success', variant: 'filled', icon: <CheckCircleOutlineIcon /> },
        ABSENT: { label: 'Отсутствовал', color: 'warning', variant: 'filled', icon: <HelpOutlineIcon /> },
        WAITLIST: { label: 'Лист ожидания', color: 'info', variant: 'outlined', icon: <AccessTimeIcon /> },
        
        // Статусы отмены (disabled)
        CANCELLED_SAFE: { label: 'Отменено (безопасно)', color: 'default', variant: 'filled', icon: <CancelIcon />, disabled: true },
        CANCELLED_PENALTY: { label: 'Отменено (штраф)', color: 'error', variant: 'filled', icon: <CancelIcon />, disabled: true },
        
        // Старые статусы (для обратной совместимости)
        PLANNED: { label: 'Запланировано', color: 'default', variant: 'outlined' },
        ABSENT_RESPECTFUL: { label: 'Уваж. пропуск', color: 'warning', variant: 'filled', icon: <HelpOutlineIcon /> },
        ABSENT_LATE_CANCEL: { label: 'Прогул', color: 'error', variant: 'filled', icon: <CancelIcon /> },
        
        default: { label: status, color: 'default', variant: 'outlined' }
    };
    const style = statusStyles[status] || statusStyles.default;
    return <Chip 
        label={style.label} 
        color={style.color} 
        variant={style.variant} 
        icon={style.icon} 
        size="small"
        sx={style.disabled ? { 
            opacity: 0.6,
            textDecoration: 'line-through'
        } : {}}
    />;
  };

  const renderStudentList = () => {
    if (!realTrainingData) {
        return <Typography>Загрузка данных о студентах...</Typography>;
    }
      
    const studentsToDisplay = realTrainingData.students || [];
    
    // Отладочная информация
    console.log('[RealTrainingModal] Students data:', studentsToDisplay);
    studentsToDisplay.forEach((student, index) => {
      console.log(`[RealTrainingModal] Student ${index}:`, {
        id: student.id,
        name: `${student.student.first_name} ${student.student.last_name}`,
        status: student.status,
        statusType: typeof student.status
      });
    });

    if (studentsToDisplay.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4, px: 2, color: alpha(theme.palette.text.primary, 0.6) }}>
          <GroupIcon sx={{ fontSize: '3rem', mb: 1, opacity: 0.3 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>Нет записанных учеников</Typography>
          <Typography variant="body2">На эту тренировку никто не записан</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {studentsToDisplay.map((s_real) => {
            const borderColor = realTrainingData.training_type?.color || theme.palette.divider;
            const isCancelled = isStudentCancelled(s_real.status);
            
            return (
          <Box 
            key={s_real.id} 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: isCancelled ? alpha(theme.palette.background.paper, 0.5) : theme.palette.background.paper, 
              border: `1px solid ${alpha(borderColor, isCancelled ? 0.1 : 0.2)}`, 
              position: 'relative', 
              transition: 'all 0.2s ease',
              opacity: isCancelled ? 0.7 : 1,
              '&:hover': isCancelled ? {} : { 
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
                  background: isCancelled 
                    ? `linear-gradient(135deg, ${alpha(borderColor, 0.3)} 0%, ${alpha(borderColor, 0.2)} 100%)` 
                    : `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.7)} 100%)`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mr: 2 
                }}>
                  <PersonIcon sx={{ color: isCancelled ? alpha('#ffffff', 0.5) : '#ffffff', fontSize: '1.2rem' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 0.5,
                      textDecoration: isCancelled ? 'line-through' : 'none',
                      opacity: isCancelled ? 0.7 : 1
                    }}
                  >
                    {`${s_real.student.first_name || ''} ${s_real.student.last_name || ''}`.trim()}
                  </Typography>
                  {s_real.student.client && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: alpha(theme.palette.text.primary, isCancelled ? 0.4 : 0.7), 
                          mr: 1 
                        }}
                      >
                        Родитель: {`${s_real.student.client.first_name || ''} ${s_real.student.client.last_name || ''}`.trim()}
                      </Typography>
                      {s_real.student.client.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                          <PhoneIcon sx={{ fontSize: '0.9rem', mr: 0.5, color: alpha(theme.palette.text.primary, isCancelled ? 0.3 : 0.5) }} />
                          <Link 
                            href={`tel:${s_real.student.client.phone}`} 
                            sx={{ 
                              color: isCancelled ? alpha(theme.palette.primary.main, 0.5) : theme.palette.primary.main, 
                              textDecoration: 'none', 
                              fontWeight: 500, 
                              '&:hover': { textDecoration: 'underline' } 
                            }}
                          >
                            {s_real.student.client.phone}
                          </Link>
                        </Box>
                      )}
                    </Box>
                  )}
                  <Box sx={{ mt: 1 }}>
                    {s_real.status ? getStatusChip(s_real.status) : (
                      <Chip 
                        label={`Без статуса (${JSON.stringify(s_real.status)})`} 
                        size="small" 
                        color="default" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              
              {!isCancelled && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<CancelIcon />}
                  onClick={() => handleOpenCancelDialog(s_real.student.id, `${s_real.student.first_name} ${s_real.student.last_name}`)}
                  disabled={isCancellingStudent && studentToCancel?.id === s_real.student.id}
                >
                  {isCancellingStudent && studentToCancel?.id === s_real.student.id ? <CircularProgress size={20} /> : 'Отменить'}
                </Button>
              )}

              {isCancelled && (
                <Chip 
                  label="Отменено" 
                  size="small" 
                  variant="outlined" 
                  color="default"
                  sx={{ opacity: 0.6 }}
                />
              )}
            </Box>
          </Box>
        )})}
      </Box>
    );
  };
  
  if (isLoading) return <Dialog open={open} onClose={onClose}><DialogContent><CircularProgress /></DialogContent></Dialog>;
  if (!realTrainingData) return <Dialog open={open} onClose={onClose}><DialogContent><Typography>Тренировка не найдена</Typography></DialogContent></Dialog>;

  const borderColor = realTrainingData.training_type?.color || theme.palette.divider;

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, backgroundColor: theme.palette.background.paper, boxShadow: `0 25px 80px ${alpha(theme.palette.common.black, 0.3)}`, border: `1px solid ${alpha(borderColor, 0.3)}`, overflow: 'hidden' } }} BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}>
      <DialogTitle sx={{ background: `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.8)} 100%)`, color: '#ffffff', py: 3, px: 3, position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 20% 80%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%)` } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {isEditing ? '✏️ Редактирование тренировки' : isDuplicating ? '📋 Дублирование тренировки' : realTrainingData.training_type?.name || 'Тренировка'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
              {isEditing ? 'Внесите изменения и нажмите "Сохранить"' : isDuplicating ? 'Настройте параметры и нажмите "Создать копию"' : `Тренировка • ${dayjs(realTrainingData.training_date).format('D MMMM YYYY')} в ${realTrainingData.start_time.substring(0,5)}`}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#ffffff', backgroundColor: alpha('#ffffff', 0.1), backdropFilter: 'blur(10px)', '&:hover': { backgroundColor: alpha('#ffffff', 0.2), transform: 'scale(1.1)' }, transition: 'all 0.2s ease' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
        <Box sx={{ mb: 3, p: 2.5, borderRadius: 2, backgroundColor: theme.palette.background.paper, border: `2px solid ${alpha(borderColor, 0.3)}`, boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.8)} 100%)`, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: borderColor, mb: 0.5 }}>Тренер</Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                {realTrainingData.trainer ? `${realTrainingData.trainer.first_name || ''} ${realTrainingData.trainer.last_name || ''}`.trim() : 'Не назначен'}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mb: 3, borderRadius: 2, backgroundColor: theme.palette.background.paper, border: `2px solid ${alpha(borderColor, 0.3)}`, boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5, backgroundColor: alpha(borderColor, 0.1), borderBottom: `2px solid ${alpha(borderColor, 0.3)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GroupIcon sx={{ color: '#ffffff', fontSize: '1.2rem', p: 1, borderRadius: 1.5, background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`, mr: 2 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: borderColor }}>Ученики</Typography>
                <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.7) }}>
                  {(() => {
                    const students = realTrainingData.students || [];
                    const activeStudents = students.filter(s => !isStudentCancelled(s.status));
                    const cancelledStudents = students.filter(s => isStudentCancelled(s.status));
                    
                    if (cancelledStudents.length > 0) {
                      return `${activeStudents.length} активных, ${cancelledStudents.length} отменено`;
                    } else {
                      return `${activeStudents.length} записано`;
                    }
                  })()}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ p: 2.5 }}>{renderStudentList()}</Box>
        </Box>
      </DialogContent>
      <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, borderTop: `2px solid ${alpha(borderColor, 0.3)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={() => setShowDeleteConfirmation(true)} variant="contained" color="error" sx={{background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${alpha(theme.palette.error.main, 0.8)} 100%)`}}>
            {isDeletingTraining ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </Box>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: alpha(borderColor, 0.4), color: borderColor }}>Закрыть</Button>
      </Box>
    </Dialog>

    <Dialog open={showDeleteConfirmation} onClose={() => setShowDeleteConfirmation(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
            <Typography>Вы уверены, что хотите удалить тренировку?</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setShowDeleteConfirmation(false)}>Отмена</Button>
            <Button onClick={handleDeleteTraining} color="error" variant="contained">{isDeletingTraining ? <CircularProgress size={24} /> : 'Удалить'}</Button>
        </DialogActions>
    </Dialog>

    <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
      <DialogTitle>Отмена записи для: {studentToCancel?.name}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <TextField
            label="Время уведомления об отмене"
            type="datetime-local"
            value={cancellationData.notification_time}
            onChange={(e) => setCancellationData({ ...cancellationData, notification_time: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Причина отмены (необязательно)"
            multiline
            rows={3}
            value={cancellationData.reason}
            onChange={(e) => setCancellationData({ ...cancellationData, reason: e.target.value })}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleCloseCancelDialog} disabled={isCancellingStudent}>Отмена</Button>
        <Button onClick={handleConfirmCancellation} variant="contained" color="error" disabled={isCancellingStudent}>
          {isCancellingStudent ? <CircularProgress size={24} color="inherit" /> : 'Подтвердить отмену'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default RealTrainingModal; 