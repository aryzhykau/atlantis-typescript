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
  onDrop?: (event: CalendarEvent, sourceDay: Dayjs, sourceTime: string, targetDay: Dayjs, targetTime: string, isDuplicate?: boolean) => void;
  // Получаем состояние Alt извне
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
  isVirtualCopy?: boolean; // Флаг что это виртуальная копия для дублирования
}

const DroppableSlot: React.FC<DroppableSlotProps> = memo(({
  day,
  time,
  children,
  onClick,
  sx = {},
  onDrop,

  forceResetAltState,
}) => {
  // Получаем состояние Alt как пропы

  const [{ isOver, canDrop, dragItem }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean; dragItem: DragItem | null }>({
    accept: 'TRAINING',
    // Убираем hover спам для чистоты логов
    drop: (item, _) => {
      if (onDrop) {
        // Используем isDuplicate из самого item (определяется в момент начала drag)
        const isDuplicate = item.isDuplicate || false;
        
        // Принудительно сбрасываем состояние Alt после drop (против "залипания")
        setTimeout(() => {
          forceResetAltState();
        }, 50);
        
        onDrop(item.event, item.sourceDay, item.sourceTime, day, time, isDuplicate);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
      dragItem: monitor.getItem(),
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
      {isOver && canDrop && dragItem && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            backgroundColor: dragItem?.isDuplicate ? 'info.main' : 'primary.main',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {dragItem?.isDuplicate ? '📋 Дублировать сюда' : '📅 Переместить сюда'}
        </Box>
      )}
    </Box>
  );
});

export default DroppableSlot; 