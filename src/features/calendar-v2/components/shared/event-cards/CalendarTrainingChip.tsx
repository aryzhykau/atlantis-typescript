import React, { useMemo, useCallback, memo, forwardRef } from 'react';
import { Box, Typography, Tooltip, useTheme, alpha, SxProps, Theme, Avatar, Chip } from '@mui/material';
import { CalendarEvent } from '../../../types';
import { createEventDisplayData, createTooltipContent, getResponsiveChipStyles } from '../../../utils/eventDisplayUtils';
import MobileDragHandle from '../../mobile/drag-drop/MobileDragHandle';

interface CalendarTrainingChipProps {
  event: CalendarEvent;
  isMobile: boolean;
  isTablet: boolean;
  onEventClick: (event: CalendarEvent) => void;
  isDragActive?: boolean;
  showDragHandle?: boolean;
  isDuplicate?: boolean; // Add this prop for Alt+drag feedback
  sx?: SxProps<Theme>;
}

export const CalendarTrainingChip = memo(forwardRef<HTMLDivElement, CalendarTrainingChipProps>(({ 
  event, 
  isMobile, 
  isTablet, 
  onEventClick, 
  isDragActive = false,
  showDragHandle = false,
  isDuplicate = false, // Add this prop
  sx
}, ref) => {
  const theme = useTheme();
  
  // Simplified event data calculation using utility
  const chipData = useMemo(() => createEventDisplayData(event, theme), [event, theme]);

  // Simplified tooltip content using utility
  const tooltipData = useMemo(() => createTooltipContent(chipData), [chipData]);
  
  // Create trainer initials for mobile avatar
  const trainerInitials = useMemo(() => {
    return chipData.trainerName
      ? chipData.trainerName.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase()
      : '?';
  }, [chipData.trainerName]);

  // Calculate student count and capacity for mobile chip
  const studentCapacityInfo = useMemo(() => {
    let studentCount = 0;
    let maxCapacity = 0;

    // Handle different event types
    if ('students' in event) {
      // RealTraining
      studentCount = event.students?.length || 0;
      maxCapacity = event.training_type?.max_participants || 0;
    } else if ('assigned_students' in event) {
      // TrainingTemplate
      studentCount = event.assigned_students?.length || 0;
      maxCapacity = event.training_type?.max_participants || 0;
    }

    return {
      current: studentCount,
      max: maxCapacity,
      label: `${studentCount}/${maxCapacity}`,
    };
  }, [event]);
  
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
  const chipSx = useMemo((): SxProps<Theme> => {
    const baseStyles: SxProps<Theme> = {
      backgroundColor: theme.palette.mode === 'dark' 
        ? alpha(chipData.typeColor, 0.12)
        : alpha(chipData.typeColor, 0.08),
      borderLeft: `3px solid ${chipData.typeColor}`,
      borderRadius: "0 8px 8px 0",
      px: 0.75,
      py: 0.25,
      cursor: 'pointer',
      width: isMobile ? '100%' : 'fit-content', // Full width on mobile
      height: isMobile ? '100%' : 'auto', // Full height on mobile
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      maxWidth: isMobile ? 'none' : responsiveStyles.maxWidth,
      transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.2s ease-out',
      '&:hover': {
        transform: 'translateY(-1px)',
        backgroundColor: theme.palette.mode === 'dark'
          ? alpha(chipData.typeColor, 0.2)
          : alpha(chipData.typeColor, 0.15),
        boxShadow: `0 2px 8px ${alpha(chipData.typeColor, 0.12)}, 0 1px 3px ${alpha(chipData.typeColor, 0.08)}`,
        '& .chip-text': {
          fontWeight: 700,
        },
        '& .trainer-text': {
          color: theme.palette.text.primary,
        },
      },
    };

    // Add duplication effect when Alt is pressed
    if (isDuplicate) {
      return {
        ...baseStyles,
        backgroundColor: alpha(theme.palette.primary.main, 0.15),
        borderLeft: `3px solid ${theme.palette.primary.main}`,
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.4)}, 0 0 8px ${alpha(theme.palette.primary.main, 0.2)}`,
        transform: 'scale(1.02)',
        '&:hover': {
          ...(baseStyles['&:hover'] as object),
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.6)}, 0 0 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        },
      } as SxProps<Theme>;
    }

    return {
      ...baseStyles,
      // Merge external sx styles
      ...(typeof sx === 'object' && !Array.isArray(sx) ? sx : {}),
    } as SxProps<Theme>;
  }, [chipData.typeColor, responsiveStyles.maxWidth, theme.palette, sx, isMobile, isDuplicate]);

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
      <Box onClick={handleClick} sx={chipSx} ref={ref}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5,
          width: '100%',
          minWidth: 0, // Allow flex children to shrink below their content size
        }}>
          {isMobile && (
            <Avatar
              sx={{
                bgcolor: chipData.typeColor,
                color: 'white',
                width: 20,
                height: 20,
                fontSize: '0.6rem',
                fontWeight: 'bold',
                flexShrink: 0, // Don't shrink the avatar
              }}
            >
              {trainerInitials}
            </Avatar>
          )}
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
              flex: 1,
              minWidth: 0, // Allow text to shrink and show ellipsis
              lineHeight: 1.2,
              transition: 'color 0.2s ease-out, font-weight 0.2s ease-out',
            }}
          >
            {chipData.trainingTypeName}
          </Typography>
          {showDragHandle && isMobile && (
            <Box sx={{ flexShrink: 0 }}> {/* Prevent drag handle from shrinking */}
              <MobileDragHandle
                inline
                color={chipData.typeColor}
                size="small"
              />
            </Box>
          )}
        </Box>
        {/* Mobile student capacity chip */}
        {isMobile && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            alignItems: 'center',
            mt: 0.5,
          }}>
            <Chip
              label={studentCapacityInfo.label}
              size="small"
              sx={{
                height: '16px',
                fontSize: '0.6rem',
                backgroundColor: alpha(chipData.typeColor, 0.15),
                color: chipData.typeColor,
                border: `1px solid ${alpha(chipData.typeColor, 0.3)}`,
                '& .MuiChip-label': {
                  px: 0.5,
                  py: 0,
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        )}
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
}));

export default CalendarTrainingChip;
