import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { TextField as FormikTextField } from 'formik-mui';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Box, Button, CircularProgress, Grid, IconButton } from '@mui/material';
import { IStudentUpdatePayload } from '../models/student';
import CloseIcon from '@mui/icons-material/Close';

interface StudentFormValues {
    first_name: string;
    last_name: string;
    date_of_birth: Dayjs | null;
}

interface StudentFormProps {
    initialValues: StudentFormValues;
    onSubmit: (values: IStudentUpdatePayload) => Promise<void>;
    onClose: () => void;
    isLoading?: boolean;
}

const validationSchema = Yup.object().shape({
    first_name: Yup.string().required('Имя обязательно для заполнения').min(2, 'Слишком короткое имя'),
    last_name: Yup.string().required('Фамилия обязательна для заполнения').min(2, 'Слишком короткая фамилия'),
    date_of_birth: Yup.date().nullable().required('Дата рождения обязательна').max(dayjs().subtract(3, 'year'), 'Студенту должно быть не менее 3 лет'),
});

export const StudentForm: React.FC<StudentFormProps> = ({ initialValues, onSubmit, onClose, isLoading }) => {
    
    const handleSubmit = async (values: StudentFormValues) => {
        const payload: IStudentUpdatePayload = {
            first_name: values.first_name,
            last_name: values.last_name,
            date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
        };
        await onSubmit(payload);
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ errors, touched, setFieldValue, values }) => (
                <Form>
                    <IconButton
                            onClick={onClose}
                            sx={{ position: "absolute", top: 8, right: 8 }}
                        >
                            <CloseIcon />
                    </IconButton>   
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Field
                                component={FormikTextField}
                                name="first_name"
                                label="Имя"
                                fullWidth
                                required
                                error={touched.first_name && !!errors.first_name}
                                helperText={touched.first_name && errors.first_name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Field
                                component={FormikTextField}
                                name="last_name"
                                label="Фамилия"
                                fullWidth
                                required
                                error={touched.last_name && !!errors.last_name}
                                helperText={touched.last_name && errors.last_name}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Дата рождения"
                                    value={values.date_of_birth}
                                    onChange={(newValue) => setFieldValue('date_of_birth', newValue)}
                                    maxDate={dayjs().subtract(3, 'year')}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            error: touched.date_of_birth && !!errors.date_of_birth,
                                            helperText: touched.date_of_birth && errors.date_of_birth ? String(errors.date_of_birth) : '',
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
                        <Button onClick={onClose} disabled={isLoading}>Отмена</Button>
                        <Button type="submit" variant="contained" disabled={isLoading}>
                            {isLoading ? <CircularProgress size={24} /> : 'Сохранить'}
                        </Button>
                    </Box>
                </Form>
            )}
        </Formik>
    );
}; 