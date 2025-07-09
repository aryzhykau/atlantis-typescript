import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { TextField as FormikTextField } from 'formik-mui';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';

interface FreezeSubscriptionFormValues {
    freeze_start_date: Dayjs | null;
    freeze_duration_days: number;
}

interface FreezeSubscriptionFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: FreezeSubscriptionFormValues) => void;
    isLoading?: boolean;
    activeSubscriptionName?: string;
    activeSubscriptionEndDate?: string;
}

const freezeValidationSchema = Yup.object().shape({
    freeze_start_date: Yup.date()
        .required('Дата начала заморозки обязательна')
        .min(dayjs().startOf('day'), 'Дата начала не может быть в прошлом'),
    freeze_duration_days: Yup.number()
        .required('Количество дней обязательно')
        .min(1, 'Минимальное количество дней: 1')
        .integer('Количество дней должно быть целым числом'),
});

export const FreezeSubscriptionForm: React.FC<FreezeSubscriptionFormProps> = ({
    open,
    onClose,
    onSubmit,
    isLoading,
    activeSubscriptionName,
    activeSubscriptionEndDate,
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ pb: 1 }}>Заморозить абонемент</DialogTitle>
            <Formik<FreezeSubscriptionFormValues>
                initialValues={{
                    freeze_start_date: dayjs().add(1, 'day'), // По умолчанию завтрашний день
                    freeze_duration_days: 7, // По умолчанию 7 дней
                }}
                validationSchema={freezeValidationSchema}
                onSubmit={onSubmit}
                enableReinitialize // Позволяет обновлять initialValues, если пропсы изменятся (хотя здесь не тот случай)
            >
                {({ errors, touched, setFieldValue, values, isSubmitting, isValid }) => (
                    <Form>
                        <DialogContent sx={{ pt: 1, pb: 2 }}>
                            <Grid container spacing={2}>
                                {activeSubscriptionName && (
                                    <Grid item xs={12} sx={{mb: 1}}>
                                        <Typography variant="subtitle1">
                                            Абонемент: <strong>{activeSubscriptionName}</strong>
                                        </Typography>
                                        {activeSubscriptionEndDate && (
                                            <Typography variant="body2" color="text.secondary">
                                                Действителен до: {activeSubscriptionEndDate}
                                            </Typography>
                                        )}
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Дата начала заморозки"
                                            value={values.freeze_start_date}
                                            onChange={(newValue) => setFieldValue('freeze_start_date', newValue)}
                                            minDate={dayjs()}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    required: true,
                                                    error: touched.freeze_start_date && !!errors.freeze_start_date,
                                                    helperText: touched.freeze_start_date && errors.freeze_start_date ? String(errors.freeze_start_date) : ' ',
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        component={FormikTextField}
                                        name="freeze_duration_days"
                                        label="Количество дней заморозки"
                                        type="number"
                                        fullWidth
                                        required
                                        error={touched.freeze_duration_days && !!errors.freeze_duration_days}
                                        helperText={touched.freeze_duration_days && errors.freeze_duration_days ? errors.freeze_duration_days : ' '}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2, pt:0 }}>
                            <Button onClick={onClose} disabled={isSubmitting || isLoading}>Отмена</Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                disabled={isSubmitting || isLoading || !isValid}
                            >
                                {isSubmitting || isLoading ? <CircularProgress size={24} /> : 'Заморозить'}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
}; 