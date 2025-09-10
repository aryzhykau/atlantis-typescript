import React from 'react';
import { Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CellComponentProps } from '../types';

interface CurrencyCellProps extends CellComponentProps {
  value: number | null;
  currency?: string;
  colorizeByValue?: boolean;
}

export const CurrencyCell: React.FC<CurrencyCellProps> = ({ 
  value, 
  currency = '€',
  colorizeByValue = false 
}) => {
  const theme = useTheme();

  if (value === null || value === undefined) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  const getColor = () => {
    if (!colorizeByValue) return theme.palette.text.primary;
    
    if (value > 0) return theme.palette.success.main;
    if (value < 0) return theme.palette.error.main;
    return theme.palette.text.primary;
  };

  const formattedValue = value.toFixed(2);

  return (
    <Box
      sx={{
        color: getColor(),
        fontWeight: colorizeByValue && value !== 0 ? 600 : 400,
        fontSize: '0.875rem',
      }}
    >
      {formattedValue} {currency}
    </Box>
  );
};
