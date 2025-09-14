import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  useTheme,
  Divider,
  Alert,
  CircularProgress,
  SwipeableDrawer,
  IconButton,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Avatar
} from '@mui/material';
import { 
  Edit as EditIcon,
  Close as CloseIcon,
  Check as CheckIcon 
} from '@mui/icons-material';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';
import { useGetTrainersQuery } from '../../../../../store/apis/trainersApi';
import { useGetTrainingTypesQuery } from '../../../../../store/apis/trainingTypesApi';

interface EditBottomSheetProps {
  event: NormalizedEvent | null;
  open: boolean;
  onSave: (event: NormalizedEvent, updates: any) => void;
  onClose: () => void;
  isLoading?: boolean;
}

/**
 * EditBottomSheet - Separate bottom sheet for editing events
 * Single responsibility: Event editing in a dedicated bottom sheet above main sheet
 */
const EditBottomSheet: React.FC<EditBottomSheetProps> = ({
  event,
  open,
  onSave,
  onClose,
  isLoading = false,
}) => {
  const theme = useTheme();
  
  const [timeHour, setTimeHour] = useState<number | ''>(9);
  const [trainerId, setTrainerId] = useState<number | ''>('');
  const [trainingTypeId, setTrainingTypeId] = useState<number | ''>('');

  // Fetch data for autocompletes
  const { data: trainersResp } = useGetTrainersQuery();
  const trainers = trainersResp?.trainers || [];
  const { data: trainingTypes } = useGetTrainingTypesQuery({ skip: 0, limit: 200 });
  
  // Update local state when event changes
  useEffect(() => {
    if (event) {
      setTimeHour(event.start.hour());
      const tId = event.trainer?.id ?? event.raw?.responsible_trainer?.id ?? '';
      setTrainerId(tId as any);
      const ttId = event.training_type?.id ?? event.raw?.training_type?.id ?? '';
      setTrainingTypeId(ttId as any);
    }
  }, [event]);

  const handleSave = useCallback(() => {
    if (!event) return;
    
    const hh = timeHour ?? event.start.hour();
    const mm = 0;
    const newStart = event.start.set('hour', Number(hh)).set('minute', Number(mm));
    const updatedRaw = { 
      ...(event.raw || {}), 
      start_time: `${String(hh).padStart(2, '0')}:00`
    };
    
    if (trainerId) updatedRaw.responsible_trainer_id = trainerId;
    if (trainingTypeId) updatedRaw.training_type_id = trainingTypeId;

    const updates = {
      start: newStart,
      end: newStart.add(event.durationMins, 'minute'),
      raw: updatedRaw,
    };
    
    onSave(event, updates);
  }, [event, timeHour, trainerId, trainingTypeId, onSave]);

  const hasChanges = event && (
    timeHour !== event.start.hour() ||
    trainerId !== (event.trainer?.id ?? event.raw?.responsible_trainer?.id ?? '') ||
    trainingTypeId !== (event.training_type?.id ?? event.raw?.training_type?.id ?? '')
  );

  if (!event) return null;

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          zIndex: 1600, // Higher than main bottom sheet (1500)
          background: theme.palette.background.paper,
          boxShadow: '0px -12px 30px rgba(15,23,42,0.35)',
          backdropFilter: 'blur(12px)',
          maxHeight: '80vh',
        },
      }}
      ModalProps={{
        keepMounted: false,
      }}
    >
      {/* Handle bar for visual feedback */}
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
              backgroundColor: theme.palette.primary.main + '15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <EditIcon sx={{ color: theme.palette.primary.main, fontSize: '1.5rem' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                mb: 0.5,
              }}>
                Редактировать тренировку
              </Typography>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
              }}>
                Измените детали тренировки
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
          }}>
            {event.title}
          </Typography>
        </Box>

        {/* Form Fields */}
        <Stack spacing={3}>
          {/* Hour-only selector (minutes are always :00) */}
          <FormControl fullWidth size="medium">
            <InputLabel id="hour-select-label">Время</InputLabel>
            <Select
              labelId="hour-select-label"
              label="Время"
              value={timeHour}
              onChange={(e) => setTimeHour(e.target.value as number)}
              sx={{ 
                bgcolor: theme.palette.background.default, 
                borderRadius: 2 
              }}
            >
              {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                <MenuItem key={h} value={h}>
                  {h.toString().padStart(2, '0')}:00
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            options={trainers}
            getOptionLabel={(option: any) => `${option.first_name || ''} ${option.last_name || ''}`.trim() || '—'}
            value={trainers.find(t => t.id === trainerId) || null}
            onChange={(_, v) => setTrainerId(v ? v.id : '')}
            renderOption={(props, option: any) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ 
                  width: 36, 
                  height: 36, 
                  fontSize: '0.95rem',
                  bgcolor: theme.palette.primary.main
                }}>
                  {(option.first_name || '?').charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {option.first_name} {option.last_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Тренер
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Ответственный тренер" 
                size="medium" 
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    bgcolor: theme.palette.background.default, 
                    borderRadius: 2 
                  }
                }} 
              />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
          />

          <Autocomplete
            options={trainingTypes || []}
            getOptionLabel={(option: any) => option.name || '—'}
            value={(trainingTypes || []).find((tt: any) => tt.id === trainingTypeId) || null}
            onChange={(_, v) => setTrainingTypeId(v ? v.id : '')}
            renderOption={(props, option: any) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: option.color || theme.palette.primary.main 
                }} />
                <Typography variant="body2">{option.name}</Typography>
              </Box>
            )}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Тип тренировки" 
                size="medium" 
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    bgcolor: theme.palette.background.default, 
                    borderRadius: 2 
                  }
                }} 
              />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
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
            Изменения будут применены к выбранной тренировке
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
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                flex: 1,
              }}
            >
              Отмена
            </Button>
            <Button 
              variant="contained"
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
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
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                flex: 1,
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: theme.palette.getContrastText(theme.palette.primary.main),
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  backgroundColor: theme.palette.action.disabledBackground,
                  backgroundImage: 'none',
                }
              }}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </SwipeableDrawer>
  );
};

export default EditBottomSheet;
