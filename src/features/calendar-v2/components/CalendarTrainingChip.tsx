import React, { useMemo, useCallback, memo } from 'react';
import { Box, Typography, Tooltip, useTheme, alpha } from '@mui/material';
import { CalendarEvent } from '../types';
import { createEventDisplayData, createTooltipContent, getResponsiveChipStyles } from '../utils/eventDisplayUtils';
import { borderBottom, borderRadius } from '@mui/system';
import { BorderRightRounded } from '@mui/icons-material';

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
  
  // Simplified event data calculation using utility
  const chipData = useMemo(() => createEventDisplayData(event, theme), [event, theme]);

  // Simplified tooltip content using utility
  const tooltipData = useMemo(() => createTooltipContent(chipData), [chipData]);
  
  const tooltipContent = useMemo(() => (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {tooltipData.title}
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.25 }}>
        {tooltipData.trainer}
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.25 }}>
        {tooltipData.students}
      </Typography>
      {tooltipData.status && (
        <Typography variant="body2" sx={{ 
          color: tooltipData.status.color,
          fontSize: '0.75rem'
        }}>
          {tooltipData.status.text}
        </Typography>
      )}
    </Box>
  ), [tooltipData]);

  // Responsive styles using utility
  const responsiveStyles = useMemo(() => getResponsiveChipStyles(isMobile, isTablet), [isMobile, isTablet]);
  
  // Chip styles with simplified memoization
  const chipSx = useMemo(() => ({
    backgroundColor: alpha(chipData.typeColor, 0.08),
    borderLeft: `3px solid ${chipData.typeColor}`,
    borderRadius: "0 8px 8px 0",
    px: 0.75,
    py: 0.25,
    cursor: 'pointer',
    maxWidth: responsiveStyles.maxWidth,
    width: 'fit-content',
    transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.2s ease-out',
    '&:hover': {
      transform: 'translateY(-1px)',
      backgroundColor: alpha(chipData.typeColor, 0.15),
      boxShadow: `0 2px 8px ${alpha(chipData.typeColor, 0.12)}, 0 1px 3px ${alpha(chipData.typeColor, 0.08)}`,
      '& .chip-text': {
        fontWeight: 700,
      },
      '& .trainer-text': {
        color: theme.palette.text.primary,
      },
    },
  }), [chipData.typeColor, responsiveStyles.maxWidth, theme.palette]);

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
            fontSize: responsiveStyles.fontSize.main,
            fontWeight: 600,
            color: theme.palette.text.primary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            lineHeight: 1.2,
            transition: 'color 0.2s ease-out, font-weight 0.2s ease-out',
          }}
        >
          {chipData.trainingTypeName}
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
                fontSize: responsiveStyles.fontSize.secondary,
                color: theme.palette.text.secondary,
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
