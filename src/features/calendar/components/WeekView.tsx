import React from 'react';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';

interface WeekViewProps {
  currentDate: dayjs.Dayjs;
  days?: dayjs.Dayjs[];
  trainingsByDay?: Record<string, any[]>;
  trainingTypes?: any[];
  trainers?: any[];
}

const WeekView: React.FC<WeekViewProps> = ({ 
  currentDate, 
  days = [], 
  trainingsByDay = {}, 
  trainingTypes = [], 
  trainers = [] 
}) => {
  const weekDays = days.length > 0 ? days : Array.from({ length: 7 }, (_, i) => 
    currentDate.startOf('week').add(i, 'day')
  );

  return (
    <Box>
      <Typography variant="h6">Недельный вид</Typography>
      {weekDays.map((day, index) => (
        <Box key={index} p={1}>
          <Typography>{day.format('dddd DD.MM')}</Typography>
          {trainingsByDay[day.format('YYYY-MM-DD')]?.map((training, trainingIndex) => (
            <Box key={trainingIndex} ml={2}>
              <Typography variant="body2">{training.title}</Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default WeekView; 