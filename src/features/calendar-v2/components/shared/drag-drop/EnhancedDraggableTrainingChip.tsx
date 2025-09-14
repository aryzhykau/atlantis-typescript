import React, { memo, useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { useDrag, DragPreviewImage } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useTheme } from '@mui/material/styles';
import { CalendarEvent } from '../../../types';
import { Dayjs } from 'dayjs';
import { debugLog } from '../../../utils/debug';
import { useAltKey } from '../../../hooks/useAltKey';

interface EnhancedDraggableTrainingChipProps {
  event: CalendarEvent;
  day: Dayjs;
  time: string;
  children?: React.ReactNode;
  isSelected?: boolean;
  chipHeight?: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
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
 * Enhanced draggable training chip component with full drag and drop functionality
 */
const EnhancedDraggableTrainingChip: React.FC<EnhancedDraggableTrainingChipProps> = memo(({
  event,
  day,
  time,
  children,
  isSelected = false,
  onDragStart,
  onDragEnd,
}) => {
  const theme = useTheme();
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartTimeRef = useRef<number>(0);
  const [isDragHandlePressed, setIsDragHandlePressed] = useState(false);
  const { isAltPressed, getCurrentAltState } = useAltKey();

  // Memoized drag item factory
  const createDragItem = useCallback((): DragItem => {
    dragStartTimeRef.current = Date.now();
    const isDuplicate = getCurrentAltState?.() || false;
    
    debugLog('🖱️ Creating desktop drag item:', {
      eventId: event.id,
      eventName: event.training_type?.name,
      source: `${day.format('ddd')} ${time}`,
      isDuplicate,
      isDesktop: true,
    });

    return {
      type: 'TRAINING',
      event,
      sourceDay: day,
      sourceTime: time,
      isDuplicate,
      isVirtualCopy: false,
    };
  }, [event, day, time, getCurrentAltState]);

  // Enhanced drag configuration for desktop
  const [{ isDragging, dragItem }, drag, preview] = useDrag<DragItem, void, { 
    isDragging: boolean; 
    dragItem: DragItem | null;
  }>({
    type: 'TRAINING',
    item: createDragItem,
    canDrag: () => true,
    
    collect: (monitor) => {
      const item = monitor.getItem() as DragItem | null;
      const isDraggingValue = monitor.isDragging();
      
      return {
        isDragging: isDraggingValue,
        dragItem: item,
      };
    },
  }, [createDragItem]);

  // Handle drag lifecycle events
  useEffect(() => {
    if (isDragging) {
      onDragStart?.();
      setIsDragHandlePressed(true);
      debugLog('🖱️ Desktop drag started for event:', event.id);
    } else {
      onDragEnd?.();
      setIsDragHandlePressed(false);
      if (dragItem && !isDragging) {
        debugLog('🖱️ Desktop drag ended for event:', event.id);
      }
    }
  }, [isDragging, dragItem, event.id, onDragStart, onDragEnd]);

  // Set empty drag preview to avoid default ghost image
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Combined ref handler for drag handle
  const combinedRef = useCallback((element: HTMLDivElement | null) => {
    elementRef.current = element;
    drag(element);
  }, [drag]);

  // Desktop-optimized drag styles
  const dragStyles = useMemo((): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'relative',
      cursor: isDragging ? 'grabbing' : 'grab',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      transformOrigin: 'center center',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    };

    if (isDragging) {
      // Create theme-aware shadow color
      const shadowColor = theme.palette.mode === 'dark' 
        ? 'rgba(255,255,255,0.2)' 
        : 'rgba(0,0,0,0.3)';
        
      return {
        ...baseStyles,
        opacity: 0.8,
        transform: 'scale(1.05)',
        zIndex: 1000,
        filter: `drop-shadow(0 4px 8px ${shadowColor})`,
        pointerEvents: 'none', // Prevent interference with drop zones during drag
      };
    }

    if (isDragHandlePressed || isSelected) {
      return {
        ...baseStyles,
        transform: 'scale(1.02)',
      };
    }

    return baseStyles;
  }, [isDragging, isDragHandlePressed, isSelected, theme.palette.mode]);

  // Enhanced children with drag state
  const enhancedChildren = useMemo(() => {
    if (!React.isValidElement(children)) return children;
    
    return React.cloneElement(children, { 
      isDragActive: isDragging,
      dragItem,
      isDesktopDrag: true,
      isDuplicate: isAltPressed,
    } as any);
  }, [children, isDragging, dragItem, isAltPressed]);

  return (
    <>
      {/* Custom drag preview - empty to avoid conflicts */}
      <DragPreviewImage 
        connect={preview} 
        src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" 
      />
      
      <div
        ref={combinedRef}
        style={dragStyles}
        data-testid={`desktop-draggable-training-${event.id}`}
      >
        {enhancedChildren}
      </div>
    </>
  );
});

EnhancedDraggableTrainingChip.displayName = 'EnhancedDraggableTrainingChip';

export default EnhancedDraggableTrainingChip;
