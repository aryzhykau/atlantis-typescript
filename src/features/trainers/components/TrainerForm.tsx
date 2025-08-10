import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Grid, Box, Typography, IconButton, Paper, FormControlLabel, Switch, CircularProgress, alpha, useTheme } from '@mui/material';
import { DatePicker } from "formik-mui-x-date-pickers";
import { ITrainerCreatePayload, ITrainerUpdatePayload, ITrainerResponse } from "../models/trainer.ts";
import { parsePhoneNumber } from 'libphonenumber-js';
import { FormikTelInput } from '../../../components/FormikTelInput.tsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import CloseIcon from '@mui/icons-material/Close';
import { useGradients } from '../../trainer-mobile/hooks/useGradients.ts';

dayjs.extend(utc);

interface TrainerFormValues {
    first_name: string;
    last_name: string;
    date_of_birth: dayjs.Dayjs | null;
    email: string;
    phone: string;
    salary: number | null;
    is_fixed_salary: boolean;
}

const validationSchema = Yup.object({
    first_name: Yup.string().required('Имя обязательно для заполнения'),
    last_name: Yup.string().required('Фамилия обязательна для заполнения'),
    email: Yup.string().email('Неверный формат email').required('Email обязателен для заполнения'),
    phone: Yup.string().required('Телефон обязателен для заполнения'),
    date_of_birth: Yup.date().nullable().required('Дата рождения обязательна'),
    salary: Yup.number().nullable().min(0, 'Зарплата не может быть отрицательной'),
    is_fixed_salary: Yup.boolean().required(),
});

const getInitialValues = (trainer?: Partial<ITrainerResponse>): TrainerFormValues => {
    if (trainer && trainer.id) { // Ensure we are in edit mode
        const phone = (trainer.phone_country_code && trainer.phone_number) 
            ? `${trainer.phone_country_code.replace('+', '')}${trainer.phone_number}` 
            : "";
        
        // Ensure there's a single '+' at the start
        const formattedPhone = phone ? `+${phone.replace('+', '')}` : "";

        return {
            first_name: trainer.first_name || "",
            last_name: trainer.last_name || "",
            date_of_birth: trainer.date_of_birth ? dayjs.utc(trainer.date_of_birth) : null,
            email: trainer.email || "",
            phone: formattedPhone,
            salary: trainer.salary ?? null,
            is_fixed_salary: trainer.is_fixed_salary ?? false,
        };
    }
    return {
        first_name: "",
        last_name: "",
        date_of_birth: null,
        email: "",
        phone: "",
        salary: null,
        is_fixed_salary: false,
    };
};

interface TrainerFormProps {
    title: string;
    initialValues?: Partial<ITrainerResponse>;
    onSubmit: (values: ITrainerCreatePayload | ITrainerUpdatePayload, id?: number) => void;
    onClose: () => void;
    isEdit: boolean;
    isLoading?: boolean;
}


export function TrainerForm({ title, initialValues, onSubmit, isEdit, onClose, isLoading }: TrainerFormProps) {
    
    const theme = useTheme();
    const gradients = useGradients();
    const formInitialValues = React.useMemo(() => getInitialValues(initialValues), [initialValues]);

    const handleFormSubmit = async (values: TrainerFormValues) => {
        const phoneInfo = values.phone ? parsePhoneNumber(values.phone) : null;
        const payload = {
            ...values,
            date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
            phone_country_code: phoneInfo?.countryCallingCode || null,
            phone_number: phoneInfo?.nationalNumber || null,
        };
        delete (payload as any).phone;

        if (isEdit) {
            onSubmit(payload as ITrainerUpdatePayload, initialValues?.id);
        } else {
            onSubmit(payload as ITrainerCreatePayload);
        }
    };

    return (
        <Formik
            initialValues={formInitialValues}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
            enableReinitialize // Keep this to populate form on edit
        >
            {({ isSubmitting, values, touched, errors }) => (
                <Form>
                    <Box sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography>
                            <IconButton onClick={onClose}><CloseIcon /></IconButton>
                        </Box>

                        <Grid container spacing={2}>
                            {/* --- Основная информация --- */}
                            <Grid item xs={12}> <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Основная информация</Typography> </Grid>
                            <Grid item xs={12} sm={6}>
                                <Field as={TextField} name="first_name" label="Имя" fullWidth required variant="outlined" size="small" error={touched.first_name && !!errors.first_name} helperText={touched.first_name && errors.first_name} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Field as={TextField} name="last_name" label="Фамилия" fullWidth required variant="outlined" size="small" error={touched.last_name && !!errors.last_name} helperText={touched.last_name && errors.last_name} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Field name="date_of_birth" label="Дата рождения" component={DatePicker} views={["year", "month", "day"]} format="DD.MM.YYYY"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true, required: true, size: "small", variant: "outlined",
                                            error: touched.date_of_birth && !!errors.date_of_birth,
                                            helperText: touched.date_of_birth && errors.date_of_birth
                                        }
                                    }}
                                />
                            </Grid>

                             {/* --- Контактная информация --- */}
                             <Grid item xs={12}> <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Контактная информация</Typography> </Grid>
                             <Grid item xs={12} sm={6}>
                                <Field as={TextField} name="email" type="email" label="Email" fullWidth required variant="outlined" size="small" error={touched.email && !!errors.email} helperText={touched.email && errors.email} />
                            </Grid>
                             <Grid item xs={12} sm={6}>
                                <FormikTelInput name="phone" label="Телефон" fullWidth required defaultCountry="SK" variant="outlined" size="small" />
                            </Grid>

                            {/* --- Зарплата --- */}
                            <Grid item xs={12}> <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Зарплата</Typography> </Grid>
                            <Grid item xs={12} sm={6}>
                                <Field as={TextField} name="salary" type="number" label={values.is_fixed_salary ? "Месячная зарплата (€)" : "Ставка за тренировку (€)"} fullWidth variant="outlined" size="small" error={touched.salary && !!errors.salary} helperText={touched.salary && errors.salary} />
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                 <FormControlLabel
                                     control={ <Field as={Switch} type="checkbox" name="is_fixed_salary" /> }
                                     label="Фиксированная зарплата"
                                 />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting || isLoading}
                                sx={{
                                    background: gradients.primary,
                                    color: 'white', fontWeight: 600, textTransform: 'none',
                                    px: 4, py: 1.5, borderRadius: 3, fontSize: '1.1rem',
                                    '&:hover': { background: alpha(theme.palette.primary.main, 0.8) },
                                    '&:disabled': { background: theme.palette.action.disabled }
                                }}
                            >
                                {isSubmitting ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={20} sx={{ color: 'white' }} />
                                        Сохранение...
                                    </Box>
                                ) : (isEdit ? 'Обновить тренера' : 'Создать тренера')}
                            </Button>
                        </Box>
                    </Box>
                </Form>
            )}
        </Formik>
    );
}