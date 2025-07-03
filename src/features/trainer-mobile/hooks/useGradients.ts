import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { getGradients, GradientType } from '../constants/gradients';

export const useGradients = () => {
  const theme = useTheme();
  
  const gradients = useMemo(() => getGradients(theme), [theme.palette.mode]);
  
  return gradients;
};

export type { GradientType }; 