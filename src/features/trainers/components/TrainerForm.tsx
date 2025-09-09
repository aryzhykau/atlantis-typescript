import React from 'react';
import { Formik, Form } from 'formik';
import { Grid, Typography } from '@mui/material';
import { Person } from '@mui/icons-material';
import { 
  FormikDialog, 
  FormikTextField, 
  FormikDatePicker, 
  FormikTelInput, 
  FormikNumberField, 
  FormikSwitch,
  FormActions 
} from '../../../components/forms';
import { useFormSubmission } from '../../../hooks/forms';
import { trainerSchemas } from '../../../utils/validationSchemas';
import { ITrainerCreatePayload, ITrainerUpdatePayload, ITrainerResponse } from "../models/trainer.ts";
import { parsePhoneNumber } from 'libphonenumber-js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

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
    const formInitialValues = React.useMemo(() => getInitialValues(initialValues), [initialValues]);

    // Form submission hook
    const { submit, isLoading: isSubmissionLoading } = useFormSubmission({
        successMessage: isEdit ? 'Тренер успешно обновлен' : 'Тренер успешно создан',
        onSuccess: onClose,
    });

    const handleFormSubmit = async (values: TrainerFormValues) => {
        await submit(async () => {
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
        });
    };

    const combinedIsLoading = isLoading || isSubmissionLoading;

    return (
        <FormikDialog
            open={true}
            onClose={onClose}
            title={title}
            subtitle={isEdit ? "Редактирование информации о тренере" : "Добавление нового тренера"}
            icon={<Person />}
            maxWidth="md"
        >
            <Formik
                initialValues={formInitialValues}
                validationSchema={isEdit ? trainerSchemas.update : trainerSchemas.create}
                onSubmit={handleFormSubmit}
                enableReinitialize
            >
                {({ isSubmitting, values }) => (
                    <Form>
                        <Grid container spacing={3}>
                            {/* --- Основная информация --- */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Основная информация
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormikTextField
                                    name="first_name"
                                    label="Имя"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormikTextField
                                    name="last_name"
                                    label="Фамилия"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormikDatePicker
                                    name="date_of_birth"
                                    label="Дата рождения"
                                    views={["year", "month", "day"]}
                                    format="DD.MM.YYYY"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                        }
                                    }}
                                />
                            </Grid>

                            {/* --- Контактная информация --- */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 600 }}>
                                    Контактная информация
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormikTextField
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
                                    fullWidth
                                    required
                                    defaultCountry="SK"
                                />
                            </Grid>

                            {/* --- Зарплата --- */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 600 }}>
                                    Зарплата
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <FormikSwitch
                                    name="is_fixed_salary"
                                    label="Фиксированная месячная зарплата"
                                />
                            </Grid>
                            {values.is_fixed_salary && (
                                <Grid item xs={12} sm={6}>
                                    <FormikNumberField
                                        name="salary"
                                        label="Месячная зарплата"
                                        suffix="€"
                                        min={0}
                                        decimalPlaces={2}
                                        fullWidth
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <FormActions
                                    onCancel={onClose}
                                    submitText={isEdit ? 'Обновить тренера' : 'Создать тренера'}
                                    isLoading={combinedIsLoading || isSubmitting}
                                    disabled={combinedIsLoading || isSubmitting}
                                />
                            </Grid>
                        </Grid>
                    </Form>
                )}
            </Formik>
        </FormikDialog>
    );
}