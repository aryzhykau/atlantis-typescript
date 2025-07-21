import React, { useState } from 'react';
import { 
    Paper, 
    Typography, 
    Box, 
    Chip, 
    CircularProgress, 
    Button, 
    Switch,
    alpha,
    Tooltip
} from '@mui/material';
import { IStudentSubscriptionView, IStudentSubscriptionFreezePayload, IStudentSubscriptionAutoRenewalUpdatePayload } from '../../subscriptions/models/subscription';
import dayjs, { Dayjs } from 'dayjs';
import { 
    useFreezeStudentSubscriptionMutation, 
    useUnfreezeStudentSubscriptionMutation,
    useUpdateStudentSubscriptionAutoRenewalMutation 
} from '../../../store/apis/subscriptionsApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useTheme } from '@mui/material';
import { FreezeSubscriptionForm } from './FreezeSubscriptionForm';

// Иконки
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AcUnitIcon from '@mui/icons-material/AcUnit';
// import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
// import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PaymentIcon from '@mui/icons-material/Payment';
import CardMembershipIcon from '@mui/icons-material/CardMembership';

interface StudentActiveSubscriptionCardProps {
    subscriptions: IStudentSubscriptionView[];
    isLoading: boolean;
    studentId: number;
    onSubscriptionUpdate?: () => void;
}

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    color?: 'primary' | 'success' | 'warning' | 'info';
    children?: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, color = 'primary', children }) => {
    const theme = useTheme();
    const gradients = useGradients();
    
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.background.paper,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: theme.shadows[4],
                    borderColor: alpha(theme.palette[color].main, 0.3),
                    background: alpha(theme.palette[color].main, 0.02),
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                    sx={{
                        p: 1,
                        borderRadius: 2,
                        background: gradients[color],
                        color: 'white',
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40,
                        height: 40,
                    }}
                >
                    {icon}
                </Box>
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                    }}
                >
                    {label}
                </Typography>
            </Box>
            <Box sx={{ pl: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    {typeof value === 'string' ? (
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                fontWeight: 500,
                                color: value === 'Не указан' || value === 'Не указана' 
                                    ? 'text.secondary' 
                                    : 'text.primary'
                            }}
                        >
                            {value}
                        </Typography>
                    ) : (
                        value
                    )}
                </Box>
                {children && (
                    <Box sx={{ ml: 2 }}>
                        {children}
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export const StudentActiveSubscriptionCard: React.FC<StudentActiveSubscriptionCardProps> = ({ subscriptions, isLoading, studentId, onSubscriptionUpdate }) => {
    const { displaySnackbar } = useSnackbar();
    const theme = useTheme();
    const gradients = useGradients();
    const now = dayjs();
    const activeSubscription = subscriptions.find(sub => 
        now.isBetween(dayjs(sub.start_date), dayjs(sub.end_date), null, '[]')
    );

    const isFrozen = !!(activeSubscription?.freeze_start_date && activeSubscription?.freeze_end_date);

    const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
    
    const [freezeSubscription, { isLoading: isFreezing }] = useFreezeStudentSubscriptionMutation();
    const [unfreezeSubscription, { isLoading: isUnfreezing }] = useUnfreezeStudentSubscriptionMutation();
    const [updateAutoRenewal, { isLoading: isUpdatingAutoRenewal }] = useUpdateStudentSubscriptionAutoRenewalMutation();

    const handleOpenFreezeModal = () => setIsFreezeModalOpen(true);
    const handleCloseFreezeModal = () => setIsFreezeModalOpen(false);

    interface FreezeFormValues {
        freeze_start_date: Dayjs | null;
        freeze_duration_days: number;
    }

    const handleFreezeSubmit = async (values: FreezeFormValues) => {
        if (!activeSubscription || !values.freeze_start_date) return;

        const payload: IStudentSubscriptionFreezePayload = {
            freeze_start_date: values.freeze_start_date.toISOString(),
            freeze_duration_days: values.freeze_duration_days,
        };

        try {
            await freezeSubscription({ studentSubscriptionId: activeSubscription.id, payload }).unwrap();
            displaySnackbar('Абонемент успешно заморожен', 'success');
            handleCloseFreezeModal();
            onSubscriptionUpdate?.();
        } catch (error: any) {
            console.error("Ошибка заморозки абонемента:", error);
            const errorDetail = error?.data?.detail || 'Ошибка при заморозке абонемента';
            displaySnackbar(String(errorDetail), 'error');
        }
    };

    const handleUnfreeze = async () => {
        if (!activeSubscription) return;
        try {
            await unfreezeSubscription({ studentSubscriptionId: activeSubscription.id, studentId }).unwrap();
            displaySnackbar('Абонемент успешно разморожен', 'success');
            onSubscriptionUpdate?.();
        } catch (error: any) {
            console.error("Ошибка разморозки абонемента:", error);
            const errorDetail = error?.data?.detail || 'Ошибка при разморозке абонемента';
            displaySnackbar(String(errorDetail), 'error');
        }
    };

    const handleToggleAutoRenewal = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!activeSubscription) return;
        const newIsAutoRenew = event.target.checked;
        const payload: IStudentSubscriptionAutoRenewalUpdatePayload = { is_auto_renew: newIsAutoRenew };

        try {
            await updateAutoRenewal({ studentSubscriptionId: activeSubscription.id, payload }).unwrap();
            displaySnackbar(`Автопродление ${newIsAutoRenew ? 'включено' : 'выключено'}`, 'success');
            onSubscriptionUpdate?.();
        } catch (error: any) {
            console.error("Ошибка обновления автопродления:", error);
            const errorDetail = error?.data?.detail || 'Ошибка при обновлении автопродления';
            displaySnackbar(String(errorDetail), 'error');
        }
    };
    
    const freezeEndDateDisplay = activeSubscription?.freeze_start_date && activeSubscription.freeze_end_date
    ? dayjs(activeSubscription.freeze_end_date).format('DD.MM.YYYY')
    : activeSubscription?.freeze_start_date && !activeSubscription.freeze_end_date 
    ? 'активна до отмены'
    : '...';

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
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                background: theme.palette.background.paper,
            }}
        >
            {/* Градиентный заголовок */}
            <Box
                sx={{
                    p: 3,
                    background: gradients.primary,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        opacity: 0.3,
                    }
                }}
            >
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
                            
                            {/* Статус абонемента */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                <Box
                                    sx={{
                                        p: 1,
                                        borderRadius: 2,
                                        background: getStatusGradient(),
                                        color: 'white',
                                        mr: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: 40,
                                        height: 40,
                                    }}
                                >
                                    {/* {activeSubscription.status?.toLowerCase() === 'active' ? <PlayCircleOutlineIcon /> : 
                                     activeSubscription.status?.toLowerCase() === 'frozen' ? <PauseCircleOutlineIcon /> : 
                                     <EventBusyIcon />} */}
                                </Box>
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

            {/* Контент карточки */}
            {!isLoading && activeSubscription && (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                        <InfoItem
                            icon={<EventAvailableIcon />}
                            label="Дата начала"
                            value={dayjs(activeSubscription.start_date).format('DD.MM.YYYY HH:mm')}
                            color="success"
                        />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <InfoItem
                            icon={<EventBusyIcon />}
                            label="Дата окончания"
                            value={dayjs(activeSubscription.end_date).format('DD.MM.YYYY HH:mm')}
                            color="warning"
                        />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <InfoItem
                            icon={<FitnessCenterIcon />}
                            label="Осталось занятий"
                            value={activeSubscription.sessions_left}
                            color="primary"
                        />
                    </Box>

                    {activeSubscription.transferred_sessions > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <InfoItem
                                icon={<FitnessCenterIcon />}
                                label="Перенесенные занятия"
                                value={activeSubscription.transferred_sessions}
                                color="info"
                            />
                        </Box>
                    )}

                    <Box sx={{ mb: 3 }}>
                        <InfoItem
                            icon={<AutorenewIcon />}
                            label="Автопродление"
                            value={
                                <Chip 
                                    label={activeSubscription.is_auto_renew ? 'Включено' : 'Выключено'} 
                                    color={activeSubscription.is_auto_renew ? 'success' : 'default'} 
                                    size="small" 
                                />
                            }
                            color="info"
                        >
                            <Switch 
                                checked={activeSubscription.is_auto_renew}
                                onChange={handleToggleAutoRenewal}
                                disabled={isUpdatingAutoRenewal || isLoading}
                                size="small"
                                color={activeSubscription.is_auto_renew ? 'success' : 'default'}
                            />
                        </InfoItem>
                    </Box>

                    {activeSubscription.is_auto_renew && activeSubscription.end_date && (
                        <Box sx={{ mb: 3 }}>
                            <InfoItem
                                icon={<PaymentIcon />}
                                label="Следующий платеж"
                                value={dayjs(activeSubscription.end_date).add(1, 'day').format('DD.MM.YYYY')}
                                color="warning"
                            />
                        </Box>
                    )}

                    <Box sx={{ mb: 3 }}>
                        <InfoItem
                            icon={<AcUnitIcon />}
                            label="Статус заморозки"
                            value={
                                isFrozen 
                                ? <Chip 
                                    label={`Заморожен с ${dayjs(activeSubscription.freeze_start_date).format('DD.MM.YYYY')} до ${freezeEndDateDisplay}`} 
                                    color="info" 
                                    size="small" 
                                  />
                                : <Chip label="Не заморожен" size="small" />
                            }
                            color="info"
                        />
                    </Box>

                    {/* Кнопки управления */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Tooltip title={isFrozen ? 'Разморозить абонемент' : 'Заморозить абонемент'}>
                            <Button
                                variant="contained"
                                onClick={isFrozen ? handleUnfreeze : handleOpenFreezeModal}
                                disabled={isFreezing || isUnfreezing}
                                sx={{
                                    background: isFrozen ? gradients.success : gradients.warning,
                                    color: 'white',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    flex: 1,
                                    '&:hover': {
                                        background: isFrozen ? alpha(theme.palette.success.main, 0.8) : alpha(theme.palette.warning.main, 0.8),
                                    }
                                }}
                            >
                                {isFreezing || isUnfreezing ? <CircularProgress size={20} /> : (isFrozen ? 'Разморозить' : 'Заморозить')}
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>
            )}

            {/* Модальное окно заморозки */}
            <FreezeSubscriptionForm
                open={isFreezeModalOpen}
                onClose={handleCloseFreezeModal}
                onSubmit={handleFreezeSubmit}
                isLoading={isFreezing}
            />
        </Paper>
    );
}; 