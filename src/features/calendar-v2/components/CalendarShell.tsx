import React, { useMemo, useState, useCallback, useEffect, memo, useRef } from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DndProvider, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { CalendarViewMode } from './CalendarV2Page'; // Предполагается, что типы там же
import { TrainingTemplate, TrainingTemplateCreate } from '../models/trainingTemplate';
import { RealTraining, RealTrainingCreate } from '../models/realTraining';
import { TrainingStudentTemplateCreate } from '../models/trainingStudentTemplate';
import TrainingTemplateForm from './TrainingTemplateForm'; // Импорт формы
import TrainingTemplateModal from './TrainingTemplateModal'; // Импортируем модалку для шаблонов
import RealTrainingModal from './RealTrainingModal'; // Импортируем модалку для реальных тренировок


import { useSnackbar } from '../../../hooks/useSnackBar';
import { 
  useMoveTrainingTemplateMutation, 
  useMoveRealTrainingMutation,
  useCreateTrainingTemplateMutation,
  useCreateRealTrainingMutation,
  useCreateTrainingStudentTemplateMutation,
  useAddStudentToRealTrainingMutation,
  useGetTrainingTemplatesQuery,
  useGetRealTrainingsQuery
} from '../../../store/apis/calendarApi-v2';
import DraggableTrainingChip from './DraggableTrainingChip';
import DroppableSlotComponent from './DroppableSlot';
import CalendarTrainingChip from './CalendarTrainingChip';
import { debugLog } from '../utils/debug';
import { useAltKey } from '../hooks/useAltKey';

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

interface SelectedSlotInfo {
  date: Dayjs;
  time: string;
}



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
  const [createTrainingTemplate] = useCreateTrainingTemplateMutation();
  const [createRealTraining] = useCreateRealTrainingMutation();
  const [createTrainingStudentTemplate] = useCreateTrainingStudentTemplateMutation();
  const [addStudentToRealTraining] = useAddStudentToRealTrainingMutation();
  
  // Инвалидация кеша для обновления UI после дублирования
  const { refetch: refetchTemplates } = useGetTrainingTemplatesQuery();
  const { refetch: refetchRealTrainings } = useGetRealTrainingsQuery({
    startDate: currentDate.startOf('isoWeek').format('YYYY-MM-DD'),
    endDate: currentDate.endOf('isoWeek').format('YYYY-MM-DD'),
  });
  
  // Состояние драга будет передаваться из внутреннего компонента
  const [isDragging, setIsDragging] = useState(false);

  // Глобальный Alt listener - создается только один раз на весь календарь  
  const { isAltPressed, getCurrentAltState, forceResetAltState } = useAltKey();

  // Обработчик перемещения/дублирования тренировок с react-dnd
  const handleTrainingDrop = useCallback(async (
    event: CalendarEvent, 
    sourceDay: Dayjs, 
    sourceTime: string, 
    targetDay: Dayjs, 
    targetTime: string,
    isDuplicate: boolean = false // Используем переданное значение
  ) => {
    // isDuplicate теперь точно определяется в DroppableSlot
    
    // Проверяем, изменилось ли положение
    if (sourceDay.isSame(targetDay, 'day') && sourceTime === targetTime) {
      return; // Ничего не изменилось
    }

    debugLog(`🚀 Начинаем ${isDuplicate ? 'дублирование' : 'перемещение'} с react-dnd:`, { 
      eventId: event.id, 
      from: `${sourceDay.format('ddd')} ${sourceTime}`,
      to: `${targetDay.format('ddd')} ${targetTime}`,
      isDuplicate,
      ctrlPressed: isDuplicate
    });

    try {
      if (isDuplicate) {
        // Логика дублирования
        if (isTrainingTemplate(event)) {
          const dayNumber = targetDay.day() === 0 ? 7 : targetDay.day(); // 1-7 (1 - понедельник)
          
          // Извлекаем студентов из оригинального шаблона
          const originalStudents = event.assigned_students || [];
          
          const newTemplate: TrainingTemplateCreate = {
            training_type_id: event.training_type?.id!,
            responsible_trainer_id: event.responsible_trainer?.id!,
            day_number: dayNumber,
            start_time: targetTime,
          };
          
          // Сначала создаем шаблон
          const createdTemplate = await createTrainingTemplate(newTemplate).unwrap();
          
          // Затем добавляем студентов отдельными запросами
          if (originalStudents.length > 0) {
            const studentPromises = originalStudents.map(async (studentTemplate) => {
              // Сохраняем оригинальную start_date - она означает "с какой даты 
              // студент участвует в данном типе тренировки"
              const startDate = studentTemplate.start_date;
              
              const studentData: TrainingStudentTemplateCreate = {
                training_template_id: createdTemplate.id,
                student_id: studentTemplate.student.id,
                start_date: startDate, // Используем корректную дату
                is_frozen: studentTemplate.is_frozen,
              };
              return createTrainingStudentTemplate(studentData).unwrap();
            });
            
            await Promise.all(studentPromises);
          }
          
          debugLog('🎉 Дублирование шаблона завершено успешно');
          const studentCount = originalStudents.length;
          const studentText = studentCount > 0 ? ` (со ${studentCount} студентами)` : '';
          displaySnackbar(`📋 Шаблон тренировки "${event.training_type?.name}" продублирован${studentText}`, 'success');
          
          // Обновляем данные для отображения актуального количества студентов
          refetchTemplates();
        } else if (isRealTraining(event)) {
          const trainingDate = targetDay.format('YYYY-MM-DD');
          
          // Извлекаем студентов из оригинальной тренировки
          const originalStudents = event.students || [];
          
          const newTraining: RealTrainingCreate = {
            training_type_id: event.training_type?.id!,
            responsible_trainer_id: event.trainer?.id!,
            training_date: trainingDate,
            start_time: targetTime,
          };
          
          // Сначала создаем тренировку
          const createdTraining = await createRealTraining(newTraining).unwrap();
          
          // Затем добавляем студентов отдельными запросами
          if (originalStudents.length > 0) {
            const studentPromises = originalStudents.map(async (trainingStudent) => {
              return addStudentToRealTraining({
                training_id: createdTraining.id,
                student_id: trainingStudent.student.id,
              }).unwrap();
            });
            
            await Promise.all(studentPromises);
          }
          
          debugLog('🎉 Дублирование тренировки завершено успешно');
          const studentCount = originalStudents.length;
          const studentText = studentCount > 0 ? ` (со ${studentCount} студентами)` : '';
          displaySnackbar(`📋 Тренировка "${event.training_type?.name}" продублирована${studentText}`, 'success');
          
          // Обновляем данные для отображения актуального количества студентов
          refetchRealTrainings();
        }
      } else {
        // Логика перемещения (существующая)
        if (isTrainingTemplate(event)) {
          const dayNumber = targetDay.day() === 0 ? 7 : targetDay.day(); // 1-7 (1 - понедельник)
          
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
      }
    } catch (error: any) {
      console.error(`❌ Ошибка при ${isDuplicate ? 'дублировании' : 'перемещении'} тренировки:`, error);
      const errorMessage = error?.data?.detail || error?.message || 'Неизвестная ошибка';
      displaySnackbar(`❌ Не удалось ${isDuplicate ? 'продублировать' : 'переместить'} тренировку: ${errorMessage}`, 'error');
    }
  }, [moveTrainingTemplate, moveRealTraining, createTrainingTemplate, createRealTraining, createTrainingStudentTemplate, addStudentToRealTraining, displaySnackbar, refetchTemplates, refetchRealTrainings]);

  const getEventsForSlot = useCallback((day: Dayjs, time: string): CalendarEvent[] => {
    const slotHour = parseInt(time.split(':')[0]);
    const slotMinute = parseInt(time.split(':')[1]);
    const slotKey = `${day.format('ddd')} ${time}`;

    let filteredEvents: CalendarEvent[] = [];

    if (viewMode === 'scheduleTemplate') {
      filteredEvents = eventsToDisplay.filter(event => {
        if (isTrainingTemplate(event)) {
          // day_number: 1-7 (1 - Пн), day.day(): 0-6 (0 - Вс), поэтому +1 для соответствия
          const eventStartTime = event.start_time.substring(0, 5); // "HH:MM"
          const matches = event.day_number === (day.day() === 0 ? 7 : day.day()) && eventStartTime === time;
          
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

  const handleSlotClick = useCallback((_event: React.MouseEvent<HTMLElement>, day: Dayjs, time: string, _eventsInSlot: CalendarEvent[]) => {
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
          isAltPressed,
          getCurrentAltState,
          forceResetAltState,
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

  // Рефы для контейнеров скролла
  const paperScrollRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<number | null>(null);

  // Теперь можем использовать useDragLayer внутри DndProvider
  const { isDraggingGlobal, clientOffset } = useDragLayer((monitor) => ({
    isDraggingGlobal: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  // Хук для автоскролла
  useEffect(() => {
    if (!isDraggingGlobal || !clientOffset || !paperScrollRef.current) {
      // Очищаем интервал если не драгаем
      if (autoScrollIntervalRef.current) {
        window.clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      return;
    }

    const container = paperScrollRef.current;
    const containerRect = container.getBoundingClientRect();
    const scrollThreshold = 120; // Зона автоскролла от края viewport
    const scrollSpeed = 15; // Скорость скролла
    
    // Проверяем позицию курсора относительно VIEWPORT (не контейнера!)
    const mouseY = clientOffset.y;
    const viewportHeight = window.innerHeight;
    
    // Рассчитываем расстояния от краев ЭКРАНА
    const distanceFromViewportTop = mouseY;
    const distanceFromViewportBottom = viewportHeight - mouseY;
    
    // Проверяем что контейнер виден на экране
    const containerVisibleTop = Math.max(containerRect.top, 0);
    const containerVisibleBottom = Math.min(containerRect.bottom, viewportHeight);
    
    // Дебаг только при первом срабатывании
    if (!autoScrollIntervalRef.current) {
      debugLog('🎯 Autoscroll viewport check:', {
        mouseY,
        viewportHeight,
        distanceFromViewportTop,
        distanceFromViewportBottom,
        containerTop: containerRect.top,
        containerBottom: containerRect.bottom,
        containerVisibleTop,
        containerVisibleBottom,
        canScrollUp: container.scrollTop > 0,
        canScrollDown: container.scrollTop < (container.scrollHeight - container.clientHeight)
      });
    }
    
    let shouldScroll = false;
    let scrollDirection: 'up' | 'down' | null = null;
    
    // Автоскролл вверх: курсор близко к верху экрана + можем скроллить вверх
    if (distanceFromViewportTop < scrollThreshold && 
        mouseY > containerVisibleTop && // курсор над видимой частью контейнера
        container.scrollTop > 0) {
      shouldScroll = true;
      scrollDirection = 'up';
      debugLog('🔼 Скролл вверх активирован (viewport)');
    } 
    // Автоскролл вниз: курсор близко к низу экрана + можем скроллить вниз  
    else if (distanceFromViewportBottom < scrollThreshold && 
             mouseY < containerVisibleBottom && // курсор под видимой частью контейнера
             container.scrollTop < (container.scrollHeight - container.clientHeight)) {
      shouldScroll = true;
      scrollDirection = 'down';
      debugLog('🔽 Скролл вниз активирован (viewport)');
    }
    
    if (shouldScroll && scrollDirection) {
      // Очищаем предыдущий интервал
      if (autoScrollIntervalRef.current) {
        window.clearInterval(autoScrollIntervalRef.current);
      }
      
      // Запускаем новый интервал для плавного скролла
      autoScrollIntervalRef.current = window.setInterval(() => {
        if (scrollDirection === 'up') {
          container.scrollTop = Math.max(0, container.scrollTop - scrollSpeed);
        } else if (scrollDirection === 'down') {
          container.scrollTop = Math.min(
            container.scrollHeight - container.clientHeight,
            container.scrollTop + scrollSpeed
          );
        }
      }, 16); // ~60 FPS
    } else {
      // Останавливаем скролл если курсор не у края
      if (autoScrollIntervalRef.current) {
        window.clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    }
  }, [isDraggingGlobal, clientOffset]);

  // Обновляем состояние в родительском компоненте
  useEffect(() => {
    setIsDragging(isDraggingGlobal);
    if (isDraggingGlobal) {
      debugLog('🎯 Начался drag - тултипы отключены');
    } else {
      debugLog('🎯 Drag завершен - тултипы включены');
    }
  }, [isDraggingGlobal, setIsDragging]);

  // Очистка интервала при размонтировании
  useEffect(() => {
    return () => {
      if (autoScrollIntervalRef.current) {
        window.clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, []);

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
                          <DraggableTrainingChip
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
                              // isDragActive передается из DraggableTrainingChip
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