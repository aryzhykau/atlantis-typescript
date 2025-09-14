import React, { memo, useCallback, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { useDrop } from 'react-dnd';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from '../../../types';
import { debugLog } from '../../../utils/debug';

interface EnhancedDroppableSlotProps {
  children: React.ReactNode;
  onDrop?: (event: CalendarEvent, sourceDay: Dayjs, sourceTime: string, targetDay: Dayjs, targetTime: string, isDuplicate?: boolean) => void | Promise<void>;
  onClick?: (event: React.MouseEvent) => void;
  isDropTarget?: boolean;
  hour?: number;
  day: Dayjs;
  time: string;
  isAltPressed?: boolean;
  getCurrentAltState?: () => boolean;
  forceResetAltState?: () => void;
  sx?: any;
}

interface DragItem {
  type: string;
  event: CalendarEvent;
  sourceDay: Dayjs;
  sourceTime: string;
  isDuplicate?: boolean;
  isVirtualCopy?: boolean;
}

/**
 * Enhanced droppable slot component with full drag and drop functionality
 */
const EnhancedDroppableSlot: React.FC<EnhancedDroppableSlotProps> = memo(({
  children,
  onDrop,
  onClick,
  isDropTarget = false,
  hour,
  day,
  time,
  isAltPressed,
  getCurrentAltState,
  forceResetAltState,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const dropRef = useRef<HTMLDivElement>(null);

  // Drop handler with react-dnd
  const handleDrop = useCallback((item: DragItem) => {
    debugLog('🎯 Drop detected on slot:', {
      targetDay: day.format('ddd'),
      targetTime: time,
      sourceDay: item.sourceDay.format('ddd'),
      sourceTime: item.sourceTime,
      eventId: item.event.id,
      isDuplicate: item.isDuplicate || getCurrentAltState?.() || false,
    });

    if (onDrop) {
      const isDuplicate = item.isDuplicate || getCurrentAltState?.() || false;
      onDrop(item.event, item.sourceDay, item.sourceTime, day, time, isDuplicate);
    }

    // Reset alt state after drop
    forceResetAltState?.();
  }, [onDrop, day, time, getCurrentAltState, forceResetAltState]);

  // React-DnD drop configuration
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'TRAINING',
    drop: handleDrop,
    canDrop: (item: DragItem) => {
      // Allow drop if it's a different location or if it's a duplicate operation
      const isDifferentLocation = !item.sourceDay.isSame(day, 'day') || item.sourceTime !== time;
      const isDuplicate = item.isDuplicate || getCurrentAltState?.() || false;
      return isDifferentLocation || isDuplicate;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Connect the drop target
  drop(dropRef);

  const isValidDropTarget = isOver && canDrop;
  const isInvalidDropTarget = isOver && !canDrop;

  // Enhanced styles with drop state feedback
  const dropStyles = {
    backgroundColor: isValidDropTarget 
      ? theme.palette.success.light 
      : isInvalidDropTarget 
        ? theme.palette.error.light 
        : isDropTarget 
          ? theme.palette.action.hover 
          : 'transparent',
    border: isValidDropTarget 
      ? `2px dashed ${theme.palette.success.main}` 
      : isInvalidDropTarget 
        ? `2px dashed ${theme.palette.error.main}` 
        : 'none',
    opacity: isInvalidDropTarget ? 0.5 : 1,
    transition: 'all 0.2s ease',
    ...sx,
  };

  return (
    <div
      ref={dropRef}
      onClick={onClick}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        ...dropStyles,
      }}
      data-testid={`droppable-slot-${day.format('YYYY-MM-DD')}-${time}`}
      {...props}
    >
      <Box sx={sx}>
        {children}
      </Box>
    </div>
  );
});

EnhancedDroppableSlot.displayName = 'EnhancedDroppableSlot';

export default EnhancedDroppableSlot;
