import React, { memo, useMemo, useCallback, useState } from 'react';
import { useDrop } from 'react-dnd';
import { Box, Fade, useTheme, alpha } from '@mui/material';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from '../../../types';

interface MobileDropZoneProps {
  day: Dayjs;
  time: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  sx?: any;
  onDrop?: (event: CalendarEvent, sourceDay: Dayjs, sourceTime: string, targetDay: Dayjs, targetTime: string, isDuplicate?: boolean) => void;
}

interface DragItem {
  type: string;
  event: CalendarEvent;
  sourceDay: Dayjs;
  sourceTime: string;
  isDuplicate?: boolean;
  isVirtualCopy?: boolean;
}

const MobileDropZone: React.FC<MobileDropZoneProps> = memo(({
  day,
  time,
  children,
  onClick,
  sx = {},
  onDrop,
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
        const isDuplicate = false; // Mobile doesn't support duplication
        
        // Add drop animation
        setIsDropAnimating(true);
        setTimeout(() => setIsDropAnimating(false), 400);
        
        onDrop(item.event, item.sourceDay, item.sourceTime, day, time, isDuplicate);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
      dragItem: monitor.getItem(),
    }),
  });

  // Mobile-optimized drop zone styles
  const dropZoneStyles = useMemo(() => {
    const baseStyles = {
      ...sx,
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transformOrigin: 'center center',
      minHeight: '44px', // Ensure touch-friendly drop area
    };

    if (isOver && canDrop) {
      return {
        ...baseStyles,
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        transform: 'scale(1.02)',
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.4)}`,
        borderRadius: theme.spacing(1),
      };
    }

    if (isDropAnimating) {
      return {
        ...baseStyles,
        backgroundColor: alpha(theme.palette.success.main, 0.2),
        transform: 'scale(1.05)',
        boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.4)}`,
      };
    }

    return baseStyles;
  }, [sx, isOver, canDrop, isDropAnimating, theme]);

  // Mobile drop indicator
  const DropIndicator = useCallback(() => {
    if (!isOver || !canDrop || !dragItem) return null;

    return (
      <Fade in={isOver && canDrop} timeout={{ enter: 250, exit: 150 }}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            fontSize: '0.8rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
            // Subtle mobile-friendly animation
            animation: 'mobilePulse 2s ease-in-out infinite',
            '@keyframes mobilePulse': {
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
          📅 Переместить сюда
        </Box>
      </Fade>
    );
  }, [isOver, canDrop, dragItem, theme]);

  // Success indicator for mobile
  const SuccessIndicator = useCallback(() => {
    if (!isDropAnimating) return null;

    return (
      <Fade in={isDropAnimating} timeout={{ enter: 100, exit: 300 }}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 15,
            backgroundColor: theme.palette.success.main,
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.4)}`,
            animation: 'mobileSuccessPop 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            '@keyframes mobileSuccessPop': {
              '0%': {
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(0.7)',
              },
              '50%': {
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1.15)',
              },
              '100%': {
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1)',
              },
            },
          }}
        >
          ✅ Перемещено!
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
      
      {/* Mobile-optimized glow effect */}
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
              ${alpha(theme.palette.primary.main, 0.15)}, 
              ${alpha(theme.palette.primary.main, 0.08)}
            )`,
            zIndex: -1,
            animation: 'mobileGlow 1.5s ease-in-out infinite alternate',
            '@keyframes mobileGlow': {
              '0%': { opacity: 0.6 },
              '100%': { opacity: 1 },
            },
          }}
        />
      )}
    </Box>
  );
});

MobileDropZone.displayName = 'MobileDropZone';

export default MobileDropZone;
