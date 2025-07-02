import React, { useMemo, useState, useCallback, useEffect, memo } from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DndProvider, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import dayjs, { Dayjs } from 'dayjs';
import { CalendarViewMode } from './CalendarV2Page'; // Предполагается, что типы там же
import { TrainingTemplate } from '../models/trainingTemplate';
import { RealTraining } from '../models/realTraining';
import TrainingTemplateForm from './TrainingTemplateForm'; // Импорт формы
import TrainingDetailModal from './TrainingDetailModal'; // Импортируем детальное модальное окно
import { calculateCapacity, formatCapacityText, shouldShowCapacityBadge } from '../utils/capacityUtils';

import { useSnackbar } from '../../../hooks/useSnackBar';
import { 
  useMoveTrainingTemplateMutation, 
  useMoveRealTrainingMutation 
} from '../../../store/apis/calendarApi-v2';
import DraggableTrainingChip from './DraggableTrainingChip';
import DroppableSlotComponent from './DroppableSlot';
import { debugLog } from '../utils/debug';

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

// Мемоизированный компонент для Training Chip (вынесен отдельно для оптимизации)
const TrainingChip = memo<{ 
  event: CalendarEvent; 
  index: number; 
  isMobile: boolean; 
  isTablet: boolean;
  onEventClick: (event: CalendarEvent) => void;
  isDragActive?: boolean;
}>(({ event, index, isMobile, isTablet, onEventClick, isDragActive = false }) => {
  const theme = useTheme();
  
  // Мемоизируем тяжелые вычисления
  const chipData = useMemo(() => {
    const typeColor = event.training_type?.color || theme.palette.primary.main;
    let trainerName = 'Без тренера';
    let studentCount = 0;
    const maxParticipants = event.training_type?.max_participants || null;

    // Получаем информацию о тренере
    if (isTrainingTemplate(event) && event.responsible_trainer) {
      trainerName = `${event.responsible_trainer.first_name || ''} ${event.responsible_trainer.last_name ? event.responsible_trainer.last_name.charAt(0) + '.' : ''}`.trim();
    } else if (isRealTraining(event) && event.trainer) {
      trainerName = `${event.trainer.first_name || ''} ${event.trainer.last_name ? event.trainer.last_name.charAt(0) + '.' : ''}`.trim();
    }

    // Получаем количество студентов
    if (isTrainingTemplate(event) && event.assigned_students) {
      studentCount = event.assigned_students.length;
    } else if (isRealTraining(event) && event.students) {
      studentCount = event.students.length;
    }

    // Рассчитываем информацию о загруженности
    const capacityInfo = calculateCapacity(studentCount, maxParticipants);
    const capacityText = formatCapacityText(capacityInfo);
    const showCapacityBadge = shouldShowCapacityBadge(capacityInfo);

    return {
      typeColor,
      trainerName,
      studentCount,
      maxParticipants,
      capacityInfo,
      capacityText,
      showCapacityBadge
    };
  }, [event, theme.palette.primary.main]);

  // Мемоизируем tooltip content
  const tooltipContent = useMemo(() => (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {event.training_type?.name || 'Тренировка'}
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.25 }}>
        👨 {chipData.trainerName}
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.25 }}>
        👥 Студентов: {chipData.capacityText}
      </Typography>
      {chipData.maxParticipants && chipData.maxParticipants < 999 && (
        <Typography variant="body2" sx={{ 
          color: chipData.capacityInfo.isFull ? '#ffcdd2' : '#e8f5e8',
          fontSize: '0.75rem'
        }}>
          {chipData.capacityInfo.isFull ? '⚠️ Группа переполнена' : 
           chipData.capacityInfo.percentage >= 90 ? '⚠️ Почти заполнена' :
           chipData.capacityInfo.percentage >= 70 ? '⚡ Заполняется' : '✅ Есть свободные места'}
        </Typography>
      )}
    </Box>
  ), [event.training_type?.name, chipData]);

  // Красивые hover эффекты с оптимизацией производительности
  const chipSx = useMemo(() => ({
    backgroundColor: alpha(chipData.typeColor, 0.1),
    border: `2px solid ${chipData.typeColor}`,
    borderRadius: 1,
    px: 0.75,
    py: 0.25,
    cursor: 'pointer',
    maxWidth: isMobile ? '80px' : (isTablet ? '100px' : '120px'),
    width: 'fit-content',
    // Оптимизированные transitions без transform (только background и border)
    transition: 'background 0.2s ease-out, border-color 0.2s ease-out',
    '&:hover': {
      background: `linear-gradient(135deg, ${alpha(chipData.typeColor, 0.8)}, ${alpha(chipData.typeColor, 0.6)})`,
      borderColor: chipData.typeColor,
      borderRadius: 4, // Более круглые при наведении
      '& .chip-text': {
        color: theme.palette.getContrastText(alpha(chipData.typeColor, 0.7)),
        fontWeight: 700,
      },
      '& .trainer-text': {
        color: alpha(theme.palette.getContrastText(alpha(chipData.typeColor, 0.7)), 0.9),
      },
    },
  }), [chipData.typeColor, isMobile, isTablet, theme.palette]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick(event);
  }, [event, onEventClick]);

  return (
    <Tooltip 
      title={isDragActive ? '' : tooltipContent} 
      arrow 
      placement="top"
      enterDelay={300}
      leaveDelay={100}
      disableHoverListener={isDragActive}
      disableFocusListener={isDragActive}
      disableTouchListener={isDragActive}
    >
      <Box onClick={handleClick} sx={chipSx}>
        <Typography
          variant="caption"
          className="chip-text"
          sx={{
            fontSize: isMobile ? '0.6rem' : '0.65rem',
            fontWeight: 600,
            color: chipData.typeColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            lineHeight: 1.2,
            transition: 'color 0.2s ease-out, font-weight 0.2s ease-out',
          }}
        >
          {event.training_type?.name || 'Тренировка'}
        </Typography>
        {!isMobile && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%'
          }}>
            <Typography
              variant="caption"
              className="trainer-text"
              sx={{
                fontSize: '0.6rem',
                color: alpha(chipData.typeColor, 0.8),
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
                transition: 'color 0.2s ease-out',
              }}
            >
              {chipData.trainerName}
            </Typography>
            {chipData.showCapacityBadge && (
              <Box
                sx={{
                  backgroundColor: chipData.capacityInfo.color,
                  color: 'white',
                  fontSize: '0.5rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  px: 0.5,
                  py: 0.125,
                  minWidth: '16px',
                  textAlign: 'center',
                  ml: 0.5,
                }}
              >
                {chipData.capacityText}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
});

const CalendarShell: React.FC<CalendarShellProps> = memo(({
  currentDate,
  viewMode,
  templatesData,
  actualData,
  isLoading,
  error,
}) => {
  const theme = useTheme(); // Получаем доступ к теме
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Определяем мобильный экран
  const isTablet = useMediaQuery(theme.breakpoints.down('lg')); // Планшет
  
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
    let events: CalendarEvent[] = [];
    if (viewMode === 'scheduleTemplate') {
      events = templatesData || [];
      debugLog(`📊 Данные шаблонов обновились: ${events.length} элементов`);
    } else {
      events = actualData || [];
      debugLog(`📊 Данные тренировок обновились: ${events.length} элементов`);
    }
    return events;
  }, [viewMode, templatesData, actualData]);

  // Hooks для drag and drop (ПЕРЕМЕЩЕНО СЮДА - до getEventsForSlot)
  const { displaySnackbar } = useSnackbar();
  const [moveTrainingTemplate] = useMoveTrainingTemplateMutation();
  const [moveRealTraining] = useMoveRealTrainingMutation();
  
  // Состояние драга будет передаваться из внутреннего компонента
  const [isDragging, setIsDragging] = useState(false);

  // Обработчик перемещения тренировок с react-dnd
  const handleTrainingDrop = useCallback(async (
    event: CalendarEvent, 
    sourceDay: Dayjs, 
    sourceTime: string, 
    targetDay: Dayjs, 
    targetTime: string
  ) => {
    // Проверяем, изменилось ли положение
    if (sourceDay.isSame(targetDay, 'day') && sourceTime === targetTime) {
      return; // Ничего не изменилось
    }

    debugLog('🚀 Начинаем перемещение с react-dnd:', { 
      eventId: event.id, 
      from: `${sourceDay.format('ddd')} ${sourceTime}`,
      to: `${targetDay.format('ddd')} ${targetTime}`
    });

    try {
      if (isTrainingTemplate(event)) {
        const dayNumber = targetDay.isoWeekday(); // 1-7 (1 - понедельник)
        
        await moveTrainingTemplate({
          id: event.id,
          dayNumber,
          startTime: targetTime,
        }).unwrap();
        
        debugLog('🎉 Перемещение шаблона завершено успешно');
        displaySnackbar(`✅ Шаблон тренировки "${event.training_type?.name}" перемещен`, 'success');
      } else if (isRealTraining(event)) {
        const trainingDate = targetDay.format('YYYY-MM-DD');
        
        await moveRealTraining({
          id: event.id,
          trainingDate,
          startTime: targetTime,
        }).unwrap();
        
        debugLog('🎉 Перемещение тренировки завершено успешно');
        displaySnackbar(`✅ Тренировка "${event.training_type?.name}" перемещена`, 'success');
      }
    } catch (error: any) {
      console.error('❌ Ошибка при перемещении тренировки:', error);
      const errorMessage = error?.data?.detail || error?.message || 'Неизвестная ошибка';
      displaySnackbar(`❌ Не удалось переместить тренировку: ${errorMessage}`, 'error');
    }
  }, [moveTrainingTemplate, moveRealTraining, displaySnackbar]);

  const getEventsForSlot = useCallback((day: Dayjs, time: string): CalendarEvent[] => {
    const slotHour = parseInt(time.split(':')[0]);
    const slotMinute = parseInt(time.split(':')[1]);
    const slotKey = `${day.format('ddd')} ${time}`;

    let filteredEvents: CalendarEvent[] = [];

    if (viewMode === 'scheduleTemplate') {
      filteredEvents = eventsToDisplay.filter(event => {
        if (isTrainingTemplate(event)) {
          // day_number: 1-7 (1 - Пн), day.isoWeekday(): 1-7 (1 - Пн)
          const eventStartTime = event.start_time.substring(0, 5); // "HH:MM"
          const matches = event.day_number === day.isoWeekday() && eventStartTime === time;
          
          if (matches) {
            debugLog(`📍 Слот ${slotKey}: найден шаблон #${event.id} "${event.training_type?.name}"`);
          }
          
          return matches;
        }
        return false;
      });
    } else if (viewMode === 'actualTrainings') {
      filteredEvents = eventsToDisplay.filter(event => {
        if (isRealTraining(event)) {
          const eventStart = dayjs(`${event.training_date}T${event.start_time}`);
          const matches = eventStart.isSame(day, 'day') &&
                 eventStart.hour() === slotHour &&
                 eventStart.minute() === slotMinute;
                 
          if (matches) {
            debugLog(`📍 Слот ${slotKey}: найдена тренировка #${event.id} "${event.training_type?.name}"`);
          }
          
          return matches;
        }
        return false;
      });
    }
    
    // Логируем только если есть события в слоте
    if (filteredEvents.length > 0) {
      debugLog(`🎯 Рендер слота ${slotKey}: ${filteredEvents.length} событий`);
    }
    
    return filteredEvents;
  }, [eventsToDisplay, viewMode]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<SelectedSlotInfo | null>(null);

  // Состояния для детального модального окна
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<'template' | 'real' | null>(null);
  
  // Убрали hoveredSlot состояние для улучшения производительности - используем чистый CSS hover

  const handleSlotClick = useCallback((event: React.MouseEvent<HTMLElement>, day: Dayjs, time: string, eventsInSlot: CalendarEvent[]) => {
    // В режиме шаблонов всегда разрешаем создание новых тренировок (независимо от количества существующих)
    if (viewMode === 'scheduleTemplate') {
      setSelectedSlotInfo({ date: day, time });
      setIsFormOpen(true);
    }
  }, [viewMode]);

  const handleOpenDetailModal = useCallback((eventData: CalendarEvent) => {
    setSelectedEventId(eventData.id);
    setSelectedEventType(isTrainingTemplate(eventData) ? 'template' : 'real');
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedEventId(null);
    setSelectedEventType(null);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedSlotInfo(null);
  }, []);



  // Адаптивные размеры для разных экранов
  const responsiveStyles = useMemo(() => {
    if (isMobile) {
      return {
        gridTemplateColumns: '60px repeat(7, minmax(80px, 1fr))',
        fontSize: '0.7rem',
        slotHeight: '80px',
        cardPadding: '2px',
      };
    } else if (isTablet) {
      return {
        gridTemplateColumns: '80px repeat(7, minmax(100px, 1fr))',
        fontSize: '0.8rem',
        slotHeight: '100px', // Увеличил с 80px
        cardPadding: '4px',
      };
    } else {
      return {
        gridTemplateColumns: '100px repeat(7, minmax(140px, 1fr))', // Увеличил минимальную ширину с 120px
        fontSize: '0.9rem',
        slotHeight: '110px', // Увеличил с 90px
        cardPadding: '6px',
      };
    }
  }, [isMobile, isTablet]);

  return (
    <DndProvider backend={HTML5Backend}>
      <CalendarContent 
        {...{
          currentDate,
          viewMode, 
          templatesData,
          actualData,
          isLoading,
          error,
          eventsToDisplay,
          getEventsForSlot,
          handleTrainingDrop,
          handleSlotClick,
          handleOpenDetailModal,
          handleCloseDetailModal,
          handleCloseForm,
          responsiveStyles,
          selectedSlotInfo,
          isFormOpen,
          isDetailModalOpen,
          selectedEventId,
          selectedEventType,
          daysOfWeek,
          timeSlots,
          isMobile,
          isTablet,
          theme,
          isDragging,
          setIsDragging,
        }}
      />
    </DndProvider>
  );
});

// Типы для внутреннего компонента
interface CalendarContentProps {
  currentDate: Dayjs;
  viewMode: CalendarViewMode;
  templatesData?: TrainingTemplate[];
  actualData?: RealTraining[];
  isLoading: boolean;
  error?: any;
  eventsToDisplay: CalendarEvent[];
  getEventsForSlot: (day: Dayjs, time: string) => CalendarEvent[];
  handleTrainingDrop: (event: CalendarEvent, sourceDay: Dayjs, sourceTime: string, targetDay: Dayjs, targetTime: string) => Promise<void>;
  handleSlotClick: (event: React.MouseEvent<HTMLElement>, day: Dayjs, time: string, eventsInSlot: CalendarEvent[]) => void;
  handleOpenDetailModal: (eventData: CalendarEvent) => void;
  handleCloseDetailModal: () => void;
  handleCloseForm: () => void;
  responsiveStyles: any;
  selectedSlotInfo: SelectedSlotInfo | null;
  isFormOpen: boolean;
  isDetailModalOpen: boolean;
  selectedEventId: number | null;
  selectedEventType: 'template' | 'real' | null;
  daysOfWeek: Dayjs[];
  timeSlots: string[];
  isMobile: boolean;
  isTablet: boolean;
  theme: any;
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
}

// Внутренний компонент для работы с drag & drop контекстом
const CalendarContent: React.FC<CalendarContentProps> = memo((props) => {
  const {
    currentDate, viewMode, templatesData, actualData, isLoading, error,
    eventsToDisplay, getEventsForSlot, handleTrainingDrop, handleSlotClick,
    handleOpenDetailModal, handleCloseDetailModal, handleCloseForm,
    responsiveStyles, selectedSlotInfo, isFormOpen, isDetailModalOpen,
    selectedEventId, selectedEventType, daysOfWeek, timeSlots,
    isMobile, isTablet, theme, isDragging, setIsDragging
  } = props;

  // Теперь можем использовать useDragLayer внутри DndProvider
  const { isDraggingGlobal } = useDragLayer((monitor) => ({
    isDraggingGlobal: monitor.isDragging(),
  }));

  // Обновляем состояние в родительском компоненте
  useEffect(() => {
    setIsDragging(isDraggingGlobal);
    if (isDraggingGlobal) {
      debugLog('🎯 Начался drag - тултипы отключены');
    } else {
      debugLog('🎯 Drag завершен - тултипы включены');
    }
  }, [isDraggingGlobal, setIsDragging]);

  return (
      <Paper 
        elevation={3} 
        sx={{
          p: isMobile ? 1 : 2, 
          mt: 2, 
          overflow: 'auto',
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
      {isLoading && <Typography>Загрузка данных...</Typography>}
      {error && <Typography color="error">Ошибка: {error?.message || JSON.stringify(error)}</Typography>}
      
      {/* Основной контейнер календаря */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: theme.spacing(0.5),
        flexGrow: 1,
        overflow: 'hidden'
      }}>
        {/* Заголовки дней недели */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: responsiveStyles.gridTemplateColumns,
          gap: theme.spacing(0.5),
          alignItems: 'center'
        }}>
          <Box sx={{ 
            textAlign: 'center', 
            p: 1,
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="caption" sx={{ fontSize: responsiveStyles.fontSize }}>
              Время
            </Typography>
          </Box>
          {daysOfWeek.map(day => (
            <Box 
              key={day.toString()} 
              sx={{ 
                textAlign: 'center', 
                p: 1, 
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1,
                minHeight: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontSize: responsiveStyles.fontSize }}>
                {day.format('dd').toUpperCase()}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.2rem' }}>
                {day.format('D')}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Основная сетка временных слотов */}
        <Box sx={{ 
          overflow: 'auto',
          flexGrow: 1
        }}>
          {timeSlots.map(time => (
            <Box 
              key={time} 
              sx={{
                display: 'grid',
                gridTemplateColumns: responsiveStyles.gridTemplateColumns,
                gap: theme.spacing(0.5),
                alignItems: 'stretch',
                mb: 0.5
              }}
            >
              {/* Колонка времени */}
              <Box sx={{ 
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: responsiveStyles.slotHeight
              }}>
                <Typography variant="caption" sx={{ fontSize: responsiveStyles.fontSize }}>
                  {time}
                </Typography>
              </Box>
              
              {/* Слоты для каждого дня */}
              {daysOfWeek.map(day => {
                const slotEvents: CalendarEvent[] = getEventsForSlot(day, time);
                const maxChips = isMobile ? 2 : (isTablet ? 3 : 4);
                const visibleEvents = slotEvents.slice(0, maxChips);
                const hiddenEventsCount = slotEvents.length - maxChips;
                const slotKey = `${day.format('YYYY-MM-DD')}-${time}`;

                return (
                  <DroppableSlotComponent
                    key={slotKey}
                    day={day}
                    time={time}
                    onClick={(e) => handleSlotClick(e, day, time, slotEvents)}
                    onDrop={handleTrainingDrop}
                    sx={{
                      minHeight: responsiveStyles.slotHeight,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 1,
                      p: responsiveStyles.cardPadding,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      cursor: viewMode === 'scheduleTemplate' ? 'pointer' : 'default',
                      // Упрощенные transitions для лучшей производительности
                      transition: 'background-color 0.15s ease-out, box-shadow 0.15s ease-out',
                      overflow: 'visible', // Разрешаем тултипам показываться за границами
                      '&:hover': viewMode === 'scheduleTemplate' ? {
                        backgroundColor: slotEvents.length === 0 
                          ? theme.palette.background.default 
                          : alpha(theme.palette.primary.main, 0.04),
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.4)}`,
                        // Убрали transform: scale для лучшей производительности
                        // CSS селекторы для показа подсказок при hover
                        '& .create-hint': {
                          opacity: 0.6,
                        },
                        '& .add-button': {
                          opacity: 1,
                        },
                      } : {},
                    }}
                  >
                    {/* Отображение чипов тренировок */}
                    {slotEvents.length > 0 && (
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        height: '100%',
                        overflow: 'visible',
                        paddingRight: viewMode === 'scheduleTemplate' ? '28px' : '0px', // Место для кнопки "+"
                      }}>
                        {visibleEvents.map((eventItem, index) => (
                          <DraggableTrainingChip
                            key={eventItem.id}
                            event={eventItem}
                            day={day}
                            time={time}
                          >
                            <TrainingChip 
                              event={eventItem} 
                              index={index} 
                              isMobile={isMobile}
                              isTablet={isTablet}
                              onEventClick={handleOpenDetailModal}
                              isDragActive={isDragging}
                            />
                          </DraggableTrainingChip>
                        ))}
                        
                        {hiddenEventsCount > 0 && (
                          <Tooltip 
                            title={isDragging ? '' : `Ещё ${hiddenEventsCount} тренировок. Кликните чтобы увидеть все.`}
                            arrow 
                            placement="top"
                            disableHoverListener={isDragging}
                            disableFocusListener={isDragging}
                            disableTouchListener={isDragging}
                          >
                            <Box
                              sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                border: `2px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
                                borderRadius: 2,
                                px: 1,
                                py: 0.5,
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'background-color 0.15s ease-out',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                                },
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  color: theme.palette.primary.main,
                                }}
                              >
                                ещё +{hiddenEventsCount}
                              </Typography>
                            </Box>
                          </Tooltip>
                        )}
                      </Box>
                    )}

                    {/* Подсказки и кнопки добавления */}
                    {viewMode === 'scheduleTemplate' && (
                      <>
                                                {/* Подсказка для пустых слотов */}
                        {slotEvents.length === 0 && (
                          <Box
                            className="create-hint"
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              opacity: 0,
                              transition: 'opacity 0.15s ease-out',
                            }}
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontSize: '0.7rem',
                                color: theme.palette.text.secondary,
                                textAlign: 'center',
                              }}
                            >
                              + Создать
                            </Typography>
                          </Box>
                        )}

                        {/* Кнопка "+" для занятых слотов */}
                        {slotEvents.length > 0 && (
                          <Tooltip 
                            title={isDragging ? '' : "Добавить ещё одну тренировку в этот слот"} 
                            arrow 
                            placement="top"
                            disableHoverListener={isDragging}
                            disableFocusListener={isDragging}
                            disableTouchListener={isDragging}
                          >
                            <Box
                              className="add-button"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                backgroundColor: alpha(theme.palette.primary.main, 0.9),
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.15s ease-out, background-color 0.15s ease-out',
                                cursor: 'pointer',
                                zIndex: 10,
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.main,
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation(); // Предотвращаем двойной вызов handleSlotClick
                                handleSlotClick(e, day, time, slotEvents);
                              }}
                            >
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  lineHeight: 1,
                                }}
                              >
                                +
                              </Typography>
                            </Box>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </DroppableSlotComponent>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Форма создания шаблона */}
      {selectedSlotInfo && (
        <TrainingTemplateForm 
          open={isFormOpen}
          onClose={handleCloseForm}
          selectedDate={selectedSlotInfo.date}
          selectedTime={selectedSlotInfo.time}
        />
      )}

      {/* Детальное модальное окно */}
      <TrainingDetailModal 
        open={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        eventId={selectedEventId}
        eventType={selectedEventType}
      />

      {/* Отображение загруженных данных (временно для отладки) */}
      {viewMode === 'scheduleTemplate' && templatesData && !isLoading && (
        <Box mt={2} sx={{display:'none'}}>
          <Typography variant="subtitle1">Template Data:</Typography>
          <Typography>Загружено {templatesData.length} шаблонов.</Typography>
        </Box>
      )}
      {viewMode === 'actualTrainings' && actualData && !isLoading && (
        <Box mt={2} sx={{display:'none'}}>
          <Typography variant="subtitle1">Actual Trainings Data:</Typography>
          <Typography>Загружено {actualData.length} актуальных тренировок.</Typography>
        </Box>
      )}
    </Paper>
  );
});
  
export default CalendarShell; 