import {ICalendarDay} from "../models/calendarDay.ts";
import {Box, Divider, ListItem, Typography} from "@mui/material";
import {ITrainingGet} from "../models/training.ts";
import TrainingCard from "./TrainingCard.tsx";
import {ITrainingTypeGet} from "../../training-types/models/trainingType.ts";
import {ITrainerGet} from "../../trainers/models/trainer.ts";


interface ICalendarDayColumnProps {
    day_name: string;
    day_object?: ICalendarDay;
    trainings: ITrainingGet[];
    trainingTypes: ITrainingTypeGet[];
    trainers: ITrainerGet[];
}

const CalendarDayColumn: React.FC<ICalendarDayColumnProps> = ({day_name, day_object, trainings, trainingTypes, trainers}) => {


    return (
        <ListItem key={day_name} sx ={{backgroundColor: theme => theme.palette.background.paper ,display: "flex", justifyContent:"flex-start", flexDirection:"column", px: 0, height:"100%"}}>
            <Box display={"flex"} flexDirection={"column"} alignItems={"flex-start"}  justifyContent={"flex-start"}>
                {day_object && day_object.date ? (
                <Box
                    display={"flex"}
                    flexDirection={"column"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    width={"48px"}
                    mb={"4px"}
                    height={"48px"}
                    borderRadius={"100%"}
                    sx={day_object && day_object.isToday ? {
                        backgroundColor: theme => theme.palette.primary.dark
                    }: {
                    }}
                >

                        <Typography variant={"h4"} textAlign={"center"}>
                            {day_object.date.format("DD")}
                        </Typography>


                </Box>
                ): null}
                <Typography variant={day_object && day_object.date ? "caption": "h4"} color={"textSecondary"}>{day_name}</Typography>
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