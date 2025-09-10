import React, { memo } from 'react';
import { Paper } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Dayjs } from 'dayjs';
import { CalendarViewMode } from '../CalendarV2Page';
import { TrainingTemplate } from '../../models/trainingTemplate';
import { RealTraining } from '../../models/realTraining';
import { CalendarErrorBoundary } from '../CalendarErrorBoundary';
import { CalendarGrid } from '../CalendarGrid';
import { CalendarModals } from '../CalendarModals';
import { CalendarLoadingError } from '../CalendarLoadingError/CalendarLoadingError';
import { useCalendarContainer } from '../../hooks/useCalendarContainer';

interface CalendarShellProps {
  currentDate: Dayjs;
  viewMode: CalendarViewMode;
  templatesData?: TrainingTemplate[];
  actualData?: RealTraining[];
  isLoading: boolean;
  error?: any;
}

/**
 * Main calendar container component
 * Orchestrates all calendar functionality
 */
const CalendarShell: React.FC<CalendarShellProps> = memo(({
  currentDate,
  viewMode,
  templatesData,
  actualData,
  isLoading,
  error,
}) => {
  const {
    eventsToDisplay,
    calendarState,
    calendarActions,
    handlers,
    paperScrollRef,
  } = useCalendarContainer({
    currentDate,
    viewMode,
    templatesData,
    actualData,
  });

  return (
    <CalendarErrorBoundary>
      <DndProvider backend={HTML5Backend}>
        <Paper 
          ref={paperScrollRef}
          elevation={3} 
          sx={{
            p: { xs: 1, md: 2 },
            mt: 2, 
            overflow: 'auto',
            maxHeight: '75vh',
            display: 'flex',
            backgroundColor: 'background.paper',
            flexDirection: 'column'
          }}
        >
          <CalendarLoadingError isLoading={isLoading} error={error} />
          
          <CalendarGrid
            currentDate={currentDate}
            viewMode={viewMode}
            eventsToDisplay={eventsToDisplay}
            onSlotClick={handlers.handleSlotClick}
            onEventClick={handlers.handleEventClick}
          />
          
          <CalendarModals
            calendarState={calendarState}
            calendarActions={calendarActions}
          />
        </Paper>
      </DndProvider>
    </CalendarErrorBoundary>
  );
});

export default CalendarShell;
