import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import dayjs from 'dayjs'; // Нужен для hexToRgb, если он останется здесь
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
// import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Убираем иконку времени
import { CalendarEvent, isRealTraining, isTrainingTemplate } from './CalendarShell'; // Предполагаем, что CalendarEvent останется в CalendarShell или будет вынесен
// import { TrainingTemplate } from '../models/trainingTemplate'; // Если CalendarEvent не будет импортироваться
// import { RealTraining } from '../models/realTraining'; // Если CalendarEvent не будет импортироваться

// Если CalendarEvent не импортируется из CalendarShell, нужно будет его определить здесь:
// export type CalendarEvent = TrainingTemplate | RealTraining;

interface TrainingCardProps {
  event: CalendarEvent;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ event }) => {
  // Восстанавливаем логику определения title, cardColor, textColor
  let title = 'Тренировка';
  let cardColor = '#e0e0e0';
  let textColor = '#000';

  let trainerName = 'Нет тренера';
  let studentCount = 0;

  if (event.training_type) {
    
    title = event.training_type.name;
    cardColor = event.training_type.color || cardColor;
    
  }

  if (isTrainingTemplate(event) && event.responsible_trainer) {
    trainerName = `${event.responsible_trainer.first_name || ''} ${event.responsible_trainer.last_name ? event.responsible_trainer.last_name.charAt(0) + '.' : ''}`.trim();
    if (trainerName === '.') trainerName = 'Нет данных';
  } else if (isRealTraining(event) && event.trainer) {
    trainerName = `${event.trainer.first_name || ''} ${event.trainer.last_name ? event.trainer.last_name.charAt(0) + '.' : ''}`.trim();
    if (trainerName === '.') trainerName = 'Нет данных';
  }

  if (isTrainingTemplate(event) && event.assigned_students) {
    studentCount = event.assigned_students.length;
  } else if (isRealTraining(event) && event.students) {
    studentCount = event.students.length;
  }
  
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  const rgb = hexToRgb(cardColor);
  if (rgb) {
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    textColor = brightness > 128 ? '#000' : '#fff';
  }

  // TODO: Добавить отображение тренера, времени и другую информацию
  // TODO: Реализовать свернутое состояние для "стопки"

  // const displayTime = event.start_time.substring(0, 5); // HH:MM - Убираем

  return (
    <Paper 
      elevation={1} 
      sx={{
        p: 0.5, 
        backgroundColor: cardColor, 
        color: textColor,
        fontSize: '0.75rem',
        lineHeight: '1.2',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.1s ease-in-out',
        '&:hover': {
          transform: 'scale(1.03)',
        },
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box display="flex" justifyContent="space-between" flexDirection={"column"}>
        <Typography variant="caption" component="div" sx={{ fontWeight: 'bold', color: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="caption" component="div" sx={{ fontSize: '0.7rem', color: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {trainerName}
          </Typography>
          {studentCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: 'inherit', mt: 0.25 }}>
              <PeopleAltOutlinedIcon sx={{ fontSize: '0.85rem', mr: 0.5, color: 'inherit' }} />
              {studentCount}
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default TrainingCard; 