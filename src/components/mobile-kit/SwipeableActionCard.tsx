import { Box } from '@mui/material';
import React, { useRef, useState } from 'react';

interface SwipeableActionCardProps {
  children: React.ReactNode;
  revealContent: React.ReactNode;
  revealWidth?: number;
  disabled?: boolean;
}

const OPEN_TRIGGER = 56;
const CLOSE_TRIGGER = 34;

export function SwipeableActionCard({
  children,
  revealContent,
  revealWidth = 168,
  disabled = false,
}: SwipeableActionCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const horizontalIntent = useRef<boolean | null>(null);

  const resetTracking = () => {
    setIsDragging(false);
    startX.current = null;
    startY.current = null;
    horizontalIntent.current = null;
  };

  const closePanel = () => {
    setIsOpen(false);
    setOffsetX(0);
  };

  const openPanel = () => {
    setIsOpen(true);
    setOffsetX(-revealWidth);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (disabled) return;
    startX.current = event.touches[0].clientX;
    startY.current = event.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (disabled || startX.current === null || startY.current === null) return;

    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;

    const deltaX = currentX - startX.current;
    const deltaY = currentY - startY.current;

    if (horizontalIntent.current === null) {
      horizontalIntent.current = Math.abs(deltaX) > Math.abs(deltaY);
    }

    if (!horizontalIntent.current) {
      return;
    }

    const baseOffset = isOpen ? -revealWidth : 0;
    const nextOffset = baseOffset + deltaX;
    const boundedOffset = Math.max(-revealWidth, Math.min(0, nextOffset));
    setOffsetX(boundedOffset);
  };

  const handleTouchEnd = () => {
    if (disabled) {
      resetTracking();
      return;
    }

    if (!isOpen) {
      if (offsetX <= -OPEN_TRIGGER) {
        openPanel();
      } else {
        closePanel();
      }
    } else if (offsetX >= -revealWidth + CLOSE_TRIGGER) {
      closePanel();
    } else {
      openPanel();
    }

    resetTracking();
  };

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 0 }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: revealWidth,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'stretch',
          background: (theme) => theme.palette.action.hover,
          borderLeft: '1px solid',
          borderColor: 'divider',
        }}
      >
        {revealContent}
      </Box>

      <Box
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={isOpen ? closePanel : undefined}
        sx={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.18s ease-out',
          touchAction: 'pan-y',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
