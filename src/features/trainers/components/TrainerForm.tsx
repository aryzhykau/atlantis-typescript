import { Formik, Form, Field } from 'formik';
import { TextField, Button, Grid, Box, Typography, IconButton, Paper, FormControlLabel, Switch } from '@mui/material';
import { DatePicker } from "formik-mui-x-date-pickers";
import { ITrainerCreatePayload, ITrainerUpdatePayload, ITrainerResponse } from "../models/trainer.ts";
import { parsePhoneNumber } from 'libphonenumber-js';
import { FormikTelInput } from '../../../components/FormikTelInput.tsx';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import CloseIcon from '@mui/icons-material/Close';

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

const defaultCreateValues: TrainerFormValues = {
    first_name: "",
    last_name: "",
    date_of_birth: null,
    email: "",
    phone: "",
    salary: null,
    is_fixed_salary: false,
};

type ITrainerP = ITrainerCreatePayload;
type ITrainerU = ITrainerUpdatePayload;

interface TrainerFormProps {
    title: string;
    initialValues?: Partial<ITrainerResponse>;
    onSubmit: (values: ITrainerP | ITrainerU, id?: number) => void;
    onClose: () => void;
    isEdit: boolean;
    isLoading?: boolean;
}

export function TrainerForm({ title, initialValues, onSubmit, isEdit, onClose, isLoading }: TrainerFormProps) {

    const formikInitialValues: TrainerFormValues = isEdit && initialValues
        ? {
            first_name: initialValues.first_name || "",
            last_name: initialValues.last_name || "",
            date_of_birth: initialValues.date_of_birth ? dayjs.utc(initialValues.date_of_birth) : null,
            email: initialValues.email || "",
            phone: (initialValues.phone_country_code && initialValues.phone_number) ? `${initialValues.phone_country_code}${initialValues.phone_number}` : "",
            salary: initialValues.salary || null,
            is_fixed_salary: initialValues.is_fixed_salary || false,
        }
        : defaultCreateValues;

    const handleFormSubmit = async (values: TrainerFormValues) => {
        const phoneInfo = parsePhoneNumber(values.phone);
        const payload: Partial<ITrainerP | ITrainerU> = {
            ...values,
            date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
            phone_country_code: phoneInfo?.countryCallingCode || '',
            phone_number: phoneInfo?.nationalNumber || '',
        };
        delete (payload as Partial<TrainerFormValues>).phone;


        if (isEdit) {
            onSubmit(payload as ITrainerU, initialValues?.id);
        } else {
            onSubmit(payload as ITrainerP);
        }
    };

    return (
        <Formik
            initialValues={formikInitialValues}
            onSubmit={handleFormSubmit}
            enableReinitialize
        >
            {({ isSubmitting }) => (
                <Form>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            position: 'relative',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
                            <IconButton onClick={onClose}><CloseIcon /></IconButton>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Field
                                    component={TextField}
                                    name="first_name"
                                    label="Имя"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Field
                                    component={TextField}
                                    name="last_name"
                                    label="Фамилия"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Field
                                    component={TextField}
                                    name="email"
                                    type="email"
                                    label="Email"
                                    fullWidth
                                    required
                                />
                            </Grid>
                             <Grid item xs={12} sm={6}>
                                <FormikTelInput
                                    name="phone"
                                    label="Телефон"
                                    defaultCountry="SK"
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                               <Field
                                    component={DatePicker}
                                    name="date_of_birth"
                                    label="Дата рождения"
                                    format="DD.MM.YYYY"
                                    views={['year', 'month', 'day']}
                                />
                            </Grid>
                             <Grid item xs={12} sm={6}>
                                <Field
                                    component={TextField}
                                    name="salary"
                                    type="number"
                                    label="Оклад"
                                    fullWidth
                                />
                            </Grid>
                             <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Field
                                            component={Switch}
                                            type="checkbox"
                                            name="is_fixed_salary"
                                        />
                                    }
                                    label="Фиксированный оклад"
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Box sx={{
                        position: 'sticky',
                        bottom: 0,
                        py: 2,
                        bgcolor: 'background.paper',
                        zIndex: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        mt: 2
                    }}>
                        <Grid container spacing={2} justifyContent="flex-end">
                            <Grid item>
                                <Button onClick={onClose} variant="outlined" color="secondary">
                                    Отмена
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isSubmitting || isLoading}
                                >
                                    {isEdit ? 'Сохранить' : 'Создать'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Form>
            )}
        </Formik>
    );
} 