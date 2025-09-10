import React from 'react';
import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import { CellComponentProps } from '../types';

interface DateCellProps extends CellComponentProps {
  value: string | Date | null;
  format?: string;
  includeTime?: boolean;
}

export const DateCell: React.FC<DateCellProps> = ({ 
  value, 
  format,
  includeTime = false
}) => {
  if (!value) {
    return (
      <Typography variant="body2" color="text.secondary">
        Не указана
      </Typography>
    );
  }

  const date = dayjs(value);
  
  if (!date.isValid()) {
    return (
      <Typography variant="body2" color="error">
        Неверная дата
      </Typography>
    );
  }

  const defaultFormat = includeTime ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY';
  const formattedDate = date.format(format || defaultFormat);

  return (
    <Typography variant="body2">
      {formattedDate}
    </Typography>
  );
};
