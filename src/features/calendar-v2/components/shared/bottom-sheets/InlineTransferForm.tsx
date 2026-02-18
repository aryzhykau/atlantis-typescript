import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  useTheme,
  Divider,
  Alert,
  CircularProgress,
  SwipeableDrawer,
  IconButton
} from '@mui/material';
import { 
  AccessTime as TimeIcon,
  Close as CloseIcon,
  Check as CheckIcon 
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import { BottomSheetHandle, getBottomSheetPaperSx } from './bottomSheetStyles';

interface TransferBottomSheetProps {
  event: NormalizedEvent | null;
  open: boolean;
  onSave: (event: NormalizedEvent, newDate: string, newTime: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

/**
 * TransferBottomSheet - Separate bottom sheet for transferring events
 * Single responsibility: Event transfer in a dedicated bottom sheet above main sheet
 */
const TransferBottomSheet: React.FC<TransferBottomSheetProps> = ({
  event,
  open,
  onSave,
  onClose,
  isLoading = false,
}) => {
  const theme = useTheme();
  
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  
  // Update local state when event changes
  React.useEffect(() => {
    if (event) {
      setSelectedDate(dayjs(event.start));
      setSelectedTime(dayjs(event.start));
    }
  }, [event]);
  
  const handleSave = useCallback(() => {
    if (!event || !selectedDate || !selectedTime) return;
    
    const newDate = selectedDate.format('YYYY-MM-DD');
    const newTime = selectedTime.format('HH:mm');
    
    onSave(event, newDate, newTime);
  }, [event, selectedDate, selectedTime, onSave]);

  const hasChanges = event && selectedDate && selectedTime && (
    !selectedDate.isSame(event.start, 'day') || 
    !selectedTime.isSame(event.start, 'hour') ||
    !selectedTime.isSame(event.start, 'minute')
  );

  if (!event) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        disableSwipeToOpen
        PaperProps={{
          sx: getBottomSheetPaperSx(theme, {
            zIndex: 1600, // Higher than main bottom sheet (1500)
            maxHeight: '80vh',
          }),
        }}
        ModalProps={{
          keepMounted: false,
        }}
      >
        {/* Handle bar for visual feedback */}
        <BottomSheetHandle />

        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                backgroundColor: theme.palette.secondary.main + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TimeIcon sx={{ color: theme.palette.secondary.main, fontSize: '1.5rem' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.text.primary,
                  mb: 0.5,
                }}>
                  Перенести тренировку
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem',
                }}>
                  Выберите новое время и дату
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': { 
                  backgroundColor: theme.palette.action.hover 
                },
                width: 44,
                height: 44,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Current Event Info */}
          <Box sx={{ 
            p: 2, 
            backgroundColor: theme.palette.action.hover,
            borderRadius: 2,
            mb: 3,
          }}>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary, 
              mb: 1,
              fontWeight: 500,
            }}>
              Текущая тренировка:
            </Typography>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600, 
              color: theme.palette.text.primary,
              mb: 1,
            }}>
              {event.title}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {dayjs(event.start).format('DD MMMM YYYY, HH:mm')} - {dayjs(event.end).format('HH:mm')}
            </Typography>
          </Box>

          {/* Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <DatePicker
              label="Новая дата"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  size: 'medium',
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }
                }
              }}
            />

            <TimePicker
              label="Новое время"
              value={selectedTime}
              onChange={(newValue) => setSelectedTime(newValue)}
              ampm={false}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  size: 'medium',
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }
                }
              }}
            />

            {/* Info Alert */}
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: '1.2rem',
                }
              }}
            >
              Проверьте, что новое время не конфликтует с другими тренировками
            </Alert>

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'flex-end',
              mt: 2,
            }}>
              <Button 
                variant="outlined"
                onClick={onClose}
                disabled={isLoading}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Отмена
              </Button>
              <Button 
                variant="contained"
                onClick={handleSave}
                disabled={!hasChanges || isLoading || !selectedDate || !selectedTime}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <CheckIcon />
                  )
                }
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                  color: theme.palette.getContrastText(theme.palette.secondary.main),
                  '&:hover': {
                    backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
                  },
                  '&:disabled': {
                    backgroundColor: theme.palette.action.disabledBackground,
                    backgroundImage: 'none',
                  }
                }}
              >
                {isLoading ? 'Перенос...' : 'Перенести тренировку'}
              </Button>
            </Box>
          </Box>
        </Box>
      </SwipeableDrawer>
    </LocalizationProvider>
  );
};

export default TransferBottomSheet;
