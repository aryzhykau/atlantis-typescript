import { useMemo } from 'react';
import { Box, Typography, useTheme, Paper } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import TrainingChip from './TrainingChip';

interface Props {
  currentDate: Dayjs;
  events: any[];
  onOpenDay?: (date: Dayjs) => void;
}

export default function MobileWeekCalendar({ currentDate, events, onOpenDay }: Props) {
  const theme = useTheme();

  const days = useMemo(() => {
    const start = currentDate.startOf('isoWeek');
    return Array.from({ length: 7 }).map((_, i) => start.add(i, 'day'));
  }, [currentDate]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    (days || []).forEach(d => {
      map[d.format('YYYY-MM-DD')] = [];
    });

    (events || []).forEach(ev => {
      // training templates use day_number (1 = Monday ... 7 = Sunday)
      if (ev) {
        const rawDay = ev.day_number ?? ev.dayNumber ?? ev.day;
        if (rawDay !== undefined && rawDay !== null) {
          const dn = Number(rawDay);
          if (!Number.isNaN(dn) && dn >= 1 && dn <= 7) {
            const dayIndex = dn - 1; // map to days array index
            const dayKey = days[dayIndex]?.format('YYYY-MM-DD');
            if (dayKey) {
              if (!map[dayKey]) map[dayKey] = [];
              map[dayKey].push(ev);
              return;
            }
          }
        }
      }

    // Real trainings may use 'training_date' or 'training_datetime' fields
    const rawDate = ev.training_date ?? ev.training_datetime ?? ev.date ?? ev.start_date ?? ev.day ?? ev.datetime ?? ev.day_key;
    const key = dayjs(rawDate).format('YYYY-MM-DD');
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });

    return map;
  }, [events, days]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {days.map(d => {
        const key = d.format('YYYY-MM-DD');
        const dayEvents = (eventsByDay[key] || []).slice().sort((a, b) => (a.start_time || a.time || '').localeCompare(b.start_time || b.time || ''));
        const visible = dayEvents.slice(0, 3);
        const more = Math.max(0, dayEvents.length - visible.length);
        const isToday = d.isSame(dayjs(), 'day');

        return (
          <Paper
            key={key}
            elevation={isToday ? 6 : 2}
            sx={{
              borderRadius: 4,
              p: 2,
              background: isToday
                ? `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.background.paper} 100%)`
                : theme.palette.background.paper,
              border: `1px solid ${isToday ? theme.palette.primary.main : theme.palette.divider}`,
              boxShadow: isToday ? `0 8px 30px ${theme.palette.primary.main}20` : undefined,
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => onOpenDay?.(d)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{d.format('dddd')}</Typography>
                <Typography variant="caption" color="text.secondary">{d.format('D MMM')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="button" sx={{ fontSize: '0.75rem', color: 'primary.main', fontWeight: 700 }}>
                  Открыть
                </Typography>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isToday ? 'primary.main' : 'transparent', border: isToday ? 'none' : `1px solid ${theme.palette.divider}` }} />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {visible.length === 0 && (
                <Typography variant="caption" color="text.secondary">Нет событий</Typography>
              )}

              {visible.map((ev, i) => (
                <TrainingChip key={i} training={ev} time={ev.start_time || ev.time || ev.training_time} />
              ))}

              {more > 0 && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>+{more} ещё</Typography>
              )}
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
