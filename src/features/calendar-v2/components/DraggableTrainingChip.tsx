import React, { memo, useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import { CalendarEvent } from './CalendarShell';
import { Dayjs } from 'dayjs';
import { useAltKey } from '../hooks/useAltKey';

interface DraggableTrainingChipProps {
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
  isVirtualCopy?: boolean; // Флаг что это виртуальная копия для дублирования
}

const DraggableTrainingChip: React.FC<DraggableTrainingChipProps> = memo(({
  event,
  day,
  time,
  children,
}) => {
  // Используем надежный хук для отслеживания Alt
  const { isAltPressed } = useAltKey();
  
  // Ref для прямого доступа к элементу
  const elementRef = useRef<HTMLDivElement>(null);
  
  // При новом подходе нам не нужны флаги блокировки,
  // так как при дублировании оригинал вообще не драггается

  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: 'TRAINING',
    item: () => {
      const currentAltState = isAltPressed;
      
      // При дублировании (Alt) - НЕ помечаем оригинал как dragging
      if (currentAltState) {
        return {
          type: 'TRAINING',
          event,
          sourceDay: day,
          sourceTime: time,
          isDuplicate: true,
          isVirtualCopy: true, // Это виртуальная копия
        };
      }
      
      // При обычном move - обычная логика
      return {
        type: 'TRAINING',
        event,
        sourceDay: day,
        sourceTime: time,
        isDuplicate: false,
      };
    },
    canDrag: () => true,
    collect: (monitor) => {
      const item = monitor.getItem() as DragItem | null;
      // Оригинал считается "dragging" только если это НЕ виртуальная копия
      const shouldShowDragging = monitor.isDragging() && (!item?.isVirtualCopy);
      return {
        isDragging: shouldShowDragging,
      };
    },
  });

  // Объединяем refs
  const combinedRef = (element: HTMLDivElement | null) => {
    elementRef.current = element;
    drag(element);
  };

  // Клонируем children и передаем isDragActive пропс
  const enhancedChildren = React.isValidElement(children) 
    ? React.cloneElement(children, { 
        isDragActive: isDragging 
      } as any)
    : children;

  return (
    <div
      ref={combinedRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isAltPressed ? 'copy' : 'move',
        filter: isAltPressed ? 'brightness(1.1) drop-shadow(0 0 8px rgba(33, 150, 243, 0.6))' : 'none',
        transition: 'filter 0.15s ease',
      }}
      title={isAltPressed ? 'Alt+Drag = Дублировать тренировку' : 'Drag = Переместить тренировку'}
    >
      {enhancedChildren}
    </div>
  );
});

export default DraggableTrainingChip; 