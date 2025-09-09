import React from 'react';
import { Formik, Form } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
import { Box, Grid, Typography, MenuItem } from '@mui/material';
import { IStudentUpdatePayload } from '../models/student';
import { useGetClientsQuery } from '../../../store/apis/clientsApi';
import { studentSchemas } from '../../../utils/validationSchemas';

// Form Components
import {
  FormikTextField,
  FormikDatePicker,
  FormikSelectField
} from '../../../components/forms/fields';
import { FormActions } from '../../../components/forms/layout';

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

export const StudentForm: React.FC<StudentFormProps> = ({ initialValues, onSubmit, onClose, isLoading }) => {
    const { data: clients = [] } = useGetClientsQuery();
    
    const handleSubmit = async (values: StudentFormValues) => {
        const payload: IStudentUpdatePayload = {
            ...values,
            date_of_birth: values.date_of_birth ? dayjs(values.date_of_birth).format('YYYY-MM-DD') : null,
        };
        await onSubmit(payload);
    };
    // Transform clients data for select options
    const clientOptions = clients.map(client => ({
        value: client.id,
        label: `${client.first_name} ${client.last_name}`
    }));

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={studentSchemas.create}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ setFieldValue, values }) => {
                React.useEffect(() => {
                    if (values.client_id) {
                        const selectedClient = clients.find(client => client.id === values.client_id);
                        if (selectedClient && values.last_name !== selectedClient.last_name) {
                            setFieldValue('last_name', selectedClient.last_name);
                        }
                    }
                }, [values.client_id, clients, setFieldValue]);

                return (
                    <Form>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                Основная информация
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormikSelectField
                                        name="client_id"
                                        label="Родитель"
                                        required
                                    >
                                        {clientOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </FormikSelectField>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <FormikTextField
                                        name="first_name"
                                        label="Имя"
                                        required
                                    />
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <FormikTextField
                                        name="last_name"
                                        label="Фамилия"
                                        required
                                    />
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <FormikDatePicker
                                        name="date_of_birth"
                                        label="Дата рождения"
                                        views={['year', 'month', 'day']}
                                        maxDate={dayjs().subtract(3, 'year')}
                                    />
                                </Grid>
                            </Grid>

                            <FormActions
                                submitText="Сохранить"
                                isSubmitting={isLoading}
                                onCancel={onClose}
                            />
                        </Box>
                    </Form>
                );
            }}
        </Formik>
    );
}; 