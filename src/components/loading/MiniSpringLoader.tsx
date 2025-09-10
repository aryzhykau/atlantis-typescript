import React from 'react';
import { Box, useTheme } from '@mui/material';

interface MiniSpringLoaderProps {
  size?: number;
  height?: string;
}

export const MiniSpringLoader: React.FC<MiniSpringLoaderProps> = ({ 
  size = 60, 
  height = '80vh' 
}) => {
  const theme = useTheme();

  const springAnimation = {
    '@keyframes miniSpringBounce': {
      '0%, 100%': {
        transform: 'scale(1)',
        opacity: 0.8,
      },
      '50%': {
        transform: 'scale(1.2)',
        opacity: 1,
      }
    },
    '@keyframes miniPulse': {
      '0%': {
        boxShadow: `0 0 0 0 ${theme.palette.primary.main}40`,
      },
      '70%': {
        boxShadow: `0 0 0 15px ${theme.palette.primary.main}00`,
      },
      '100%': {
        boxShadow: `0 0 0 0 ${theme.palette.primary.main}00`,
      }
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: '100%', 
        height: height 
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '16px',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: `miniSpringBounce 1000ms cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite, miniPulse 2s infinite`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 20px rgba(102, 126, 234, 0.3)'
            : '0 8px 20px rgba(102, 126, 234, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          ...springAnimation,
          
          // Shine effect
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
            transform: 'rotate(45deg)',
            animation: 'miniShine 2s ease-in-out infinite',
          },
          
          '@keyframes miniShine': {
            '0%': {
              transform: 'rotate(45deg) translate(-100%, -100%)',
            },
            '50%': {
              transform: 'rotate(45deg) translate(100%, 100%)',
            },
            '100%': {
              transform: 'rotate(45deg) translate(-100%, -100%)',
            },
          },
        }}
      >
        <Box
          component="img"
          src="/Logo.PNG"
          alt="Atlantis Logo"
          sx={{
            width: '65%',
            height: '65%',
            objectFit: 'contain',
            filter: 'brightness(1.1) contrast(1.1)',
            position: 'relative',
            zIndex: 2,
          }}
        />
      </Box>
    </Box>
  );
};
