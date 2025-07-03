import React from 'react';
import { Box, Paper, Typography, SxProps, useTheme } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { useGradients, GradientType } from '../hooks/useGradients';

interface StatsCardProps {
  icon: SvgIconComponent;
  value: string | number;
  label: string;
  gradient?: GradientType;
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
  const gradients = useGradients();

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