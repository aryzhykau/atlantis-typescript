import { Box, Grid, Paper, Tab, Tabs, alpha, useTheme } from "@mui/material"
import { StudentParentInfoCard } from "../StudentParentInfoCard"
import { StudentInfoCard } from "../StudentInfoCard"
import { StudentActiveSubscriptionCard } from "../StudentActiveSubscriptionCard"
import { useState } from "react"
import { StudentTabPanel } from "./StudentTabPanel"
import { StudentSubscriptionsTable } from "../StudentSubscriptionsTable"
import { IStudentSubscriptionView } from "../../../subscriptions/models/subscription"
import { IStudent } from "../../models/student"
import { useGradients } from "../../../trainer-mobile/hooks/useGradients"


export type StudentContentType = {  
    handleStudentStatusHasChanged: () => void;
    handleSubscriptionDataUpdate: () => void;
    enrichedStudentSubscriptions: IStudentSubscriptionView[];
    isLoadingStudentSubscriptions: boolean;
    student: IStudent;
}

export const StudentContent = ({  
        handleStudentStatusHasChanged, 
        handleSubscriptionDataUpdate, 
        enrichedStudentSubscriptions, 
        isLoadingStudentSubscriptions,
        student
    }: StudentContentType) => {

    const theme = useTheme();
    const gradients = useGradients();
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const a11yProps = (index: number) => ({
        id: `student-tab-${index}`,
        'aria-controls': `student-tabpanel-${index}`,
    });

    return(
        <Box sx={{ p: 3 }}>
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="Student details tabs"
                    sx={{
                        background: alpha(theme.palette.primary.main, 0.05),
                        '& .MuiTab-root': {
                            minHeight: 64,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            color: 'text.secondary',
                            '&.Mui-selected': {
                                color: theme.palette.primary.main,
                                background: theme.palette.background.paper,
                            },
                            '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                            }
                        },
                        '& .MuiTabs-indicator': {
                            background: gradients.primary,
                            height: 3,
                        }
                    }}
                >
                    <Tab label="📊 Информация" {...a11yProps(0)} />
                    <Tab label="🎫 Абонементы" {...a11yProps(1)} />
                </Tabs>
            </Paper>

            <StudentTabPanel value={tabValue} index={0}>
                <Grid container spacing={2} alignItems="stretch">
                    <Grid item xs={12} md={6} lg={4}>
                        <StudentInfoCard student={student} onStatusHasChanged={handleStudentStatusHasChanged} />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <StudentParentInfoCard parentData={student.client} />
                    </Grid>
                    <Grid item xs={12} md={12} lg={4}>
                        <StudentActiveSubscriptionCard 
                            subscriptions={enrichedStudentSubscriptions}
                            isLoading={isLoadingStudentSubscriptions}
                            onSubscriptionUpdate={handleSubscriptionDataUpdate}
                        />
                    </Grid>
                </Grid>
            </StudentTabPanel>

            <StudentTabPanel value={tabValue} index={1}>
                <StudentSubscriptionsTable 
                    subscriptions={enrichedStudentSubscriptions}
                    isLoading={isLoadingStudentSubscriptions}
                />
            </StudentTabPanel>
        </Box>  
    )
}