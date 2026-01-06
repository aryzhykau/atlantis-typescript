import { Grid} from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { StatsCard } from "../StatsCard";

export type StudentStatisticsType = {
    age: number;
    activeSubscriptions: number;
    totalSessions: number;
    enrichedStudentSubscriptions: number;
}

export const StudentStatistics = ({age, activeSubscriptions, totalSessions, enrichedStudentSubscriptions}: StudentStatisticsType) => {
    const statsData = [
        {icon: SchoolIcon, value: age, description: "Возраст"},
        {icon: CardMembershipIcon, value: activeSubscriptions, description: "Активных абонементов"},
        {icon: FitnessCenterIcon, value: totalSessions, description: "Осталось занятий"},
        {icon: EventAvailableIcon, value: enrichedStudentSubscriptions, description: "Всего абонементов"},
    ]

    return (
        <Grid container spacing={3} sx={{ mt: 2 }}>
            {statsData.map(s => {
                return (
                    <StatsCard icon={s.icon} value={s.value} description={s.description}/>
                )
            })}
        </Grid>
    )
}