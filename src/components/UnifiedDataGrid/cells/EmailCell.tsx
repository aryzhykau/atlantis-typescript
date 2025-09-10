import React from 'react';
import { Typography, Link, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CellComponentProps } from '../types';

interface EmailCellProps extends CellComponentProps {
  value: string;
  enableAccessibility?: boolean;
}

export const EmailCell: React.FC<EmailCellProps> = ({ 
  value, 
  enableAccessibility = true,
}) => {
  if (enableAccessibility) {
    return (
      <Tooltip title="Нажмите для отправки email">
        <Link
          href={`mailto:${value}`}
          onClick={(e) => e.stopPropagation()}
          sx={{
            cursor: 'pointer',
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 'medium',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            '&:hover': {
              textDecoration: 'underline',
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            }
          }}
          aria-label={`Отправить email на ${value}`}
        >
          {value}
        </Link>
      </Tooltip>
    );
  }

  return (
    <Typography
      variant="body2"
      onClick={(e) => e.stopPropagation()}
      sx={{ 
        cursor: 'default',
        userSelect: 'text'
      }}
    >
      {value}
    </Typography>
  );
};
