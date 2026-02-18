import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  SwipeableDrawer,
  TextField,
  Button,
  Alert,
  useTheme,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import { StudentCancellationRequest } from '../../../models/realTraining';
import { useCancelStudentFromTrainingMutation } from '../../../../../store/apis/calendarApi-v2';
import { useSnackbar } from '../../../../../hooks/useSnackBar';
import { BottomSheetHandle, getBottomSheetPaperSx } from './bottomSheetStyles';

interface CancelStudentBottomSheetProps {
  open: boolean;
  student: any;
  training: NormalizedEvent;
  onClose: () => void;
}

/**
 * CancelStudentBottomSheet - Handle student cancellation from real training
 * Unlike templates where students are deleted, real training students are cancelled
 */
const CancelStudentBottomSheet: React.FC<CancelStudentBottomSheetProps> = ({
  open,
  student,
  training,
  onClose,
}) => {
  const theme = useTheme();
  const { displaySnackbar } = useSnackbar();
  
  const [cancelStudentFromTraining, { isLoading }] = useCancelStudentFromTrainingMutation();
  
  const [cancellationData, setCancellationData] = useState({
    reason: '',
    notification_time: dayjs().format('YYYY-MM-DDTHH:mm'),
  });

  const handleCancel = useCallback(async () => {
    if (!student || !training) return;
    
    try {
      const request: StudentCancellationRequest = {
        reason: cancellationData.reason,
        notification_time: dayjs(cancellationData.notification_time).toISOString()
      };
      
      const response = await cancelStudentFromTraining({
        training_id: training.id,
        student_id: student.student_id || student.student?.id,
        data: request
      }).unwrap();
      
      // Show different messages based on trainer salary result
      const salaryMessage = response.trainer_salary_result?.expense_created 
        ? ` (Тренеру начислена зарплата: ${response.trainer_salary_result.salary_amount} ₽)`
        : response.trainer_salary_result?.salary_decision?.reason 
        ? ` (${response.trainer_salary_result.salary_decision.reason})`
        : '';
      
      displaySnackbar(`Отмена для ${student.student?.first_name || 'ученика'} обработана${salaryMessage}`, 'success');
      onClose();
    } catch (err: any) {
      console.error('[CancelStudentBottomSheet] Failed to cancel student:', err);
      displaySnackbar(
        err?.data?.detail || 'Ошибка при отмене записи', 
        'error'
      );
    }
  }, [student, training, cancellationData, cancelStudentFromTraining, displaySnackbar, onClose]);

  const handleClose = useCallback(() => {
    // Reset form
    setCancellationData({
      reason: '',
      notification_time: dayjs().format('YYYY-MM-DDTHH:mm'),
    });
    onClose();
  }, [onClose]);

  if (!student || !training) return null;

  const studentName = student.student?.first_name && student.student?.last_name 
    ? `${student.student.first_name} ${student.student.last_name}`
    : 'Ученик';

  const studentInitials = student.student?.first_name && student.student?.last_name
    ? `${student.student.first_name.charAt(0)}${student.student.last_name.charAt(0)}`.toUpperCase()
    : '?';

  const typeColor = training.training_type?.color || theme.palette.primary.main;

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={handleClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: getBottomSheetPaperSx(theme, {
          zIndex: 1500,
          maxHeight: '85vh',
        }),
      }}
    >
      <BottomSheetHandle />

      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
              Отмена записи
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Отменить запись ученика на тренировку
            </Typography>
          </Box>

          <IconButton 
            onClick={handleClose} 
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

        {/* Student Info */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 2, 
          borderRadius: 2, 
          backgroundColor: theme.palette.background.default,
          border: `1px solid ${theme.palette.divider}`,
          mb: 3 
        }}>
          <Avatar sx={{ 
            bgcolor: typeColor, 
            width: 48, 
            height: 48, 
            fontSize: '1.1rem', 
            fontWeight: 600 
          }}>
            {studentInitials}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              {studentName}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {training.title} • {training.raw?.training_date && dayjs(training.raw.training_date).format('D MMMM YYYY')}
            </Typography>
          </Box>
          <PersonRemoveIcon sx={{ color: theme.palette.warning.main, fontSize: '1.5rem' }} />
        </Box>

        {/* Warning about cancellation timing */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Время отмены:</strong> Если отмена происходит менее чем за 12 часов до тренировки, 
            будет применен штраф. Тренер получит зарплату в зависимости от времени отмены и количества оставшихся учеников.
          </Typography>
        </Alert>

        {/* Form */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Время уведомления об отмене"
            type="datetime-local"
            value={cancellationData.notification_time}
            onChange={(e) => setCancellationData({ ...cancellationData, notification_time: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: theme.palette.background.default,
              }
            }}
          />
          
          <TextField
            label="Причина отмены"
            multiline
            rows={3}
            value={cancellationData.reason}
            onChange={(e) => setCancellationData({ ...cancellationData, reason: e.target.value })}
            fullWidth
            placeholder="Укажите причину отмены записи..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: theme.palette.background.default,
              }
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mt: 4,
          '& > button': {
            minHeight: 48,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }
        }}>
          <Button 
            variant="outlined" 
            onClick={handleClose}
            disabled={isLoading}
            sx={{ 
              flex: 1,
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              '&:hover': {
                borderColor: theme.palette.text.secondary,
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            Отмена
          </Button>
          
          <Button
            variant="contained"
            onClick={handleCancel}
            disabled={isLoading || !cancellationData.reason.trim()}
            color="warning"
            startIcon={isLoading ? null : <PersonRemoveIcon />}
            sx={{ 
              flex: 1,
              backgroundColor: theme.palette.warning.main,
              '&:hover': {
                backgroundColor: theme.palette.warning.dark,
              }
            }}
          >
            {isLoading ? 'Отменяем...' : 'Отменить запись'}
          </Button>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

export default CancelStudentBottomSheet;
