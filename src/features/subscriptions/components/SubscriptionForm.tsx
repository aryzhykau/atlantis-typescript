import React from 'react';
import {Formik, Form, Field} from 'formik';
import * as Yup from 'yup';
import {TextField} from 'formik-mui';
import {Checkbox, FormControlLabel, Button, Box, Typography, CircularProgress, IconButton} from '@mui/material';
import {
    ISubscriptionResponse,
    ISubscriptionCreatePayload,
    ISubscriptionUpdatePayload
} from "../models/subscription.ts";
import {
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation
} from "../../../store/apis/subscriptionsApi.ts";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import CloseIcon from '@mui/icons-material/Close';

interface SubscriptionFormProps {
    initialValues: Partial<ISubscriptionResponse>;
    isCreating: boolean;
    onClose: () => void;
}

const SubscriptionSchema = Yup.object({
    name: Yup.string().min(2, 'Название должно содержать минимум 2 символа').max(100, 'Название не должно превышать 100 символов').required('Название обязательно'),
    price: Yup.number()
        .min(0, 'Цена не может быть отрицательной')
        .required('Цена обязательна'),
    validity_days: Yup.number().integer('Должно быть целое число').min(1, 'Срок действия должен быть минимум 1 день').required('Срок действия обязателен'),
    number_of_sessions: Yup.number().integer('Должно быть целое число').min(0, 'Количество занятий не может быть отрицательным').required('Количество занятий обязательно'),
    is_active: Yup.boolean().required(),
});

const prepareSubmitValues = (values: Partial<ISubscriptionResponse>, isCreating: boolean): ISubscriptionCreatePayload | ISubscriptionUpdatePayload => {
    const commonData = {
        name: values.name || '',
        price: Number(values.price),
        number_of_sessions: Number(values.number_of_sessions),
        validity_days: Number(values.validity_days),
        is_active: values.is_active === undefined ? true : values.is_active,
    };

    if (isCreating) {
        return commonData as ISubscriptionCreatePayload;
    }
    const updateData: any = {};
    if (values.name !== undefined) updateData.name = values.name;
    if (values.price !== undefined) updateData.price = Number(values.price);
    if (values.number_of_sessions !== undefined) updateData.number_of_sessions = Number(values.number_of_sessions);
    if (values.validity_days !== undefined) updateData.validity_days = Number(values.validity_days);
    if (values.is_active !== undefined) updateData.is_active = values.is_active;
    return updateData as ISubscriptionUpdatePayload;
};

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({isCreating, initialValues, onClose}) => {

    const [createSubscription, {isLoading: isCreatingLoading}] = useCreateSubscriptionMutation();
    const [updateSubscription, {isLoading: isUpdatingLoading}] = useUpdateSubscriptionMutation();
    const {displaySnackbar} = useSnackbar();

    const handleSubmit = async (values: Partial<ISubscriptionResponse>, {resetForm}: {resetForm: () => void}) => {
        const formValuesForSubmit = prepareSubmitValues(values, isCreating);
        try {
            if (isCreating) {
                await createSubscription(formValuesForSubmit as ISubscriptionCreatePayload).unwrap();
                displaySnackbar("Абонемент успешно создан", "success");
            } else if (initialValues.id) {
                await updateSubscription({id: initialValues.id, payload: formValuesForSubmit as ISubscriptionUpdatePayload}).unwrap();
                displaySnackbar("Абонемент успешно обновлен", "success");
            }
            resetForm();
            onClose();
        } catch (error: any) {
            console.error("Ошибка сохранения абонемента:", error);
            const errorDetail = error?.data?.detail || 'Ошибка при сохранении абонемента';
            displaySnackbar(String(errorDetail), 'error');
        }
    };

    const formInitialValues = {
        name: initialValues.name || '',
        price: initialValues.price === undefined ? 0 : initialValues.price,
        number_of_sessions: initialValues.number_of_sessions === undefined ? 1 : initialValues.number_of_sessions,
        validity_days: initialValues.validity_days === undefined ? 30 : initialValues.validity_days,
        is_active: initialValues.is_active === undefined ? true : initialValues.is_active,
    };

    return (
        <Formik
            initialValues={formInitialValues}
            validationSchema={SubscriptionSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({isSubmitting, values, errors, touched}) => (
                <Form>
                    <Box display="flex" flexDirection="column" gap={2} padding={3} borderRadius={1} sx={{position: 'relative', minWidth: 400, p:3}}>
                         <IconButton
                            onClick={onClose}
                            sx={{position: "absolute", top: 8, right: 8, zIndex: 1000 }}
                        >
                            <CloseIcon/>
                        </IconButton>
                        <Typography variant="h6" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
                            {isCreating ? "Добавление абонемента": "Изменение абонемента"}
                        </Typography>
                        <Field
                            name="name"
                            label="Название"
                            component={TextField}
                            variant="outlined"
                            fullWidth
                            error={touched.name && Boolean(errors.name)}
                            helperText={touched.name && errors.name}
                        />
                        <Field
                            name="price"
                            label="Стоимость абонемента"
                            component={TextField}
                            type="number"
                            variant="outlined"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={touched.price && Boolean(errors.price)}
                            helperText={touched.price && errors.price}
                        />
                        <Field
                            name="validity_days"
                            label="Срок действия (дней)"
                            component={TextField}
                            type="number"
                            variant="outlined"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={touched.validity_days && Boolean(errors.validity_days)}
                            helperText={touched.validity_days && errors.validity_days}
                        />
                        <Field
                            name="number_of_sessions"
                            label="Количество занятий"
                            component={TextField}
                            type="number"
                            variant="outlined"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={touched.number_of_sessions && Boolean(errors.number_of_sessions)}
                            helperText={touched.number_of_sessions && errors.number_of_sessions}
                        />
                        <FormControlLabel
                            control={
                                <Field
                                    name="is_active"
                                    type="checkbox"
                                    as={Checkbox}
                                    checked={values.is_active}
                                    color="primary"
                                />
                            }
                            label="Активен"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={isCreatingLoading || isUpdatingLoading || isSubmitting}
                            startIcon={(isCreatingLoading || isUpdatingLoading) ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{mt: 2}}
                        >
                            {isCreating ? "Добавить" : "Изменить"}
                        </Button>
                    </Box>
                </Form>
            )}
        </Formik>
    );
};

export default SubscriptionForm;