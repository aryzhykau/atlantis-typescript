import React from 'react';
import { Paper, Typography } from '@mui/material';
import dayjs from 'dayjs'; // Нужен для hexToRgb, если он останется здесь
import { CalendarEvent } from './CalendarShell'; // Предполагаем, что CalendarEvent останется в CalendarShell или будет вынесен
// import { TrainingTemplate } from '../models/trainingTemplate'; // Если CalendarEvent не будет импортироваться
// import { RealTraining } from '../models/realTraining'; // Если CalendarEvent не будет импортироваться

// Если CalendarEvent не импортируется из CalendarShell, нужно будет его определить здесь:
// export type CalendarEvent = TrainingTemplate | RealTraining;

interface TrainingCardProps {
  event: CalendarEvent;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ event }) => {
  let title = 'Тренировка';
  let cardColor = '#e0e0e0';
  let textColor = '#000';

  if (event.training_type) {
    title = event.training_type.name;
    cardColor = event.training_type.color || cardColor;
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

  return (
    <Paper 
      elevation={1} 
      sx={{
        p: 0.5, 
        mb: 0.5, 
        backgroundColor: cardColor, 
        color: textColor,
        fontSize: '0.75rem',
        lineHeight: '1.2',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: 'pointer', // Добавляем указатель для кликабельности
        transition: 'transform 0.1s ease-in-out',
        '&:hover': {
          transform: 'scale(1.03)',
        }
      }}
    >
      <Typography variant="caption" component="div" sx={{ fontWeight: 'bold', color: 'inherit' }}>
        {title}
      </Typography>
      {/* Можно добавить время или имя тренера, если есть место или в режиме popover */}
      {/* <Typography variant="caption" component="div" sx={{ fontSize: '0.65rem', color: 'inherit' }}>
        { (event as any).trainer?.name || 'Нет тренера' }
      </Typography> */}
    </Paper>
  );
};

export default TrainingCard; 