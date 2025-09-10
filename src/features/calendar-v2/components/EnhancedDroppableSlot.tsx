/**
 * Enhanced DroppableSlot with smooth animations and better UX
 */

import React, { memo, useMemo, useCallback, useState } from 'react';
import { useDrop } from 'react-dnd';
import { Box, Fade, useTheme, alpha } from '@mui/material';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from '../types';

interface EnhancedDroppableSlotProps {
  day: Dayjs;
  time: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  sx?: any;
  onDrop?: (event: CalendarEvent, sourceDay: Dayjs, sourceTime: string, targetDay: Dayjs, targetTime: string, isDuplicate?: boolean) => void;
  isAltPressed: boolean;
  getCurrentAltState: () => boolean;
  forceResetAltState: () => void;
}

interface DragItem {
  type: string;
  event: CalendarEvent;
  sourceDay: Dayjs;
  sourceTime: string;
  isDuplicate?: boolean;
  isVirtualCopy?: boolean;
}

const EnhancedDroppableSlot: React.FC<EnhancedDroppableSlotProps> = memo(({
  day,
  time,
  children,
  onClick,
  sx = {},
  onDrop,
  forceResetAltState,
}) => {
  const theme = useTheme();
  const [isDropAnimating, setIsDropAnimating] = useState(false);

  const [{ isOver, canDrop, dragItem }, drop] = useDrop<DragItem, void, { 
    isOver: boolean; 
    canDrop: boolean; 
    dragItem: DragItem | null;
  }>({
    accept: 'TRAINING',
    drop: (item, monitor) => {
      if (onDrop && monitor.didDrop() === false) {
        const isDuplicate = item.isDuplicate || false;
        
        // Add drop animation
        setIsDropAnimating(true);
        setTimeout(() => setIsDropAnimating(false), 300);
        
        // Reset Alt state after drop
        setTimeout(() => {
          forceResetAltState();
        }, 50);
        
        onDrop(item.event, item.sourceDay, item.sourceTime, day, time, isDuplicate);
      }
    },
    hover: (_, monitor) => {
      // Optional: Add hover feedback here
      if (monitor.isOver({ shallow: true })) {
        // Could trigger haptic feedback or other UX improvements
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
      dragItem: monitor.getItem(),
    }),
  });

  // Optimized drop zone styles with smooth transitions
  const dropZoneStyles = useMemo(() => {
    const baseStyles = {
      ...sx,
      position: 'relative',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth easing
      transformOrigin: 'center center',
    };

    if (isOver && canDrop) {
      return {
        ...baseStyles,
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        transform: 'scale(1.02)',
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
        borderRadius: theme.spacing(1),
      };
    }

    if (isDropAnimating) {
      return {
        ...baseStyles,
        backgroundColor: alpha(theme.palette.success.main, 0.15),
        transform: 'scale(1.05)',
        boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.3)}`,
      };
    }

    return baseStyles;
  }, [sx, isOver, canDrop, isDropAnimating, theme]);

  // Enhanced drop indicator with better animations
  const DropIndicator = useCallback(() => {
    if (!isOver || !canDrop || !dragItem) return null;

    const isDuplicate = dragItem.isDuplicate;
    const indicatorColor = isDuplicate ? theme.palette.info.main : theme.palette.primary.main;
    const indicatorText = isDuplicate ? '📋 Дублировать сюда' : '📅 Переместить сюда';

    return (
      <Fade in={isOver && canDrop} timeout={{ enter: 200, exit: 150 }}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            backgroundColor: indicatorColor,
            color: 'white',
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: `0 4px 12px ${alpha(indicatorColor, 0.4)}`,
            // Subtle animation
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1)',
              },
              '50%': {
                opacity: 0.9,
                transform: 'translate(-50%, -50%) scale(1.05)',
              },
            },
          }}
        >
          {indicatorText}
        </Box>
      </Fade>
    );
  }, [isOver, canDrop, dragItem, theme]);

  // Success indicator for completed drops
  const SuccessIndicator = useCallback(() => {
    if (!isDropAnimating) return null;

    return (
      <Fade in={isDropAnimating} timeout={{ enter: 100, exit: 200 }}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 15,
            backgroundColor: theme.palette.success.main,
            color: 'white',
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            fontSize: '0.8rem',
            fontWeight: 600,
            boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.4)}`,
            animation: 'successPop 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            '@keyframes successPop': {
              '0%': {
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(0.8)',
              },
              '50%': {
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1.1)',
              },
              '100%': {
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1)',
              },
            },
          }}
        >
          ✅ Готово!
        </Box>
      </Fade>
    );
  }, [isDropAnimating, theme]);

  return (
    <Box
      ref={drop as any}
      onClick={onClick}
      sx={dropZoneStyles}
    >
      {children}
      <DropIndicator />
      <SuccessIndicator />
      
      {/* Optional: Subtle glow effect for active drop zones */}
      {isOver && canDrop && (
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: theme.spacing(1.5),
            background: `linear-gradient(45deg, 
              ${alpha(theme.palette.primary.main, 0.1)}, 
              ${alpha(theme.palette.primary.main, 0.05)}
            )`,
            zIndex: -1,
            animation: 'glow 1.5s ease-in-out infinite alternate',
            '@keyframes glow': {
              '0%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }}
        />
      )}
    </Box>
  );
});

EnhancedDroppableSlot.displayName = 'EnhancedDroppableSlot';

export default EnhancedDroppableSlot;
