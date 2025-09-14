import React, { useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Avatar,
  useTheme,
  Button,
  Chip,
  Alert
} from '@mui/material';
import { 
  Close as CloseIcon,
  AccessTime as TimeIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  PersonOff as PersonOffIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import { TrainingAttendanceStatus } from '../../../models/realTraining';
// import CancelStudentBottomSheet from './CancelStudentBottomSheet';
// import AddStudentToRealTrainingBottomSheet from './AddStudentToRealTrainingBottomSheet';
// import CancelTrainingBottomSheet from './CancelTrainingBottomSheet';
// import EditBottomSheet from './EditBottomSheet';
// import TransferBottomSheet from './TransferBottomSheet';

interface RealTrainingViewProps {
  event: NormalizedEvent;
  onClose: () => void;
  onRequestMove?: (event: NormalizedEvent, transferData?: any) => void;
  onRequestEdit?: (event: NormalizedEvent) => void;
  onCancel?: (event: NormalizedEvent) => void;
  readOnlyForTrainer?: boolean;
  onMarkStudentAbsent?: (studentTrainingId: string) => Promise<void>;
}

/**
 * RealTrainingView - Component for displaying real training events
 * Handles cancellation instead of deletion, student management, and past training restrictions
 */
const RealTrainingView: React.FC<RealTrainingViewProps> = ({
  event,
  onClose,
  onRequestMove,
  onRequestEdit,
  onCancel,
  readOnlyForTrainer = false,
  onMarkStudentAbsent,
}) => {
  const theme = useTheme();

  // Form state - commented out for now
  // const [showEditForm, setShowEditForm] = useState(false);
  // const [showTransferForm, setShowTransferForm] = useState(false);
  // const [showCancelStudentForm, setShowCancelStudentForm] = useState(false);
  // const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  // const [showCancelTrainingForm, setShowCancelTrainingForm] = useState(false);
  // const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Check if training is in the past
  const isPastTraining = useMemo(() => {
    if (!event.raw?.training_date || !event.raw?.start_time) return false;
    
    const trainingDateTime = dayjs(`${event.raw.training_date} ${event.raw.start_time}`);
    return trainingDateTime.isBefore(dayjs());
  }, [event.raw?.training_date, event.raw?.start_time]);

  // Check if training is cancelled
  const isTrainingCancelled = useMemo(() => {
    return event.raw?.status === 'cancelled_by_coach' || event.raw?.status === 'cancelled_by_admin';
  }, [event.raw?.status]);

  // Get active and cancelled students
  const { activeStudents, cancelledStudents } = useMemo(() => {
    if (!event.raw?.students) return { activeStudents: [], cancelledStudents: [] };
    
    const active = event.raw.students.filter((s: any) => 
      s.status === 'REGISTERED' || s.status === 'PRESENT' || s.status === 'ABSENT'
    );
    const cancelled = event.raw.students.filter((s: any) => 
      s.status === 'CANCELLED_SAFE' || s.status === 'CANCELLED_PENALTY'
    );
    
    return { activeStudents: active, cancelledStudents: cancelled };
  }, [event.raw?.students]);

  const trainerName = event.trainer
    ? `${event.trainer.first_name || ''} ${event.trainer.last_name || ''}`.trim()
    : 'Не указан';

  const trainerInitials = event.trainer
    ? `${(event.trainer.first_name || '').charAt(0)}${(event.trainer.last_name || '').charAt(0)}`.toUpperCase()
    : '?';

  const typeColor = event.training_type?.color || theme.palette.primary.main;

  const formatTime = useCallback((time?: string) => {
    if (!time) return '';
    const parts = time.split(':');
    if (parts.length >= 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    return time;
  }, []);

  const handleEdit = useCallback(() => {
    if (isPastTraining || isTrainingCancelled) return;
    onRequestEdit?.(event);
  }, [isPastTraining, isTrainingCancelled, onRequestEdit, event]);

  const handleMove = useCallback(() => {
    if (isPastTraining || isTrainingCancelled) return;
    onRequestMove?.(event);
  }, [isPastTraining, isTrainingCancelled, onRequestMove, event]);

  const handleCancelStudent = useCallback((student: any) => {
    if (isPastTraining || isTrainingCancelled) return;
    // Will implement later with proper bottom sheet
    console.log('Cancel student:', student);
  }, [isPastTraining, isTrainingCancelled]);

  const handleAddStudent = useCallback(() => {
    if (isPastTraining || isTrainingCancelled) return;
    // Will implement later with proper bottom sheet
    console.log('Add student');
  }, [isPastTraining, isTrainingCancelled]);

  const handleCancelTraining = useCallback(() => {
    if (isPastTraining || isTrainingCancelled) return;
    // Will implement later with proper bottom sheet
    onCancel?.(event);
  }, [isPastTraining, isTrainingCancelled, onCancel, event]);

  const getStatusChip = (status: TrainingAttendanceStatus) => {
    const statusConfig: Record<string, { label: string; color: 'primary' | 'success' | 'error' | 'default' | 'warning' | 'secondary' }> = {
      'REGISTERED': { label: 'Записан', color: 'primary' },
      'PRESENT': { label: 'Присутствовал', color: 'success' },
      'ABSENT': { label: 'Отсутствовал', color: 'error' },
      'CANCELLED_SAFE': { label: 'Отменено', color: 'default' },
      'CANCELLED_PENALTY': { label: 'Отменено (штраф)', color: 'warning' },
      'WAITLIST': { label: 'Лист ожидания', color: 'secondary' },
      // Legacy statuses
      'PLANNED': { label: 'Запланировано', color: 'primary' },
      'ABSENT_RESPECTFUL': { label: 'Отсутствовал', color: 'default' },
      'ABSENT_LATE_CANCEL': { label: 'Поздняя отмена', color: 'warning' },
    };

    const config = statusConfig[status] || { label: status, color: 'default' as const };
    
    return (
      <Chip 
        label={config.label} 
        size="small" 
        color={config.color}
        variant="outlined"
        sx={{ fontSize: '0.7rem', height: 24 }}
      />
    );
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1, letterSpacing: 0.2 }}>
              {event.title}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {event.training_type && <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: typeColor }} />}
                {event.training_type && <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>{event.training_type.name}</Typography>}
                {event.training_type?.max_participants && (
                  <Chip label={`Макс: ${event.training_type.max_participants}`} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 22, ml: 1 }} />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
                <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                  {event.raw?.training_date && dayjs(event.raw.training_date).format('D MMMM YYYY')} в {formatTime(event.raw?.start_time)}
                </Typography>
              </Box>
            </Box>

            {/* Training Status Alerts */}
            {isPastTraining && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Эта тренировка уже прошла. Изменения недоступны.
              </Alert>
            )}
            
            {isTrainingCancelled && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Эта тренировка отменена.
              </Alert>
            )}
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

        {/* Active Students */}
        {activeStudents.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ 
                color: theme.palette.text.secondary, 
                textTransform: 'uppercase', 
                letterSpacing: 0.5, 
                fontSize: '0.75rem',
                fontWeight: 600,
              }}>
                Записанные ученики ({activeStudents.length})
              </Typography>
              
              {!isPastTraining && !isTrainingCancelled && !readOnlyForTrainer && (
                <Button
                  onClick={handleAddStudent}
                  startIcon={<PersonAddIcon fontSize="small" />}
                  variant="contained"
                  size="small"
                  sx={{ 
                    textTransform: 'none', 
                    height: 36,
                    borderRadius: 2,
                    fontWeight: 600,
                    minWidth: 'fit-content',
                    px: 2,
                  }}
                >
                  Добавить
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {activeStudents.map((studentTraining: any) => (
                <Box 
                  key={studentTraining.id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderColor: theme.palette.primary.main + '40',
                    }
                  }}
                >
                  <Avatar sx={{ 
                    width: 40, 
                    height: 40, 
                    fontSize: '0.9rem', 
                    backgroundColor: typeColor + '20', 
                    color: typeColor, 
                    fontWeight: 600,
                    border: `2px solid ${typeColor}30`,
                  }}>
                    {studentTraining.student?.first_name?.charAt(0) || '?'}
                    {studentTraining.student?.last_name?.charAt(0) || ''}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 600, 
                      color: theme.palette.text.primary,
                      mb: 0.5,
                    }}>
                      {studentTraining.student?.first_name || 'Имя'} {studentTraining.student?.last_name || 'Фамилия'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {getStatusChip(studentTraining.status)}
                      {studentTraining.requires_payment && (
                        <Chip 
                          label="Оплата" 
                          size="small" 
                          color="warning" 
                          variant="filled" 
                          sx={{ fontSize: '0.7rem', height: 24 }}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  {!isPastTraining && !isTrainingCancelled && !readOnlyForTrainer && studentTraining.status === 'REGISTERED' && (
                    <IconButton
                      size="small"
                      onClick={() => handleCancelStudent(studentTraining)}
                      sx={{ 
                        color: theme.palette.warning.main, 
                        backgroundColor: theme.palette.warning.main + '10',
                        width: 36,
                        height: 36,
                        '&:hover': { 
                          backgroundColor: theme.palette.warning.main + '20',
                        },
                      }}
                      aria-label="Отменить запись ученика"
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  )}

                  {readOnlyForTrainer && !isPastTraining && !isTrainingCancelled && 
                   (studentTraining.status === 'REGISTERED' || studentTraining.status === 'PRESENT') && (
                    <IconButton
                      size="small"
                      onClick={() => onMarkStudentAbsent?.(studentTraining.id)}
                      sx={{ 
                        color: theme.palette.error.main, 
                        backgroundColor: theme.palette.error.main + '10',
                        width: 36,
                        height: 36,
                        '&:hover': { 
                          backgroundColor: theme.palette.error.main + '20',
                        },
                      }}
                      aria-label="Отметить как пропуск"
                    >
                      <PersonOffIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Cancelled Students */}
        {cancelledStudents.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ 
              color: theme.palette.text.secondary, 
              textTransform: 'uppercase', 
              letterSpacing: 0.5, 
              fontSize: '0.75rem',
              fontWeight: 600,
              mb: 2,
            }}>
              Отмененные записи ({cancelledStudents.length})
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {cancelledStudents.map((studentTraining: any) => (
                <Box 
                  key={studentTraining.id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`,
                    opacity: 0.7,
                  }}
                >
                  <Avatar sx={{ 
                    width: 40, 
                    height: 40, 
                    fontSize: '0.9rem', 
                    backgroundColor: theme.palette.grey[200], 
                    color: theme.palette.grey[600], 
                    fontWeight: 600,
                  }}>
                    {studentTraining.student?.first_name?.charAt(0) || '?'}
                    {studentTraining.student?.last_name?.charAt(0) || ''}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 600, 
                      color: theme.palette.text.secondary,
                      mb: 0.5,
                    }}>
                      {studentTraining.student?.first_name || 'Имя'} {studentTraining.student?.last_name || 'Фамилия'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {getStatusChip(studentTraining.status)}
                      {studentTraining.cancellation_reason && (
                        <Typography variant="caption" sx={{ 
                          color: theme.palette.text.secondary, 
                          fontStyle: 'italic',
                          fontSize: '0.75rem',
                        }}>
                          {studentTraining.cancellation_reason}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* No Students Message */}
        {activeStudents.length === 0 && cancelledStudents.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, px: 2, color: theme.palette.text.secondary, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>Нет записанных учеников</Typography>
            <Typography variant="body2">На эту тренировку никто не записан</Typography>
          </Box>
        )}

        {/* Action Buttons */}
        {!readOnlyForTrainer && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2, 
            mt: 3,
            '& > button': {
              minHeight: 48,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }
          }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              disabled={isPastTraining || isTrainingCancelled}
              sx={{ 
                flex: 1,
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              Редактировать
            </Button>
            
            <Button
              variant="contained"
              startIcon={<TimeIcon />}
              onClick={handleMove}
              disabled={isPastTraining || isTrainingCancelled}
              sx={{
                flex: 1,
                backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                color: theme.palette.getContrastText(theme.palette.secondary.main),
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Перенести
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancelTraining}
              disabled={isPastTraining || isTrainingCancelled}
              color="warning"
              sx={{
                flex: 1,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: theme.palette.warning.main + '10',
                }
              }}
            >
              Отменить тренировку
            </Button>
          </Box>
        )}
      </Box>

      {/* Edit Bottom Sheet - Will be implemented later */}
      {/* <EditBottomSheet
        event={event}
        open={showEditForm}
        onSave={handleEditSave}
        onClose={handleEditCancel}
      /> */}

      {/* Transfer Bottom Sheet - Will be implemented later */}
      {/* <TransferBottomSheet
        event={event}
        open={showTransferForm}
        onSave={handleTransferSave}
        onClose={handleTransferCancel}
      /> */}

      {/* Cancel Student Bottom Sheet */}
      {/* <CancelStudentBottomSheet
        open={showCancelStudentForm}
        student={selectedStudent}
        training={event}
        onClose={handleStudentCancelClose}
      /> */}

      {/* Add Student Bottom Sheet */}
      {/* <AddStudentToRealTrainingBottomSheet
        open={showAddStudentForm}
        training={event}
        onClose={handleAddStudentClose}
      /> */}

      {/* Cancel Training Bottom Sheet */}
      {/* <CancelTrainingBottomSheet
        open={showCancelTrainingForm}
        training={event}
        onClose={handleTrainingCancelClose}
        onCancel={onCancel}
      /> */}
    </>
  );
};

export default RealTrainingView;
