import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Paper, Box, Chip, Switch, Typography, Divider, alpha } from '@mui/material';
import { IStudentSubscriptionView, IStudentSubscriptionAutoRenewalUpdatePayload } from '../../subscriptions/models/subscription';
import dayjs from 'dayjs';
import { useUpdateStudentSubscriptionAutoRenewalMutation } from '../../../store/apis/subscriptionsApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useTheme } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PaymentIcon from '@mui/icons-material/Payment';
import { StudentInfoItem } from './studentsPage/studentSubscriptions/StudentInfoItem';
import { SubscriptionCardHeader } from './studentsPage/studentSubscriptions/SubscriptionCardHeader';
import { SubscriptionCardST } from '../styles/styles';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMobile from '../../../hooks/useMobile';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';

interface StudentActiveSubscriptionCardProps {
    subscriptions: IStudentSubscriptionView[];
    isLoading: boolean;
    onSubscriptionUpdate?: () => void;
}

export const StudentActiveSubscriptionCard: React.FC<StudentActiveSubscriptionCardProps> = ({ subscriptions, isLoading, onSubscriptionUpdate }) => {
    const { displaySnackbar } = useSnackbar();
    const theme = useTheme();
    const gradients = useGradients();
    const isMobile = useMobile();
    const now = dayjs();
    const activeSubscription = subscriptions.find(sub => 
        now.isBetween(dayjs(sub.start_date), dayjs(sub.end_date), null, '[]')
    );

    const isFrozen = !!(activeSubscription?.freeze_start_date && activeSubscription?.freeze_end_date);
    const [updateAutoRenewal, { isLoading: isUpdatingAutoRenewal }] = useUpdateStudentSubscriptionAutoRenewalMutation();

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

    if (isMobile) {
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
                <Accordion disableGutters defaultExpanded={false} sx={{ background: 'transparent', boxShadow: 'none' }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                        sx={{
                            p: 0,
                            minHeight: 'unset',
                            '& .MuiAccordionSummary-content': { m: 0 },
                            '& .MuiAccordionSummary-expandIconWrapper': { mr: 1.5 },
                            background: gradients.info,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                                opacity: 0.3,
                            }
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1, px: 2, py: 1.75, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CardMembershipIcon sx={{ fontSize: 20 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Абонемент
                                </Typography>
                            </Box>
                            <Chip
                                label={activeSubscription ? activeSubscription.subscription_name : 'Нет активного'}
                                size="small"
                                sx={{ background: alpha('#ffffff', 0.2), color: 'white', fontWeight: 700 }}
                            />
                        </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 2 }}>
                        {isLoading ? (
                            <Typography variant="body2" color="text.secondary">Загрузка данных абонемента...</Typography>
                        ) : !activeSubscription ? (
                            <Typography variant="body2" color="text.secondary">У ученика нет активного абонемента.</Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Срок действия</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {dayjs(activeSubscription.start_date).format('DD.MM.YYYY')} — {dayjs(activeSubscription.end_date).format('DD.MM.YYYY')}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Осталось занятий</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{activeSubscription.sessions_left}</Typography>
                                </Box>
                                {activeSubscription.transferred_sessions > 0 && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Перенесено занятий</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{activeSubscription.transferred_sessions}</Typography>
                                    </Box>
                                )}

                                <Divider />

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Автопродление</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {activeSubscription.is_auto_renew ? 'Включено' : 'Выключено'}
                                        </Typography>
                                    </Box>
                                    <Switch
                                        checked={activeSubscription.is_auto_renew}
                                        onChange={handleToggleAutoRenewal}
                                        disabled={isUpdatingAutoRenewal || isLoading}
                                        size="small"
                                        color={activeSubscription.is_auto_renew ? 'success' : 'default'}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">Статус заморозки</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        {isFrozen ? (
                                            <Chip
                                                label={`Заморожен с ${dayjs(activeSubscription.freeze_start_date).format('DD.MM.YYYY')} до ${freezeEndDateDisplay}`}
                                                color="info"
                                                size="small"
                                            />
                                        ) : (
                                            <Chip label="Не заморожен" size="small" />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </AccordionDetails>
                </Accordion>
            </Paper>
        );
    }

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
                   
                </Box>
            )}
        </Paper>
    );
}; 