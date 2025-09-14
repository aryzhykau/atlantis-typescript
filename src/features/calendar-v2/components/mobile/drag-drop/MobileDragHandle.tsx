import React from 'react';
import { Box, useTheme, alpha } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface MobileDragHandleProps {
  isVisible?: boolean;
  isDragging?: boolean;
  size?: 'small' | 'medium';
  color?: string;
  inline?: boolean;
}

const MobileDragHandle: React.FC<MobileDragHandleProps> = ({
  isVisible = true,
  isDragging = false,
  size = 'small',
  color,
  inline = false,
}) => {
  const theme = useTheme();

  if (!isVisible) return null;

  const iconSize = size === 'small' ? 14 : 18;
  const handleColor = color || theme.palette.grey[600];

  return (
    <Box
      data-drag-handle="true"
      sx={{
        position: inline ? 'static' : 'absolute',
        top: inline ? 'auto' : 2,
        right: inline ? 'auto' : 2,
        width: inline ? 'auto' : iconSize + 4,
        height: inline ? 'auto' : iconSize + 4,
        borderRadius: inline ? 0 : '4px',
        backgroundColor: inline ? 'transparent' : (isDragging 
          ? alpha(theme.palette.primary.main, 0.8)
          : alpha(handleColor, 0.1)),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        transition: theme.transitions.create(['background-color', 'transform'], {
          duration: theme.transitions.duration.short,
        }),
        zIndex: 5,
        marginLeft: inline ? theme.spacing(0.5) : 0,
        '&:hover': {
          backgroundColor: inline ? 'transparent' : alpha(handleColor, 0.2),
          transform: inline ? 'none' : 'scale(1.1)',
        },
        '&:active': {
          cursor: 'grabbing',
          transform: inline ? 'none' : 'scale(1.05)',
        },
      }}
    >
      <DragIndicatorIcon
        className="mobile-drag-icon"
        sx={{
          fontSize: iconSize,
          color: alpha(handleColor, isDragging ? 0.8 : 0.6),
          opacity: isDragging ? 0.8 : 1,
           // Force rotation with important to override any conflicts
          transformOrigin: 'center center',
          // Add debug styling to make rotation obvious
          '&.mobile-drag-icon': {
          },
        }}
      />
    </Box>
  );
};

export default MobileDragHandle;
