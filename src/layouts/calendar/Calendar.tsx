import useCalendar from "../../features/calendar/hooks/useCalendar.ts";
import {Box, IconButton, List, Modal, Typography} from "@mui/material";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CalendarDayColumn from "../../features/calendar/components/CalendarDayColumn.tsx";
import Fab from '@mui/material/Fab';
import TrainingForm from "../../features/calendar/components/TrainingForm.tsx";
import {useState} from "react";



const Calendar = () => {
    const {
        today,// Текущая выбранная дата
        selectedWeekDays, // Массив из 7 дней выбранной недели
        selectedWeekMonths, // Массив месяцев выбранной недели
        goToNextWeek, // Перейти на неделю вперед
        goToPreviousWeek,
    } = useCalendar();

    const [modalOpen, setModalOpen] = useState(false);


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
                flexGrow: 1,

                width: "100%"
            }}>
                {selectedWeekDays.map((day) => (
                    <CalendarDayColumn key={day.day_name} day={day}/>
                ))}
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
            <TrainingForm initialValues={{
                trainer_id: null,
                training_date: today,
                training_time: today,
                training_type_id:  null,
                clients: []
            }} onClose={() => setModalOpen(false)}/>
        </Modal>
    </>

    )
}

export default Calendar;