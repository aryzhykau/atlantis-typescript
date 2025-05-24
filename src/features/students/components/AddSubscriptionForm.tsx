import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Select as FormikSelect, CheckboxWithLabel } from 'formik-mui'; // CheckboxWithLabel может не подойти, посмотрим
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    Box,
    Checkbox, // Используем обычный Checkbox и FormControlLabel
    FormControlLabel,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ISubscriptionResponse, IStudentSubscriptionCreatePayload } from '../../subscriptions/models/subscription';

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
}

const validationSchema = Yup.object().shape({
    subscription_id: Yup.string().required('Необходимо выбрать абонемент'),
    is_auto_renew: Yup.boolean(),
});

export const AddSubscriptionForm: React.FC<AddSubscriptionFormProps> = ({
    open,
    onClose,
    onSubmit,
    isLoading,
    studentId,
    availableSubscriptions,
    isLoadingSubscriptions,
}) => {
    const initialFormValues: AddSubscriptionFormValues = {
        subscription_id: '',
        is_auto_renew: true, // По умолчанию автопродление включено
    };

    const handleSubmit = async (values: AddSubscriptionFormValues) => {
        const payload: IStudentSubscriptionCreatePayload = {
            student_id: studentId,
            subscription_id: Number(values.subscription_id),
            is_auto_renew: values.is_auto_renew,
        };
        await onSubmit(payload);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
            }}>
                Добавить абонемент ученику
            </DialogTitle>
            <Formik
                initialValues={initialFormValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize // Если initialValues могут измениться извне (здесь не тот случай, но полезно)
            >
                {({ errors, touched, values, setFieldValue, isSubmitting, dirty, isValid }) => (
                    <Form>
                        <IconButton
                            onClick={onClose}
                            sx={{ position: "absolute", top: 8, right: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <DialogContent sx={{ pt: 1 }}>
                            <FormControl 
                                fullWidth 
                                sx={{ mb: 2 }} 
                                error={touched.subscription_id && !!errors.subscription_id}
                            >
                                <InputLabel id="subscription-select-label">Абонемент</InputLabel>
                                <Field
                                    component={FormikSelect}
                                    name="subscription_id"
                                    labelId="subscription-select-label"
                                    label="Абонемент"
                                    disabled={isLoadingSubscriptions || availableSubscriptions.length === 0}
                                >
                                    {isLoadingSubscriptions ? (
                                        <MenuItem value="" disabled>
                                            <em>Загрузка абонементов...</em>
                                        </MenuItem>
                                    ) : availableSubscriptions.length === 0 ? (
                                        <MenuItem value="" disabled>
                                            <em>Нет доступных абонементов</em>
                                        </MenuItem>
                                    ): (
                                        availableSubscriptions.map((sub) => (
                                            <MenuItem key={sub.id} value={sub.id.toString()}>
                                                {sub.name} ({sub.price}€, {sub.number_of_sessions} занятий, {sub.validity_days} дней)
                                            </MenuItem>
                                        ))
                                    )}
                                </Field>
                                {touched.subscription_id && errors.subscription_id && (
                                    <FormHelperText error>{errors.subscription_id}</FormHelperText>
                                )}
                            </FormControl>

                            <FormControlLabel
                                control={
                                    <Field
                                        component={Checkbox} // Используем MUI Checkbox напрямую с Formik Field
                                        type="checkbox"
                                        name="is_auto_renew"
                                        checked={values.is_auto_renew}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('is_auto_renew', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Автоматическое продление"
                                sx={{ mb: 1, display: 'block' }}
                            />
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={onClose} disabled={isLoading || isSubmitting}>
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isLoading || isSubmitting || !dirty || !isValid}
                            >
                                {isLoading || isSubmitting ? <CircularProgress size={24} /> : 'Добавить'}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
}; 