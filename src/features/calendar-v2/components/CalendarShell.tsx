import React, { useMemo, useState, useCallback, useEffect, memo, useRef } from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DndProvider, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { CalendarViewMode } from './CalendarV2Page'; // Предполагается, что типы там же
import { TrainingTemplate } from '../models/trainingTemplate';
import { RealTraining } from '../models/realTraining';
import TrainingTemplateForm from './TrainingTemplateForm'; // Импорт формы
import TrainingTemplateModal from './TrainingTemplateModal'; // Импортируем модалку для шаблонов
import RealTrainingModal from './RealTrainingModal'; // Импортируем модалку для реальных тренировок


// API calls now handled by useCalendarDragDrop hook
import EnhancedDraggableTrainingChip from './EnhancedDraggableTrainingChip';
import EnhancedDroppableSlot from './EnhancedDroppableSlot';
import CalendarTrainingChip from './CalendarTrainingChip';
import PerformanceMonitor from './PerformanceMonitor';
import { CALENDAR_FEATURE_FLAGS } from '../config/featureFlags';
import { debugLog } from '../utils/debug';
import { useAltKey } from '../hooks/useAltKey';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { useCalendarState, SelectedSlotInfo } from '../hooks/useCalendarState';
import { useCalendarDragDrop } from '../hooks/useCalendarDragDrop';
import { generateTimeSlots } from '../utils/slotUtils';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useDragState } from '../hooks/useDragState';
// Hooks

// Настраиваем dayjs для работы с ISO неделями (понедельник - воскресенье)
dayjs.extend(isoWeek);

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

// SelectedSlotInfo is now imported from useCalendarState



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
    // Используем isoWeek для начала недели с понедельника
    const startOfWeek = currentDate.startOf('isoWeek');
    return Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'));
  }, [currentDate]);

  const timeSlots = useMemo(() => generateTimeSlots(6, 22), []);

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

  // Use optimized calendar events hook
  const { getEventsForSlot } = useCalendarEvents(eventsToDisplay, viewMode, currentDate);

  // Use unified state management
  // Use unified state management
  const { state: calendarState, actions: calendarActions } = useCalendarState();

  // Use drag & drop hook
  const { handleTrainingDrop } = useCalendarDragDrop(viewMode, currentDate);

  // Global Alt key state
  const { isAltPressed, getCurrentAltState, forceResetAltState } = useAltKey();

  // Drag state for UI updates
  const [isDragging, setIsDragging] = useState(false);

  // Drag & drop handled by custom hook

  // Remove the old getEventsForSlot - now handled by useCalendarEvents hook

  // Replaced individual useState with unified state management
  // const [isFormOpen, setIsFormOpen] = useState(false);
  // const [selectedSlotInfo, setSelectedSlotInfo] = useState<SelectedSlotInfo | null>(null);
  // const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  // const [selectedEventType, setSelectedEventType] = useState<'template' | 'real' | null>(null);
  
  // Убрали hoveredSlot состояние для улучшения производительности - используем чистый CSS hover

  const handleSlotClick = useCallback((_event: React.MouseEvent<HTMLElement>, day: Dayjs, time: string, _eventsInSlot: CalendarEvent[]) => {
    // В режиме шаблонов всегда разрешаем создание новых тренировок (независимо от количества существующих)
    if (viewMode === 'scheduleTemplate') {
      calendarActions.openCreateForm({ date: day, time });
    }
  }, [viewMode, calendarActions]);

  const handleOpenDetailModal = useCallback((eventData: CalendarEvent) => {
    calendarActions.openEventModal(eventData.id, isTrainingTemplate(eventData) ? 'template' : 'real');
  }, [calendarActions]);

  const handleCloseDetailModal = useCallback(() => {
    calendarActions.closeEventModal();
  }, [calendarActions]);

  const handleCloseForm = useCallback(() => {
    calendarActions.closeCreateForm();
  }, [calendarActions]);



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
          selectedSlotInfo: calendarState.createForm.selectedSlot,
          isFormOpen: calendarState.createForm.isOpen,
          isDetailModalOpen: calendarState.eventModal.isOpen,
          selectedEventId: calendarState.eventModal.eventId,
          selectedEventType: calendarState.eventModal.type,
          daysOfWeek,
          timeSlots,
          isMobile,
          isTablet,
          theme,
          isDragging,
          setIsDragging,
          isAltPressed,
          getCurrentAltState,
          forceResetAltState,
        }}
      />
      
      {/* Performance monitoring - easily removable via feature flag */}
      {CALENDAR_FEATURE_FLAGS.enablePerformanceMonitor && (
        <PerformanceMonitor enabled={CALENDAR_FEATURE_FLAGS.enablePerformanceMonitor} />
      )}
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
  handleTrainingDrop: (event: CalendarEvent, sourceDay: Dayjs, sourceTime: string, targetDay: Dayjs, targetTime: string, isDuplicate?: boolean) => Promise<void>;
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
  // Добавляем Alt состояние
  isAltPressed: boolean;
  getCurrentAltState: () => boolean;
  forceResetAltState: () => void;

}

// Внутренний компонент для работы с drag & drop контекстом
const CalendarContent: React.FC<CalendarContentProps> = memo((props) => {
  const {
    viewMode, templatesData, actualData, isLoading, error,
    getEventsForSlot, handleTrainingDrop, handleSlotClick,
    handleOpenDetailModal, handleCloseDetailModal, handleCloseForm,
    responsiveStyles, selectedSlotInfo, isFormOpen, isDetailModalOpen,
    selectedEventId, selectedEventType, daysOfWeek, timeSlots,
    isMobile, isTablet, theme, isDragging, setIsDragging,
    isAltPressed, getCurrentAltState, forceResetAltState
  } = props;

  // Optimized drag state and auto-scroll with enhanced top area
  const paperScrollRef = useRef<HTMLDivElement | null>(null);
  const { actions: dragActions } = useDragState();
  const { handleMouseMove: handleAutoScroll } = useAutoScroll(
    paperScrollRef as React.RefObject<HTMLElement>,
    {
      topThreshold: 220, // Larger top area for easier upward scrolling
      threshold: 150,    // Other edges
      speed: 15,
      maxSpeed: 45,
      acceleration: 1.5,
      showDebugZones: CALENDAR_FEATURE_FLAGS.showAutoScrollDebugZones,
    }
  );

  // Optimized drag layer with throttled updates
  const { isDraggingGlobal, clientOffset } = useDragLayer((monitor) => ({
    isDraggingGlobal: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  // Handle auto-scroll with optimized mouse tracking
  useEffect(() => {
    if (!isDraggingGlobal || !clientOffset) {
      return;
    }

    // Throttled auto-scroll handling
    handleAutoScroll(clientOffset.x, clientOffset.y);
  }, [isDraggingGlobal, clientOffset, handleAutoScroll]);

  // Update drag state for UI components
  useEffect(() => {
    setIsDragging(isDraggingGlobal);
    
    if (isDraggingGlobal) {
      debugLog('🎯 Начался drag - тултипы отключены');
    } else {
      debugLog('🎯 Drag завершен - тултипы включены');
      // Log performance stats when drag ends
      const stats = dragActions.getPerformanceStats();
      if (stats) {
        debugLog('📊 Drag performance:', stats);
      }
    }
  }, [isDraggingGlobal, setIsDragging, dragActions]);

  // Choose enhanced components for better performance and UX
  const DroppableSlotComponent = EnhancedDroppableSlot;
  const DraggableChipComponent = EnhancedDraggableTrainingChip;

  return (
      <Paper 
        ref={paperScrollRef}
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
        flexGrow: 1
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
        <Box 
          sx={{ 
            flexGrow: 1
          }}
        >
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
                    isAltPressed={isAltPressed}
                    getCurrentAltState={getCurrentAltState}
                    forceResetAltState={forceResetAltState}
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
                        {visibleEvents.map((eventItem, _) => (
                          <DraggableChipComponent
                            key={eventItem.id}
                            event={eventItem}
                            day={day}
                            time={time}
                          >
                            <CalendarTrainingChip 
                              event={eventItem} 
                              isMobile={isMobile}
                              isTablet={isTablet}
                              onEventClick={handleOpenDetailModal}
                              // isDragActive передается из DraggableChipComponent
                            />
                          </DraggableChipComponent>
                        ))}
                        
                        {hiddenEventsCount > 0 && (
                          <Tooltip 
                            title={isDragging ? '' : `Ещё ${hiddenEventsCount} тренировок. Кликните чтобы увидеть все.`}
                            arrow 
                            placement="top"
                            disableHoverListener={isDragging}
                            disableFocusListener={isDragging}
                            disableTouchListener={isDragging}
                            open={isDragging ? false : undefined}
                          >
                            <Box
                              sx={{
                                backgroundColor: alpha(theme.palette.background.paper, 0.95), // Match chip background
                                borderLeft: `3px solid ${theme.palette.primary.main}`, // Only thin left border
                                borderRadius: 2,
                                px: 1,
                                py: 0.5,
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out, background-color 0.15s ease-out',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  backgroundColor: theme.palette.background.paper,
                                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.12)}`,
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
                            open={isDragging ? false : undefined}
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

      {/* Модальные окна для разных типов тренировок */}
      {selectedEventType === 'template' && (
        <TrainingTemplateModal 
          open={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          templateId={selectedEventId}
        />
      )}
      {selectedEventType === 'real' && (
        <RealTrainingModal 
          open={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          trainingId={selectedEventId}
        />
      )}

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