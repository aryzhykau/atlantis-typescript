import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  Backdrop,
} from '@mui/material';

interface AnimatedLoaderProps {
  open: boolean;
  message?: string;
  size?: number;
}

/**
 * Animated loading overlay with logo/branding
 * Used across both mobile and desktop views
 */
const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  open,
  message = 'Загрузка...',
  size = 60,
}) => {
  const theme = useTheme();

  return (
    <Backdrop
      sx={{
        color: theme.palette.primary.main,
        zIndex: theme.zIndex.modal + 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(4px)',
      }}
      open={open}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress
          size={size}
          sx={{
            color: theme.palette.primary.main,
          }}
        />
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default AnimatedLoader;
