import React from 'react';
import { Box } from '@mui/material';
import { Theme } from '@mui/material/styles';

export const getBottomSheetPaperSx = (
  theme: Theme,
  overrides: Record<string, unknown> = {}
) => ({
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  background: theme.palette.background.paper,
  boxShadow: '0px -12px 30px rgba(15,23,42,0.18)',
  backdropFilter: 'none',
  ...overrides,
});

export const BottomSheetHandle: React.FC = () =>
  React.createElement(Box, {
    sx: (theme: Theme) => ({
      width: 48,
      height: 4,
      background: theme.palette.divider,
      borderRadius: 2,
      mx: 'auto',
      mt: 2,
      mb: 1,
      opacity: 0.6,
    }),
  });
