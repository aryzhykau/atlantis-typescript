import React from 'react';
import { Typography, Link, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CellComponentProps } from '../types';

interface ClickableCellProps extends CellComponentProps {
  value: any;
  navigateUrl?: string;
  onClick?: () => void;
  variant?: 'link' | 'button' | 'text';
}

export const ClickableCell: React.FC<ClickableCellProps> = ({ 
  value, 
  navigateUrl,
  onClick,
  variant = 'link'
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onClick) {
      onClick();
    } else if (navigateUrl) {
      navigate(navigateUrl);
    }
  };

  if (variant === 'link') {
    return (
      <Tooltip title="Нажмите для перехода">
        <Link
          component="span"
          onClick={handleClick}
          sx={{
            cursor: 'pointer',
            color: 'primary.main',
            fontWeight: 'medium',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {value}
        </Link>
      </Tooltip>
    );
  }

  return (
    <Typography 
      onClick={handleClick}
      sx={{ 
        cursor: 'pointer',
        fontWeight: variant === 'button' ? 600 : 400,
        color: variant === 'button' ? 'primary.main' : 'text.primary',
        '&:hover': {
          color: 'primary.main',
          textDecoration: variant === 'button' ? 'underline' : 'none',
        }
      }}
    >
      {value}
    </Typography>
  );
};
