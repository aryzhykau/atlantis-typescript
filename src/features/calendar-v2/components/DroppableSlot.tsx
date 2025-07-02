import React, { memo, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { Box } from '@mui/material';
import { Dayjs } from 'dayjs';
import { CalendarEvent } from './CalendarShell';

interface DroppableSlotProps {
  day: Dayjs;
  time: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  sx?: any;
  onDrop?: (event: CalendarEvent, sourceDay: Dayjs, sourceTime: string, targetDay: Dayjs, targetTime: string) => void;
}

interface DragItem {
  type: string;
  event: CalendarEvent;
  sourceDay: Dayjs;
  sourceTime: string;
}

const DroppableSlot: React.FC<DroppableSlotProps> = memo(({
  day,
  time,
  children,
  onClick,
  sx = {},
  onDrop,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: 'TRAINING',
    drop: (item) => {
      if (onDrop) {
        onDrop(item.event, item.sourceDay, item.sourceTime, day, time);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const dropSx = useMemo(() => ({
    ...sx,
    position: 'relative',
    backgroundColor: isOver && canDrop ? 'primary.main' : sx.backgroundColor,
    opacity: isOver && canDrop ? 0.1 : 1,
    '&::before': isOver && canDrop ? {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'primary.main',
      opacity: 0.1,
      borderRadius: 1,
      border: '2px dashed',
      borderColor: 'primary.main',
      zIndex: 1,
    } : {},
  }), [sx, isOver, canDrop]);

  return (
    <Box
      ref={drop as any}
      onClick={onClick}
      sx={dropSx}
    >
      {children}
      {isOver && canDrop && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            backgroundColor: 'primary.main',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          📅 Переместить сюда
        </Box>
      )}
    </Box>
  );
});

export default DroppableSlot; 