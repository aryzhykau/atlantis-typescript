/**
 * Enhanced DraggableTrainingChip with performance optimizations and better UX
 */

import React, { memo, useRef, useCallback, useMemo } from 'react';
import { useDrag, DragPreviewImage } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { CalendarEvent } from './CalendarShell';
import { Dayjs } from 'dayjs';
import { useAltKey } from '../hooks/useAltKey';
import { debugLog } from '../utils/debug';

interface EnhancedDraggableTrainingChipProps {
  event: CalendarEvent;
  day: Dayjs;
  time: string;
  children: React.ReactNode;
}

interface DragItem {
  type: string;
  event: CalendarEvent;
  sourceDay: Dayjs;
  sourceTime: string;
  isDuplicate?: boolean;
  isVirtualCopy?: boolean;
}

const EnhancedDraggableTrainingChip: React.FC<EnhancedDraggableTrainingChipProps> = memo(({
  event,
  day,
  time,
  children,
}) => {
  const { isAltPressed } = useAltKey();
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartTimeRef = useRef<number>(0);

  // Memoized drag item factory for better performance
  const createDragItem = useCallback((): DragItem => {
    const currentAltState = isAltPressed;
    dragStartTimeRef.current = Date.now();
    
    debugLog('🚀 Creating drag item:', {
      eventId: event.id,
      eventName: event.training_type?.name,
      isDuplicate: currentAltState,
      source: `${day.format('ddd')} ${time}`,
    });

    return {
      type: 'TRAINING',
      event,
      sourceDay: day,
      sourceTime: time,
      isDuplicate: currentAltState,
      isVirtualCopy: currentAltState,
    };
  }, [isAltPressed, event, day, time]);

  // Enhanced drag configuration with performance monitoring
  const [{ isDragging, dragItem }, drag, preview] = useDrag<DragItem, void, { 
    isDragging: boolean; 
    dragItem: DragItem | null;
  }>({
    type: 'TRAINING',
    item: createDragItem,
    canDrag: () => true,
    
    // Performance-optimized collect function
    collect: (monitor) => {
      const item = monitor.getItem() as DragItem | null;
      const isDraggingValue = monitor.isDragging() && (!item?.isVirtualCopy);
      
      return {
        isDragging: isDraggingValue,
        dragItem: item,
      };
    },

    // Note: begin/end hooks are handled in useDrag spec directly
  });

  // Set empty drag preview to use custom preview
  React.useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Combined ref handler
  const combinedRef = useCallback((element: HTMLDivElement | null) => {
    elementRef.current = element;
    drag(element);
  }, [drag]);

  // Optimized drag styles with better performance
  const dragStyles = useMemo(() => {
    const baseStyles = {
      cursor: isAltPressed ? 'copy' : 'move',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      transformOrigin: 'center center',
    };

    if (isDragging) {
      return {
        ...baseStyles,
        opacity: 0.6,
        transform: 'scale(0.98)',
        filter: 'blur(0.5px)',
      };
    }

    if (isAltPressed) {
      return {
        ...baseStyles,
        filter: 'brightness(1.1) drop-shadow(0 0 8px rgba(33, 150, 243, 0.6))',
        transform: 'scale(1.02)',
      };
    }

    return baseStyles;
  }, [isDragging, isAltPressed]);

  // Enhanced tooltip with performance info
  const tooltipText = useMemo(() => {
    if (isDragging) {
      return dragItem?.isDuplicate ? 'Дублируется...' : 'Перемещается...';
    }
    
    return isAltPressed 
      ? `Alt+Drag = Дублировать "${event.training_type?.name}"` 
      : `Drag = Переместить "${event.training_type?.name}"`;
  }, [isDragging, isAltPressed, event.training_type?.name, dragItem]);

  // Clone children with drag state
  const enhancedChildren = useMemo(() => {
    if (!React.isValidElement(children)) return children;
    
    return React.cloneElement(children, { 
      isDragActive: isDragging,
      dragItem,
    } as any);
  }, [children, isDragging, dragItem]);

  return (
    <>
      {/* Custom drag preview image - hidden but helps with performance */}
      <DragPreviewImage 
        connect={preview} 
        src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" // 1x1 transparent pixel
      />
      
      <div
        ref={combinedRef}
        style={dragStyles}
        title={tooltipText}
        data-testid={`draggable-training-${event.id}`}
      >
        {enhancedChildren}
        
        {/* Optional: Drag handle indicator */}
        {isAltPressed && !isDragging && (
          <div
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'rgba(33, 150, 243, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: 'white',
              fontWeight: 'bold',
              zIndex: 5,
            }}
          >
            +
          </div>
        )}
      </div>
    </>
  );
});

EnhancedDraggableTrainingChip.displayName = 'EnhancedDraggableTrainingChip';

export default EnhancedDraggableTrainingChip;
