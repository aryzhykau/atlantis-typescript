import React from 'react';
import { Card, CardContent, Typography, Grid, Chip, Box } from '@mui/material';
import { IStudentSubscriptionView } from '../../../subscriptions/models/subscription';
import dayjs from 'dayjs';

interface ActiveSubscriptionCardProps {
    subscription: IStudentSubscriptionView | null | undefined;
    isLoading?: boolean;
}

const typographyVariant = "body2";

export const ActiveSubscriptionCard: React.FC<ActiveSubscriptionCardProps> = ({ subscription, isLoading }) => {
    if (isLoading) {
        return <Typography>Загрузка информации об активном абонементе...</Typography>;
    }

    if (!subscription) {
        return (
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Активный абонемент
                    </Typography>
                    <Typography color="text.secondary">
                        Нет активных абонементов.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const деталейАбонемента = [
        { label: "Студент", value: subscription.student_name },
        { label: "Дата начала", value: dayjs(subscription.start_date).format('DD.MM.YYYY') },
        { label: "Дата окончания", value: dayjs(subscription.end_date).format('DD.MM.YYYY') },
        { label: "Осталось тренировок", value: subscription.sessions_left },
        { label: "Перенесено тренировок", value: subscription.transferred_sessions },
        {
            label: "Автопродление",
            value: <Chip label={subscription.is_auto_renew ? "Включено" : "Выключено"} size="small" color={subscription.is_auto_renew ? "success" : "default"} />
        },
        {
            label: "Статус",
            value: <Chip label={subscription.status} size="small" /> // Можно добавить цвета для статусов
        },
    ];

    if (subscription.freeze_start_date) {
        деталейАбонемента.push({ label: "Заморожен с", value: dayjs(subscription.freeze_start_date).format('DD.MM.YYYY') });
        if (subscription.freeze_end_date) {
            деталейАбонемента.push({ label: "Заморожен до", value: dayjs(subscription.freeze_end_date).format('DD.MM.YYYY') });
        }
    }

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Активный абонемент: {subscription.subscription_name}
                </Typography>
                <Grid container spacing={1}>
                    {деталейАбонемента.map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box display="flex">
                                <Typography variant={typographyVariant} color="text.secondary" sx={{ minWidth: '150px' }}>
                                    {item.label}:
                                </Typography>
                                <Typography variant={typographyVariant}>
                                    {item.value}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
}; 