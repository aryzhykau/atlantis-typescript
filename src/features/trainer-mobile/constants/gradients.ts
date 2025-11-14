import { Theme } from '@mui/material';

export const getGradients = (theme: Theme) => ({
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
  error: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
    : 'linear-gradient(135deg, #f85032 0%, #e73827 100%)',
});

export type GradientType = 'primary' | 'success' | 'warning' | 'info' | 'error'; 