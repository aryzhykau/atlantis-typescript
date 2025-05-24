import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Dayjs } from 'dayjs';
import { CalendarViewMode } from './CalendarV2Page'; // Предполагается, что типы там же
import { TrainingTemplate } from '../models/trainingTemplate';
import { RealTraining } from '../models/realTraining';

interface CalendarShellProps {
  currentDate: Dayjs;
  viewMode: CalendarViewMode;
  templatesData?: TrainingTemplate[];
  actualData?: RealTraining[];
  isLoading: boolean;
  error?: any; // Можно уточнить тип ошибки, если он известен
}

const CalendarShell: React.FC<CalendarShellProps> = ({
  currentDate,
  viewMode,
  templatesData,
  actualData,
  isLoading,
  error,
}) => {
  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6">CalendarShell</Typography>
      <Typography>Current Date: {currentDate.format('YYYY-MM-DD')}</Typography>
      <Typography>View Mode: {viewMode}</Typography>
      {isLoading && <Typography>Loading data...</Typography>}
      {error && <Typography color="error">Error: {JSON.stringify(error)}</Typography>}
      {viewMode === 'scheduleTemplate' && templatesData && (
        <Box mt={2}>
          <Typography variant="subtitle1">Template Data:</Typography>
          {/* <pre>{JSON.stringify(templatesData, null, 2)}</pre> */}
          <Typography>Загружено {templatesData.length} шаблонов.</Typography>
        </Box>
      )}
      {viewMode === 'actualTrainings' && actualData && (
        <Box mt={2}>
          <Typography variant="subtitle1">Actual Trainings Data:</Typography>
          {/* <pre>{JSON.stringify(actualData, null, 2)}</pre> */}
          <Typography>Загружено {actualData.length} актуальных тренировок.</Typography>
        </Box>
      )}
      {/* Здесь будет основная логика отображения сетки календаря */}
    </Paper>
  );
};

export default CalendarShell; 