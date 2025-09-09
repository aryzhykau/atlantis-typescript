import React, { useMemo, useCallback, memo } from 'react';
import { Box, Typography, Tooltip, useTheme, alpha } from '@mui/material';
import { CalendarEvent, isRealTraining, isTrainingTemplate } from './CalendarShell';
import { calculateCapacity, formatCapacityText, shouldShowCapacityBadge } from '../utils/capacityUtils';

interface CalendarTrainingChipProps {
  event: CalendarEvent;
  isMobile: boolean;
  isTablet: boolean;
  onEventClick: (event: CalendarEvent) => void;
  isDragActive?: boolean;
}

export const CalendarTrainingChip = memo<CalendarTrainingChipProps>(({ 
  event, 
  isMobile, 
  isTablet, 
  onEventClick, 
  isDragActive = false 
}) => {
  const theme = useTheme();
  
  // Мемоизируем тяжелые вычисления
  const chipData = useMemo(() => {
    const typeColor = event.training_type?.color || theme.palette.primary.main;
    let trainerName = 'Без тренера';
    let studentCount = 0;
    const maxParticipants = event.training_type?.max_participants || null;

    // Получаем информацию о тренере
    if (isTrainingTemplate(event) && event.responsible_trainer) {
      trainerName = `${event.responsible_trainer.first_name || ''} ${event.responsible_trainer.last_name ? event.responsible_trainer.last_name.charAt(0) + '.' : ''}`.trim();
    } else if (isRealTraining(event) && event.trainer) {
      trainerName = `${event.trainer.first_name || ''} ${event.trainer.last_name ? event.trainer.last_name.charAt(0) + '.' : ''}`.trim();
    }

    // Получаем количество студентов
    if (isTrainingTemplate(event) && event.assigned_students) {
      studentCount = event.assigned_students.length;
    } else if (isRealTraining(event) && event.students) {
      studentCount = event.students.length;
    }

    // Рассчитываем информацию о загруженности
    const capacityInfo = calculateCapacity(studentCount, maxParticipants);
    const capacityText = formatCapacityText(capacityInfo);
    const showCapacityBadge = shouldShowCapacityBadge(capacityInfo);

    return {
      typeColor,
      trainerName,
      studentCount,
      maxParticipants,
      capacityInfo,
      capacityText,
      showCapacityBadge
    };
  }, [event, theme.palette.primary.main]);

  // Мемоизируем tooltip content
  const tooltipContent = useMemo(() => (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {event.training_type?.name || 'Тренировка'}
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.25 }}>
        👨 {chipData.trainerName}
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.25 }}>
        👥 Студентов: {chipData.capacityText}
      </Typography>
      {chipData.maxParticipants && chipData.maxParticipants < 999 && (
        <Typography variant="body2" sx={{ 
          color: chipData.capacityInfo.isFull ? '#ffcdd2' : '#e8f5e8',
          fontSize: '0.75rem'
        }}>
          {chipData.capacityInfo.isFull ? '⚠️ Группа переполнена' : 
           chipData.capacityInfo.percentage >= 90 ? '⚠️ Почти заполнена' :
           chipData.capacityInfo.percentage >= 70 ? '⚡ Заполняется' : '✅ Есть свободные места'}
        </Typography>
      )}
    </Box>
  ), [event.training_type?.name, chipData]);

  // Стили чипа
  const chipSx = useMemo(() => ({
    backgroundColor: alpha(chipData.typeColor, 0.08), // Subtle tint of training type color for better distinction
    borderLeft: `3px solid ${chipData.typeColor}`, // Only thin left border for training type identification
    borderRadius: 1,
    px: 0.75,
    py: 0.25,
    cursor: 'pointer',
    maxWidth: isMobile ? '80px' : (isTablet ? '100px' : '120px'),
    width: 'fit-content',
    // Оптимизированные transitions
    transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.2s ease-out',
    '&:hover': {
      transform: 'translateY(-1px)',
      backgroundColor: alpha(chipData.typeColor, 0.15), // Stronger tint on hover for better visibility
      boxShadow: `0 2px 8px ${alpha(chipData.typeColor, 0.12)}, 0 1px 3px ${alpha(chipData.typeColor, 0.08)}`,
      '& .chip-text': {
        fontWeight: 700,
      },
      '& .trainer-text': {
        color: theme.palette.text.primary,
      },
    },
  }), [chipData.typeColor, isMobile, isTablet, theme.palette]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick(event);
  }, [event, onEventClick]);

  return (
    <Tooltip 
      title={isDragActive ? '' : tooltipContent} 
      arrow 
      placement="top"
      enterDelay={300}
      leaveDelay={100}
      disableHoverListener={isDragActive}
      disableFocusListener={isDragActive}
      disableTouchListener={isDragActive}
      open={isDragActive ? false : undefined}
    >
      <Box onClick={handleClick} sx={chipSx}>
        <Typography
          variant="caption"
          className="chip-text"
          sx={{
            fontSize: isMobile ? '0.6rem' : '0.65rem',
            fontWeight: 600,
            color: theme.palette.text.primary, // Use standard text color for better readability
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            lineHeight: 1.2,
            transition: 'color 0.2s ease-out, font-weight 0.2s ease-out',
          }}
        >
          {event.training_type?.name || 'Тренировка'}
        </Typography>
        {!isMobile && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%'
          }}>
            <Typography
              variant="caption"
              className="trainer-text"
              sx={{
                fontSize: '0.6rem',
                color: theme.palette.text.secondary, // Use standard secondary text color for better readability
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
                transition: 'color 0.2s ease-out',
              }}
            >
              {chipData.trainerName}
            </Typography>
            {chipData.showCapacityBadge && (
              <Box
                sx={{
                  backgroundColor: chipData.capacityInfo.color,
                  color: 'white',
                  fontSize: '0.5rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  px: 0.5,
                  py: 0.125,
                  minWidth: '16px',
                  textAlign: 'center',
                  ml: 0.5,
                }}
              >
                {chipData.capacityText}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
});

export default CalendarTrainingChip;
