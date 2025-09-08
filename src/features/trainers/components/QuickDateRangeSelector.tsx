import React from 'react';
import { ButtonGroup, Button } from '@mui/material';
import dayjs from 'dayjs';

interface QuickDateRangeSelectorProps {
  onRangeSelect: (startDate: string, endDate: string) => void;
}

export const QuickDateRangeSelector: React.FC<QuickDateRangeSelectorProps> = ({ onRangeSelect }) => {
  const handleQuickSelect = (range: 'thisMonth' | 'lastMonth' | 'thisWeek' | 'lastWeek' | 'today') => {
    let startDate: string;
    let endDate: string;

    switch (range) {
      case 'today':
        startDate = endDate = dayjs().format('YYYY-MM-DD');
        break;
      case 'thisWeek':
        startDate = dayjs().startOf('week').format('YYYY-MM-DD');
        endDate = dayjs().endOf('week').format('YYYY-MM-DD');
        break;
      case 'lastWeek':
        startDate = dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
        endDate = dayjs().subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
        break;
      case 'thisMonth':
        startDate = dayjs().startOf('month').format('YYYY-MM-DD');
        endDate = dayjs().endOf('month').format('YYYY-MM-DD');
        break;
      case 'lastMonth':
        startDate = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
        endDate = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
        break;
    }

    onRangeSelect(startDate, endDate);
  };

  return (
    <ButtonGroup size="small" sx={{ mb: 2 }}>
      <Button onClick={() => handleQuickSelect('today')}>Сегодня</Button>
      <Button onClick={() => handleQuickSelect('thisWeek')}>Эта неделя</Button>
      <Button onClick={() => handleQuickSelect('thisMonth')}>Этот месяц</Button>
      <Button onClick={() => handleQuickSelect('lastMonth')}>Прошлый месяц</Button>
    </ButtonGroup>
  );
};
