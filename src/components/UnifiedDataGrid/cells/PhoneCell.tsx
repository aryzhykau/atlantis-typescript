import React from 'react';
import { Typography, Link, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CellComponentProps, PhoneData } from '../types';

interface PhoneCellProps extends CellComponentProps {
  value: string | PhoneData;
  enableAccessibility?: boolean;
}

export const PhoneCell: React.FC<PhoneCellProps> = ({ 
  value, 
  enableAccessibility = true,
}) => {
  const formatPhone = (phone: string | PhoneData): string => {
    if (typeof phone === 'string') {
      return phone;
    }
    return `${phone.countryCode} ${phone.number}`;
  };

  const getPhoneHref = (phone: string | PhoneData): string => {
    if (typeof phone === 'string') {
      return `tel:${phone.replace(/\s+/g, '')}`;
    }
    return `tel:${phone.countryCode}${phone.number.replace(/\s+/g, '')}`;
  };

  const phoneDisplay = formatPhone(value);

  if (enableAccessibility) {
    return (
      <Tooltip title="Нажмите для звонка" placement="top">
        <Link
          href={getPhoneHref(value)}
          underline="none"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'primary.main',
            fontWeight: 500,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            '&:hover': {
              color: 'primary.dark',
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            }
          }}
        >
          {phoneDisplay}
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
      {phoneDisplay}
    </Typography>
  );
};
