import React, { useState, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import { CalendarViewMode } from './CalendarV2Page';
import {
  useGetTrainingTemplatesQuery,
  useGetRealTrainingsQuery,
} from '../../../store/apis/calendarApi-v2';
import MobileWeekTimeGrid from './MobileWeekTimeGrid';
import WeekdaySelector from './WeekdaySelector';
import TabsContainer from './TabsContainer';
import MobileMonthPickerOverlay from './MobileMonthPickerOverlay';
import { normalizeEventsForWeek } from '../utils/normalizeEventsForWeek';

// Mobile full calendar: reuse CalendarShell but adapt paddings to mobile
const MobileFullCalendarV2Page: React.FC = () => {
  const [weekStart, setWeekStart] = useState(dayjs().startOf('isoWeek'));
  const [selectedDay, setSelectedDay] = useState<Dayjs>(dayjs());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('scheduleTemplate');
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const realTrainingsParams = useMemo(() => ({
    startDate: weekStart.format('YYYY-MM-DD'),
    endDate: weekStart.endOf('isoWeek').format('YYYY-MM-DD'),
  }), [weekStart]);

  const { data: scheduleTemplates } = useGetTrainingTemplatesQuery(undefined, {
    skip: viewMode !== 'scheduleTemplate',
  });

  const { data: actualTrainings } = useGetRealTrainingsQuery(realTrainingsParams, {
    skip: viewMode !== 'actualTrainings',
  });

  // Normalize events for the week view based on current view mode
  const normalizedEvents = useMemo(() => {
    const events = viewMode === 'scheduleTemplate' ? scheduleTemplates || [] : actualTrainings || [];
    return normalizeEventsForWeek(events, weekStart);
  }, [viewMode, scheduleTemplates, actualTrainings, weekStart]);

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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
          <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        p: 1,
        gap: 0.5,
      }}
    >
        {/* Tabs Container with Month Picker and View Mode */}
        <TabsContainer
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onOpenMonthPicker={() => setMonthPickerOpen(true)}
        />
        
        {/* Weekday Selector */}
        <WeekdaySelector
          weekStart={weekStart}
          selectedDay={selectedDay}
          onDaySelect={handleDaySelect}
        />

        {/* Time Grid */}
        <MobileWeekTimeGrid
          eventsMap={normalizedEvents}
          selectedDay={selectedDay}
        />

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
      </Box>
    </LocalizationProvider>
  );
};

export default MobileFullCalendarV2Page;
