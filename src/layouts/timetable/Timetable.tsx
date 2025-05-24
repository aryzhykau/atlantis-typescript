import useCalendar from "../../features/calendar/hooks/useCalendar";
import WeekView from "../../features/calendar/components/WeekView";

const Timetable = () => {
    const { getWeekDayNames } = useCalendar();

    const days = getWeekDayNames().map((day_name, index) => ({
        day_name,
        day_number: index,
        isToday: false, // Расписание не связано с календарем
    }));

    return (
        <WeekView
            days={days}
            trainingsByDay={{}} // Замените на данные тренировок
            trainingTypes={[]} // Подключите данные
            trainers={[]} // Подключите данные
        />
    );
};

export default Timetable;