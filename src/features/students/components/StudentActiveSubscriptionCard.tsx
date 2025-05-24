import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, CircularProgress, Divider, Button, Switch } from '@mui/material';
import { IStudentSubscriptionView, IStudentSubscriptionFreezePayload, IStudentSubscriptionAutoRenewalUpdatePayload } from '../../subscriptions/models/subscription';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { 
    useFreezeStudentSubscriptionMutation, 
    useUnfreezeStudentSubscriptionMutation,
    useUpdateStudentSubscriptionAutoRenewalMutation 
} from '../../../store/apis/subscriptionsApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { FreezeSubscriptionForm } from './FreezeSubscriptionForm';

// Иконки
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PaymentIcon from '@mui/icons-material/Payment';

interface StudentActiveSubscriptionCardProps {
    subscriptions: IStudentSubscriptionView[];
    isLoading: boolean;
    studentId: number;
    onSubscriptionUpdate?: () => void;
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; valueColor?: string; children?: React.ReactNode }> = ({ icon, label, value, valueColor, children }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        {icon}
        <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '130px' }}>{label}:</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'medium', color: valueColor || 'text.primary', mr: children ? 1 : 0 }}>{value}</Typography>
            {children}
        </Box>
    </Box>
);

export const StudentActiveSubscriptionCard: React.FC<StudentActiveSubscriptionCardProps> = ({ subscriptions, isLoading, studentId, onSubscriptionUpdate }) => {
    const { displaySnackbar } = useSnackbar();
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

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                        Активный абонемент
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <CircularProgress />
                        </Box>
                    ) : activeSubscription ? (
                        <Box>
                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'primary.main', textAlign: 'center', mb: 2 }}>
                                {activeSubscription.subscription_name}
                            </Typography>
                            <InfoRow 
                                icon={<EventAvailableIcon color="success" />}
                                label="Начало"
                                value={dayjs(activeSubscription.start_date).format('DD.MM.YYYY HH:mm')}
                            />
                            <InfoRow 
                                icon={<EventBusyIcon color="error" />}
                                label="Окончание"
                                value={dayjs(activeSubscription.end_date).format('DD.MM.YYYY HH:mm')}
                            />
                            <InfoRow 
                                icon={<FitnessCenterIcon color="action" />}
                                label="Осталось занятий"
                                value={activeSubscription.sessions_left}
                            />
                            {activeSubscription.transferred_sessions > 0 && (
                                <InfoRow 
                                    icon={<FitnessCenterIcon color="info" />}
                                    label="Перенесенные"
                                    value={activeSubscription.transferred_sessions}
                                />
                            )}
                            <InfoRow 
                                icon={<AutorenewIcon color="action" />}
                                label="Автопродление"
                                value={<Chip label={activeSubscription.is_auto_renew ? 'Включено' : 'Выключено'} color={activeSubscription.is_auto_renew ? 'success' : 'default'} size="small" />}
                            >
                                <Switch 
                                    checked={activeSubscription.is_auto_renew}
                                    onChange={handleToggleAutoRenewal}
                                    disabled={isUpdatingAutoRenewal || isLoading}
                                    size="small"
                                    color={activeSubscription.is_auto_renew ? 'success' : 'default'}
                                />
                            </InfoRow>
                            {activeSubscription.is_auto_renew && activeSubscription.end_date && (
                                <InfoRow
                                    icon={<PaymentIcon color="action" />}
                                    label="След. платеж"
                                    value={dayjs(activeSubscription.end_date).add(1, 'day').format('DD.MM.YYYY')}
                                    valueColor="primary.main"
                                />
                            )}
                            <InfoRow
                                icon={<AcUnitIcon color={isFrozen ? "info" : "disabled"} />}
                                label="Статус заморозки"
                                value={
                                    isFrozen 
                                    ? <Chip label={`Заморожен с ${dayjs(activeSubscription.freeze_start_date).format('DD.MM.YYYY')} до ${freezeEndDateDisplay}`} color="info" size="small" />
                                    : <Chip label="Не заморожен" size="small" />
                                }
                            />
                            <InfoRow
                                icon={<Chip sx={{height: '20px', width: '20px', borderRadius: '50%', backgroundColor: 
                                    activeSubscription.status?.toLowerCase() === 'active' ? 'success.light' : 
                                    activeSubscription.status?.toLowerCase() === 'frozen' ? 'info.light' : 
                                    activeSubscription.status?.toLowerCase() === 'expired' ? 'error.light' : 
                                    'default'
                                }} />}
                                label="Общий статус"
                                value={
                                    activeSubscription.status?.toLowerCase() === 'active' ? <Chip label="Активен" color="success" size="small" /> :
                                    activeSubscription.status?.toLowerCase() === 'frozen' ? <Chip label="Заморожен" color="info" size="small" /> :
                                    activeSubscription.status?.toLowerCase() === 'expired' ? <Chip label="Истёк" color="error" size="small" /> :
                                    <Chip label={activeSubscription.status || "Неизвестно"} size="small" />
                                }
                            />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, textAlign: 'center', minHeight: '200px' }}>
                            <EventBusyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}/>
                            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                                Нет активного абонемента
                            </Typography>
                        </Box>
                    )}
                </Box>
                
                {activeSubscription && (
                    <Box sx={{ mt: 2 }}>
                        {isFrozen ? (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<PlayCircleOutlineIcon />}
                                onClick={handleUnfreeze}
                                disabled={isUnfreezing || isLoading}
                                fullWidth
                            >
                                {isUnfreezing ? <CircularProgress size={24} color="inherit" /> : 'Разморозить'}
                            </Button>
                        ) : (
                            <Button
                                variant="outlined"
                                color="info"
                                startIcon={<PauseCircleOutlineIcon />}
                                onClick={handleOpenFreezeModal}
                                disabled={isFreezing || isLoading || !dayjs(activeSubscription.end_date).isAfter(dayjs().add(1, 'day'))}
                                title={!dayjs(activeSubscription.end_date).isAfter(dayjs().add(1, 'day')) ? "Нельзя заморозить абонемент, который скоро истекает" : ""}
                                fullWidth
                            >
                                {isFreezing ? <CircularProgress size={24} color="inherit" /> : 'Заморозить'}
                            </Button>
                        )}
                    </Box>
                )}
            </CardContent>

            {activeSubscription && (
                <FreezeSubscriptionForm 
                    open={isFreezeModalOpen}
                    onClose={handleCloseFreezeModal}
                    onSubmit={handleFreezeSubmit}
                    activeSubscriptionName={activeSubscription.subscription_name}
                    activeSubscriptionEndDate={dayjs(activeSubscription.end_date).format('DD.MM.YYYY')}
                    isLoading={isFreezing}
                />
            )}
        </Card>
    );
}; 