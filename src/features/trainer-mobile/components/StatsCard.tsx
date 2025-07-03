import React from 'react';
import { Box, Paper, Typography, SxProps, useTheme } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface StatsCardProps {
  icon: SvgIconComponent;
  value: string | number;
  label: string;
  gradient?: 'primary' | 'success' | 'warning' | 'info';
  sx?: SxProps;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  icon: Icon, 
  value, 
  label, 
  gradient = 'success',
  sx = {}
}) => {
  const theme = useTheme();

  // Динамические градиенты в зависимости от темы
  const gradients = {
    primary: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #8e44ad 0%, #6c5ce7 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
      : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
      : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    info: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
      : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2, 
        background: gradients[gradient],
        borderRadius: 3,
        color: 'white',
        textAlign: 'center',
        ...sx
      }}
    >
      <Icon sx={{ fontSize: 32, mb: 1 }} />
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          opacity: theme.palette.mode === 'dark' ? 0.95 : 0.8,
          fontWeight: theme.palette.mode === 'dark' ? 500 : 400,
          textShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {label}
      </Typography>
    </Paper>
  );
}; 