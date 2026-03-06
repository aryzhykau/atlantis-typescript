import React, { useMemo } from 'react';
import { Formik, Form } from 'formik';
import { MenuItem, Alert, Chip, Box, Typography } from '@mui/material';
import { AccountBalance, CalendarToday } from '@mui/icons-material';
import { FormikDialog, FormikSelectField, FormikCheckboxField, FormActions } from '../../../components/forms';
import { useFormSubmission } from '../../../hooks/forms';
import { subscriptionSchemas } from '../../../utils/validationSchemas';
import { ISubscriptionResponse } from '../../subscriptions/models/subscription';
import { IStudentSubscriptionCreateV2Payload } from '../../subscriptions/models/subscription_v2';
import { MobileFormBottomSheet } from '../../../components/mobile-kit';
import dayjs from 'dayjs';

/** Клиентский расчёт пропорциональной стоимости (зеркалит логику бэкенда). */
function getProratedPreview(
    price: number,
    sessionsPerWeek: number,
    today: Date,
): { isProrated: boolean; amount: number; paymentDue: string } | null {
    if (!sessionsPerWeek || sessionsPerWeek <= 0) return null;

    const getMonday = (d: Date): Date => {
        const day = new Date(d);
        const dow = day.getDay(); // 0=Sun
        const diff = dow === 0 ? -6 : 1 - dow;
        day.setDate(day.getDate() + diff);
        return day;
    };

    const countSessions = (start: Date, end: Date, spw: number): number => {
        let total = 0;
        let weekMon = getMonday(start);
        while (weekMon <= end) {
            const weekSun = new Date(weekMon);
            weekSun.setDate(weekMon.getDate() + 6);
            const overlapStart = start > weekMon ? start : weekMon;
            const overlapEnd = end < weekSun ? end : weekSun;
            const days = Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / 86400000) + 1;
            total += Math.min(spw, days);
            weekMon = new Date(weekMon);
            weekMon.setDate(weekMon.getDate() + 7);
        }
        return total;
    };

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const monthEnd = new Date(today.getFullYear(), today.getMonth(), lastDay);

    const totalSessions = countSessions(monthStart, monthEnd, sessionsPerWeek);
    if (totalSessions === 0) return null;

    const isProrated = today.getDate() > 1;
    const remaining = isProrated
        ? countSessions(today, monthEnd, sessionsPerWeek)
        : totalSessions;

    const amount = Math.round(price * remaining / totalSessions * 100) / 100;

    // payment due: prorated → 7th of next month; full → 7th of this month
    const dueBase = isProrated
        ? new Date(today.getFullYear(), today.getMonth() + 1, 7)
        : new Date(today.getFullYear(), today.getMonth(), 7);
    const paymentDue = `${dueBase.getDate()} ${dayjs(dueBase).format('MMMM')}`;

    return { isProrated, amount, paymentDue };
}

interface AddSubscriptionFormValues {
    subscription_id: string;
    is_auto_renew: boolean;
}

interface AddSubscriptionFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: IStudentSubscriptionCreateV2Payload) => Promise<void>;
    isLoading?: boolean; // Статус выполнения onSubmit
    studentId: number;
    availableSubscriptions: ISubscriptionResponse[];
    isLoadingSubscriptions?: boolean;
    useBottomSheetVariant?: boolean;
}

export const AddSubscriptionForm: React.FC<AddSubscriptionFormProps> = ({
    open,
    onClose,
    onSubmit,
    isLoading,
    studentId,
    availableSubscriptions,
    isLoadingSubscriptions,
    useBottomSheetVariant = false,
}) => {
    const initialFormValues: AddSubscriptionFormValues = {
        subscription_id: '',
        is_auto_renew: true, // По умолчанию автопродление включено
    };

    // Use the form submission hook
    const { submit, isLoading: isSubmissionLoading } = useFormSubmission({
        successMessage: 'Абонемент успешно добавлен ученику',
        onSuccess: onClose,
    });

    const handleSubmit = async (values: AddSubscriptionFormValues) => {
        const payload: IStudentSubscriptionCreateV2Payload = {
            student_id: studentId,
            subscription_id: Number(values.subscription_id),
            is_auto_renew: values.is_auto_renew,
        };

        await submit(async () => {
            await onSubmit(payload);
        });
    };

    const combinedIsLoading = isLoading || isSubmissionLoading;

    const formBody = (
        <>
            <Formik
                initialValues={initialFormValues}
                validationSchema={subscriptionSchemas.addToStudent}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting, isValid, values }) => {
                    const selectedSub = availableSubscriptions.find(
                        (s) => s.id.toString() === values.subscription_id
                    );
                    const preview = selectedSub?.sessions_per_week
                        ? getProratedPreview(selectedSub.price, selectedSub.sessions_per_week, new Date())
                        : null;

                    return (
                        <Form>
                            <FormikSelectField
                                name="subscription_id"
                                label="Абонемент"
                                isLoading={isLoadingSubscriptions}
                                loadingText="Загрузка абонементов..."
                                emptyText="Нет доступных абонементов"
                                disabled={isLoadingSubscriptions || availableSubscriptions.length === 0}
                                sx={{ mb: 2 }}
                            >
                                {availableSubscriptions.map((sub) => (
                                    <MenuItem key={sub.id} value={sub.id.toString()}>
                                        {sub.name}
                                        {sub.sessions_per_week
                                            ? ` — ${sub.sessions_per_week}×/нед, ${sub.price}€`
                                            : ` (${sub.price}€, ${sub.number_of_sessions} занятий, ${sub.validity_days} дней)`}
                                    </MenuItem>
                                ))}
                            </FormikSelectField>

                            {/* Prorated preview */}
                            {preview && (
                                <Box sx={{ mb: 2 }}>
                                    {preview.isProrated ? (
                                        <Alert
                                            severity="info"
                                            icon={<CalendarToday fontSize="small" />}
                                            sx={{ fontSize: '0.85rem', py: 0.5 }}
                                        >
                                            Пропорциональная оплата:{' '}
                                            <strong>{preview.amount}€</strong> до {preview.paymentDue}
                                            {' '}(до конца текущего месяца)
                                        </Alert>
                                    ) : (
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip
                                                size="small"
                                                icon={<CalendarToday fontSize="small" />}
                                                label={`${preview.amount}€ — оплатить до ${preview.paymentDue}`}
                                                color="default"
                                                variant="outlined"
                                            />
                                        </Box>
                                    )}
                                </Box>
                            )}

                            <FormikCheckboxField
                                name="is_auto_renew"
                                label="Автоматическое продление"
                                sx={{ mb: 3 }}
                            />

                            <FormActions
                                onCancel={onClose}
                                submitText="Добавить"
                                isLoading={combinedIsLoading || isSubmitting}
                                disabled={combinedIsLoading || isSubmitting || !isValid}
                            />
                        </Form>
                    );
                }}
            </Formik>
        </>
    );

    if (useBottomSheetVariant) {
        return (
            <MobileFormBottomSheet
                open={open}
                onClose={onClose}
                title="🎫 Добавить абонемент ученику"
            >
                {formBody}
            </MobileFormBottomSheet>
        );
    }

    return (
        <FormikDialog
            open={open}
            onClose={onClose}
            title="Добавить абонемент ученику"
            subtitle="Выберите абонемент и настройте параметры"
            icon={<AccountBalance />}
            maxWidth="sm"
        >
            {formBody}
        </FormikDialog>
    );
}; 