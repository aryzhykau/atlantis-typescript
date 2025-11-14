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
  Grid,
  Alert,
  Autocomplete,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import { 
    useGetRealTrainingByIdQuery, 
    useCancelRealTrainingMutation, 
    useCancelStudentFromTrainingMutation,
    useAddStudentToRealTrainingMutation
} from '../../../../../store/apis/calendarApi-v2';
import { useGetStudentsQuery } from '../../../../../store/apis/studentsApi';
import { calendarApiV2 } from '../../../../../store/apis/calendarApi-v2';
import { StudentCancellationRequest, StudentCancellationResponse, TrainingCancellationRequest } from '../../../models/realTraining';
import { useSnackbar } from '../../../../../hooks/useSnackBar';
import { formatDateTime } from '../../../../../utils/dateHelpers';

interface RealTrainingModalProps {
  open: boolean;
  onClose: () => void;
  trainingId: number | null;
}

const RealTrainingModal: React.FC<RealTrainingModalProps> = ({ open, onClose, trainingId }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { displaySnackbar } = useSnackbar();

  // Мутации
  const [cancelStudentFromTraining, { isLoading: isCancellingStudent }] = useCancelStudentFromTrainingMutation();
  const [cancelRealTraining, { isLoading: isCancellingReal }] = useCancelRealTrainingMutation();
  const [addStudentToTraining, { isLoading: isAddingStudent }] = useAddStudentToRealTrainingMutation();

  
  const { data: realTrainingData, isLoading: isLoadingReal } = useGetRealTrainingByIdQuery(
    trainingId || 0, 
    { skip: !trainingId }
  );
  const { data: allStudents } = useGetStudentsQuery();
  
  const isLoading = isLoadingReal;

  // Состояния
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  
  // Состояние для диалога отмены
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [studentToCancel, setStudentToCancel] = useState<{ id: number; name: string } | null>(null);
  const [cancellationData, setCancellationData] = useState({
      reason: '',
      notification_time: dayjs().format('YYYY-MM-DDTHH:mm'),
  });

  // Состояние для диалога добавления студента
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState<any>(null);
  const [isTrial, setIsTrial] = useState(false);

  // Состояние для отображения информации о зарплате тренера
  const [salaryResult, setSalaryResult] = useState<StudentCancellationResponse['trainer_salary_result'] | null>(null);
  const [showSalaryDetails, setShowSalaryDetails] = useState(false);

  const isCancellingTraining = isCancellingReal;

  const isStudentCancelled = (status?: string) => {
    return status === 'CANCELLED_SAFE' || status === 'CANCELLED_PENALTY';
  };

  // Helper functions for capacity management
  const getActiveStudents = () => {
    if (!realTrainingData?.students) return [];
    return realTrainingData.students.filter(s => !isStudentCancelled(s.status));
  };

  const getCancelledStudents = () => {
    if (!realTrainingData?.students) return [];
    return realTrainingData.students.filter(s => isStudentCancelled(s.status));
  };

  const getCapacityInfo = () => {
    const activeCount = getActiveStudents().length;
    const maxParticipants = realTrainingData?.training_type?.max_participants || null;
    
    return {
      current: activeCount,
      max: maxParticipants,
      hasLimit: maxParticipants !== null,
      isFull: maxParticipants ? activeCount >= maxParticipants : false,
      available: maxParticipants ? maxParticipants - activeCount : null
    };
  };

  // Get students that can be added (not already in this training and active)
  const getAvailableStudents = () => {
    if (!allStudents || !realTrainingData) return [];
    
    const currentStudentIds = new Set(realTrainingData.students.map(s => s.student_id));
    
    return allStudents.filter(student => 
      student.is_active && !currentStudentIds.has(student.id)
    );
  };

  useEffect(() => {
    if (realTrainingData) {
      // Removed unused baseData variable
      
      // Removed unused duplicateFormData logic
    }
  }, [realTrainingData]);

  // Handlers
  const handleOpenCancelDialog = (studentId: number, studentName: string) => {
    setStudentToCancel({ id: studentId, name: studentName });
    setCancellationData({
        reason: '',
        notification_time: dayjs().format('YYYY-MM-DDTHH:mm'),
    });
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setStudentToCancel(null);
    setCancellationData({ reason: '', notification_time: dayjs().format('YYYY-MM-DDTHH:mm') });
  };

  const handleConfirmCancellation = async () => {
    if (!studentToCancel || !realTrainingData) return;
    
    try {
        const request: StudentCancellationRequest = {
            reason: cancellationData.reason,
            notification_time: dayjs(cancellationData.notification_time).toISOString()
        };
        
        const response = await cancelStudentFromTraining({
            training_id: realTrainingData.id,
            student_id: studentToCancel.id,
            data: request
        }).unwrap();

        // Store salary result for display
        setSalaryResult(response.trainer_salary_result);
        
        dispatch(calendarApiV2.util.invalidateTags([{ type: 'RealTrainingV2', id: realTrainingData.id }]));
        
        // Show different messages based on trainer salary result
        const salaryMessage = response.trainer_salary_result.expense_created 
          ? ` (Тренеру начислена зарплата: ${response.trainer_salary_result.salary_amount} ₽)`
          : ` (${response.trainer_salary_result.salary_decision.reason})`;
        
        displaySnackbar(`Отмена для ${studentToCancel.name} обработана${salaryMessage}`, 'success');
        
        // Show detailed salary information if needed
        if (response.trainer_salary_result.salary_decision.should_receive_salary || 
            response.trainer_salary_result.expense_created) {
          setShowSalaryDetails(true);
        }
        
        handleCloseCancelDialog();
    } catch (err) {
        console.error('[RealTrainingModal] Failed to cancel student:', err);
        displaySnackbar('Ошибка при отмене записи', 'error');
    }
  };

  // Add student handlers
  const handleAddStudent = async () => {
    if (!selectedStudentToAdd || !realTrainingData) return;
    
    try {
      await addStudentToTraining({
        training_id: realTrainingData.id,
        student_id: selectedStudentToAdd.id,
        is_trial: isTrial
      }).unwrap();
      
      dispatch(calendarApiV2.util.invalidateTags([{ type: 'RealTrainingV2', id: realTrainingData.id }]));
      displaySnackbar(`Ученик ${selectedStudentToAdd.first_name} ${selectedStudentToAdd.last_name} добавлен на тренировку`, 'success');
      
      // Close dialog and reset selection
      setAddStudentDialogOpen(false);
      setSelectedStudentToAdd(null);
    } catch (err: any) {
      console.error('[RealTrainingModal] Failed to add student:', err);
      displaySnackbar(
        err?.data?.detail || 'Ошибка при добавлении ученика', 
        'error'
      );
    }
  };

  const handleCancelTraining = async () => {
    if (!realTrainingData || !cancelReason.trim()) return;
    
    try {
      const cancellationData: TrainingCancellationRequest = {
        reason: cancelReason.trim(),
        process_refunds: true
      };
      
      await cancelRealTraining({ 
        trainingId: realTrainingData.id, 
        cancellationData 
      }).unwrap();
      
      dispatch(calendarApiV2.util.invalidateTags(['RealTrainingV2']));
      displaySnackbar('Тренировка отменена', 'success');
      onClose();
    } catch (err) {
      console.error('[RealTrainingModal] Failed to cancel training:', err);
      displaySnackbar('Ошибка при отмене тренировки', 'error');
    } finally {
      setShowCancelConfirmation(false);
      setCancelReason('');
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
        return <Typography>Загрузка данных об учениках...</Typography>;
    }
      
    const studentsToDisplay = realTrainingData.students || [];
    
    // Отладочная информация
    console.log('[RealTrainingModal] Students data:', studentsToDisplay);
    studentsToDisplay.forEach((student, index) => {
      if (student.student) {
        console.log(`[RealTrainingModal] Student ${index}:`, {
          id: student.id,
          name: `${student.student.first_name} ${student.student.last_name}`,
          status: student.status,
          statusType: typeof student.status
        });
      }
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
            if (!s_real.student) return null;
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
                    {s_real.student ? `${s_real.student.first_name || ''} ${s_real.student.last_name || ''}`.trim() : 'Имя не найдено'}
                    {s_real.is_trial && <Chip label="Пробное" size="small" color="success" sx={{ ml: 1 }} />}
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
                  onClick={() => s_real.student && handleOpenCancelDialog(s_real.student.id, `${s_real.student.first_name} ${s_real.student.last_name}`)}
                  disabled={isCancellingStudent && studentToCancel?.id === s_real.student?.id}
                >
                  {isCancellingStudent && studentToCancel?.id === s_real.student?.id ? <CircularProgress size={20} /> : 'Отменить'}
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
              {realTrainingData.training_type?.name || 'Тренировка'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
              {`Тренировка • ${dayjs(realTrainingData.training_date).format('D MMMM YYYY')} в ${realTrainingData.start_time.substring(0,5)}`}
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
                    const capacity = getCapacityInfo();
                    const cancelledCount = getCancelledStudents().length;
                    
                    let statusText = `${capacity.current}`;
                    if (capacity.hasLimit) {
                      statusText += `/${capacity.max}`;
                    }
                    statusText += ' записано';
                    
                    if (cancelledCount > 0) {
                      statusText += `, ${cancelledCount} отменено`;
                    }
                    
                    return statusText;
                  })()}
                </Typography>
              </Box>
            </Box>
            
            {/* Add Student Button */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => setAddStudentDialogOpen(true)}
              disabled={getCapacityInfo().isFull}
              sx={{ 
                borderColor: borderColor,
                color: borderColor,
                '&:hover': {
                  borderColor: borderColor,
                  backgroundColor: alpha(borderColor, 0.1)
                }
              }}
            >
              Добавить
            </Button>
          </Box>
          <Box sx={{ p: 2.5 }}>{renderStudentList()}</Box>
        </Box>
      </DialogContent>
      <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, borderTop: `2px solid ${alpha(borderColor, 0.3)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={() => setShowCancelConfirmation(true)} variant="contained" color="warning" sx={{background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${alpha(theme.palette.warning.main, 0.8)} 100%)`}}>
            {isCancellingTraining ? <CircularProgress size={20} /> : 'Отменить тренировку'}
          </Button>
        </Box>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: alpha(borderColor, 0.4), color: borderColor }}>Закрыть</Button>
      </Box>
    </Dialog>

    <Dialog open={showCancelConfirmation} onClose={() => setShowCancelConfirmation(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Отмена тренировки</DialogTitle>
        <DialogContent>
            <Typography sx={{ mb: 2 }}>
                Отмена тренировки приведет к автоматическому возврату занятий ученикам и отмене связанных счетов.
            </Typography>
            <TextField
                fullWidth
                label="Причина отмены"
                multiline
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Укажите причину отмены тренировки..."
                required
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setShowCancelConfirmation(false)}>Отмена</Button>
            <Button 
                onClick={handleCancelTraining} 
                color="warning" 
                variant="contained"
                disabled={!cancelReason.trim() || isCancellingTraining}
            >
                {isCancellingTraining ? <CircularProgress size={24} /> : 'Отменить тренировку'}
            </Button>
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

    {/* Salary Details Dialog */}
    <Dialog open={showSalaryDetails} onClose={() => setShowSalaryDetails(false)} maxWidth="md" fullWidth>
      <DialogTitle>Информация о зарплате тренера</DialogTitle>
      <DialogContent>
        {salaryResult && (
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Результат обработки отмены ученика
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Время отмены: {formatDateTime(salaryResult.cancellation_time)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Время тренировки: {formatDateTime(salaryResult.training_datetime)}
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Решение по зарплате:
                </Typography>
                <Typography 
                  variant="body1" 
                  color={salaryResult.salary_decision.should_receive_salary ? 'success.main' : 'text.primary'}
                >
                  {salaryResult.salary_decision.should_receive_salary ? 'Да' : 'Нет'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Часов до тренировки:
                </Typography>
                <Typography variant="body1">
                  {salaryResult.salary_decision.hours_before_training.toFixed(1)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Причина:
                </Typography>
                <Typography variant="body1">
                  {salaryResult.salary_decision.reason}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Оставшиеся ученики:
                </Typography>
                <Typography variant="body1">
                  {salaryResult.salary_decision.remaining_students_count}
                </Typography>
              </Grid>
              
              {salaryResult.expense_created && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Создан расход:
                    </Typography>
                    <Typography variant="body1" color="success.main">
                      Да (ID: {salaryResult.expense_id})
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Alert severity="success" sx={{ mt: 1 }}>
                      Тренеру начислена зарплата: {salaryResult.salary_amount} ₽
                    </Alert>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowSalaryDetails(false)}>Закрыть</Button>
      </DialogActions>
    </Dialog>

    {/* Add Student Dialog */}
    <Dialog 
      open={addStudentDialogOpen} 
      onClose={() => setAddStudentDialogOpen(false)} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: 3, 
          backgroundColor: theme.palette.background.paper, 
          boxShadow: `0 25px 80px ${alpha(theme.palette.common.black, 0.3)}`, 
          border: `1px solid ${alpha(borderColor, 0.3)}`, 
          overflow: 'hidden',
          minHeight: '500px'
        } 
      }} 
      BackdropProps={{ 
        sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } 
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.8)} 100%)`, 
        color: '#ffffff', 
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
          background: `radial-gradient(circle at 20% 80%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%)` 
        } 
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              Добавить ученика
            </Typography>
            {realTrainingData && (
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                {realTrainingData.training_type?.name} • {dayjs(realTrainingData.training_date).format('D MMMM YYYY')} в {realTrainingData.start_time.substring(0,5)}
              </Typography>
            )}
          </Box>
          <IconButton 
            onClick={() => setAddStudentDialogOpen(false)} 
            sx={{ 
              color: '#ffffff', 
              backgroundColor: alpha('#ffffff', 0.1), 
              backdropFilter: 'blur(10px)', 
              '&:hover': { 
                backgroundColor: alpha('#ffffff', 0.2), 
                transform: 'scale(1.1)' 
              }, 
              transition: 'all 0.2s ease' 
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: theme.palette.background.default }}>
        {/* Capacity Info Card */}
        {realTrainingData && (
          <Box sx={{ 
            p: 3, 
            borderBottom: `1px solid ${alpha(borderColor, 0.2)}`,
            background: `linear-gradient(135deg, ${alpha(borderColor, 0.05)} 0%, transparent 100%)`
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 2.5, 
              borderRadius: 2, 
              backgroundColor: theme.palette.background.paper, 
              border: `2px solid ${alpha(borderColor, 0.3)}`, 
              boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}` 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  background: `linear-gradient(135deg, ${borderColor} 0%, ${alpha(borderColor, 0.8)} 100%)`, 
                  mr: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <GroupIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: borderColor, mb: 0.5 }}>
                    Вместимость тренировки
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    {(() => {
                      const capacity = getCapacityInfo();
                      if (capacity.hasLimit) {
                        return `${capacity.current} / ${capacity.max}`;
                      } else {
                        return `${capacity.current}`;
                      }
                    })()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getCapacityInfo().hasLimit ? 'мест занято' : 'записано (без ограничений)'}
                  </Typography>
                </Box>
              </Box>
              
              {getCapacityInfo().available !== null && getCapacityInfo().available! > 0 && (
                <Chip
                  label={`${getCapacityInfo().available} свободно`}
                  color="success"
                  variant="filled"
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    height: 32,
                  }}
                />
              )}
              
              {getCapacityInfo().isFull && (
                <Chip
                  label="Заполнено"
                  color="error"
                  variant="filled"
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    height: 32,
                  }}
                />
              )}
            </Box>
            
            {getCapacityInfo().isFull && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mt: 2, 
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                  backgroundColor: alpha(theme.palette.warning.main, 0.1)
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Тренировка заполнена. Нельзя добавить больше учеников.
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {/* Student Selection */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
            Выберите ученика для добавления
          </Typography>
          
          <Autocomplete
            options={getAvailableStudents()}
            getOptionLabel={(student) => `${student.first_name} ${student.last_name}`}
            value={selectedStudentToAdd}
            onChange={(_, newValue) => setSelectedStudentToAdd(newValue)}
            disabled={getCapacityInfo().isFull}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Ученик"
                placeholder="Начните вводить имя ученика..."
                fullWidth
                variant="outlined"
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
            renderOption={(props, student) => (
              <Box 
                component="li" 
                {...props} 
                sx={{ 
                  p: 2,
                  '&:hover': {
                    backgroundColor: alpha(borderColor, 0.1)
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
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
                    <PersonIcon sx={{ color: '#ffffff', fontSize: '1.2rem' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {student.first_name} {student.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Дата рождения: {dayjs(student.date_of_birth).format('DD.MM.YYYY')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            noOptionsText={
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: '3rem', color: alpha(theme.palette.text.primary, 0.3), mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  {getAvailableStudents().length === 0 
                    ? "Нет доступных учеников для добавления" 
                    : "Ученик не найден"}
                </Typography>
              </Box>
            }
            sx={{
              '& .MuiAutocomplete-listbox': {
                padding: 1,
              },
              '& .MuiAutocomplete-option': {
                borderRadius: 1,
                margin: '2px 0',
              }
            }}
          />

          <FormControlLabel
            control={<Checkbox checked={isTrial} onChange={(e) => setIsTrial(e.target.checked)} />}
            label="Пробное занятие"
          />
          
          {selectedStudentToAdd && (
            <Box sx={{ 
              mt: 3, 
              p: 2.5, 
              borderRadius: 2, 
              backgroundColor: alpha(theme.palette.success.main, 0.1), 
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
              transition: 'all 0.3s ease'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%', 
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.8)} 100%)`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mr: 2 
                }}>
                  <PersonIcon sx={{ color: '#ffffff', fontSize: '1.4rem' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.dark }}>
                    {selectedStudentToAdd.first_name} {selectedStudentToAdd.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Готов к добавлению на тренировку
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        backgroundColor: theme.palette.background.default, 
        borderTop: `2px solid ${alpha(borderColor, 0.3)}`, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Button 
          onClick={() => setAddStudentDialogOpen(false)} 
          disabled={isAddingStudent}
          variant="outlined"
          sx={{ 
            borderColor: alpha(borderColor, 0.4), 
            color: borderColor,
            borderRadius: 2,
            px: 3,
            py: 1,
            '&:hover': {
              borderColor: borderColor,
              backgroundColor: alpha(borderColor, 0.1)
            }
          }}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleAddStudent} 
          variant="contained" 
          disabled={!selectedStudentToAdd || isAddingStudent || getCapacityInfo().isFull}
          startIcon={isAddingStudent ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
              transform: 'translateY(-2px)',
              boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
            '&:disabled': {
              background: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
              transform: 'none',
              boxShadow: 'none'
            },
            transition: 'all 0.2s ease'
          }}
        >
          {isAddingStudent ? 'Добавляю ученика...' : 'Добавить ученика'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default RealTrainingModal; 