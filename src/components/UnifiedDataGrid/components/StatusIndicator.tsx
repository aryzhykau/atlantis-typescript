import React from 'react';
import { Box, Chip, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface StatusIndicatorProps {
  status: string | boolean;
  variant?: 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  variant,
  size = 'small',
  showIcon = true,
}) => {
  const theme = useTheme();

  const getStatusConfig = () => {
    // Auto-detect variant from status if not provided
    let detectedVariant = variant;
    if (!variant) {
      if (typeof status === 'boolean') {
        detectedVariant = status ? 'active' : 'inactive';
      } else {
        const statusLower = status.toString().toLowerCase();
        if (statusLower.includes('активн') || statusLower.includes('active')) {
          detectedVariant = 'active';
        } else if (statusLower.includes('неактивн') || statusLower.includes('inactive')) {
          detectedVariant = 'inactive';
        } else if (statusLower.includes('ожидан') || statusLower.includes('pending')) {
          detectedVariant = 'pending';
        } else if (statusLower.includes('успех') || statusLower.includes('success')) {
          detectedVariant = 'success';
        } else if (statusLower.includes('предупр') || statusLower.includes('warning')) {
          detectedVariant = 'warning';
        } else if (statusLower.includes('ошибк') || statusLower.includes('error')) {
          detectedVariant = 'error';
        } else {
          detectedVariant = 'active';
        }
      }
    }

    const configs = {
      active: {
        color: theme.palette.success.main,
        bg: alpha(theme.palette.success.main, 0.1),
        label: typeof status === 'boolean' ? 'Активен' : status,
        icon: '●',
      },
      inactive: {
        color: theme.palette.error.main,
        bg: alpha(theme.palette.error.main, 0.1),
        label: typeof status === 'boolean' ? 'Неактивен' : status,
        icon: '●',
      },
      pending: {
        color: theme.palette.warning.main,
        bg: alpha(theme.palette.warning.main, 0.1),
        label: status.toString(),
        icon: '◐',
      },
      success: {
        color: theme.palette.success.main,
        bg: alpha(theme.palette.success.main, 0.1),
        label: status.toString(),
        icon: '✓',
      },
      warning: {
        color: theme.palette.warning.main,
        bg: alpha(theme.palette.warning.main, 0.1),
        label: status.toString(),
        icon: '⚠',
      },
      error: {
        color: theme.palette.error.main,
        bg: alpha(theme.palette.error.main, 0.1),
        label: status.toString(),
        icon: '✗',
      },
    };

    return configs[detectedVariant as keyof typeof configs] || configs.active;
  };

  const config = getStatusConfig();

  return (
    <Chip
      size={size}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {showIcon && (
            <Box
              component="span"
              sx={{
                fontSize: '0.75rem',
                lineHeight: 1,
              }}
            >
              {config.icon}
            </Box>
          )}
          {config.label}
        </Box>
      }
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: '0.75rem',
        border: `1px solid ${alpha(config.color, 0.3)}`,
        '& .MuiChip-label': {
          px: 1.5,
          py: 0.5,
        },
      }}
    />
  );
};
