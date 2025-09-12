import React, { useState, useEffect } from 'react';
import {
  SwipeableDrawer,
  Box,
  Typography,
  Button,
  TextField,
  useTheme,
  IconButton,
  Stack,
  Avatar,
  Divider,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { NormalizedEvent } from '../utils/normalizeEventsForWeek';
import { useGetTrainersQuery } from '../../../store/apis/trainersApi';
import { useGetTrainingTypesQuery } from '../../../store/apis/trainingTypesApi';

interface EditEventBottomSheetProps {
  open: boolean;
  event: NormalizedEvent | null;
  onClose: () => void;
  onSave: (updatedEvent: NormalizedEvent) => void;
  saving?: boolean;
}

const EditEventBottomSheet: React.FC<EditEventBottomSheetProps> = ({ open, event, onClose, onSave, saving = false }) => {
  const theme = useTheme();
  const [timeHour, setTimeHour] = useState<number | ''>(9);
  const [trainerId, setTrainerId] = useState<number | ''>('');
  const [trainingTypeId, setTrainingTypeId] = useState<number | ''>('');

  const { data: trainersResp } = useGetTrainersQuery();
  const trainers = trainersResp?.trainers || [];
  const { data: trainingTypes } = useGetTrainingTypesQuery({ skip: 0, limit: 200 });

  useEffect(() => {
    if (event) {
      setTimeHour(event.start.hour());
      const tId = event.trainer?.id ?? event.raw?.responsible_trainer?.id ?? '';
      setTrainerId(tId as any);
      const ttId = event.training_type?.id ?? event.raw?.training_type?.id ?? '';
      setTrainingTypeId(ttId as any);
    }
  }, [event]);

  const handleSave = () => {
    if (!event) return;
  const hh = timeHour ?? event.start.hour();
  const mm = 0;
  const newStart = event.start.set('hour', Number(hh)).set('minute', Number(mm));
  const updatedRaw = { ...(event.raw || {}), start_time: `${String(hh).padStart(2, '0')}:00` };
    if (trainerId) updatedRaw.responsible_trainer_id = trainerId;
    if (trainingTypeId) updatedRaw.training_type_id = trainingTypeId;

    const updated: NormalizedEvent = {
      ...event,
      start: newStart,
      end: newStart.add(event.durationMins, 'minute'),
      raw: updatedRaw,
    } as NormalizedEvent;

    onSave(updated);
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          p: 3,
          zIndex: 1401,
          background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          boxShadow: '0px -12px 30px rgba(15,23,42,0.18)',
          backdropFilter: 'blur(6px)',
        },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>
        {/* Drag handle */}
        <Box sx={{ width: 56, height: 6, background: theme.palette.primary.light, borderRadius: 3, mx: 'auto', mb: 2, opacity: 0.95 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, letterSpacing: 0.2 }}>Редактирование</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: theme.palette.text.secondary, bgcolor: 'transparent' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2, opacity: 0.6 }} />

        <Stack spacing={2}>
          {/* Hour-only selector (minutes are always :00) */}
          <FormControl fullWidth size="small">
            <InputLabel id="hour-select-label">Час</InputLabel>
            <Select
              labelId="hour-select-label"
              label="Час"
              value={timeHour}
              onChange={(e) => setTimeHour(e.target.value as number)}
              sx={{ bgcolor: theme.palette.background.default, borderRadius: 2, px: 1 }}
            >
              {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                <MenuItem key={h} value={h}>{h.toString().padStart(2, '0')}:00</MenuItem>
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
                <Avatar sx={{ width: 36, height: 36, fontSize: '0.95rem' }}>{(option.first_name || '?').charAt(0)}</Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{option.first_name} {option.last_name}</Typography>
                  <Typography variant="caption" color="text.secondary">Тренер</Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => <TextField {...params} label="Тренер" size="small" sx={{ bgcolor: theme.palette.background.default, borderRadius: 2 }} />}
            isOptionEqualToValue={(o, v) => o.id === v.id}
          />

          <Autocomplete
            options={trainingTypes || []}
            getOptionLabel={(option: any) => option.name || '—'}
            value={(trainingTypes || []).find((tt: any) => tt.id === trainingTypeId) || null}
            onChange={(_, v) => setTrainingTypeId(v ? v.id : '')}
            renderOption={(props, option: any) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: option.color || theme.palette.primary.main }} />
                <Typography variant="body2">{option.name}</Typography>
              </Box>
            )}
            renderInput={(params) => <TextField {...params} label="Тип тренировки" size="small" sx={{ bgcolor: theme.palette.background.default, borderRadius: 2 }} />}
            isOptionEqualToValue={(o, v) => o.id === v.id}
          />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{
                flex: 1,
                borderRadius: 2,
                height: 52,
                textTransform: 'none',
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: theme.palette.getContrastText(theme.palette.primary.main),
                boxShadow: '0 8px 20px rgba(16,24,40,0.14)',
                fontWeight: 700,
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button variant="outlined" onClick={onClose} disabled={saving} sx={{ flex: 1, borderRadius: 2, height: 52, textTransform: 'none', borderColor: theme.palette.divider }}>
              Отмена
            </Button>
          </Box>
        </Stack>
      </Box>
    </SwipeableDrawer>
  );
};

export default EditEventBottomSheet;
