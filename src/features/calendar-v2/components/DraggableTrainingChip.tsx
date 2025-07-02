import React, { memo, useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { CalendarEvent } from './CalendarShell';
import { Dayjs } from 'dayjs';

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
  isDuplicate: boolean;
}

const DraggableTrainingChip: React.FC<DraggableTrainingChipProps> = memo(({
  event,
  day,
  time,
  children,
}) => {
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  // Отслеживание клавиши Ctrl
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) { // Ctrl на Windows/Linux или Cmd на Mac
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsCtrlPressed(false);
      }
    };

    const handleBlur = () => {
      setIsCtrlPressed(false); // Сброс состояния при потере фокуса
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: 'TRAINING',
    item: () => ({
      type: 'TRAINING',
      event,
      sourceDay: day,
      sourceTime: time,
      isDuplicate: isCtrlPressed,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isCtrlPressed ? 'copy' : 'move',
        filter: isCtrlPressed ? 'brightness(1.1) drop-shadow(0 0 8px rgba(33, 150, 243, 0.6))' : 'none',
        transition: 'filter 0.15s ease',
      }}
      title={isCtrlPressed ? 'Ctrl+Drag = Дублировать тренировку' : 'Drag = Переместить тренировку'}
    >
      {children}
    </div>
  );
});

export default DraggableTrainingChip; 