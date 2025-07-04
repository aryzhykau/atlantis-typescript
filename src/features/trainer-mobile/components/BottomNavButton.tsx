import React from 'react';
import { BottomNavigationAction, SxProps, useTheme } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface BottomNavButtonProps {
  label: string;
  icon: SvgIconComponent;
  gradientStyle: string;
  sx?: SxProps;
}

export const BottomNavButton: React.FC<BottomNavButtonProps> = ({
  label,
  icon: Icon,
  gradientStyle,
  sx = {}
}) => {
  const theme = useTheme();

  return (
    <BottomNavigationAction
      label={label}
      showLabel={true}
      icon={<Icon />}
      sx={{
        minWidth: 'auto',
        color: theme.palette.text.secondary,
        padding: '8px 4px',
        '&.Mui-selected': {
          color: theme.palette.primary.main,
          background: gradientStyle,
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#ffffff',
          },
          '& .MuiSvgIcon-root': {
            background: gradientStyle,
            borderRadius: '50%',
            padding: '4px',
            color: '#ffffff',
            fontSize: '1.5rem',
          },
        },
        '& .MuiBottomNavigationAction-label': {
          fontSize: '0.75rem',
          fontWeight: 500,
          marginTop: 1,
          color: '#ffffff',
        },
        '& .MuiSvgIcon-root': {
          fontSize: '1.5rem',
        },
        ...sx
      }}
    />
  );
}; 