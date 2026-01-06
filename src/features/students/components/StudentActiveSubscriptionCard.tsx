import React, { useState } from 'react';
import { Paper, Box, Chip, CircularProgress, Button, Switch, alpha, Tooltip} from '@mui/material';
import { IStudentSubscriptionView, IStudentSubscriptionFreezePayload, IStudentSubscriptionAutoRenewalUpdatePayload } from '../../subscriptions/models/subscription';
import dayjs, { Dayjs } from 'dayjs';
import { useFreezeStudentSubscriptionMutation, useUnfreezeStudentSubscriptionMutation, useUpdateStudentSubscriptionAutoRenewalMutation } from '../../../store/apis/subscriptionsApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useTheme } from '@mui/material';
import { FreezeSubscriptionForm } from './FreezeSubscriptionForm';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PaymentIcon from '@mui/icons-material/Payment';
import { StudentInfoItem } from './studentsPage/studentSubscriptions/StudentInfoItem';
import { SubscriptionCardHeader } from './studentsPage/studentSubscriptions/SubscriptionCardHeader';
import { SubscriptionCardST } from '../styles/styles';

interface StudentActiveSubscriptionCardProps {
    subscriptions: IStudentSubscriptionView[];
    isLoading: boolean;
    studentId: number;
    onSubscriptionUpdate?: () => void;
}

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

    return (
        <Paper elevation={0} sx={SubscriptionCardST(theme)}>
            <SubscriptionCardHeader isLoading={isLoading} activeSubscription={activeSubscription}/>
            {!isLoading && activeSubscription && (
                <Box sx={{ p: 3 }}>
                    <StudentInfoItem
                        icon={<EventAvailableIcon />}
                        label="Дата начала"
                        value={dayjs(activeSubscription.start_date).format('DD.MM.YYYY HH:mm')}
                        color="success"
                    />
                    
                    <StudentInfoItem
                        icon={<EventBusyIcon />}
                        label= "Дата окончания"
                        value={dayjs(activeSubscription.end_date).format('DD.MM.YYYY HH:mm')}
                        color="warning"
                    />
                   
                    <StudentInfoItem
                        icon={<FitnessCenterIcon />}
                        label="Осталось занятий"
                        value={activeSubscription.sessions_left}
                        color="primary"
                    />
                    {activeSubscription.transferred_sessions > 0 && (
                        
                    <StudentInfoItem
                        icon={<FitnessCenterIcon />}
                        label="Перенесенные занятия"
                        value={activeSubscription.transferred_sessions}
                        color="info"
                    />)}

                    <StudentInfoItem
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
                    </StudentInfoItem>
                
                    {activeSubscription.is_auto_renew && activeSubscription.end_date && (
                        <StudentInfoItem
                            icon={<PaymentIcon />}
                            label="Следующий платеж"
                            value={dayjs(activeSubscription.end_date).add(1, 'day').format('DD.MM.YYYY')}
                            color="warning"
                        />
                    )}

                        <StudentInfoItem
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
            <FreezeSubscriptionForm
                open={isFreezeModalOpen}
                onClose={handleCloseFreezeModal}
                onSubmit={handleFreezeSubmit}
                isLoading={isFreezing}
            />
        </Paper>
    );
}; 