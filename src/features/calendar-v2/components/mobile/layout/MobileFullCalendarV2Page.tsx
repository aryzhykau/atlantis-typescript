import React, { useState, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import { CalendarViewMode } from '../../desktop/layout/CalendarV2Page';
import {
  useGetTrainingTemplatesQuery,
  useGetRealTrainingsQuery,
} from '../../../../../store/apis/calendarApi-v2';
import AnimatedLogoLoader from '../../common/loaders/AnimatedLogoLoader';
import { MobileTimeGrid } from '../time-grid';
import WeekdaySelector from '../controls/WeekdaySelector';
import TabsContainer from '../controls/TabsContainer';
import MobileMonthPickerOverlay from '../controls/MobileMonthPickerOverlay';
import TrainingTemplateForm from '../../shared/forms/TrainingTemplateForm';
import { normalizeEventsForWeek } from '../../../utils/normalizeEventsForWeek';

// Mobile full calendar: reuse CalendarShell but adapt paddings to mobile
const MobileFullCalendarV2Page: React.FC = () => {
  const [weekStart, setWeekStart] = useState(dayjs().startOf('isoWeek'));
  const [selectedDay, setSelectedDay] = useState<Dayjs>(dayjs());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('scheduleTemplate');
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [isTrainingFormOpen, setIsTrainingFormOpen] = useState(false);

  const realTrainingsParams = useMemo(() => ({
    startDate: weekStart.format('YYYY-MM-DD'),
    endDate: weekStart.endOf('isoWeek').format('YYYY-MM-DD'),
  }), [weekStart]);

  const { data: scheduleTemplates, isLoading: isLoadingTemplates } = useGetTrainingTemplatesQuery(undefined, {
    skip: viewMode !== 'scheduleTemplate',
  });

  const { data: actualTrainings, isLoading: isLoadingActual } = useGetRealTrainingsQuery(realTrainingsParams, {
    skip: viewMode !== 'actualTrainings',
  });

  // Normalize events for the week view based on current view mode
  const normalizedEvents = useMemo(() => {
    const events = viewMode === 'scheduleTemplate' ? scheduleTemplates || [] : actualTrainings || [];
    return normalizeEventsForWeek(events, weekStart);
  }, [viewMode, scheduleTemplates, actualTrainings, weekStart]);

  const isLoading = viewMode === 'scheduleTemplate' ? !!isLoadingTemplates : !!isLoadingActual;

  // Ensure selected day is within the current week when week changes
  useEffect(() => {
    if (!selectedDay.isBetween(weekStart, weekStart.endOf('isoWeek'), 'day', '[]')) {
      // If selected day is outside current week, default to today if it's in the week, otherwise Monday
      const today = dayjs();
      if (today.isBetween(weekStart, weekStart.endOf('isoWeek'), 'day', '[]')) {
        setSelectedDay(today);
      } else {
        setSelectedDay(weekStart);
      }
    }
  }, [weekStart, selectedDay, setSelectedDay]);

  // Handle day selection
  const handleDaySelect = (day: Dayjs) => {
    setSelectedDay(day);
    // If selected day is outside current week, navigate to that week
    const dayWeekStart = day.startOf('isoWeek');
    if (!dayWeekStart.isSame(weekStart, 'day')) {
      setWeekStart(dayWeekStart);
    }
  };

  // Handle view mode change
  const handleViewModeChange = (mode: CalendarViewMode) => {
    setViewMode(mode);
  };

  // Handle training form
  const handleAddTraining = () => {
    setIsTrainingFormOpen(true);
  };

  const handleCloseTrainingForm = () => {
    setIsTrainingFormOpen(false);
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh', // occupy the full viewport so inner scroll doesn't move page header
          overflow: 'hidden',
          p: 1,
          gap: 0.5,
        }}
      >
        {/* Sticky header: Tabs + Weekday selector stay fixed at the top */}
        <Box
          sx={(theme) => ({
            position: 'sticky',
            top: 0,
            zIndex: theme.zIndex.appBar + 2,
            bgcolor: theme.palette.background.paper,
            WebkitBackdropFilter: 'blur(4px)',
            // Reset child margins so sticky header size is predictable
            display: 'flex',
            flexDirection: 'column',
            px: 0.5,
            py: 0.5,
            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            '& > *': {
              marginBottom: 0,
            },
          })}
        >
          <TabsContainer
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onOpenMonthPicker={() => setMonthPickerOpen(true)}
            onAddTraining={handleAddTraining}
          />

          <WeekdaySelector
            weekStart={weekStart}
            selectedDay={selectedDay}
            onDaySelect={handleDaySelect}
          />
        </Box>

        {/* Time Grid (only this area scrolls) */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <MobileTimeGrid
            eventsMap={normalizedEvents}
            selectedDay={selectedDay}
          />
        </Box>

        {/* Loader overlay: blocks interactions when fetching templates or real trainings */}
        <AnimatedLogoLoader open={isLoading} message={viewMode === 'scheduleTemplate' ? 'Загружаются шаблоны...' : 'Загружаются тренировки...'} />

        {/* Month Picker Overlay */}
        <MobileMonthPickerOverlay
          open={monthPickerOpen}
          selectedDate={selectedDay}
          onSelect={(date) => {
            if (date) {
              handleDaySelect(date);
              setMonthPickerOpen(false);
            }
          }}
          onClose={() => setMonthPickerOpen(false)}
        />

        {/* Training Template Form */}
        <TrainingTemplateForm
          open={isTrainingFormOpen}
          onClose={handleCloseTrainingForm}
          selectedDate={selectedDay}
          selectedTime="08:00"
        />
      </Box>
    </LocalizationProvider>
  );
};

export default MobileFullCalendarV2Page;
