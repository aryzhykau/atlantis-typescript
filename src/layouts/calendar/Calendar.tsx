import useCalendar from "../../features/calendar/hooks/useCalendar";
import WeekView from "../../features/calendar/components/WeekView";
import { Box, IconButton, Typography } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useTrainings } from "../../features/calendar/hooks/useTrainings";

const Calendar = () => {
    const {
        selectedWeekDays,
        goToNextWeek,
        goToPreviousWeek,
        selectedStartOfWeek,
        selectedEndOfWeek,
    } = useCalendar();
    const trainerId = undefined
    const { groupedTrainingsByDate } = useTrainings(trainerId, selectedStartOfWeek.format(), selectedEndOfWeek.format());

    return (
        <Box display="flex" height="100%" flexDirection="column">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <IconButton onClick={goToPreviousWeek}>
                    <KeyboardArrowLeftIcon />
                </IconButton>
                <Typography variant="h6">
                    {selectedStartOfWeek.format("DD.MM")} - {selectedEndOfWeek.format("DD.MM")}
                </Typography>
                <IconButton onClick={goToNextWeek}>
                    <KeyboardArrowRightIcon />
                </IconButton>
            </Box>

            <WeekView
                days={selectedWeekDays}
                trainingsByDay={groupedTrainingsByDate}
                trainingTypes={[]} // Подключите данные
                trainers={[]} // Подключите данные
            />
        </Box>
    );
};

export default Calendar;