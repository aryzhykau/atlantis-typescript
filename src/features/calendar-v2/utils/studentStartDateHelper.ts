import dayjs from 'dayjs';

/**
 * Helper function to get colors and status text based on student start date
 * Used in both TrainingTemplateModal (desktop) and AssignedStudents (mobile bottom sheet)
 */
export const getStartDateColorsAndStatus = (
  startDateStr: string,
  theme: any
): {
  icon: string;
  text: string;
  statusText: string;
} => {
  const startDate = dayjs(startDateStr).startOf('day');
  const today = dayjs().startOf('day');
  const isPast = startDate.isBefore(today);
  const isFuture = startDate.isAfter(today);

  if (isPast) {
    return {
      icon: theme.palette.error.main,
      text: theme.palette.error.main,
      statusText: 'уже начал(а)',
    };
  }
  if (isFuture) {
    return {
      icon: theme.palette.success.main,
      text: theme.palette.success.main,
      statusText: 'еще не начал(а) посещать',
    };
  }
  return {
    icon: theme.palette.text.primary,
    text: theme.palette.text.primary,
    statusText: 'начинает сегодня',
  };
};

/**
 * Helper function to get opacity values for icon and text
 */
export const getStartDateOpacity = () => ({
  iconOpacity: 0.6,
  textOpacity: 0.8,
  iconDefaultOpacity: 0.5,
  textDefaultOpacity: 0.7,
});
