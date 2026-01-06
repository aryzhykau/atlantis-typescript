import { Box, Chip, CircularProgress, Typography } from "@mui/material";
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { SubscriptionHeaderST } from "../../../styles/styles";
import { useGradients } from "../../../../trainer-mobile/hooks/useGradients";
import { IStudentSubscriptionView } from "../../../../subscriptions/models/subscription";

export type SubscriptionCardHeaderType = {
    isLoading: boolean;
    activeSubscription: IStudentSubscriptionView | undefined;
}

export const SubscriptionCardHeader = ({isLoading, activeSubscription}: SubscriptionCardHeaderType) => {
    const gradients = useGradients();

    const getStatusColor = () => {
        if (!activeSubscription) return 'default';
        const status = activeSubscription.status?.toLowerCase();
        if (status === 'active') return 'success';
        if (status === 'frozen') return 'info';
        if (status === 'expired') return 'error';
        return 'default';
    };

    const getStatusGradient = () => {
        const color = getStatusColor();
        if (color === 'default') return gradients.primary;
        if (color === 'error') return gradients.warning; // Используем warning для error
        return gradients[color];
    };
    
    return (
        <Box sx={SubscriptionHeaderST(gradients)}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CardMembershipIcon sx={{ fontSize: 32, mr: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            Активный абонемент
                        </Typography>
                    </Box>
                </Box>
                
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                        <CircularProgress sx={{ color: 'white' }} />
                    </Box>
                ) : activeSubscription ? (
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                            {activeSubscription.subscription_name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                            <Chip
                                label={
                                    activeSubscription.status?.toLowerCase() === 'active' ? 'Активен' :
                                    activeSubscription.status?.toLowerCase() === 'frozen' ? 'Заморожен' :
                                    activeSubscription.status?.toLowerCase() === 'expired' ? 'Истёк' :
                                    'Неизвестен'
                                }
                                color={getStatusColor()}
                                size="small"
                                sx={{
                                    background: getStatusGradient(),
                                    color: 'white',
                                    fontWeight: 600,
                                    '& .MuiChip-label': {
                                        color: 'white',
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="body1" sx={{ textAlign: 'center', opacity: 0.9 }}>
                        Нет активного абонемента
                    </Typography>
                )}
            </Box>
        </Box>
    )
}