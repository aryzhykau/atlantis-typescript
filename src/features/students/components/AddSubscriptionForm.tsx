import React from 'react';
import { Formik, Form } from 'formik';
import { MenuItem, Alert, Box } from '@mui/material';
import { AccountBalance, Schedule } from '@mui/icons-material';
import { FormikDialog, FormikSelectField, FormikCheckboxField, FormActions } from '../../../components/forms';
import { useFormSubmission } from '../../../hooks/forms';
import { subscriptionSchemas } from '../../../utils/validationSchemas';
import { ISubscriptionResponse } from '../../subscriptions/models/subscription';
import { IStudentSubscriptionCreateV2Payload } from '../../subscriptions/models/subscription_v2';
import { MobileFormBottomSheet } from '../../../components/mobile-kit';

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
                    const isFirstOfMonth = new Date().getDate() === 1;

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

                            {/* Pricing info block */}
                            {selectedSub?.sessions_per_week && (
                                <Box sx={{ mb: 2 }}>
                                    {isFirstOfMonth ? (
                                        <Alert severity="info" icon={<Schedule fontSize="small" />} sx={{ fontSize: '0.85rem', py: 0.5 }}>
                                            Полный месяц — <strong>{selectedSub.price}€</strong>. Счёт будет выставлен автоматически.
                                        </Alert>
                                    ) : (
                                        <Alert severity="info" icon={<Schedule fontSize="small" />} sx={{ fontSize: '0.85rem', py: 0.5 }}>
                                            Счёт будет выставлен автоматически после добавления студента в расписание ({selectedSub.sessions_per_week} {selectedSub.sessions_per_week === 1 ? 'день' : 'дней'} в неделю).
                                        </Alert>
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