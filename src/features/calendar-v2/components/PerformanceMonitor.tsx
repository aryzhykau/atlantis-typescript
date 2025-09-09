/**
 * Performance monitoring component for calendar optimizations
 * Shows real-time performance metrics and optimization benefits
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Chip, Collapse, IconButton, Paper } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';


interface PerformanceStats {
  renderCount: number;
  lastRenderTime: number;
  avgRenderTime: number;
  memoryUsage: number;
  dragOperations: number;
  autoScrollEvents: number;
  slotComputations: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = false // Default to disabled to prevent infinite renders
}) => {
  const [stats, setStats] = useState<PerformanceStats>({
    renderCount: 0,
    lastRenderTime: 0,
    avgRenderTime: 0,
    memoryUsage: 0,
    dragOperations: 0,
    autoScrollEvents: 0,
    slotComputations: 0,
  });
  
  const [expanded, setExpanded] = useState(false);
  const renderTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const updateIntervalRef = useRef<number | undefined>(undefined);
  
  // Track render performance with throttled updates to prevent infinite renders
  useEffect(() => {
    if (!enabled) return;
    
    const updateStats = () => {
      const renderTime = Date.now() - startTimeRef.current;
      renderTimesRef.current.push(renderTime);
      
      // Keep only last 50 measurements
      if (renderTimesRef.current.length > 50) {
        renderTimesRef.current = renderTimesRef.current.slice(-50);
      }
      
      const avgRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;
      
      setStats(prev => ({
        ...prev,
        renderCount: prev.renderCount + 1,
        lastRenderTime: renderTime,
        avgRenderTime,
        memoryUsage: (performance as any)?.memory?.usedJSHeapSize || 0,
      }));
      
      startTimeRef.current = Date.now();
    };
    
    // Update stats only every 100ms to prevent render loops
    updateIntervalRef.current = window.setInterval(updateStats, 100);
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [enabled]);

  // Listen for custom performance events
  useEffect(() => {
    const handleDragEvent = () => {
      setStats(prev => ({ ...prev, dragOperations: prev.dragOperations + 1 }));
    };
    
    const handleAutoScrollEvent = () => {
      setStats(prev => ({ ...prev, autoScrollEvents: prev.autoScrollEvents + 1 }));
    };
    
    const handleSlotComputationEvent = () => {
      setStats(prev => ({ ...prev, slotComputations: prev.slotComputations + 1 }));
    };

    // Custom event listeners
    window.addEventListener('calendar:drag', handleDragEvent);
    window.addEventListener('calendar:autoscroll', handleAutoScrollEvent);
    window.addEventListener('calendar:slotcomputation', handleSlotComputationEvent);
    
    return () => {
      window.removeEventListener('calendar:drag', handleDragEvent);
      window.removeEventListener('calendar:autoscroll', handleAutoScrollEvent);
      window.removeEventListener('calendar:slotcomputation', handleSlotComputationEvent);
    };
  }, []);

  // Performance analysis
  const getPerformanceStatus = () => {
    if (stats.avgRenderTime < 16) return { color: 'success', label: 'Отлично' };
    if (stats.avgRenderTime < 33) return { color: 'warning', label: 'Хорошо' };
    return { color: 'error', label: 'Медленно' };
  };

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (!enabled) {
    return null;
  }

  const performanceStatus = getPerformanceStatus();

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'fixed',
        top: 80,
        right: 16,
        width: expanded ? 320 : 200,
        zIndex: 9999,
        transition: 'width 0.3s ease',
      }}
    >
      <Box
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          📊 Производительность
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            color={performanceStatus.color as any}
            label={performanceStatus.label}
          />
          <IconButton
            size="small"
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Рендеры
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {stats.renderCount}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Ср. время (мс)
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {stats.avgRenderTime.toFixed(1)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Память
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatMemory(stats.memoryUsage)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Drag операции
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {stats.dragOperations}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Оптимизации:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip size="small" label="🚀 Slot mapping" color="success" variant="outlined" />
            <Chip size="small" label="🎯 Memoization" color="success" variant="outlined" />
            <Chip size="small" label="⚡ Throttled scroll" color="success" variant="outlined" />
            <Chip size="small" label="🎨 Enhanced UX" color="success" variant="outlined" />
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
            Цель: &lt;16ms для 60fps
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default PerformanceMonitor;
