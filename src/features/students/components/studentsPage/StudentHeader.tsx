import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from "react-router-dom";
import { ISubscriptionListResponse } from "../../../subscriptions/models/subscription";
import { IStudent } from "../../models/student";
import { useTheme } from '@mui/material';
import { EditButtonST, GoBackButtonST, HeaderButtonST } from "../../styles/styles";

export type StudentHeaderProps = {
    handleOpenAddSubscriptionModal: () => void;
    handleOpenEditModal: () => void;
    subscriptionInfo: SubscriptionInfo;
    student: IStudent;
    age: number;
    isLoadingStudent: boolean;
    hideActions?: boolean;
}

type SubscriptionInfo = {
    hasActiveOrFrozenSubscription: boolean;
    isLoadingAllBaseSubscriptions: boolean;
    allBaseSubscriptionsData: ISubscriptionListResponse | undefined;
}

export const StudentHeader = ({handleOpenAddSubscriptionModal, handleOpenEditModal, subscriptionInfo, student, age, isLoadingStudent, hideActions = false }: StudentHeaderProps) =>  {
    const navigate = useNavigate();
    const handleBackClick = () => navigate(-1);
    const {hasActiveOrFrozenSubscription, isLoadingAllBaseSubscriptions, allBaseSubscriptionsData} = subscriptionInfo;
    const theme = useTheme();
    
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleBackClick} sx={GoBackButtonST}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {student?.first_name} {student?.last_name}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Ученик #{student?.id} • {age} лет
                    </Typography>
                </Box>
            </Box>
            {!hideActions && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Tooltip
                        title={hasActiveOrFrozenSubscription ? 'У ученика уже есть активный или замороженный абонемент' : ''}
                        disableHoverListener={!hasActiveOrFrozenSubscription}
                    >
                        <span>
                            <Button 
                                variant="contained" 
                                onClick={handleOpenAddSubscriptionModal}
                                disabled={hasActiveOrFrozenSubscription || isLoadingAllBaseSubscriptions || !allBaseSubscriptionsData?.items?.length}
                                sx={HeaderButtonST(theme)}
                            >
                                Добавить абонемент
                            </Button>
                        </span>
                    </Tooltip>
                    <IconButton onClick={handleOpenEditModal} disabled={!student || isLoadingStudent} sx={EditButtonST}>
                        <EditIcon />
                    </IconButton>
                </Box>
            )}
        </Box>
    )
}