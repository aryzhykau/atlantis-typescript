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
  Cancel as CancelIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import { TrainingCancellationRequest } from '../../../models/realTraining';
import { useCancelRealTrainingMutation } from '../../../../../store/apis/calendarApi-v2';
import { useSnackbar } from '../../../../../hooks/useSnackBar';

interface CancelTrainingBottomSheetProps {
  open: boolean;
  training: NormalizedEvent;
  onClose: () => void;
  onCancel?: (event: NormalizedEvent) => void;
}

/**
 * CancelTrainingBottomSheet - Handle full training cancellation (admin only)
 */
const CancelTrainingBottomSheet: React.FC<CancelTrainingBottomSheetProps> = ({
  open,
  training,
  onClose,
  onCancel,
}) => {
  const theme = useTheme();
  const { displaySnackbar } = useSnackbar();
  
  const [cancelRealTraining, { isLoading }] = useCancelRealTrainingMutation();
  
  const [cancelReason, setCancelReason] = useState('');

  const handleCancelTraining = useCallback(async () => {
    if (!training || !cancelReason.trim()) return;
    
    try {
      const cancellationData: TrainingCancellationRequest = {
        reason: cancelReason.trim(),
        process_refunds: true
      };
      
      await cancelRealTraining({ 
        trainingId: training.id, 
        cancellationData 
      }).unwrap();
      
      displaySnackbar('Тренировка отменена', 'success');
      onCancel?.(training);
      handleClose();
    } catch (err: any) {
      console.error('[CancelTrainingBottomSheet] Failed to cancel training:', err);
      displaySnackbar(
        err?.data?.detail || 'Ошибка при отмене тренировки', 
        'error'
      );
    }
  }, [training, cancelReason, cancelRealTraining, displaySnackbar, onCancel]);

  const handleClose = useCallback(() => {
    setCancelReason('');
    onClose();
  }, [onClose]);

  if (!training) return null;

  const typeColor = training.training_type?.color || theme.palette.primary.main;
  const studentCount = training.raw?.students?.filter((s: any) => 
    s.status !== 'CANCELLED_SAFE' && s.status !== 'CANCELLED_PENALTY'
  ).length || 0;

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={handleClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          zIndex: 1500,
          background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          boxShadow: '0px -12px 30px rgba(15,23,42,0.18)',
          backdropFilter: 'blur(8px)',
          maxHeight: '85vh',
        },
      }}
    >
      {/* Handle bar */}
      <Box sx={{ 
        width: 48, 
        height: 4, 
        background: theme.palette.divider, 
        borderRadius: 2, 
        mx: 'auto', 
        mt: 2, 
        mb: 1,
        opacity: 0.6,
      }} />

      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.warning.main, mb: 1 }}>
              Отмена тренировки
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Это действие нельзя отменить
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

        {/* Training Info */}
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
            <CancelIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              {training.title}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {training.raw?.training_date && dayjs(training.raw.training_date).format('D MMMM YYYY')} в {training.raw?.start_time?.substring(0,5)}
              {studentCount > 0 && ` • ${studentCount} ${studentCount === 1 ? 'ученик' : 'учеников'}`}
            </Typography>
          </Box>
        </Box>

        {/* Warning */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Внимание:</strong> Отмена тренировки приведет к автоматическому возврату занятий ученикам 
            и отмене связанных счетов. Все записанные ученики будут уведомлены об отмене.
          </Typography>
        </Alert>

        {/* Students affected info */}
        {studentCount > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Будет затронуто учеников: <strong>{studentCount}</strong>
            </Typography>
          </Alert>
        )}

        {/* Reason Input */}
        <TextField
          fullWidth
          label="Причина отмены"
          multiline
          rows={3}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Укажите причину отмены тренировки..."
          required
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: theme.palette.background.default,
            }
          }}
        />

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
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
            onClick={handleCancelTraining}
            disabled={isLoading || !cancelReason.trim()}
            color="warning"
            startIcon={isLoading ? null : <CancelIcon />}
            sx={{ 
              flex: 1,
              backgroundColor: theme.palette.warning.main,
              '&:hover': {
                backgroundColor: theme.palette.warning.dark,
              }
            }}
          >
            {isLoading ? 'Отменяем тренировку...' : 'Отменить тренировку'}
          </Button>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

export default CancelTrainingBottomSheet;
