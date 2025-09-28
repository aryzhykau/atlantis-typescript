import React from 'react';
import { Box, Grid, MenuItem } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import { IStudentCreatePayload, IStudentUpdatePayload } from '../models/student';
import { useGetClientsQuery } from '../../../store/apis/clientsApi';
import { studentSchemas } from '../../../utils/validationSchemas';

// Form Components
import { FormikTextField, FormikDatePicker, FormikSelectField, FormikDialog, FormActions } from '../../../components/forms';
import { useFormSubmission } from '../../../hooks/forms';

interface StudentFormValues {
    first_name: string;
    last_name: string;
    date_of_birth: Dayjs | null;
    client_id: number | null;
}

interface StudentFormProps {
    open?: boolean;
    onClose: () => void;
    initialValues: StudentFormValues;
    validationSchema?: Yup.ObjectSchema<any>;
    onSubmit: (values: IStudentCreatePayload | IStudentUpdatePayload) => Promise<void>;
    isLoading?: boolean;
    title?: string;
    subtitle?: string;
    isEdit?: boolean;
}

export const StudentForm: React.FC<StudentFormProps> = ({
    open,
    onClose,
    initialValues,
    validationSchema,
    onSubmit,
    isLoading,
    title,
    subtitle,
    isEdit = false,
}) => {
    const { data: clients = [] } = useGetClientsQuery();

    const { submit, isLoading: isSubmissionLoading } = useFormSubmission({
        successMessage: isEdit ? 'Данные ученика успешно обновлены' : 'Ученик успешно создан',
        onSuccess: onClose,
    });

    const handleSubmit = async (values: StudentFormValues) => {
        const payload: IStudentCreatePayload | IStudentUpdatePayload = {
            ...values,
            date_of_birth: values.date_of_birth ? dayjs(values.date_of_birth).format('YYYY-MM-DD') : '',
            ...(isEdit ? {} : { is_active: true }) // is_active only for creation
        };

        await submit(async () => {
            await onSubmit(payload);
        });
    };

    const combinedIsLoading = isLoading || isSubmissionLoading;

    // Transform clients data for select options
    const clientOptions = clients.map(client => ({
        value: client.id,
        label: `${client.first_name} ${client.last_name}`
    }));

    const schemaToUse = validationSchema ?? (isEdit ? studentSchemas.update : studentSchemas.create);

    const renderInner = () => (
        <Formik
            initialValues={initialValues}
            validationSchema={schemaToUse}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ setFieldValue, values, isSubmitting, isValid }) => {
                    React.useEffect(() => {
                        if (values.client_id) {
                            const selectedClient = clients.find(client => client.id === values.client_id);
                            if (selectedClient && values.last_name !== selectedClient.last_name) {
                                setFieldValue('last_name', selectedClient.last_name);
                            }
                        }
                    }, [values.client_id, clients, setFieldValue, values.last_name]);

                    return (
                        <Form>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                                    isLoading={combinedIsLoading || isSubmitting}
                                    onCancel={onClose}
                                    disabled={combinedIsLoading || isSubmitting || !isValid}
                                />
                            </Box>
                        </Form>
                    );
                }}
        </Formik>
    );

    // If `open` prop is provided, wrap in dialog; otherwise render inline form (for embedding)
    if (typeof open === 'boolean') {
        return (
            <FormikDialog
                open={open}
                onClose={onClose}
                title={title ?? ''}
                subtitle={subtitle}
                maxWidth="sm"
            >
                {renderInner()}
            </FormikDialog>
        );
    }

    return renderInner();
};