import React from 'react';
import { Box, Chip, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { UnifiedDataGrid } from '../../../components/UnifiedDataGrid';
import { IStudentSubscriptionView } from '../../subscriptions/models/subscription';
import { createEnhancedStudentSubscriptionColumns } from '../tables/enhancedStudentSubscriptionColumns';
import dayjs from 'dayjs';

interface StudentSubscriptionsTableProps {
    subscriptions: IStudentSubscriptionView[];
    isLoading: boolean;
}

export const StudentSubscriptionsTable: React.FC<StudentSubscriptionsTableProps> = ({ subscriptions, isLoading }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const columns = createEnhancedStudentSubscriptionColumns({});

    const getStatusMeta = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE':
                return { label: 'Активный', color: 'success' as const };
            case 'EXPIRED':
            case 'CANCELLED':
                return { label: 'Истёк', color: 'error' as const };
            case 'FROZEN':
                return { label: 'Заморожен', color: 'info' as const };
            case 'PENDING_PAYMENT':
                return { label: 'Ожидает оплаты', color: 'warning' as const };
            default:
                return { label: status || 'Неизвестно', color: 'default' as const };
        }
    };

    const getFreezeText = (subscription: IStudentSubscriptionView) => {
        if (subscription.freeze_start_date && subscription.freeze_end_date) {
            return `${dayjs(subscription.freeze_start_date).format('DD.MM.YY')} - ${dayjs(subscription.freeze_end_date).format('DD.MM.YY')}`;
        }

        if (subscription.freeze_start_date) {
            return `С ${dayjs(subscription.freeze_start_date).format('DD.MM.YY')}`;
        }

        return 'Нет';
    };

    const lastTenSubscriptions = [...subscriptions]
        .sort((a, b) => dayjs(b.start_date).valueOf() - dayjs(a.start_date).valueOf())
        .slice(0, 10);

    if (!subscriptions || subscriptions.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                    История абонементов пуста
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    У ученика пока нет абонементов
                </Typography>
            </Box>
        );
    }

    if (isMobile) {
        return (
            <Box sx={{ mx: -2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Последние абонементы
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Показаны: {lastTenSubscriptions.length} из {subscriptions.length}
                    </Typography>
                </Box>

                {lastTenSubscriptions.map((subscription) => {
                    const statusMeta = getStatusMeta(subscription.status);

                    return (
                        <Paper
                            key={subscription.id}
                            elevation={0}
                            sx={{
                                borderRadius: 0,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderLeft: 'none',
                                borderRight: 'none',
                                borderTop: 'none',
                                p: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                                        {subscription.subscription_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        ID: {subscription.id}
                                    </Typography>
                                </Box>

                                <Chip
                                    size="small"
                                    color={statusMeta.color}
                                    label={statusMeta.label}
                                />
                            </Box>

                            <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {dayjs(subscription.start_date).format('DD.MM.YYYY')} → {dayjs(subscription.end_date).format('DD.MM.YYYY')}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <FitnessCenterIcon sx={{ fontSize: 15, color: 'success.main' }} />
                                    <Typography variant="body2">Остаток: {subscription.sessions_left}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Перенесено: {subscription.transferred_sessions}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <AutorenewIcon sx={{ fontSize: 15, color: subscription.is_auto_renew ? 'success.main' : 'text.disabled' }} />
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        color={subscription.is_auto_renew ? 'success' : 'default'}
                                        label={subscription.is_auto_renew ? 'Автопродление: Да' : 'Автопродление: Нет'}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <AcUnitIcon sx={{ fontSize: 15, color: subscription.freeze_start_date ? 'info.main' : 'text.disabled' }} />
                                    <Typography
                                        variant="body2"
                                        color={subscription.freeze_start_date ? 'info.main' : 'text.secondary'}
                                    >
                                        Заморозка: {getFreezeText(subscription)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    );
                })}
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                История абонементов ({subscriptions.length})
            </Typography>
            
            <UnifiedDataGrid
                rows={subscriptions}
                columns={columns}
                loading={isLoading}
                entityType="subscriptions"
                pageSizeOptions={[10, 25, 50]}
                initialPageSize={10}
                variant="elevated"
                ariaLabel="Таблица истории абонементов ученика"
                height="auto"
            />
        </Box>
    );
}; 