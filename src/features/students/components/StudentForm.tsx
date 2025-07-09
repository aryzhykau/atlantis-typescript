import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Box, Button, CircularProgress, Grid, Typography, Paper, Autocomplete, TextField } from '@mui/material';
import { IStudentUpdatePayload } from '../models/student';
import PersonIcon from '@mui/icons-material/Person';
import CakeIcon from '@mui/icons-material/Cake';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useTheme } from '@mui/material';
import { useGetClientsQuery } from '../../../store/apis/clientsApi';
import { IClientUserGet } from '../../clients/models/client';

interface StudentFormValues {
    first_name: string;
    last_name: string;
    date_of_birth: Dayjs | null;
    client_id: number | null;
}

interface StudentFormProps {
    initialValues: StudentFormValues;
    onSubmit: (values: IStudentUpdatePayload) => Promise<void>;
    onClose: () => void;
    isLoading?: boolean;
}

const validationSchema = Yup.object({
    first_name: Yup.string().required('Имя обязательно'),
    last_name: Yup.string().required('Фамилия обязательна'),
    date_of_birth: Yup.date().nullable().required('Дата рождения обязательна').max(dayjs().subtract(3, 'year'), 'Студенту должно быть не менее 3 лет'),
    client_id: Yup.number().nullable().required('Выберите родителя'),
});

type StyledFieldColor = 'primary' | 'success' | 'warning' | 'info';

interface StyledFieldProps {
    name: string;
    label: string;
    icon: React.ReactNode;
    color?: StyledFieldColor;
    [key: string]: any;
}



export const StudentForm: React.FC<StudentFormProps> = ({ initialValues, onSubmit, onClose, isLoading }) => {
    const gradients: Record<StyledFieldColor, string> = useGradients();
    const { data: clients = [] } = useGetClientsQuery();
    
    const handleSubmit = async (values: StudentFormValues) => {
        const payload: IStudentUpdatePayload = {
            ...values,
            date_of_birth: values.date_of_birth ? dayjs(values.date_of_birth).format('YYYY-MM-DD') : null,
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
            {({ errors, touched, setFieldValue, values }) => {
                React.useEffect(() => {
                    if (values.client_id) {
                        const selectedClient = clients.find(client => client.id === values.client_id);
                        if (selectedClient && values.last_name !== selectedClient.last_name) {
                            setFieldValue('last_name', selectedClient.last_name);
                        }
                    }
                }, [values.client_id]);
                return (
                    <Form>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                Основная информация
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Field
                                        name="client_id"
                                        label="Родитель"
                                        icon={<FamilyRestroomIcon />}
                                        color="info"
                                        component={Autocomplete}
                                        options={clients}
                                        getOptionLabel={(option: IClientUserGet) => `${option.first_name} ${option.last_name}`}
                                        value={clients.find(client => client.id === values.client_id) || null}
                                        onChange={(_event: any, newValue: IClientUserGet | null) => setFieldValue('client_id', newValue?.id || null)}
                                        renderInput={(params: any) => (
                                            <TextField
                                                {...params}
                                                label="Выберите родителя"
                                                error={touched.client_id && !!errors.client_id}
                                                helperText={touched.client_id && errors.client_id}
                                                fullWidth
                                                required
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Field
                                        name="first_name"
                                        label="Имя"
                                        icon={<PersonIcon />}
                                        color="primary"
                                        component={TextField}
                                        fullWidth
                                        required
                                        error={touched.first_name && !!errors.first_name}
                                        helperText={touched.first_name && errors.first_name}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Field
                                        name="last_name"
                                        label="Фамилия"
                                        icon={<PersonIcon />}
                                        color="primary"
                                        component={TextField}
                                        fullWidth
                                        required
                                        error={touched.last_name && !!errors.last_name}
                                        helperText={touched.last_name && errors.last_name}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        name="date_of_birth"
                                        label="Дата рождения"
                                        icon={<CakeIcon />}
                                        color="warning"
                                        component={DatePicker}
                                        views={["year", "month", "date"]}
                                        textField={{helperText: "Укажите дату рождения"}}
                                        inputFormat="dd.MM.yyyy"
                                        InputLabelProps={{shrink: true}}
                                        value={values.date_of_birth}
                                        onChange={(newValue: Dayjs | null) => setFieldValue('date_of_birth', newValue)}
                                        maxDate={dayjs().subtract(3, 'year')}
                                        required
                                        error={touched.date_of_birth && !!errors.date_of_birth}
                                        helperText={touched.date_of_birth && errors.date_of_birth}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
                            <Button onClick={onClose} disabled={isLoading} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 500 }}>
                                Отмена
                            </Button>
                            <Button type="submit" variant="contained" disabled={isLoading} sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 2, px: 4, py: 1.5, background: gradients.primary, color: 'white', '&:hover': { background: gradients.primary } }}>
                                {isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Сохранить'}
                            </Button>
                        </Box>
                    </Form>
                );
            }}
        </Formik>
    );
}; 