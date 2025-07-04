import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Stack,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/ru';
import CalendarShell from './CalendarShell';
import CalendarSearchBar, { CalendarFilters } from './CalendarSearchBar';
import { 
  filterEvents, 
  createFilterOptionsFromTemplates, 
  createFilterOptionsFromRealTrainings,
  mergeFilterOptions 
} from '../utils/filterUtils';

// Настраиваем dayjs для работы с ISO неделями (понедельник - воскресенье)
dayjs.extend(isoWeek);

dayjs.locale('ru');

export type CalendarViewMode = 'scheduleTemplate' | 'actualTrainings';

import {
  useGetTrainingTemplatesQuery,
  useGetRealTrainingsQuery,
} from '../../../store/apis/calendarApi-v2';

interface CalendarControlsHeaderProps {
  currentDate: Dayjs;
  onDateChange: (date: Dayjs | null) => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (event: React.SyntheticEvent, newValue: CalendarViewMode) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  weekDisplay: string;
}

const CalendarControlsHeader: React.FC<CalendarControlsHeaderProps> = ({
  currentDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  onPreviousWeek,
  onNextWeek,
  weekDisplay,
}) => {
  return (
    <Paper elevation={1} sx={{ p: 1, mb: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={viewMode} onChange={onViewModeChange} aria-label="Режимы календаря">
            <Tab label="Шаблон расписания" value="scheduleTemplate" />
            <Tab label="Актуальные тренировки" value="actualTrainings" />
          </Tabs>
        </Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={onPreviousWeek} aria-label="Предыдущая неделя">
            <ChevronLeft />
          </IconButton>
          <DatePicker
            label="Выберите неделю"
            value={currentDate}
            onChange={onDateChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: '180px' },
              },
            }}
          />
          <IconButton onClick={onNextWeek} aria-label="Следующая неделя">
            <ChevronRight />
          </IconButton>
          <Typography variant="subtitle1" sx={{ minWidth: '180px', textAlign: 'center' }}>
            {weekDisplay}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

const CalendarV2Page: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs().startOf('isoWeek'));
  const [viewMode, setViewMode] = useState<CalendarViewMode>('scheduleTemplate');
  const [filters, setFilters] = useState<CalendarFilters>({
    searchText: '',
    trainerIds: [],
    trainingTypeIds: [],
    studentIds: [],
  });

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setCurrentDate(date.startOf('isoWeek'));
    }
  };

  const handleViewModeChange = (
    event: React.SyntheticEvent,
    newValue: CalendarViewMode,
  ) => {
    setViewMode(newValue);
  };

  const handlePreviousWeek = () => {
    setCurrentDate(prevDate => prevDate.subtract(1, 'week').startOf('isoWeek'));
  };

  const handleNextWeek = () => {
    setCurrentDate(prevDate => prevDate.add(1, 'week').startOf('isoWeek'));
  };

  const weekDisplay = useMemo(() => {
    const start = currentDate.startOf('isoWeek');
    const end = currentDate.endOf('isoWeek');
    return `${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}`;
  }, [currentDate]);

  const realTrainingsParams = useMemo(() => ({
    startDate: currentDate.startOf('isoWeek').format('YYYY-MM-DD'),
    endDate: currentDate.endOf('isoWeek').format('YYYY-MM-DD'),
  }), [currentDate]);

  const {
    data: scheduleTemplates,
    isLoading: isLoadingTemplates,
    error: errorTemplates,
  } = useGetTrainingTemplatesQuery(undefined, {
    skip: viewMode !== 'scheduleTemplate',
  });

  const {
    data: actualTrainings,
    isLoading: isLoadingActual,
    error: errorActual,
  } = useGetRealTrainingsQuery(realTrainingsParams, {
    skip: viewMode !== 'actualTrainings',
  });

  const isLoading = viewMode === 'scheduleTemplate' ? isLoadingTemplates : isLoadingActual;
  const error = viewMode === 'scheduleTemplate' ? errorTemplates : errorActual;

  // Создаем опции для фильтров на основе загруженных данных
  const filterOptions = useMemo(() => {
    if (viewMode === 'scheduleTemplate' && scheduleTemplates) {
      return createFilterOptionsFromTemplates(scheduleTemplates);
    }
    if (viewMode === 'actualTrainings' && actualTrainings) {
      return createFilterOptionsFromRealTrainings(actualTrainings);
    }
    return {
      trainerOptions: [],
      trainingTypeOptions: [],
      studentOptions: [],
    };
  }, [viewMode, scheduleTemplates, actualTrainings]);

  // Фильтруем данные на основе текущих фильтров
  const filteredTemplatesData = useMemo(() => {
    if (!scheduleTemplates) return undefined;
    
    const hasActiveFilters = filters.searchText || 
      filters.trainerIds.length > 0 || 
      filters.trainingTypeIds.length > 0 || 
      filters.studentIds.length > 0;
    
    return hasActiveFilters ? filterEvents(scheduleTemplates, filters) as typeof scheduleTemplates : scheduleTemplates;
  }, [scheduleTemplates, filters]);

  const filteredActualData = useMemo(() => {
    if (!actualTrainings) return undefined;
    
    const hasActiveFilters = filters.searchText || 
      filters.trainerIds.length > 0 || 
      filters.trainingTypeIds.length > 0 || 
      filters.studentIds.length > 0;
    
    return hasActiveFilters ? filterEvents(actualTrainings, filters) as typeof actualTrainings : actualTrainings;
  }, [actualTrainings, filters]);

  // Обработчик изменения фильтров
  const handleFiltersChange = (newFilters: CalendarFilters) => {
    setFilters(newFilters);
  };

  return (
    <Box sx={{ p: 1 }}>
      <CalendarControlsHeader
        currentDate={currentDate}
        onDateChange={handleDateChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        weekDisplay={weekDisplay}
      />
      <CalendarSearchBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        trainerOptions={filterOptions.trainerOptions}
        trainingTypeOptions={filterOptions.trainingTypeOptions}
        studentOptions={filterOptions.studentOptions}
        isLoading={isLoading}
      />
      <CalendarShell 
        currentDate={currentDate}
        viewMode={viewMode}
        templatesData={filteredTemplatesData}
        actualData={filteredActualData}
        isLoading={isLoading}
        error={error}
      />
    </Box>
  );
};

export default CalendarV2Page;