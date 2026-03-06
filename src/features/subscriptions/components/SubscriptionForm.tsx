import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
    FormikTextField,
    FormikNumberField,
    FormikCheckboxField,
} from '../../../components/forms/fields';
import { FormActions } from '../../../components/forms/layout';
import { useSnackbar } from '../../../hooks/useSnackBar';
import {
    ISubscriptionResponse,
    ISubscriptionCreatePayload,
    ISubscriptionUpdatePayload,
} from '../models/subscription';
import {
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation,
} from '../../../store/apis/subscriptionsApi';

interface SubscriptionFormProps {
    initialValues: Partial<ISubscriptionResponse>;
    isCreating: boolean;
    onClose: () => void;
}

const schema = Yup.object({
    name: Yup.string().required('Введите название'),
    price: Yup.number().min(0, 'Минимум 0').required('Укажите стоимость'),
    sessions_per_week: Yup.number()
        .min(1, 'Минимум 1')
        .max(14, 'Максимум 14')
        .required('Укажите количество занятий в неделю'),
    is_active: Yup.boolean(),
});

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
    isCreating,
    initialValues,
    onClose,
}) => {
    const [createSubscription, { isLoading: isCreatingLoading }] = useCreateSubscriptionMutation();
    const [updateSubscription, { isLoading: isUpdatingLoading }] = useUpdateSubscriptionMutation();
    const { displaySnackbar } = useSnackbar();

    const formInitialValues = {
        name: initialValues.name ?? '',
        price: initialValues.price ?? 0,
        sessions_per_week: initialValues.sessions_per_week ?? 3,
        is_active: initialValues.is_active ?? true,
    };

    const handleSubmit = async (
        values: typeof formInitialValues,
        { resetForm }: { resetForm: () => void },
    ) => {
        try {
            if (isCreating) {
                const payload: ISubscriptionCreatePayload = {
                    name: values.name,
                    price: values.price,
                    sessions_per_week: values.sessions_per_week,
                    number_of_sessions: 0,
                    validity_days: 30,
                    is_active: values.is_active,
                };
                await createSubscription(payload).unwrap();
                displaySnackbar('Абонемент успешно создан', 'success');
            } else if (initialValues.id) {
                const payload: ISubscriptionUpdatePayload = {
                    name: values.name,
                    price: values.price,
                    sessions_per_week: values.sessions_per_week,
                    is_active: values.is_active,
                };
                await updateSubscription({ id: initialValues.id, payload }).unwrap();
                displaySnackbar('Абонемент успешно обновлён', 'success');
            }
            resetForm();
            onClose();
        } catch (error: any) {
            const msg = error?.data?.detail?.[0]?.msg ?? error?.data?.detail ?? 'Ошибка при сохранении';
            displaySnackbar(String(msg), 'error');
        }
    };

    return (
        <Formik
            initialValues={formInitialValues}
            validationSchema={schema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {() => (
                <Form>
                    <IconButton
                        onClick={onClose}
                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 9999 }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box sx={{ position: 'relative', minWidth: { xs: '100%', sm: 400 }, p: 3 }}>
                        <Typography
                            variant="h6"
                            component="h2"
                            gutterBottom
                            sx={{ textAlign: 'center', mb: 3 }}
                        >
                            {isCreating ? 'Новый абонемент' : 'Редактировать абонемент'}
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <FormikTextField
                                name="name"
                                label="Название"
                                required
                            />

                            <FormikNumberField
                                name="price"
                                label="Стоимость в месяц, €"
                                min={0}
                                decimalPlaces={2}
                            />

                            <FormikNumberField
                                name="sessions_per_week"
                                label="Занятий в неделю"
                                min={1}
                                max={14}
                            />

                            <FormikCheckboxField
                                name="is_active"
                                label="Активен"
                            />

                            <FormActions
                                submitText={isCreating ? 'Создать' : 'Сохранить'}
                                isSubmitting={isCreatingLoading || isUpdatingLoading}
                                onCancel={onClose}
                                showCancel={false}
                            />
                        </Box>
                    </Box>
                </Form>
            )}
        </Formik>
    );
};

export default SubscriptionForm;
