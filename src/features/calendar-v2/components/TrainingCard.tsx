import React from 'react';
import { Paper, Typography, Box, IconButton, useTheme, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs'; // Нужен для hexToRgb, если он останется здесь
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SportsIcon from '@mui/icons-material/Sports';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Иконка для кнопки "развернуть"
// import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Убираем иконку времени
import { CalendarEvent, isRealTraining, isTrainingTemplate } from './CalendarShell'; // Предполагаем, что CalendarEvent останется в CalendarShell или будет вынесен
// import { TrainingTemplate } from '../models/trainingTemplate'; // Если CalendarEvent не будет импортироваться
// import { RealTraining } from '../models/realTraining'; // Если CalendarEvent не будет импортироваться

// Если CalendarEvent не импортируется из CalendarShell, нужно будет его определить здесь:
// export type CalendarEvent = TrainingTemplate | RealTraining;

interface TrainingCardProps {
  event: CalendarEvent;
  variant?: 'full' | 'stacked_preview';
  isInPopover?: boolean;
  showExpandButton?: boolean;
  onExpandClick?: (eventData: CalendarEvent) => void;
}

// Утилита для преобразования hex в rgb, вынесем для чистоты
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const TrainingCard: React.FC<TrainingCardProps> = ({ event, variant = 'full', isInPopover = false, showExpandButton = false, onExpandClick }) => {
  const theme = useTheme();
  const isStackedPreview = variant === 'stacked_preview';

  let title = 'Тренировка';
  const typeColor = event.training_type?.color || theme.palette.divider;

  if (event.training_type) {
    title = event.training_type.name;
  }

  let trainerName = 'Нет тренера';
  if (isTrainingTemplate(event) && event.responsible_trainer) {
    trainerName = `${event.responsible_trainer.first_name || ''} ${event.responsible_trainer.last_name ? event.responsible_trainer.last_name.charAt(0) + '.' : ''}`.trim();
    if (trainerName === '.') trainerName = 'Нет данных';
  } else if (isRealTraining(event) && event.trainer) {
    trainerName = `${event.trainer.first_name || ''} ${event.trainer.last_name ? event.trainer.last_name.charAt(0) + '.' : ''}`.trim();
    if (trainerName === '.') trainerName = 'Нет данных';
  }

  let studentCount = 0;
  let studentNames: string[] = [];
  if (isTrainingTemplate(event) && event.assigned_students) {
    studentCount = event.assigned_students.length;
    studentNames = event.assigned_students.map(s => `${s.student.first_name || ''} ${s.student.last_name || ''}`.trim()).filter(name => name);
  } else if (isRealTraining(event) && event.students) {
    studentCount = event.students.length;
    studentNames = event.students.map(s => `${s.student.first_name || ''} ${s.student.last_name || ''}`.trim()).filter(name => name);
  }

  // Определяем цвета - теперь они одинаковы для всех вариантов,
  // за исключением того, что stacked_preview не отображает текст.
  const cardBackgroundColor = theme.palette.background.paper;
  const mainTextColor = theme.palette.text.primary;
  const borderColor = typeColor;
  const borderWidth = '1px'; // Единая толщина рамки

  const handleExpandButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpandClick) {
      onExpandClick(event);
    }
  };

  return (
    <Paper 
      elevation={isInPopover ? 1 : 2} 
      sx={{
        position: 'relative',
        backgroundColor: cardBackgroundColor,
        color: mainTextColor, 
        border: `${borderWidth} solid ${borderColor}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
        '&:hover': {
          transform: isStackedPreview ? 'none' : 'scale(1.02)', 
          boxShadow: isStackedPreview ? 'none' : (isInPopover ? theme.shadows[3] : theme.shadows[5]),
        },
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isStackedPreview ? 'center' : 'space-between',
        boxSizing: 'border-box',
        p: 0,
      }}
    >
      {/* Контент отображается только если это не stacked_preview */}
      {!isStackedPreview && (
        <>
          {showExpandButton && variant === 'full' && (
            <IconButton
              size="small"
              onClick={handleExpandButtonClick}
              sx={{
                position: 'absolute',
                top: 1,
                right: 1,
                padding: '2px',
                color: typeColor, 
                zIndex: 1,
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: alpha(typeColor, 0.1),
                }
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          )}
          <Box 
            display="flex" 
            flexDirection="column" 
            justifyContent="space-between" 
            sx={{ 
              height: '100%', 
              p: 0.5,
              boxSizing: 'border-box',
            }}
          >
            <Typography 
              variant="caption" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                color: 'inherit',
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                pr: showExpandButton ? '18px' : 0, 
              }}
            >
              {title}
            </Typography>
            
            <Box sx={{ mt: 0.5, display: 'flex', flexDirection: isInPopover && studentNames.length > 0 ? 'column' : 'row', justifyContent: 'space-between', alignItems: isInPopover ? 'flex-start' : 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: 'inherit', minWidth: 0 }}>
                <SportsIcon sx={{ fontSize: '0.85rem', mr: 0.5, color: typeColor }} />
                <Typography variant="caption" component="div" sx={{ fontSize: '0.7rem', color: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {trainerName}
                </Typography>
              </Box>
              
              {studentCount > 0 && !isInPopover && (
                <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', color: 'inherit', ml: 0.5 }}>
                  <PeopleAltOutlinedIcon sx={{ fontSize: '0.85rem', mr: 0.5, color: typeColor }} />
                  {studentCount}
                </Box>
              )}
            </Box>

            {isInPopover && studentNames.length > 0 && (
              <>
                <Divider sx={{my: 0.5, borderColor: alpha(mainTextColor, 0.2)}}/>
                <Box sx={{ fontSize: '0.7rem', color: 'inherit', mt: 0.5, width: '100%' }}>
                  <Typography variant="body2" sx={{mb:0.5, fontWeight:'medium', color: 'inherit'}}>Участники ({studentNames.length}):</Typography>
                  <Box sx={{maxHeight: '60px', overflowY: 'auto'}}>
                    {studentNames.map((name, index) => (
                      <Typography key={index} variant="caption" component="div" sx={{ fontSize: '0.7rem', color: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {name}
                      </Typography>
                    ))}
                  </Box>
                  {studentNames.length === 0 && <Typography variant="caption" sx={{color:'text.secondary', fontStyle:'italic'}}>Нет участников</Typography>}
                </Box>
              </>
            )}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default TrainingCard; 