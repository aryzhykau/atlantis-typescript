import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/ru';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.locale('ru');

const useCalendar = () => {
    const today = dayjs(); // Текущая дата
    const [selectedDate, setSelectedDate] = useState<Dayjs>(today); // Выбранный день (по умолчанию — сегодня)

    const weekDays = [
        "Понедельник",
        "Вторник",
        "Среда",
        "Четверг",
        "Пятница",
        "Суббота",
        "Воскресенье"
    ];

    // Полный список дней текущей недели
    const getWeekDays = (currentDate: Dayjs): { day_name: string; isToday: boolean; date: Dayjs; day_number: number }[] => {
        const startOfWeek = currentDate.startOf('isoWeek'); // Начало текущей недели

        return Array.from({ length: 7 }, (_, i) => {
            const date = startOfWeek.add(i, 'day'); // Каждый следующий день недели
            return {
                day_name: date.format('dddd').toUpperCase(), // Название дня недели
                isToday: date.isSame(today, 'day'), // Является ли этот день сегодняшним
                date, // Объект dayjs (для работы с датой)
                day_number: i, // Номер дня недели (начиная с 0)
            };
        });
    };

    // Получить только названия дней для расписания
    const getWeekDayNames = (): string[] => weekDays;

    const currentWeekDays = getWeekDays(today); // Дни текущей недели
    const selectedWeekDays = getWeekDays(selectedDate); // Дни выбранной недели

    const getMonthsFromWeek = (weekDays: { date: Dayjs }[]): string[] => {
        return [...new Set(weekDays.map(({ date }) => date.format('MMMM')))];
    };

    const currentMonths = getMonthsFromWeek(currentWeekDays);
    const selectedWeekMonths = getMonthsFromWeek(selectedWeekDays);

    // Дата начала и окончания текущей выбранной недели
    const selectedStartOfWeek = selectedDate.startOf('isoWeek'); // Начало (понедельник) выбранной недели
    const selectedEndOfWeek = selectedDate.endOf('isoWeek'); // Конец (воскресенье) выбранной недели

    const goToNextWeek = () => setSelectedDate((prev) => prev.add(1, 'week'));
    const goToPreviousWeek = () => setSelectedDate((prev) => prev.subtract(1, 'week'));

    return {
        today, // Текущая дата
        weekDays, // Названия дней недели
        getWeekDays, // Функция получения структурированных дней недели
        getWeekDayNames, // Функция получения только названий дней недели
        currentWeekDays, // Дни текущей недели
        selectedWeekDays, // Дни выбранной недели
        currentMonths, // Месяцы текущей недели
        selectedWeekMonths, // Месяцы выбранной недели
        selectedStartOfWeek, // Начало выбранной недели
        selectedEndOfWeek, // Конец выбранной недели
        goToNextWeek, // Перейти на следующую неделю
        goToPreviousWeek, // Перейти к предыдущей неделе
        selectedDate, // Текущая выбранная дата
    };
};

export default useCalendar;