import React, { useMemo, useState } from 'react';
import { Box, Typography, Paper, Grid, useTheme } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { CalendarViewMode } from './CalendarV2Page'; // Предполагается, что типы там же
import { TrainingTemplate } from '../models/trainingTemplate';
import { RealTraining } from '../models/realTraining';
import TrainingCard from './TrainingCard'; // Импортируем TrainingCard
import TrainingTemplateForm from './TrainingTemplateForm'; // Импорт формы

// Определим объединенный тип для тренировок для удобства
export type CalendarEvent = TrainingTemplate | RealTraining;

interface CalendarShellProps {
  currentDate: Dayjs;
  viewMode: CalendarViewMode;
  templatesData?: TrainingTemplate[];
  actualData?: RealTraining[];
  isLoading: boolean;
  error?: any; // Можно уточнить тип ошибки, если он известен
}

// Функция для определения, является ли событие TrainingTemplate
export function isTrainingTemplate(event: CalendarEvent): event is TrainingTemplate {
  return 'day_number' in event && typeof event.day_number === 'number';
}

// Функция для определения, является ли событие RealTraining
export function isRealTraining(event: CalendarEvent): event is RealTraining {
  return 'training_date' in event && typeof event.training_date === 'string';
}

interface SelectedSlotInfo {
  date: Dayjs;
  time: string;
}

const CalendarShell: React.FC<CalendarShellProps> = ({
  currentDate,
  viewMode,
  templatesData,
  actualData,
  isLoading,
  error,
}) => {
  const theme = useTheme(); // Получаем доступ к теме
  const daysOfWeek = useMemo(() => {
    const startOfWeek = currentDate.startOf('isoWeek');
    return Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'));
  }, [currentDate]);

  const timeSlots = useMemo(() => {
    const slots = [];
    // Временная шкала с 06:00 до 22:00 (последний слот 22:00-23:00)
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(dayjs().hour(hour).minute(0).format('HH:mm'));
    }
    return slots;
  }, []);

  // Выбираем актуальные данные в зависимости от viewMode
  const eventsToDisplay: CalendarEvent[] = useMemo(() => {
    if (viewMode === 'scheduleTemplate') {
      return templatesData || [];
    }
    return actualData || [];
  }, [viewMode, templatesData, actualData]);

  // TODO: Исправить типизацию и раскомментировать фильтрацию и отображение событий
  const getEventsForSlot = (day: Dayjs, time: string): CalendarEvent[] => {
    const slotHour = parseInt(time.split(':')[0]);
    const slotMinute = parseInt(time.split(':')[1]);

    let filteredEvents: CalendarEvent[] = [];

    if (viewMode === 'scheduleTemplate') {
      filteredEvents = eventsToDisplay.filter(event => {
        if (isTrainingTemplate(event)) {
          // day_number: 1-7 (1 - Пн), day.isoWeekday(): 1-7 (1 - Пн)
          const eventStartTime = event.start_time.substring(0, 5); // "HH:MM"
          return event.day_number === day.isoWeekday() && eventStartTime === time;
        }
        return false;
      });
    } else if (viewMode === 'actualTrainings') {
      filteredEvents = eventsToDisplay.filter(event => {
        if (isRealTraining(event)) {
          const eventStart = dayjs(`${event.training_date}T${event.start_time}`);
          return eventStart.isSame(day, 'day') &&
                 eventStart.hour() === slotHour &&
                 eventStart.minute() === slotMinute;
        }
        return false;
      });
    }
    return filteredEvents;
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<SelectedSlotInfo | null>(null);

  const handleSlotClick = (day: Dayjs, time: string, eventsInSlot: CalendarEvent[]) => {
    if (viewMode === 'scheduleTemplate' && eventsInSlot.length === 0) {
      setSelectedSlotInfo({ date: day, time });
      setIsFormOpen(true);
    } else if (eventsInSlot.length > 0) {
      console.log(`Slot clicked: Day - ${day.format('YYYY-MM-DD')}, Time - ${time}`);
      console.log('Events in this slot:', eventsInSlot);
      // TODO: Open Popover with TrainingCards
    } else {
      console.log(`Slot clicked: Day - ${day.format('YYYY-MM-DD')}, Time - ${time}`);
      console.log('This slot is empty (not in template mode or not empty for template mode).');
      // TODO: Open Modal for creating new REAL event (depends on viewMode)
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSlotInfo(null);
  };

  const slotGap = theme.spacing(0.10); // Было 0.5, уменьшаем в два раза

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2, overflow: 'auto' }}>
      {/* <Typography>Current Date: {currentDate.format('YYYY-MM-DD')}</Typography>
      <Typography>View Mode: {viewMode}</Typography> */}
      {isLoading && <Typography>Загрузка данных...</Typography>}
      {error && <Typography color="error">Ошибка: {error?.message || JSON.stringify(error)}</Typography>}
      
      {/* Контейнер для всей сетки, включая заголовки дней и временные слоты */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: slotGap }}>
        {/* Заголовок с днями недели */}
        <Grid container spacing={0} sx={{ columnGap: slotGap }}>
          <Grid item xs={1} sx={{ textAlign: 'center', p: 1 }}> 
            <Typography variant="caption">Время</Typography>
          </Grid>
          {daysOfWeek.map(day => (
            <Grid item xs key={day.toString()} sx={{ textAlign: 'center', p: 1, backgroundColor: theme.palette.background.paper /* Было grey[200] */ }}>
              <Typography variant="subtitle2">{day.format('dd').toUpperCase()}</Typography>
              <Typography variant="h6">{day.format('D')}</Typography>
            </Grid>
          ))}
        </Grid>

        {/* Основная сетка: временные слоты и ячейки для каждого дня */}
        {timeSlots.map(time => (
          <Grid container spacing={0} key={time} sx={{ columnGap: slotGap, alignItems: 'stretch' }}>
            <Grid item xs={1} sx={{ p: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Typography variant="caption">{time}</Typography>
            </Grid>
            {daysOfWeek.map(day => {
              const slotEvents: CalendarEvent[] = getEventsForSlot(day, time); 
              return (
                <Grid 
                  item 
                  xs 
                  key={`${day.toString()}-${time}`}
                  sx={{
                    minHeight: '60px',
                    backgroundColor: theme.palette.background.paper, // Фон для слотов как у Paper
                    // borderRadius: theme.shape.borderRadius / 2, // Убираем скругление
                    p: 0.5,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    cursor: 'pointer',
                    transition: theme.transitions.create(['background-color', 'box-shadow'], {
                      duration: theme.transitions.duration.short,
                    }),
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.light, // Мягкий цвет при наведении
                      boxShadow: `0 0 0 1px ${theme.palette.secondary.main}`,
                    }
                  }}
                  onClick={() => handleSlotClick(day, time, slotEvents)}
                >
                  {slotEvents.map((eventItem) => (
                    <TrainingCard key={eventItem.id} event={eventItem} />
                  ))}
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>

      {selectedSlotInfo && (
        <TrainingTemplateForm 
          open={isFormOpen}
          onClose={handleCloseForm}
          selectedDate={selectedSlotInfo.date}
          selectedTime={selectedSlotInfo.time}
        />
      )}

      {/* Отображение загруженных данных (временно для отладки) */}
      {viewMode === 'scheduleTemplate' && templatesData && !isLoading && (
        <Box mt={2} sx={{display:'none'}}> {/* Скрываем, т.к. будут на сетке */}
          <Typography variant="subtitle1">Template Data:</Typography>
          <Typography>Загружено {templatesData.length} шаблонов.</Typography>
        </Box>
      )}
      {viewMode === 'actualTrainings' && actualData && !isLoading && (
        <Box mt={2} sx={{display:'none'}}> {/* Скрываем, т.к. будут на сетке */}
          <Typography variant="subtitle1">Actual Trainings Data:</Typography>
          <Typography>Загружено {actualData.length} актуальных тренировок.</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CalendarShell; 