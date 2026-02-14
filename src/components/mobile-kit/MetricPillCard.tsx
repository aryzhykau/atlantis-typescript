import { Box, Paper, Typography } from '@mui/material';
import React from 'react';

interface MetricPillCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
}

export function MetricPillCard({ icon, label, value, gradient }: MetricPillCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        borderRadius: 3,
        background: gradient,
        color: 'white',
        minHeight: 86,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>
          {label}
        </Typography>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
        {value}
      </Typography>
    </Paper>
  );
}
