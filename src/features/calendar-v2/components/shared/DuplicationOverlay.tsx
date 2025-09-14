import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import { useAltKey } from '../../hooks/useAltKey';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

/**
 * Global overlay that shows when Alt key is pressed to indicate duplication mode
 */
export const DuplicationOverlay: React.FC = () => {
  const theme = useTheme();
  const { isAltPressed } = useAltKey();

  if (!isAltPressed) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pt: 4,
      }}
    >
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.95),
          color: 'white',
          px: 3,
          py: 1.5,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
          animation: 'fadeIn 0.2s ease-out',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(-10px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <ContentCopyIcon sx={{ fontSize: 20 }} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Режим дублирования активен
        </Typography>
      </Box>
    </Box>
  );
};

export default DuplicationOverlay;
