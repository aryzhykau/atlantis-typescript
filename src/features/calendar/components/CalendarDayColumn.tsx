import {ICalendarDay} from "../models/calendarDay.ts";
import {Box, Divider, ListItem, Typography} from "@mui/material";
import {ITrainingGet} from "../models/training.ts";
import {useEffect} from "react";
import TrainingCard from "./TrainingCard.tsx";


interface ICalendarDayColumnProps {
    day: ICalendarDay;
    trainings: ITrainingGet[]
}

const CalendarDayColumn: React.FC<ICalendarDayColumnProps> = ({day, trainings}) => {

    useEffect(() => {
        // console.log(day.day_name)
        console.log(trainings)
    }, []);

    return (
        <ListItem key={day.day_name} sx ={{backgroundColor: theme => theme.palette.background.paper ,display: "flex", justifyContent:"flex-start", flexDirection:"column", px: 0, height:"100%"}}>
            <Box display={"flex"} flexDirection={"column"} alignItems={"center"}  justifyContent={"flex-start"}>
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
                    maxHeight: "700px",
                    overflowY: "scroll",
                }}
            >

            {trainings.map((training) => {
                return (
                    <Box key={training.id} sx={{width: "100%", px: "4px", mb: "8px"}}>
                    <TrainingCard key={training.id} training={training}/>
                    </Box>
                )
            })}
            </Box>

        </ListItem>
    )
}

export default CalendarDayColumn;