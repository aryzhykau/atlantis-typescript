import { Box, Grid, Paper, Typography } from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useGradients } from "../../../trainer-mobile/hooks/useGradients";

export type StudentStatisticsType = {
    age: number;
    activeSubscriptions: number;
    totalSessions: number;
    enrichedStudentSubscriptions: number;
}

export const StudentStatistics = ({age, activeSubscriptions, totalSessions, enrichedStudentSubscriptions}: StudentStatisticsType) => {
    const gradients = useGradients();

    const statsData = [
        {icon: SchoolIcon, value: age, description: "Возраст", gradient: gradients.primary},
        {icon: CardMembershipIcon, value: activeSubscriptions, description: "Активных абонементов", gradient: gradients.info},
        {icon: FitnessCenterIcon, value: totalSessions, description: "Осталось занятий", gradient: gradients.success},
        {icon: EventAvailableIcon, value: enrichedStudentSubscriptions, description: "Всего абонементов", gradient: gradients.warning},
    ]

    return (
        <Grid container spacing={1.5} sx={{ mt: 2 }}>
            {statsData.map((s, idx) => {
                const Icon = s.icon;
                return (
                    <Grid item xs={6} key={idx}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                background: s.gradient,
                                borderRadius: 3,
                                color: 'white',
                                minHeight: 110,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icon sx={{ fontSize: 22, opacity: 0.95 }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                    {s.description}
                                </Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                {s.value}
                            </Typography>
                        </Paper>
                    </Grid>
                )
            })}
        </Grid>
    )
}