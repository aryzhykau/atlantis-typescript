import { Box, Grid, Paper, Tab, Tabs, useTheme } from "@mui/material"
import { StudentParentInfoCard } from "../StudentParentInfoCard"
import { StudentInfoCard } from "../StudentInfoCard"
import { StudentActiveSubscriptionCard } from "../StudentActiveSubscriptionCard"
import { useState } from "react"
import { StudentTabPanel } from "./StudentTabPanel"
import { StudentSubscriptionsTable } from "../StudentSubscriptionsTable"
import { IStudentSubscriptionView } from "../../../subscriptions/models/subscription"
import { IStudent } from "../../models/student"
import { useGradients } from "../../../trainer-mobile/hooks/useGradients"
import { TabsST } from "../../styles/styles"


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

    return(
        <Box sx={{ p: 3 }}>
            <Paper
                elevation={0}
                sx={{borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                mb: 3}}
            >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={TabsST(theme, gradients)}>
                    <Tab label="Информация" />
                    <Tab label="Абонементы" />
                </Tabs>
            </Box>

            <StudentTabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
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
                            studentId={student.id}
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
        </Paper>
        </Box>  
    )
}