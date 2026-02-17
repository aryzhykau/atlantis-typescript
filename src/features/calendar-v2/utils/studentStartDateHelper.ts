import dayjs from 'dayjs';
import { Theme } from '@mui/material/styles';

export interface StartDateDisplayInfo {
  icon: string;
  text: string;
  statusText: string;
  formattedDate: string;
}

/**
 * Helper function to get colors, status text, and formatted date based on student start date
 * Used in both TrainingTemplateModal (desktop) and AssignedStudents (mobile bottom sheet)
 */
export const getStartDateColorsAndStatus = (
  startDateStr: string,
  theme: Theme
): StartDateDisplayInfo => {
  const startDate = dayjs(startDateStr).startOf('day');
  const today = dayjs().startOf('day');
  const isPast = startDate.isBefore(today);
  const isFuture = startDate.isAfter(today);

  const formattedDate = startDate.format('DD.MM.YYYY');

  if (isPast) {
    return {
      icon: theme.palette.error.main,
      text: theme.palette.error.main,
      statusText: 'уже начал(а)',
      formattedDate,
    };
  }
  if (isFuture) {
    return {
      icon: theme.palette.success.main,
      text: theme.palette.success.main,
      statusText: 'еще не начал(а) посещать',
      formattedDate,
    };
  }
  return {
    icon: theme.palette.text.primary,
    text: theme.palette.text.primary,
    statusText: 'начинает сегодня',
    formattedDate,
  };
};
