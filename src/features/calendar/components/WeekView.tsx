import CalendarDayColumn from "./CalendarDayColumn";
import { List } from "@mui/material";
import { ICalendarDay } from "../models/calendarDay";
import { ITrainingGet } from "../models/training";
import { ITrainingTypeGet } from "../../training-types/models/trainingType";
import { ITrainerGet } from "../../trainers/models/trainer";

interface IWeekViewProps {
    days: ICalendarDay[]; // Содержит массив дней (с датами или просто названиями)
    trainingsByDay: Record<string, ITrainingGet[]>; // Тренировки, сгруппированные по дням (ключ: дата)
    trainingTypes: ITrainingTypeGet[];
    trainers: ITrainerGet[];
}

const WeekView: React.FC<IWeekViewProps> = ({ days, trainingsByDay, trainingTypes, trainers }) => {
    return (
        <List
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                borderRadius: "50px",
                gridGap: "1px",
                height: "100%",
                width: "100%",
            }}
        >
            {days.map((day) => {
                const dayKey = day.date ? day.date.format("YYYY-MM-DD") : day.day_name; // Ключ для тренировок
                const trainingsForDay = trainingsByDay[dayKey] || []; // Получаем тренировки для дня

                return (
                    <CalendarDayColumn
                        key={dayKey}
                        day_name={day.day_name}
                        day_object={day}
                        trainings={trainingsForDay}
                        trainingTypes={trainingTypes}
                        trainers={trainers}
                    />
                );
            })}
        </List>
    );
};

export default WeekView;