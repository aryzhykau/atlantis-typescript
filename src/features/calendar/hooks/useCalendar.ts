import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

export interface CalendarState {
  currentDate: dayjs.Dayjs;
  selectedDate: dayjs.Dayjs | null;
}

export const useCalendar = () => {
  const [state, setState] = useState<CalendarState>({
    currentDate: dayjs(),
    selectedDate: null,
  });

  const setCurrentDate = (date: dayjs.Dayjs) => {
    setState(prev => ({ ...prev, currentDate: date }));
  };

  const setSelectedDate = (date: dayjs.Dayjs | null) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  };

  const selectedWeekDays = Array.from({ length: 7 }, (_, i) => 
    state.currentDate.startOf('week').add(i, 'day')
  );

  const goToNextWeek = () => {
    setCurrentDate(state.currentDate.add(1, 'week'));
  };

  const goToPreviousWeek = () => {
    setCurrentDate(state.currentDate.subtract(1, 'week'));
  };

  const selectedStartOfWeek = state.currentDate.startOf('week');
  const selectedEndOfWeek = state.currentDate.endOf('week');

  const getWeekDayNames = () => {
    return ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  };

  return {
    ...state,
    setCurrentDate,
    setSelectedDate,
    selectedWeekDays,
    goToNextWeek,
    goToPreviousWeek,
    selectedStartOfWeek,
    selectedEndOfWeek,
    getWeekDayNames,
  };
};

export default useCalendar; 