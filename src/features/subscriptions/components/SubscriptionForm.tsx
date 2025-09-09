import React from 'react';
import { Formik, Form } from 'formik';
import { Box } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import { FormikDialog, FormikTextField, FormikNumberField, FormikCheckboxField, FormActions } from '../../../components/forms';
import { useFormSubmission } from '../../../hooks/forms';
import { subscriptionSchemas } from '../../../utils/validationSchemas';
import {
    ISubscriptionResponse,
    ISubscriptionCreatePayload,
    ISubscriptionUpdatePayload
} from "../models/subscription.ts";
import {
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation
} from "../../../store/apis/subscriptionsApi.ts";

interface SubscriptionFormProps {
    initialValues: Partial<ISubscriptionResponse>;
    isCreating: boolean;
    onClose: () => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ isCreating, initialValues, onClose }) => {
    const [createSubscription] = useCreateSubscriptionMutation();
    const [updateSubscription] = useUpdateSubscriptionMutation();

    // Form submission hook
    const { submit, isLoading } = useFormSubmission({
        successMessage: isCreating ? 'Абонемент успешно создан' : 'Абонемент успешно обновлен',
        onSuccess: onClose,
    });

    const formInitialValues = {
        name: initialValues.name || '',
        price: initialValues.price === undefined ? 0 : initialValues.price,
        number_of_sessions: initialValues.number_of_sessions === undefined ? 1 : initialValues.number_of_sessions,
        validity_days: initialValues.validity_days === undefined ? 30 : initialValues.validity_days,
        is_active: initialValues.is_active === undefined ? true : initialValues.is_active,
    };

    const handleSubmit = async (values: typeof formInitialValues, { resetForm }: { resetForm: () => void }) => {
        await submit(async () => {
            if (isCreating) {
                await createSubscription(values as ISubscriptionCreatePayload).unwrap();
            } else if (initialValues.id) {
                await updateSubscription({
                    id: initialValues.id,
                    payload: values as ISubscriptionUpdatePayload
                }).unwrap();
            }
            resetForm();
        });
    };

    return (
        <FormikDialog
            open={true}
            onClose={onClose}
            title={isCreating ? 'Добавление абонемента' : 'Изменение абонемента'}
            subtitle="Заполните информацию об абонементе"
            icon={<AccountBalance />}
            maxWidth="sm"
            actions={
                <FormActions
                    onCancel={onClose}
                    submitText={isCreating ? 'Добавить' : 'Изменить'}
                    isLoading={isLoading}
                    disabled={isLoading}
                />
            }
        >
            <Formik
                initialValues={formInitialValues}
                validationSchema={isCreating ? subscriptionSchemas.create : subscriptionSchemas.update}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {() => (
                    <Form>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <FormikTextField
                                name="name"
                                label="Название"
                                fullWidth
                            />

                            <FormikNumberField
                                name="price"
                                label="Стоимость абонемента"
                                suffix="€"
                                min={0}
                                decimalPlaces={2}
                                fullWidth
                            />

                            <FormikNumberField
                                name="validity_days"
                                label="Срок действия (дней)"
                                min={1}
                                max={3650}
                                fullWidth
                            />

                            <FormikNumberField
                                name="number_of_sessions"
                                label="Количество занятий"
                                min={0}
                                max={1000}
                                fullWidth
                            />

                            <FormikCheckboxField
                                name="is_active"
                                label="Активен"
                            />
                        </Box>
                    </Form>
                )}
            </Formik>
        </FormikDialog>
    );
};

export default SubscriptionForm;