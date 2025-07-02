import React, { memo } from 'react';
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
}

const DraggableTrainingChip: React.FC<DraggableTrainingChipProps> = memo(({
  event,
  day,
  time,
  children,
}) => {
  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: 'TRAINING',
    item: {
      type: 'TRAINING',
      event,
      sourceDay: day,
      sourceTime: time,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      {children}
    </div>
  );
});

export default DraggableTrainingChip; 