import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear'; // Плагин для работы с неделями
import isoWeek from 'dayjs/plugin/isoWeek'; // Плагин для ISO-недель
import 'dayjs/locale/ru';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

dayjs.locale('ru');

const useCalendar = () => {
    const today = dayjs(); // Текущая дата
    const [selectedDate, setSelectedDate] = useState<Dayjs>(today); // Выбранный день (по умолчанию - сегодня)

    // Получить все дни текущей недели, начиная с понедельника
    const getWeekDays = (currentDate: Dayjs): { day_name: string; isToday: boolean; date: Dayjs }[] => {
        const startOfWeek = currentDate.startOf('isoWeek'); // Начало текущей недели

        return Array.from({ length: 7 }, (_, i) => {
            const date = startOfWeek.add(i, 'day'); // Каждый следующий день недели
            return {
                day_name: date.format('dddd').toUpperCase(), // Название дня недели
                isToday: date.isSame(today, 'day'), // Является ли этот день сегодняшним
                date, // Объект dayjs (для работы с датой)
            };
        });
    };

    const currentWeekDays = getWeekDays(today); // Все дни текущей недели
    const selectedWeekDays = getWeekDays(selectedDate); // Все дни недели, выбранной даты

    // Получить массив месяцев для текущей недели
    const getMonthsFromWeek = (weekDays: { date: Dayjs }[]): string[] => {
        return [...new Set(weekDays.map(({ date }) => date.format('MMMM')))];
    };

    const currentMonths = getMonthsFromWeek(currentWeekDays); // Массив месяцев для текущей недели
    const selectedWeekMonths = getMonthsFromWeek(selectedWeekDays); // Массив месяцев выбранной недели

    // Получить дату начала и конца выбранной недели (понедельник и воскресенье)
    const getStartAndEndOfWeek = (date: Dayjs): { startOfWeek: Dayjs; endOfWeek: Dayjs } => {
        const startOfWeek = date.startOf('isoWeek'); // Начало недели (понедельник)
        const endOfWeek = date.endOf('isoWeek'); // Конец недели (воскресенье)
        return { startOfWeek, endOfWeek };
    };

    const { startOfWeek: selectedStartOfWeek, endOfWeek: selectedEndOfWeek } =
        getStartAndEndOfWeek(selectedDate);

    // Функции для переключения недели
    const goToNextWeek = () => setSelectedDate((prev) => prev.add(1, 'week')); // Следующая неделя
    const goToPreviousWeek = () => setSelectedDate((prev) => prev.subtract(1, 'week')); // Предыдущая неделя

    return {
        today, // Текущая дата (Dayjs)
        currentWeekDays, // Массив из 7 дней текущей недели
        currentMonths, // Массив месяцев текущей недели
        selectedDate, // Текущая выбранная дата
        selectedWeekDays, // Массив из 7 объектов с информацией о днях выбранной недели
        selectedWeekMonths, // Массив месяцев выбранной недели
        selectedStartOfWeek, // Дата начала выбранной недели (понедельник)
        selectedEndOfWeek, // Дата конца выбранной недели (воскресенье)
        goToNextWeek, // Перейти на неделю вперед
        goToPreviousWeek, // Перейти на неделю назад
    };
};

export default useCalendar;