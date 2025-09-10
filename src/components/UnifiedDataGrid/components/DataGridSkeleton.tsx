import React from 'react';
import { Box, Skeleton, Paper, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface DataGridSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  height?: number | string;
}

export const DataGridSkeleton: React.FC<DataGridSkeletonProps> = ({
  rows = 10,
  columns = 5,
  showHeader = true,
  height = 400
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      sx={{
        height,
        borderRadius: '12px',
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        overflow: 'hidden',
        background: isDark 
          ? alpha(theme.palette.background.paper, 0.95) 
          : 'white',
        boxShadow: isDark 
          ? '0 8px 32px 0 rgba(0,0,0,0.12)' 
          : '0 8px 32px 0 rgba(80,0,120,0.08)',
      }}
    >
      {/* Header skeleton */}
      {showHeader && (
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08)} 0%, ${alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06)} 100%)`,
            borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: '12px 12px 0 0',
            p: 2,
            display: 'flex',
            gap: 2,
          }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              width={index === 0 ? 120 : 80}
              height={24}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.05),
              }}
            />
          ))}
        </Box>
      )}

      {/* Rows skeleton */}
      <Box sx={{ p: 2 }}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Box
            key={rowIndex}
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
              p: 1,
              borderRadius: 1,
              '&:hover': {
                bgcolor: alpha(theme.palette.action.hover, 0.02),
              },
            }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="rectangular"
                width={colIndex === 0 ? 140 : 100}
                height={20}
                sx={{
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.action.hover, isDark ? 0.08 : 0.04),
                }}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
