import React, { useEffect, useState } from 'react';
import {
  SwipeableDrawer,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  useTheme,
  Divider,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { NormalizedEvent } from '../../../utils/normalizeEventsForWeek';

interface TransferEventBottomSheetProps {
  open: boolean;
  event: NormalizedEvent | null;
  onClose: () => void;
  onMove: (updatedEvent: NormalizedEvent) => void;
  moving?: boolean;
}

const WEEKDAYS = [
  { id: 1, label: 'Пн' },
  { id: 2, label: 'Вт' },
  { id: 3, label: 'Ср' },
  { id: 4, label: 'Чт' },
  { id: 5, label: 'Пт' },
  { id: 6, label: 'Сб' },
  { id: 7, label: 'Вс' },
];

const TransferEventBottomSheet: React.FC<TransferEventBottomSheetProps> = ({ open, event, onClose, onMove, moving = false }) => {
  const theme = useTheme();
  const [hour, setHour] = useState<number | ''>(9);
  const [dayNumber, setDayNumber] = useState<number | ''>('');
  const [trainingDate, setTrainingDate] = useState<string>('');

  useEffect(() => {
    if (event) {
      setHour(event.start.hour());
      setDayNumber(event.raw?.day_number ?? event.raw?.dayNumber ?? '');
      setTrainingDate(event.raw?.training_date ?? event.raw?.trainingDate ?? '');
    }
  }, [event]);

  const handleSave = () => {
    if (!event) return;
    const hh = hour ?? event.start.hour();
    const mm = 0;
    const newStart = event.start.set('hour', Number(hh)).set('minute', Number(mm));

    const updatedRaw: any = { ...(event.raw || {}) };
    if (event.isTemplate) {
      if (dayNumber) updatedRaw.day_number = dayNumber;
      updatedRaw.start_time = `${String(hh).padStart(2, '0')}:00`;
    } else {
      if (trainingDate) updatedRaw.training_date = trainingDate;
      updatedRaw.start_time = `${String(hh).padStart(2, '0')}:00`;
    }

    const updated: NormalizedEvent = {
      ...event,
      start: newStart,
      end: newStart.add(event.durationMins, 'minute'),
      raw: updatedRaw,
    } as NormalizedEvent;

    onMove(updated);
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
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          p: 3,
          zIndex: 1402,
          background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          boxShadow: '0px -14px 36px rgba(15,23,42,0.16)',
          backdropFilter: 'blur(6px)',
        },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>
        <Box sx={{ width: 64, height: 6, background: theme.palette.primary.light, borderRadius: 4, mx: 'auto', mb: 2, opacity: 0.95 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Перенести</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: theme.palette.text.secondary }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2, opacity: 0.6 }} />

        <Stack spacing={2}>
          {event?.isTemplate ? (
            <FormControl fullWidth size="small">
              <InputLabel id="move-day-label">День недели</InputLabel>
              <Select labelId="move-day-label" value={dayNumber} label="День недели" onChange={(e) => setDayNumber(Number(e.target.value))} sx={{ bgcolor: theme.palette.background.default, borderRadius: 2, px: 1 }}>
                {WEEKDAYS.map(w => (
                  <MenuItem key={w.id} value={w.id}>{w.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              label="Дата"
              type="date"
              size="small"
              fullWidth
              value={trainingDate}
              onChange={(e) => setTrainingDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: theme.palette.background.default, borderRadius: 2 }}
            />
          )}

          <FormControl fullWidth size="small">
            <InputLabel id="move-hour-label">Час</InputLabel>
            <Select labelId="move-hour-label" value={hour} label="Час" onChange={(e) => setHour(Number(e.target.value))} sx={{ bgcolor: theme.palette.background.default, borderRadius: 2, px: 1 }}>
              {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                <MenuItem key={h} value={h}>{h.toString().padStart(2, '0')}:00</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={moving}
              startIcon={moving ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{
                flex: 1,
                borderRadius: 2,
                height: 48,
                textTransform: 'none',
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: theme.palette.getContrastText(theme.palette.primary.main),
                boxShadow: '0 10px 28px rgba(16,24,40,0.12)',
                fontWeight: 700,
              }}
            >
              {moving ? 'Перенос...' : 'Перенести'}
            </Button>
            <Button variant="outlined" onClick={onClose} disabled={moving} sx={{ flex: 1, borderRadius: 2, height: 48, textTransform: 'none', borderColor: theme.palette.divider }}>
              Отмена
            </Button>
          </Box>
        </Stack>
      </Box>
    </SwipeableDrawer>
  );
};

export default TransferEventBottomSheet;
