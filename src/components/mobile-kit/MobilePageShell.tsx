import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { useGradients } from '../../features/trainer-mobile/hooks/useGradients';

interface MobilePageShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  stats?: React.ReactNode;
  fab?: React.ReactNode;
  heroGradient?: string;
}

export function MobilePageShell({
  title,
  subtitle,
  icon,
  children,
  actions,
  stats,
  fab,
  heroGradient,
}: MobilePageShellProps) {
  const gradients = useGradients();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ p: 2, pb: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: heroGradient ?? gradients.primary,
          color: 'white',
          p: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: isDark ? 0.2 : 0.3,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
              {icon}
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.95 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions}
        </Box>
      </Paper>

      {stats}
      {children}
      {fab}
    </Box>
  );
}
