import React from 'react';
import { Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CellComponentProps } from '../types';

interface CurrencyCellProps extends CellComponentProps {
  value: number;
  currency?: string;
  colorByValue?: boolean;
}

export const CurrencyCell: React.FC<CurrencyCellProps> = ({ 
  value, 
  currency = '€',
  colorByValue = false
}) => {
  const theme = useTheme();

  const getValueColor = (val: number) => {
    if (!colorByValue) return theme.palette.text.primary;
    
    if (val > 0) return theme.palette.success.main;
    if (val < 0) return theme.palette.error.main;
    return theme.palette.text.primary;
  };

  const formatValue = (val: number) => {
    return `${val.toFixed(2)} ${currency}`;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: getValueColor(value),
          fontSize: '0.875rem',
        }}
      >
        {formatValue(value)}
      </Typography>
    </Box>
  );
};
