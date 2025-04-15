import useCalendar from "../../features/calendar/hooks/useCalendar.ts";
import {Box, IconButton, List, Modal, Typography} from "@mui/material";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CalendarDayColumn from "../../features/calendar/components/CalendarDayColumn.tsx";
import Fab from '@mui/material/Fab';
import TrainingForm from "../../features/calendar/components/TrainingForm.tsx";
import {useMemo, useState} from "react";
import {useTrainings} from "../../features/calendar/hooks/useTrainings.ts";
import {useTrainingTypes} from "../../features/trainingTypes/hooks/useTrainingTypes.ts";
import {useTrainers} from "../../features/trainers/hooks/trainerManagementHooks.ts";



const Calendar = () => {
    const {
        today,// Текущая выбранная дата
        selectedStartOfWeek,
        selectedEndOfWeek,
        selectedWeekDays, // Массив из 7 дней выбранной недели
        selectedWeekMonths, // Массив месяцев выбранной недели
        goToNextWeek, // Перейти на неделю вперед
        goToPreviousWeek,
    } = useCalendar();

    const [trainerId, ] = useState<number | undefined>(undefined);
    const formattedStartOfWeek = useMemo(() => selectedStartOfWeek.format(), [selectedStartOfWeek]);
    const formattedEndOfWeek = useMemo(() => selectedEndOfWeek.format(), [selectedEndOfWeek]);
    const {trainingTypes} = useTrainingTypes();
    const {trainers} = useTrainers();

    const {groupedTrainingsByDate} = useTrainings(trainerId, formattedStartOfWeek, formattedEndOfWeek);

    const [modalOpen, setModalOpen] = useState(false);



    const style = {
        position: "absolute",
        width: "50%",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        p: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    };

    return (
        <>
        <Box display={"flex"} height={"100%"} flexDirection={"column"}>
            <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                <Box display={"flex"} justifyContent={"flex-start"} gap={"16px"} alignItems={"center"} mb={"16px"}>
                    <IconButton onClick={goToPreviousWeek}>
                        <KeyboardArrowLeftIcon/>
                    </IconButton>
                    <Box>
                        <Typography variant={"h6"}>{selectedWeekDays[0].date.format("DD.MM")}-{selectedWeekDays[6].date.format("DD.MM")}</Typography>
                    </Box>
                    <IconButton onClick={goToNextWeek}>
                        <KeyboardArrowRightIcon/>
                    </IconButton>
                </Box>
                <Typography variant={"h6"} color={"textSecondary"}>
                    {selectedWeekMonths.length>1 ?
                        `${selectedWeekMonths[0].toUpperCase()}-${selectedWeekMonths[1].toUpperCase()}`
                        : selectedWeekMonths[0].toUpperCase()}
                </Typography>


            </Box>


            <List sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                borderRadius: "50px",
                gridGap: "1px",
                height: "100%",
                width: "100%"
            }}>
                {selectedWeekDays.map((day) => {
                    // console.log(groupedTrainingsByDate)
                    // Преобразуем дату в формат ключа (YYYY-MM-DD)
                    const dayKey = day.date.format('YYYY-MM-DD');
                    // console.log(dayKey)
                    // console.log(groupedTrainingsByDate[dayKey])

                    // Берём тренировки из groupedTrainingsByDate по ключу
                    const trainingsForDay = groupedTrainingsByDate[dayKey] || [];
                    console.log(day.day_name)
                    // console.log(trainingsForDay)

                    return (
                        <CalendarDayColumn key={day.day_name} day={day} trainings={trainingsForDay} trainingTypes={trainingTypes} trainers={trainers}/>
                    );
                })}

            </List>
            <Fab
                onClick={() => setModalOpen(true)}
                color={"primary"}
                sx={{
                    position: "fixed",
                    bottom: 36,
                    right: 36,
                    opacity: 0.4,
                    transition: "opacity 0.5s",
                    "&:hover": {opacity: 1}
                }}
            >
                <AddIcon/>
            </Fab>
        </Box>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <Box sx={style}>
                <TrainingForm
                    initialValues={{
                        trainer_id: null,
                        training_date: today,
                        training_time: null,
                        training_type_id:  null,
                        clients: []
                    }}
                    onClose={() => setModalOpen(false)}
                    trainerId={trainerId}
                    startWeek={selectedStartOfWeek.format()}
                    endWeek={selectedEndOfWeek.format()}
                />
            </Box>
        </Modal>
    </>

    )
}

export default Calendar;