import React, { memo, useRef, useCallback, useMemo, useState } from 'react';
import { useDrag, DragPreviewImage } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { CalendarEvent } from '../types';
import { Dayjs } from 'dayjs';
import { debugLog } from '../utils/debug';

interface MobileDraggableEventCardProps {
  event: CalendarEvent;
  day: Dayjs;
  time: string;
  children: React.ReactNode;
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

const MobileDraggableEventCard: React.FC<MobileDraggableEventCardProps> = memo(({
  event,
  day,
  time,
  children,
  onDragStart,
  onDragEnd,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartTimeRef = useRef<number>(0);
  const [isDragHandlePressed, setIsDragHandlePressed] = useState(false);

  // Memoized drag item factory for mobile
  const createDragItem = useCallback((): DragItem => {
    dragStartTimeRef.current = Date.now();
    
    debugLog('📱 Creating mobile drag item:', {
      eventId: event.id,
      eventName: event.training_type?.name,
      source: `${day.format('ddd')} ${time}`,
      isMobile: true,
    });

    return {
      type: 'TRAINING',
      event,
      sourceDay: day,
      sourceTime: time,
      isDuplicate: false, // Mobile doesn't support Alt+drag, so always false
      isVirtualCopy: false,
    };
  }, [event, day, time]);

  // Enhanced drag configuration for mobile
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
  React.useEffect(() => {
    if (isDragging) {
      onDragStart?.();
      setIsDragHandlePressed(true);
      debugLog('📱 Mobile drag started for event:', event.id);
    } else {
      onDragEnd?.();
      setIsDragHandlePressed(false);
      if (dragItem && !isDragging) {
        debugLog('📱 Mobile drag ended for event:', event.id);
      }
    }
  }, [isDragging, dragItem, event.id, onDragStart, onDragEnd]);

  // Set empty drag preview to avoid default ghost image on mobile
  React.useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Combined ref handler for drag handle
  const combinedRef = useCallback((element: HTMLDivElement | null) => {
    elementRef.current = element;
    drag(element);
  }, [drag]);

  // Mobile-optimized drag styles
  const dragStyles = useMemo((): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'relative',
      cursor: isDragging ? 'grabbing' : 'inherit',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      transformOrigin: 'center center',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      // Don't interfere with touch scrolling when not dragging
      touchAction: isDragging ? 'none' : 'auto',
    };

    if (isDragging) {
      return {
        ...baseStyles,
        opacity: 0.7,
        transform: 'scale(1.05)',
        zIndex: 1000,
        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
        pointerEvents: 'none', // Prevent interference with drop zones during drag
      };
    }

    if (isDragHandlePressed) {
      return {
        ...baseStyles,
        transform: 'scale(1.02)',
      };
    }

    return baseStyles;
  }, [isDragging, isDragHandlePressed]);

  // Enhanced children with drag state for mobile
  const enhancedChildren = useMemo(() => {
    if (!React.isValidElement(children)) return children;
    
    return React.cloneElement(children, { 
      isDragActive: isDragging,
      dragItem,
      isMobileDrag: true,
    } as any);
  }, [children, isDragging, dragItem]);

  return (
    <>
      {/* Custom drag preview - empty for mobile to avoid conflicts */}
      <DragPreviewImage 
        connect={preview} 
        src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" 
      />
      
      <div
        ref={combinedRef}
        style={dragStyles}
        data-testid={`mobile-draggable-training-${event.id}`}
      >
        {enhancedChildren}
      </div>
    </>
  );
});

MobileDraggableEventCard.displayName = 'MobileDraggableEventCard';

export default MobileDraggableEventCard;
