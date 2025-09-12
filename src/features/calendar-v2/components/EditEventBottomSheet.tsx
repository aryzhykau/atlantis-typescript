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
}

const EditEventBottomSheet: React.FC<EditEventBottomSheetProps> = ({ open, event, onClose, onSave }) => {
  const theme = useTheme();
  const [timeValue, setTimeValue] = useState('09:00');
  const [trainerId, setTrainerId] = useState<number | ''>('');
  const [trainingTypeId, setTrainingTypeId] = useState<number | ''>('');

  const { data: trainersResp } = useGetTrainersQuery();
  const trainers = trainersResp?.trainers || [];
  const { data: trainingTypes } = useGetTrainingTypesQuery({ skip: 0, limit: 200 });

  useEffect(() => {
    if (event) {
      setTimeValue(event.start.format('HH:mm'));
      const tId = event.trainer?.id ?? event.raw?.responsible_trainer?.id ?? '';
      setTrainerId(tId as any);
      const ttId = event.training_type?.id ?? event.raw?.training_type?.id ?? '';
      setTrainingTypeId(ttId as any);
    }
  }, [event]);

  const handleSave = () => {
    if (!event) return;
    const [hh, mm] = timeValue.split(':');
    const newStart = event.start.set('hour', Number(hh)).set('minute', Number(mm));
    const updatedRaw = { ...(event.raw || {}), start_time: `${hh}:${mm}` };
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
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 2,
          zIndex: 1401,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>
        {/* Drag handle */}
        <Box sx={{ width: 44, height: 4, backgroundColor: theme.palette.divider, borderRadius: 2, mx: 'auto', mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Редактирование</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: theme.palette.text.secondary }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <TextField
            label="Время"
            type="time"
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
            sx={{ bgcolor: theme.palette.background.default, borderRadius: 1 }}
          />

          <Autocomplete
            options={trainers}
            getOptionLabel={(option: any) => `${option.first_name || ''} ${option.last_name || ''}`.trim() || '—'}
            value={trainers.find(t => t.id === trainerId) || null}
            onChange={(_, v) => setTrainerId(v ? v.id : '')}
            renderOption={(props, option: any) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32 }}>{(option.first_name || '?').charAt(0)}</Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.first_name} {option.last_name}</Typography>
                  <Typography variant="caption" color="text.secondary">Тренер</Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => <TextField {...params} label="Тренер" size="small" />}
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
            renderInput={(params) => <TextField {...params} label="Тип тренировки" size="small" />}
            isOptionEqualToValue={(o, v) => o.id === v.id}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={handleSave} sx={{ flex: 1, borderRadius: 2, height: 44, textTransform: 'none' }}>
              Сохранить
            </Button>
            <Button variant="outlined" onClick={onClose} sx={{ flex: 1, borderRadius: 2, height: 44, textTransform: 'none' }}>
              Отмена
            </Button>
          </Box>
        </Stack>
      </Box>
    </SwipeableDrawer>
  );
};

export default EditEventBottomSheet;
