import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Stack,
  Card,
  CardContent,

  Chip,
  CircularProgress,
  Collapse,
  Avatar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

export type CalendarViewMode = 'scheduleTemplate' | 'actualTrainings';

import {
  useGetTrainingTemplatesQuery,
  useGetRealTrainingsQuery,
} from '../../../store/apis/calendarApi-v2';
import { TrainingStudentTemplate } from '../models/trainingStudentTemplate';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface MobileCalendarControlsHeaderProps {
  currentDate: Dayjs;
  onDateChange: (date: Dayjs | null) => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (event: React.SyntheticEvent, newValue: CalendarViewMode) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  dayDisplay: string;
  showBack?: boolean;
  onBack?: () => void;
}

const MobileCalendarControlsHeader: React.FC<MobileCalendarControlsHeaderProps> = ({
  currentDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  onPreviousDay,
  onNextDay,
  dayDisplay,
  showBack,
  onBack,
}) => {
  return (
    <Paper 
      elevation={3} 
      sx={(theme) => ({ 
        p: 3, 
        mb: 3, 
        borderRadius: 4,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[900]} 100%)`
          : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
        border: `1px solid ${theme.palette.divider}`
      })}
    >
  <Stack spacing={3}>
        {/* Навигация по дням */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showBack && (
              <IconButton
                onClick={onBack}
                size="large"
                sx={{
                  backgroundColor: 'transparent',
                  color: 'text.primary',
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}

            <IconButton 
              onClick={onPreviousDay} 
              size="large"
              sx={{ 
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { backgroundColor: 'primary.dark' }
              }}
            >
              <ChevronLeft />
            </IconButton>
          </Box>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {dayDisplay}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Листайте для навигации
            </Typography>
          </Box>
          <IconButton 
            onClick={onNextDay} 
            size="large"
            sx={{ 
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { backgroundColor: 'primary.dark' }
            }}
          >
            <ChevronRight />
          </IconButton>
        </Stack>
        
        {/* Дата-пикер */}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
          <DatePicker
            label="📅 Выберите день"
            value={currentDate}
            onChange={onDateChange}
                          slotProps={{
                textField: {
                  size: 'medium',
                  fullWidth: true,
                  variant: 'outlined',
                  sx: (theme) => ({
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: theme.palette.background.default,
                    }
                  })
                },
              }}
          />
        </LocalizationProvider>
        
        {/* Табы режимов */}
                 <Box 
           sx={(theme) => ({ 
             backgroundColor: theme.palette.background.paper, 
             borderRadius: 3,
             p: 0.5,
             border: `1px solid ${theme.palette.divider}`
           })}
         >
          <Tabs 
            value={viewMode} 
            onChange={onViewModeChange} 
            variant="fullWidth"
            textColor="primary"
            sx={(theme) => ({
              '& .MuiTabs-indicator': {
                display: 'none', // Убираем стандартный индикатор
              },
              '& .MuiTab-root': {
                borderRadius: 2,
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '0.9rem',
                color: theme.palette.text.secondary,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}20`,
                  color: theme.palette.primary.main
                }
              },
              '& .Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  color: theme.palette.primary.contrastText
                }
              }
            })}
          >
            <Tab label="📋 Шаблон" value="scheduleTemplate" />
            <Tab label="🏃‍♂️ Тренировки" value="actualTrainings" />
          </Tabs>
        </Box>
      </Stack>
    </Paper>
  );
};

interface TrainingCardProps {
  training: any;
  day: string;
  time: string;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ training, time }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  // Форматируем время из HH:MM:SS в HH:MM
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Берем только HH:MM
  };

  // Получаем цвет типа тренировки
  const trainingTypeColor = training.training_type?.color || '#1976d2';
  
  // Информация о тренере
  const trainerName = training.responsible_trainer 
    ? `${training.responsible_trainer.first_name || ''} ${training.responsible_trainer.last_name || ''}`.trim()
    : 'Не назначен';

  // Список студентов
  const students = training.assigned_students || [];

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card 
      elevation={3}
      sx={(theme) => ({ 
        mb: 2, 
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, ${trainingTypeColor}20 0%, ${theme.palette.background.paper} 100%)`
          : `linear-gradient(135deg, ${trainingTypeColor}15 0%, ${theme.palette.background.paper} 100%)`,
        border: `2px solid ${trainingTypeColor}`,
        borderRadius: 4,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${trainingTypeColor}30`
        }
      })}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: expanded ? 3 : 3 } }}>
        {/* Основная информация */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Stack direction="row" alignItems="center" spacing={1} flex={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: trainingTypeColor,
                flexShrink: 0
              }}
            />
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              {training.training_type?.name || 'Тренировка'}
            </Typography>
          </Stack>
          <Chip 
            label={formatTime(time)} 
            size="small" 
            sx={{ 
              fontSize: '0.9rem',
              fontWeight: 'bold',
              backgroundColor: trainingTypeColor,
              color: 'white',
              '& .MuiChip-label': { px: 2 }
            }}
          />
        </Stack>
        
        {/* Тренер */}
        <Stack direction="row" alignItems="center" mb={2}>
          <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: trainingTypeColor }}>
            👨‍🏫
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {trainerName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Тренер
            </Typography>
          </Box>
        </Stack>

        {/* Кнопка раскрытия */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            👥 {students.length} студент{students.length === 1 ? '' : students.length > 4 ? 'ов' : 'а'}
          </Typography>
          <IconButton
            onClick={handleExpandClick}
            sx={{
              backgroundColor: `${trainingTypeColor}10`,
              '&:hover': { backgroundColor: `${trainingTypeColor}20` }
            }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>

        {/* Раскрывающийся блок со студентами */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${trainingTypeColor}30` }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
              Студенты:
            </Typography>
            {students.length > 0 ? (
              <Stack spacing={1}>
                                 {students.map((studentTemplate: TrainingStudentTemplate, index: number) => (
                  <Stack key={index} direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: `${trainingTypeColor}40`, fontSize: '0.75rem' }}>
                      {studentTemplate.student.first_name?.charAt(0) || '?'}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {`${studentTemplate.student.first_name || ''} ${studentTemplate.student.last_name || ''}`.trim() || 'Без имени'}
                      </Typography>
                      {studentTemplate.is_frozen && (
                        <Chip 
                          label="Заморожен" 
                          size="small" 
                          color="warning" 
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                    </Box>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Студенты не записаны
              </Typography>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

interface MobileCalendarShellProps {
  currentDate: Dayjs;
  viewMode: CalendarViewMode;
  templatesData?: any[];
  actualData?: any[];
  isLoading: boolean;
  error: any;
}

const MobileCalendarShell: React.FC<MobileCalendarShellProps> = ({
  currentDate,
  viewMode,
  templatesData,
  actualData,
  isLoading,
  error,
}) => {
  const dayTrainings = useMemo(() => {
    const data = viewMode === 'scheduleTemplate' ? templatesData : actualData;
    if (!data) return [];

    let trainings: any[];
    
    if (viewMode === 'scheduleTemplate') {
      // Для шаблонов данные уже отфильтрованы API по дню
      trainings = data;
    } else {
      // Для реальных тренировок фильтруем по дате
      const dayKey = currentDate.format('YYYY-MM-DD');
      trainings = data.filter((training: any) => {
        return dayjs(training.date).format('YYYY-MM-DD') === dayKey;
      });
    }

    // Сортируем тренировки по времени (создаем копию массива)
    return [...trainings].sort((a, b) => {
      const timeA = a.start_time || a.time;
      const timeB = b.start_time || b.time;
      return timeA.localeCompare(timeB);
    });
  }, [currentDate, viewMode, templatesData, actualData]);

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="300px"
        sx={{ textAlign: 'center' }}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: 'primary.main',
            mb: 2
          }} 
        />
        <Typography variant="h6" color="primary.main" sx={{ mb: 1, fontWeight: 'bold' }}>
          Загружаем тренировки...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ⏳ Подождите немного
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper 
        elevation={2}
        sx={(theme) => ({ 
          p: 4, 
          textAlign: 'center', 
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.error.dark}20 0%, ${theme.palette.background.paper} 100%)`
            : `linear-gradient(135deg, ${theme.palette.error.light}20 0%, ${theme.palette.background.paper} 100%)`,
          borderRadius: 4,
          border: `2px solid ${theme.palette.error.light}`
        })}
      >
        <Typography sx={{ fontSize: '3rem', mb: 2 }}>😔</Typography>
        <Typography color="error" variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Ошибка загрузки данных
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Что-то пошло не так при загрузке расписания
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          💡 Попробуйте обновить страницу или проверьте интернет-соединение
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ minHeight: '400px' }}>
      {dayTrainings.length > 0 ? (
        <Stack spacing={2}>
          {dayTrainings.map((training, index) => (
            <TrainingCard
              key={`training-${index}`}
              training={training}
              day={currentDate.format('dddd, DD MMMM')}
              time={training.start_time || training.time || ''}
            />
          ))}
        </Stack>
      ) : (
        <Card 
          elevation={1}
          sx={(theme) => ({ 
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.background.paper} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.light}10 0%, ${theme.palette.background.paper} 100%)`,
            textAlign: 'center', 
            py: 6,
            borderRadius: 4,
            border: `2px dashed ${theme.palette.divider}`
          })}
        >
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2, fontSize: '3rem' }}>
              🏖️
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{ mb: 1, fontWeight: 'bold' }}>
              Свободный день!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              На этот день тренировки не запланированы
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
              Время для отдыха и восстановления ✨
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

const MobileCalendarV2Page: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const dateParam = params.get('date');
  const initialDate = dateParam ? dayjs(dateParam) : dayjs();

  const [currentDate, setCurrentDate] = useState<Dayjs>(initialDate);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('scheduleTemplate');
  const navigate = useNavigate();

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setCurrentDate(date);
    }
  };

  const handleViewModeChange = (
    _: React.SyntheticEvent,
    newValue: CalendarViewMode,
  ) => {
    setViewMode(newValue);
  };

  const handlePreviousDay = () => {
    setCurrentDate(prevDate => prevDate.subtract(1, 'day'));
  };

  const handleNextDay = () => {
    setCurrentDate(prevDate => prevDate.add(1, 'day'));
  };

  const dayDisplay = useMemo(() => {
    return currentDate.format('dddd, DD MMMM YYYY');
  }, [currentDate]);

  // Для актуальных тренировок загружаем данные только на текущий день
  const realTrainingsParams = useMemo(() => ({
    startDate: currentDate.format('YYYY-MM-DD'),
    endDate: currentDate.format('YYYY-MM-DD'),
  }), [currentDate]);

  // Для шаблонов запрашиваем только тренировки на текущий день
  const currentDayNumber = useMemo(() => {
    return currentDate.day() === 0 ? 7 : currentDate.day(); // 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
  }, [currentDate]);

  const fromParam = params.get('from');
  const showBack = fromParam === 'week';
  const handleBack = () => {
    // Go back to the mobile full week calendar
    navigate('/home/calendar-full');
  };

  const {
    data: scheduleTemplates,
    isLoading: isLoadingTemplates,
    error: errorTemplates,
  } = useGetTrainingTemplatesQuery(
    viewMode === 'scheduleTemplate' ? { dayNumber: currentDayNumber } : undefined,
    {
      skip: viewMode !== 'scheduleTemplate',
    }
  );

  const {
    data: actualTrainings,
    isLoading: isLoadingActual,
    error: errorActual,
  } = useGetRealTrainingsQuery(realTrainingsParams, {
    skip: viewMode !== 'actualTrainings',
  });

  const isLoading = viewMode === 'scheduleTemplate' ? isLoadingTemplates : isLoadingActual;
  const error = viewMode === 'scheduleTemplate' ? errorTemplates : errorActual;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Box 
        sx={(theme) => ({ 
          minHeight: '100vh',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
            : `linear-gradient(180deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[200]} 100%)`,
          p: 2, 
          pb: 10 
        })}
      >
        <MobileCalendarControlsHeader
          currentDate={currentDate}
          onDateChange={handleDateChange}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          dayDisplay={dayDisplay}
          showBack={showBack}
          onBack={handleBack}
        />
        <MobileCalendarShell 
          currentDate={currentDate}
          viewMode={viewMode}
          templatesData={scheduleTemplates}
          actualData={actualTrainings}
          isLoading={isLoading}
          error={error}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default MobileCalendarV2Page; 