import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import dayjs, { Dayjs } from 'dayjs';
import { CalendarViewMode } from './CalendarV2Page'; // Предполагается, что типы там же
import { TrainingTemplate } from '../models/trainingTemplate';
import { RealTraining } from '../models/realTraining';
import TrainingTemplateForm from './TrainingTemplateForm'; // Импорт формы
import TrainingDetailModal from './TrainingDetailModal'; // Импортируем детальное модальное окно
import { calculateCapacity, formatCapacityText, shouldShowCapacityBadge } from '../utils/capacityUtils';

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

  // Состояния для детального модального окна
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<'template' | 'real' | null>(null);
  
  // Состояние для отслеживания hover на слотах
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const handleSlotClick = (event: React.MouseEvent<HTMLElement>, day: Dayjs, time: string, eventsInSlot: CalendarEvent[]) => {
    // В режиме шаблонов всегда разрешаем создание новых тренировок (независимо от количества существующих)
    if (viewMode === 'scheduleTemplate') {
      setSelectedSlotInfo({ date: day, time });
      setIsFormOpen(true);
    }
  };

  const handleOpenDetailModal = (eventData: CalendarEvent) => {
    setSelectedEventId(eventData.id);
    setSelectedEventType(isTrainingTemplate(eventData) ? 'template' : 'real');
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEventId(null);
    setSelectedEventType(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSlotInfo(null);
  };

  // Компонент для рендеринга чипа тренировки
  const TrainingChip: React.FC<{ event: CalendarEvent; index: number }> = ({ event, index }) => {
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

    const tooltipContent = (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {event.training_type?.name || 'Тренировка'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.25 }}>
          👨 {trainerName}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.25 }}>
          👥 Студентов: {capacityText}
        </Typography>
        {maxParticipants && maxParticipants < 999 && (
          <Typography variant="body2" sx={{ 
            color: capacityInfo.isFull ? '#ffcdd2' : '#e8f5e8',
            fontSize: '0.75rem'
          }}>
            {capacityInfo.isFull ? '⚠️ Группа переполнена' : 
             capacityInfo.percentage >= 90 ? '⚠️ Почти заполнена' :
             capacityInfo.percentage >= 70 ? '⚡ Заполняется' : '✅ Есть свободные места'}
          </Typography>
        )}
      </Box>
    );

    return (
      <Tooltip 
        title={tooltipContent} 
        arrow 
        placement="top"
        enterDelay={300}
        leaveDelay={100}
      >
        <Box
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDetailModal(event);
          }}
          sx={{
            backgroundColor: alpha(typeColor, 0.1),
            border: `2px solid ${typeColor}`,
            borderRadius: 1, // Более квадратные в обычном состоянии
            px: 0.75,
            py: 0.25,
            cursor: 'pointer',
            maxWidth: isMobile ? '80px' : (isTablet ? '100px' : '120px'), // Ограничиваем ширину
            width: 'fit-content', // Подгоняем под контент
            transition: theme.transitions.create(['transform', 'background-color', 'border-radius', 'border-color'], {
              duration: theme.transitions.duration.short,
              easing: theme.transitions.easing.easeOut,
            }),
                          '&:hover': {
                transform: 'translateY(-2px) scale(1.02)',
                background: `linear-gradient(135deg, ${alpha(typeColor, 0.8)}, ${alpha(typeColor, 0.6)})`, // Красивый градиент!
                borderColor: typeColor, // Полностью яркий цвет границы без прозрачности!
                borderRadius: 4, // Более круглые при наведении!
                '& .MuiTypography-root': {
                  color: theme.palette.getContrastText(alpha(typeColor, 0.7)), // Подходящий контрастный цвет!
                  fontWeight: 700,
                },
              },
          }}
                  >
            <Typography
              variant="caption"
              sx={{
                fontSize: isMobile ? '0.6rem' : '0.65rem',
                fontWeight: 600,
                color: typeColor,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
                lineHeight: 1.2,
                transition: 'all 0.2s ease',
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
                  sx={{
                    fontSize: '0.6rem',
                    color: alpha(typeColor, 0.8),
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1,
                  }}
                >
                  {trainerName}
                </Typography>
                {showCapacityBadge && (
                  <Box
                    sx={{
                      backgroundColor: capacityInfo.color,
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
                    {capacityText}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Tooltip>
    );
  };

  // Адаптивные размеры для разных экранов
  const getResponsiveStyles = () => {
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
  };

  const responsiveStyles = getResponsiveStyles();

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
                const isHovered = hoveredSlot === slotKey;

                return (
                  <Box
                    key={slotKey}
                    onMouseEnter={() => setHoveredSlot(slotKey)}
                    onMouseLeave={() => setHoveredSlot(null)}
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
                      transition: theme.transitions.create(['background-color', 'box-shadow', 'transform'], {
                        duration: theme.transitions.duration.standard,
                        easing: theme.transitions.easing.easeInOut,
                      }),
                      overflow: 'visible', // Разрешаем тултипам показываться за границами
                      '&:hover': viewMode === 'scheduleTemplate' ? {
                        backgroundColor: slotEvents.length === 0 
                          ? theme.palette.background.default 
                          : alpha(theme.palette.primary.main, 0.02),
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                        transform: 'scale(1.01)',
                      } : {},
                    }}
                    onClick={(e) => handleSlotClick(e, day, time, slotEvents)}
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
                          <TrainingChip key={eventItem.id} event={eventItem} index={index} />
                        ))}
                        
                        {hiddenEventsCount > 0 && (
                          <Tooltip 
                            title={`Ещё ${hiddenEventsCount} тренировок. Кликните чтобы увидеть все.`}
                            arrow 
                            placement="top"
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
                                transition: theme.transitions.create(['transform', 'background-color'], {
                                  duration: theme.transitions.duration.short,
                                }),
                                '&:hover': {
                                  transform: 'translateY(-1px)',
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
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              opacity: isHovered ? 0.6 : 0,
                              transition: theme.transitions.create('opacity', {
                                duration: theme.transitions.duration.short,
                              }),
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
                            title="Добавить ещё одну тренировку в этот слот" 
                            arrow 
                            placement="top"
                          >
                            <Box
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
                                opacity: isHovered ? 1 : 0,
                                transition: theme.transitions.create(['opacity', 'transform'], {
                                  duration: theme.transitions.duration.short,
                                }),
                                cursor: 'pointer',
                                zIndex: 10,
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.main,
                                  transform: 'scale(1.2)',
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
                  </Box>
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
};

export default CalendarShell; 