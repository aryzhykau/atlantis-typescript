import React from 'react';
import {
  SwipeableDrawer,
  Box,
  Typography,
  useTheme,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  FitnessCenter as FitnessCenterIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useSnackbar } from '../../../../../hooks/useSnackBar';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';

interface TrainerEventBottomSheetProps {
  open: boolean;
  event: NormalizedEvent | null;
  onClose: () => void;
  onMarkStudentAbsent?: (studentTrainingId: string) => Promise<void>;
}

const TrainerEventBottomSheet: React.FC<TrainerEventBottomSheetProps> = ({
  open,
  event,
  onClose,
  onMarkStudentAbsent,
}) => {
  const theme = useTheme();
  const [markingId, setMarkingId] = React.useState<string | null>(null);
  // Robust cancelled detection aligned with RealTrainingView
  // This hook must run on every render (even when `event` is null) to keep hook order stable
  const isCancelled = React.useMemo(() => {
    const raw: any = (event && event.raw) || event || {};
    const status = (raw?.status || '').toString().toLowerCase();
    return (
      status === 'cancelled_by_coach' ||
      status === 'cancelled_by_admin' ||
      status === 'cancelled' ||
      Boolean(raw?.cancelled_at) ||
      Boolean(raw?.cancelled) ||
      Boolean(raw?.is_cancelled) ||
      Boolean(raw?.raw?.cancelled_at)
    );
  }, [event]);

  // Provide snackbar for user feedback (must be called unconditionally)
  const { displaySnackbar } = useSnackbar();

  if (!event) return null;

  const typeColor = event.training_type?.color || theme.palette.primary.main;
  const trainingTypeName = event.training_type?.name || 'Тренировка';
  
  // Trainer info
  const trainer = event.trainer || event.raw?.responsible_trainer;
  const trainerName = trainer 
    ? `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || 'Тренер'
    : 'Тренер';
  const trainerInitials = trainer
    ? `${trainer.first_name?.[0] || ''}${trainer.last_name?.[0] || ''}`.toUpperCase()
    : 'T';

  // Training timing
  const startTime = event.start.format('HH:mm');
  const endTime = event.end.format('HH:mm');
  const trainingDate = event.start.format('DD MMMM YYYY');
  
  // Check if training is in the past
  const isPastTraining = event.start.isBefore(dayjs(), 'minute');

  // Get students from the event and split active/cancelled consistently
  const students = event.raw?.students || [];
  const activeStudents = (students || []).filter((s: any) => {
    const st = (s?.status || '').toString().toUpperCase();
    return st === 'REGISTERED' || st === 'PRESENT' || st === 'ABSENT';
  });

  // Get attendance status color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PRESENT': return theme.palette.success.main;
      case 'ABSENT': return theme.palette.error.main;
      case 'REGISTERED': return theme.palette.info.main;
      case 'CANCELLED': return theme.palette.grey[500];
      default: return theme.palette.grey[500];
    }
  };

  // Get attendance status label
  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PRESENT': return 'Присутствует';
      case 'ABSENT': return 'Отсутствует';
      case 'REGISTERED': return 'Записан';
      case 'CANCELLED': return 'Отменён';
      default: return status;
    }
  };

  // Check if student can be marked absent
  const canMarkAbsent = (status: string) => {
    const st = (status || '').toString().toUpperCase();
    return !isPastTraining && !isCancelled && (st === 'REGISTERED' || st === 'PRESENT');
  };

  const handleMarkAbsent = async (studentTraining: any) => {
    if (!onMarkStudentAbsent) return;
    if (isCancelled) {
      displaySnackbar('Нельзя отмечать посещаемость для отменённой тренировки', 'error');
      return;
    }
    if (canMarkAbsent(studentTraining.status)) {
      const attendanceId = studentTraining.id || studentTraining.real_training_id;
      if (!attendanceId) {
        console.error('Error: No valid attendance ID found in studentTraining', studentTraining);
        return;
      }
      try {
        setMarkingId(attendanceId.toString());
        console.log('Calling onMarkStudentAbsent with ID:', attendanceId);
        await onMarkStudentAbsent(attendanceId.toString());
      } catch (error) {
        console.error('Error marking student absent:', error);
      }
      finally {
        setMarkingId(null);
      }
    }
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}} // Required for SwipeableDrawer
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '90vh',
          minHeight: '50vh',
        },
      }}
    >
      <Box sx={{ p: 3, pb: 4 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${typeColor}, ${typeColor}80)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {trainingTypeName}
          </Typography>
          <IconButton 
            onClick={onClose} 
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': { 
                backgroundColor: theme.palette.action.hover 
              } 
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Training Info */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          borderRadius: 2, 
          backgroundColor: theme.palette.background.default, 
          mb: 3 
        }}>
          <Avatar sx={{ 
            bgcolor: typeColor, 
            width: 48, 
            height: 48, 
            fontSize: '1.1rem', 
            fontWeight: 600 
          }}>
            {trainerInitials}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600, 
              color: theme.palette.text.primary 
            }}>
              {trainerName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <AccessTimeIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {startTime} - {endTime}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                • {trainingDate}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Status Messages */}
  {isCancelled && (
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: theme.palette.error.light + '20',
            border: `1px solid ${theme.palette.error.light}`,
            mb: 3 
          }}>
            <Typography variant="body2" sx={{ 
              color: theme.palette.error.dark,
              fontWeight: 500 
            }}>
              Тренировка отменена
            </Typography>
          </Box>
        )}

  {isPastTraining && !isCancelled && (
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: theme.palette.grey[100],
            border: `1px solid ${theme.palette.grey[300]}`,
            mb: 3 
          }}>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 500 
            }}>
              Прошедшая тренировка
            </Typography>
          </Box>
        )}

        {/* Students List */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Ученики ({activeStudents.length})
        </Typography>

        {activeStudents.length > 0 ? (
          <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
            {activeStudents.map((studentTraining: any, index: number) => {
              const student = studentTraining.student;
              const status = studentTraining.status;
              const canMarkAbsentForThis = canMarkAbsent(status);
              const attendanceId = studentTraining.id || studentTraining.real_training_id || `idx-${index}`;
              
              return (
                <React.Fragment key={attendanceId}>
                  <ListItem sx={{ py: 1.5 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                        width: 40,
                        height: 40
                      }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {student?.first_name} {student?.last_name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={getStatusLabel(status)}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(status) + '20',
                              color: getStatusColor(status),
                              fontWeight: 500,
                              fontSize: '0.75rem',
                            }}
                          />
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    
                    <ListItemSecondaryAction>
                      {canMarkAbsentForThis && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleMarkAbsent(studentTraining)}
                          disabled={markingId === String(attendanceId)}
                          sx={{
                            fontWeight: 500,
                            borderRadius: 2,
                            px: 2,
                            py: 0.5,
                            minWidth: 'unset',
                            textTransform: 'none',
                          }}
                        >
                          {markingId === String(attendanceId) ? (
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={16} color="inherit" />
                              <span>Отмечаю...</span>
                            </Box>
                          ) : (
                            'Отметить отсутствие'
                          )}
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {index < activeStudents.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4, 
            color: theme.palette.text.secondary 
          }}>
            <FitnessCenterIcon sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
              Нет записанных учеников
            </Typography>
            <Typography variant="body2">
              На эту тренировку никто не записан
            </Typography>
          </Box>
        )}
      </Box>
    </SwipeableDrawer>
  );
};

export default TrainerEventBottomSheet;
