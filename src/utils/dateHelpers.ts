import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru'; // Russian locale

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale('ru');

export const formatDateTime = (dateTime: string) => {
  return dayjs(dateTime).format('DD.MM.YYYY HH:mm');
};

export const formatDate = (date: string) => {
  return dayjs(date).format('DD.MM.YYYY');
};

export const formatTime = (time: string) => {
  return dayjs(time, 'HH:mm:ss').format('HH:mm');
};

export const formatForDateTimeLocal = (dateTime: string | Date) => {
  return dayjs(dateTime).format('YYYY-MM-DDTHH:mm');
};

export const formatRelativeTime = (dateTime: string) => {
  return dayjs(dateTime).fromNow();
};

export const isWithinHours = (dateTime: string, hours: number) => {
  return dayjs().add(hours, 'hour').isAfter(dayjs(dateTime));
};

export const calculateHoursDifference = (from: string, to: string) => {
  return dayjs(to).diff(dayjs(from), 'hour', true);
};
