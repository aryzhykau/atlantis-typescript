import React, { useMemo } from 'react';
import { Box, Typography, Paper, Grid, useTheme } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { CalendarViewMode } from './CalendarV2Page'; // Предполагается, что типы там же
import { TrainingTemplate } from '../models/trainingTemplate';
import { RealTraining } from '../models/realTraining';
import TrainingCard from './TrainingCard'; // Импортируем TrainingCard

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
function isTrainingTemplate(event: CalendarEvent): event is TrainingTemplate {
  return 'day_of_week' in event && typeof event.day_of_week === 'number';
}

// Функция для определения, является ли событие RealTraining
function isRealTraining(event: CalendarEvent): event is RealTraining {
  return 'start_datetime' in event && typeof event.start_datetime === 'string';
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

    if (viewMode === 'scheduleTemplate') {
      const currentTemplates = (templatesData || []) as TrainingTemplate[];
      return currentTemplates.filter(event => {
        // @ts-ignore // Временно игнорируем ошибку типа
        const templateDayIso = event.day_of_week + 1;
        // @ts-ignore // Временно игнорируем ошибку типа
        const eventStartTime = event.start_time.substring(0, 5);
        return templateDayIso === day.isoWeekday() && eventStartTime === time;
      });
    } else if (viewMode === 'actualTrainings') {
      const currentRealTrainings = (actualData || []) as RealTraining[];
      return currentRealTrainings.filter(event => {
        // @ts-ignore // Временно игнорируем ошибку типа
        const eventStart = dayjs(event.start_datetime);
        return eventStart.isSame(day, 'day') && 
               eventStart.hour() === slotHour && 
               eventStart.minute() === slotMinute;
      });
    }
    return [];
  };

  const handleSlotClick = (day: Dayjs, time: string, eventsInSlot: CalendarEvent[]) => {
    console.log(`Slot clicked: Day - ${day.format('YYYY-MM-DD')}, Time - ${time}`);
    if (eventsInSlot.length > 0) {
      console.log('Events in this slot:', eventsInSlot);
      // TODO: Open Popover with TrainingCards
    } else {
      console.log('This slot is empty.');
      // TODO: Open Modal for creating new event (depends on viewMode)
    }
  };

  const slotGap = theme.spacing(0.10); // Было 0.5, уменьшаем в два раза

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2, overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Календарь
      </Typography>
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
              const slotEvents: CalendarEvent[] = []; 
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
                  {/* {slotEvents.map((eventItem, index) => ( // Пока комментируем
                    <TrainingCard key={eventItem.id || index} event={eventItem} />
                  ))} */}
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>

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