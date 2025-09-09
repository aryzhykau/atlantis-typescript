import React from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SportsIcon from '@mui/icons-material/Sports';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { CalendarEvent, isRealTraining, isTrainingTemplate } from './CalendarShell';

interface TrainingCardProps {
  event: CalendarEvent;
  variant?: 'full' | 'stacked_preview';
  isInPopover?: boolean;
  showExpandButton?: boolean;
  onExpandClick?: (eventData: CalendarEvent) => void;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ event, variant = 'full', isInPopover = false, showExpandButton = false, onExpandClick }) => {
  const theme = useTheme();
  const isStackedPreview = variant === 'stacked_preview';

  let title = 'Тренировка';
  const typeColor = event.training_type?.color || theme.palette.primary.main;

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

  // Улучшенная цветовая схема для лучшей читаемости
  const cardBackgroundColor = theme.palette.background.paper; // Всегда используем стандартный фон темы
  
  // Используем цвет типа тренировки только для левой границы
  const leftBorderColor = typeColor;
  const leftBorderWidth = isStackedPreview ? '3px' : '4px';
  
  // Стандартный цвет текста для максимальной читаемости
  const textColor = theme.palette.text.primary;
  
  // Убираем градиенты и прозрачные фоны - только solid цвета
  const solidBackground = cardBackgroundColor;

  const handleExpandButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpandClick) {
      onExpandClick(event);
    }
  };

  return (
    <Paper 
      elevation={isInPopover ? 1 : (isStackedPreview ? 1 : 2)} 
      sx={{
        position: 'relative',
        background: solidBackground,
        color: textColor, 
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        // Убираем основные границы, оставляем только левую цветную
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderLeft: `${leftBorderWidth} solid ${leftBorderColor}`,
        transition: theme.transitions.create(
          ['transform', 'box-shadow'], 
          {
            duration: theme.transitions.duration.short,
            easing: theme.transitions.easing.easeInOut,
          }
        ),
        '&:hover': {
          transform: isStackedPreview ? 'none' : 'translateY(-2px)', 
          boxShadow: isStackedPreview 
            ? 'none' 
            : `0 4px 12px ${alpha(leftBorderColor, 0.15)}, 0 1px 4px ${alpha(leftBorderColor, 0.08)}`,
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
                top: 4,
                right: 4,
                padding: '4px',
                color: isInPopover ? typeColor : textColor, 
                zIndex: 2,
                backgroundColor: alpha(typeColor, 0.1),
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: alpha(typeColor, 0.2),
                  transform: 'scale(1.1)',
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
              p: isInPopover ? 0.5 : 1,
              pl: isInPopover ? 1 : 1.5, // Увеличенный отступ слева для цветной левой границы
              boxSizing: 'border-box',
            }}
          >
            <Typography 
              variant="subtitle2" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                fontSize: isInPopover ? '0.8rem' : '0.9rem',
                color: typeColor,
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                pr: showExpandButton ? '28px' : 0,
                mb: 0.5,
                letterSpacing: '0.025em',
              }}
            >
              {title}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isInPopover && studentNames.length > 0 ? 'column' : 'row', 
              justifyContent: 'space-between', 
              alignItems: isInPopover ? 'flex-start' : 'center',
              gap: 1,
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                minWidth: 0,
                flex: 1,
              }}>
                <SportsIcon sx={{ 
                  fontSize: '1rem', 
                  mr: 0.75, 
                  color: alpha(theme.palette.text.secondary, 0.7),
                }} />
                <Typography variant="body2" component="div" sx={{ 
                  fontSize: '0.75rem', 
                  color: theme.palette.text.secondary,
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  fontWeight: 500,
                }}>
                  {trainerName}
                </Typography>
              </Box>
              
              {studentCount > 0 && !isInPopover && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: alpha(typeColor, 0.1),
                  borderRadius: 1,
                  px: 0.75,
                  py: 0.25,
                  border: `1px solid ${alpha(typeColor, 0.2)}`,
                }}>
                  <PeopleAltOutlinedIcon sx={{ 
                    fontSize: '0.875rem', 
                    mr: 0.5, 
                    color: typeColor 
                  }} />
                  <Typography variant="caption" sx={{ 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: typeColor,
                  }}>
                  {studentCount}
                  </Typography>
                </Box>
              )}
            </Box>

            {isInPopover && studentNames.length > 0 && (
              <>
                {/* <Divider sx={{my: 0.5, borderColor: alpha(textColor, 0.2)}}/> */}
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
      
      {/* Для stacked_preview показываем минималистичный дизайн */}
      {isStackedPreview && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: solidBackground, // Используем solid фон вместо прозрачного
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Левая граница уже добавлена в Paper
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: leftBorderColor,
              fontWeight: 600,
              fontSize: '0.7rem',
              textAlign: 'center',
              letterSpacing: '0.025em',
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TrainingCard; 