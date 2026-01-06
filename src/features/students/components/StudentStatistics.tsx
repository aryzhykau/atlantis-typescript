import { Grid, Paper, Typography, alpha, useTheme} from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

export type StudentStatisticsType = {
    age: number;
    activeSubscriptions: number;
    totalSessions: number;
    enrichedStudentSubscriptions: number;
}

export const StudentStatistics = ({age, activeSubscriptions, totalSessions, enrichedStudentSubscriptions}: StudentStatisticsType) => {
    const theme = useTheme();

    return (
        <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: alpha('#ffffff', 0.2),
                        background: alpha('#ffffff', 0.1),
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[8],
                        }
                    }}
                >
                    <SchoolIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {age}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Возраст
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: alpha('#ffffff', 0.2),
                        background: alpha('#ffffff', 0.1),
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[8],
                        }
                    }}
                >
                    <CardMembershipIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {activeSubscriptions}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Активных абонементов
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: alpha('#ffffff', 0.2),
                        background: alpha('#ffffff', 0.1),
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[8],
                        }
                    }}
                >
                    <FitnessCenterIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {totalSessions}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Осталось занятий
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: alpha('#ffffff', 0.2),
                        background: alpha('#ffffff', 0.1),
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[8],
                        }
                    }}
                >
                    <EventAvailableIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {enrichedStudentSubscriptions}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Всего абонементов
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    )
}