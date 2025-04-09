import {ICalendarDay} from "../models/calendarDay.ts";
import {Box, Divider, ListItem, Typography} from "@mui/material";


interface ICalendarDayColumnProps {
    day: ICalendarDay;
}

const CalendarDayColumn: React.FC<ICalendarDayColumnProps> = ({day}) => {
    return (
        <ListItem key={day.day_name} sx ={{backgroundColor: theme => theme.palette.background.paper ,display: "flex", justifyContent:"flex-start", flexDirection:"column", px: 0}}>
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
        </ListItem>
    )
}

export default CalendarDayColumn;