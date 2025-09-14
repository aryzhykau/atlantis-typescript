import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  useTheme,
  Divider,
  CircularProgress,
  SwipeableDrawer,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  AccessTime as TimeIcon,
  Close as CloseIcon,
  Check as CheckIcon 
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';

interface TransferBottomSheetProps {
  event: NormalizedEvent | null;
  open: boolean;
  onSave: (event: NormalizedEvent, transferData: any) => void;
  onClose: () => void;
  isLoading?: boolean;
}

/**
 * TransferBottomSheet - Separate bottom sheet for transferring events
 * Handles both templates (day of week) and real trainings (actual date)
 */
const TransferBottomSheet: React.FC<TransferBottomSheetProps> = ({
  event,
  open,
  onSave,
  onClose,
  isLoading = false,
}) => {
  const theme = useTheme();
  
  // For real trainings
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  // For templates
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number | ''>('');
  // Common time selection
  const [selectedHour, setSelectedHour] = useState<number | ''>(9);
  
  const isTemplate = event?.isTemplate ?? false;
  
  // Update local state when event changes
  React.useEffect(() => {
    if (event) {
      setSelectedHour(event.start.hour());
      if (isTemplate) {
        // For templates, use day of week (0 = Sunday, 1 = Monday, etc.)
        setSelectedDayOfWeek(event.start.day());
      } else {
        // For real trainings, use actual date
        setSelectedDate(dayjs(event.start));
      }
    }
  }, [event, isTemplate]);
  
  const handleSave = useCallback(() => {
    if (!event) return;
    
    const transferData: any = {
      hour: selectedHour
    };
    
    if (isTemplate) {
      // For templates, send day of week
      if (selectedDayOfWeek === '') return;
      transferData.dayOfWeek = selectedDayOfWeek;
    } else {
      // For real trainings, send actual date
      if (!selectedDate) return;
      transferData.date = selectedDate.format('YYYY-MM-DD');
    }
    
    onSave(event, transferData);
  }, [event, selectedDate, selectedDayOfWeek, selectedHour, isTemplate, onSave]);

  const hasChanges = event && (
    selectedHour !== event.start.hour() ||
    (isTemplate ? selectedDayOfWeek !== event.start.day() : selectedDate && !selectedDate.isSame(event.start, 'day'))
  );

  const dayOfWeekNames = [
    'Воскресенье',
    'Понедельник', 
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота'
  ];

  if (!event) return null;

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen={true}
      disableBackdropTransition={true}
      hideBackdrop={true}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        sx: {
          borderRadius: '16px 16px 0 0',
          maxHeight: '70vh',
          backgroundColor: theme.palette.background.paper,
          zIndex: 1600, // Above main event sheet (1500)
        },
      }}
    >
      <Box sx={{ 
        padding: 3,
        paddingBottom: 0,
        paddingTop: 2
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary 
            }}
          >
            {isTemplate ? 'Перенести шаблон' : 'Перенести тренировку'}
          </Typography>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Event Info */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: theme.palette.grey[50],
          borderRadius: 2,
          mb: 3
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            {event.training_type?.name || event.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimeIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
            <Typography variant="body2" color="text.secondary">
              {event.start.format('HH:mm')} - {event.end.format('HH:mm')}
            </Typography>
          </Box>
        </Box>

        {/* Date/Day Selection */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ mb: 3 }}>
            {isTemplate ? (
              <FormControl fullWidth>
                <InputLabel>День недели</InputLabel>
                <Select
                  value={selectedDayOfWeek}
                  onChange={(e) => setSelectedDayOfWeek(e.target.value as number)}
                  label="День недели"
                >
                  {dayOfWeekNames.map((dayName, index) => (
                    <MenuItem key={index} value={index}>
                      {dayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <DatePicker
                label="Дата"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                sx={{ width: '100%' }}
              />
            )}
          </Box>

          {/* Time Selection */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Время</InputLabel>
              <Select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value as number)}
                label="Время"
              >
                {Array.from({ length: 18 }, (_, i) => i + 6).map((hour) => (
                  <MenuItem key={hour} value={hour}>
                    {String(hour).padStart(2, '0')}:00
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </LocalizationProvider>

        <Divider sx={{ my: 2 }} />

        {/* Actions */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'flex-end',
          pb: 3
        }}>
          <Button 
            variant="outlined" 
            onClick={onClose}
            disabled={isLoading}
            sx={{ minWidth: 100 }}
          >
            Отмена
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={!hasChanges || isLoading || (isTemplate ? selectedDayOfWeek === '' : !selectedDate)}
            startIcon={isLoading ? <CircularProgress size={16} /> : <CheckIcon />}
            sx={{ minWidth: 100 }}
          >
            {isLoading ? 'Сохранение...' : 'Перенести'}
          </Button>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

export default TransferBottomSheet;
