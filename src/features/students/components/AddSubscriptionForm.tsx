import React from 'react';
import { Formik, Form } from 'formik';
import { MenuItem } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import { FormikDialog, FormikSelectField, FormikCheckboxField, FormActions } from '../../../components/forms';
import { useFormSubmission } from '../../../hooks/forms';
import { subscriptionSchemas } from '../../../utils/validationSchemas';
import { ISubscriptionResponse, IStudentSubscriptionCreatePayload } from '../../subscriptions/models/subscription';
import { MobileFormBottomSheet } from '../../../components/mobile-kit';

interface AddSubscriptionFormValues {
    subscription_id: string;
    is_auto_renew: boolean;
}

interface AddSubscriptionFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: IStudentSubscriptionCreatePayload) => Promise<void>; // onSubmit будет принимать готовый payload
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
        const payload: IStudentSubscriptionCreatePayload = {
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
                {({ isSubmitting, isValid }) => (
                    <Form>
                        <FormikSelectField
                            name="subscription_id"
                            label="Абонемент"
                            isLoading={isLoadingSubscriptions}
                            loadingText="Загрузка абонементов..."
                            emptyText="Нет доступных абонементов"
                            disabled={isLoadingSubscriptions || availableSubscriptions.length === 0}
                            sx={{ mb: 3 }}
                        >
                            {availableSubscriptions.map((sub) => (
                                <MenuItem key={sub.id} value={sub.id.toString()}>
                                    {sub.name} ({sub.price}€, {sub.number_of_sessions} занятий, {sub.validity_days} дней)
                                </MenuItem>
                            ))}
                        </FormikSelectField>

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
                )}
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