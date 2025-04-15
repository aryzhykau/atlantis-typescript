import {ICalendarDay} from "../models/calendarDay.ts";
import {Box, Divider, ListItem, Typography} from "@mui/material";
import {ITrainingGet} from "../models/training.ts";
import TrainingCard from "./TrainingCard.tsx";
import {ITrainingTypeGet} from "../../trainingTypes/models/trainingType.ts";
import {ITrainerGet} from "../../trainers/models/trainer.ts";


interface ICalendarDayColumnProps {
    day: ICalendarDay;
    trainings: ITrainingGet[];
    trainingTypes: ITrainingTypeGet[];
    trainers: ITrainerGet[];
}

const CalendarDayColumn: React.FC<ICalendarDayColumnProps> = ({day, trainings, trainingTypes, trainers}) => {


    return (
        <ListItem key={day.day_name} sx ={{backgroundColor: theme => theme.palette.background.paper ,display: "flex", justifyContent:"flex-start", flexDirection:"column", px: 0, height:"100%"}}>
            <Box display={"flex"} flexDirection={"column"} alignItems={"flex-start"}  justifyContent={"flex-start"}>
                <Box
                    display={"flex"}
                    flexDirection={"column"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    width={"48px"}
                    mb={"4px"}
                    height={"48px"}
                    sx={day.isToday ? {
                        borderRadius:"100%",
                        backgroundColor: theme => theme.palette.primary.dark
                    }: {
                        borderRadius:"100%"
                    }}
                >
                    <Typography
                        variant={"h4"}
                        textAlign={"center"}
                    >
                        {day.date.format("DD")}
                    </Typography>
                </Box>
                <Typography variant={"caption"} color={"textSecondary"}>{day.day_name}</Typography>
            </Box>
            <Divider sx={{width: "100%", my: "8px", borderColor: "black"}}/>
            <Box
                sx={{
                    width: "100%",
                    maxHeight: "700px",
                    overflowY: "auto",
                }}
            >

            {trainings.map((training) => {
                return (
                    <Box key={training.id} sx={{width: "100%", px: "6px", mb: "8px"}}>
                    <TrainingCard
                        key={training.id}
                        training={training}
                        trainingType={trainingTypes.find(type => type.id === training.training_type_id)}
                        trainer={trainers.find(trainer => trainer.id === training.trainer_id)}
                    />
                    </Box>
                )
            })}
            </Box>

        </ListItem>
    )
}

export default CalendarDayColumn;