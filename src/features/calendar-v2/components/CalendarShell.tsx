import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Box, Typography, Paper, Grid, useTheme } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { CalendarViewMode } from './CalendarV2Page'; // Предполагается, что типы там же
import { TrainingTemplate } from '../models/trainingTemplate';
import { RealTraining } from '../models/realTraining';
import TrainingCard from './TrainingCard'; // Импортируем TrainingCard
import TrainingTemplateForm from './TrainingTemplateForm'; // Импорт формы
import TrainingsStackPopover from './TrainingsStackPopover'; // Импортируем Popover

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

  const getEventsForSlot = useCallback((day: Dayjs, time: string): CalendarEvent[] => {
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
  }, [eventsToDisplay, viewMode]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<SelectedSlotInfo | null>(null);

  // Состояния для Popover
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);
  const [popoverEvents, setPopoverEvents] = useState<CalendarEvent[]>([]);
  const [popoverSelectedDate, setPopoverSelectedDate] = useState<Dayjs | null>(null);
  const [popoverSelectedTime, setPopoverSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (popoverSelectedDate && popoverSelectedTime) {
      const currentSlotEvents = getEventsForSlot(popoverSelectedDate, popoverSelectedTime);
      if (JSON.stringify(popoverEvents) !== JSON.stringify(currentSlotEvents)) {
        console.log('[CalendarShell] Base data or selected slot changed. Re-setting popoverEvents for slot:', popoverSelectedDate.format('YYYY-MM-DD'), popoverSelectedTime, currentSlotEvents);
        setPopoverEvents(currentSlotEvents);
      }
    } else {
      if (popoverEvents.length > 0) {
        console.log('[CalendarShell] No selected slot for popover. Clearing popoverEvents.');
        setPopoverEvents([]);
      }
    }
  }, [eventsToDisplay, popoverSelectedDate, popoverSelectedTime, getEventsForSlot, popoverEvents]);

  const handleSlotClick = (event: React.MouseEvent<HTMLElement>, day: Dayjs, time: string, eventsInSlot: CalendarEvent[]) => {
    console.log('[CalendarShell] handleSlotClick - eventsInSlot:', eventsInSlot);
    if (eventsInSlot.length > 0) {
      setPopoverAnchorEl(event.currentTarget);
      setPopoverSelectedDate(day);
      setPopoverSelectedTime(time);
      if (JSON.stringify(popoverEvents) !== JSON.stringify(eventsInSlot) || !popoverAnchorEl) {
        setPopoverEvents(eventsInSlot);
      }
    } else if (viewMode === 'scheduleTemplate' && eventsInSlot.length === 0) {
      setSelectedSlotInfo({ date: day, time });
      setIsFormOpen(true);
    } else {
      console.log(`Slot clicked: Day - ${day.format('YYYY-MM-DD')}, Time - ${time}`);
      console.log('This slot is empty (not in template mode or not empty for template mode).');
    }
  };

  const handleClosePopover = () => {
    setPopoverAnchorEl(null);
  };

  const handleOpenFormFromPopover = (date: Dayjs, time: string) => {
    setSelectedSlotInfo({ date, time });
    setIsFormOpen(true);
    handleClosePopover(); // Закрываем поповер после открытия формы
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSlotInfo(null);
  };

  const slotGap = theme.spacing(0.10); // Было 0.5, уменьшаем в два раза

  return (
    <Paper 
      elevation={3} 
      sx={{
        p: 2, 
        mt: 2, 
        overflow: 'auto', // Это уже здесь и включает вертикальную прокрутку, если контент превышает размеры
        maxHeight: '75vh', // Ограничиваем максимальную высоту, чтобы появилась прокрутка
        display: 'flex', // Добавляем flex, чтобы дочерний Box мог правильно растягиваться или сжиматься
        flexDirection: 'column' // Направление flex для Paper
      }}
    >
      {/* <Typography>Current Date: {currentDate.format('YYYY-MM-DD')}</Typography>
      <Typography>View Mode: {viewMode}</Typography> */}
      {isLoading && <Typography>Загрузка данных...</Typography>}
      {error && <Typography color="error">Ошибка: {error?.message || JSON.stringify(error)}</Typography>}
      
      {/* Контейнер для всей сетки, включая заголовки дней и временные слоты */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: slotGap, flexGrow: 1 /* Позволяем этому Box расти */ }}>
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
                    minHeight: '80px',
                    backgroundColor: theme.palette.background.paper, // Фон для слотов как у Paper
                    // borderRadius: theme.shape.borderRadius / 2, // Убираем скругление
                    p: 0.5, // Внутренний отступ для full карточки
                    position: 'relative', // Для позиционирования stacked карточек
                    display: 'flex',
                    flexDirection: 'column',
                    // alignItems: 'stretch', // Убираем, чтобы stacked карточки не растягивались
                    justifyContent: 'flex-start', // Начинаем с верхнего края
                    gap: '2px', // Небольшой отступ между full карточками, если их несколько (маловероятно, но пусть будет)
                    cursor: 'pointer',
                    transition: theme.transitions.create(['background-color', 'box-shadow'], {
                      duration: theme.transitions.duration.short,
                    }),
                    '&:hover': {
                      backgroundColor: theme.palette.background.default, // Мягкий цвет при наведении
                      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
                    }
                  }}
                  onClick={(e) => handleSlotClick(e, day, time, slotEvents)}
                >
                  {/* Логика отображения карточек для стопки */}
                  {slotEvents.length === 1 && (
                    <TrainingCard key={slotEvents[0].id} event={slotEvents[0]} variant="full" />
                  )}
                  {slotEvents.length > 1 && (
                    <>
                      {slotEvents.slice(0, 3).map((eventItem, index) => {
                        const isFirstCardInStack = index === 0;
                        const cardVariant = isFirstCardInStack ? 'full' : 'stacked_preview';
                        // Высота для Box-обертки карточки
                        const boxWrapperHeight = '60px'; // Уменьшаем высоту первой карточки, чтобы дать место выглядывающим

                        return (
                          <Box 
                            key={eventItem.id} 
                            sx={{
                              position: 'absolute',
                              top: `${index * 8}px`, // Увеличиваем смещение для лучшей видимости нижних карточек
                              left: 0,
                              right: 0,
                              height: boxWrapperHeight, 
                              zIndex: slotEvents.length - index, 
                              padding: '0px',
                              overflow: 'hidden', 
                              borderRadius: 1, // Применяем borderRadius = 1, как вы указали
                            }}
                          >
                            <TrainingCard 
                              event={eventItem} 
                              variant={cardVariant} 
                            />
                          </Box>
                        );
                      })}
                      {slotEvents.length > 3 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '4px',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            fontSize: '0.6rem',
                            padding: '1px 3px',
                            borderRadius: '2px',
                            zIndex: 10, // Поверх всех карточек
                          }}
                        >
                          +{slotEvents.length - 3}
                        </Box>
                      )}
                    </>
                  )}
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

      <TrainingsStackPopover 
        anchorEl={popoverAnchorEl}
        open={Boolean(popoverAnchorEl)} // Popover открыт, если есть anchorEl
        onClose={handleClosePopover}
        events={popoverEvents}
        selectedDate={popoverSelectedDate}
        selectedTime={popoverSelectedTime}
        viewMode={viewMode}
        onAddTrainingClick={popoverSelectedDate && popoverSelectedTime 
          ? () => handleOpenFormFromPopover(popoverSelectedDate, popoverSelectedTime) 
          : undefined
        }
      />

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