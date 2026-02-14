import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import React, { useRef, useState } from 'react';

interface MobileRefreshContainerProps {
  children: React.ReactNode;
  onRefresh: () => Promise<unknown> | unknown;
  isRefreshing?: boolean;
  disabled?: boolean;
  showManualRefreshButton?: boolean;
}

const TRIGGER_DISTANCE = 70;

export function MobileRefreshContainer({
  children,
  onRefresh,
  isRefreshing = false,
  disabled = false,
  showManualRefreshButton = true,
}: MobileRefreshContainerProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startYRef = useRef<number | null>(null);
  const isTriggeringRef = useRef(false);

  const triggerRefresh = async () => {
    if (disabled || isTriggeringRef.current || isRefreshing) return;
    isTriggeringRef.current = true;
    try {
      await Promise.resolve(onRefresh());
    } finally {
      isTriggeringRef.current = false;
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (window.scrollY > 0) return;
    startYRef.current = event.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (!isPulling || startYRef.current === null || window.scrollY > 0) return;

    const delta = event.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      const damped = Math.min(100, delta * 0.45);
      setPullDistance(damped);
    }
  };

  const handleTouchEnd = async () => {
    if (disabled) {
      setIsPulling(false);
      setPullDistance(0);
      startYRef.current = null;
      return;
    }

    if (pullDistance >= TRIGGER_DISTANCE) {
      await triggerRefresh();
    }

    setIsPulling(false);
    setPullDistance(0);
    startYRef.current = null;
  };

  return (
    <Box onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          height: pullDistance,
          overflow: 'hidden',
          transition: isPulling ? 'none' : 'height 0.2s ease',
        }}
      >
        {!disabled && (isRefreshing || pullDistance > 0) && (
          <>
            {isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
            <Typography variant="caption" color="text.secondary">
              {pullDistance >= TRIGGER_DISTANCE ? 'Отпустите, чтобы обновить' : 'Потяните вниз для обновления'}
            </Typography>
          </>
        )}
      </Box>

      {showManualRefreshButton && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton aria-label="refresh" size="small" onClick={triggerRefresh} disabled={disabled}>
            {isRefreshing ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
          </IconButton>
        </Box>
      )}

      {children}
    </Box>
  );
}
