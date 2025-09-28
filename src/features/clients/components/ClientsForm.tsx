import { Form, Formik, FormikProps } from "formik";
import { Box, Grid } from "@mui/material";
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { parsePhoneNumber } from 'libphonenumber-js';

import { useClients } from "../hooks/clientManagementHooks.ts";
import { useSnackbar } from "../../../hooks/useSnackBar.tsx";
import { IClientUserFormValues, ClientUpdate, IClientCreatePayload } from "../models/client.ts";
import { clientSchemas } from "../../../utils/validationSchemas";

// Form Components
import {
  FormikTextField,
  FormikTelInput,
  FormikDatePicker,
  FormikCheckboxField,
  FormikFieldArray
} from "../../../components/forms/fields";
import { FormActions } from "../../../components/forms/layout";


dayjs.extend(utc);
dayjs.extend(timezone);

// Новый интерфейс для формы студента
export interface IStudentFormShape {
    id?: number;
    first_name: string;
    last_name: string;
    date_of_birth: Date | null | dayjs.Dayjs;
}

const defaultValues : IClientUserFormValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: null,
    whatsapp_number: "",
    is_student: false,
    students: []
};

interface ClientsFormProps {
    title?: string;
    initialValues?: IClientUserFormValues;
    onClose: () => void;
    isEdit?: boolean;
    clientId?: number | null;
}

// Компонент для красивого поля ввода


export function ClientsForm({initialValues = defaultValues, isEdit = false, clientId = null, onClose }: ClientsFormProps) {
    const {createClient, updateClient, refetchClients} = useClients()
    const {displaySnackbar} = useSnackbar();

    const validationSchema = isEdit ? clientSchemas.update : clientSchemas.create;

    const handleSubmit = async (values: IClientUserFormValues, {resetForm}: {resetForm: () =>  void}) => {
        // Log and show a quick snackbar to confirm submit handler invocation
        console.log('ClientsForm handleSubmit called with values:', values);
        displaySnackbar('Submitting client...', 'info');
        try {
            const phoneInfo = values.phone ? parsePhoneNumber(values.phone) : null;
            const whatsappInfo = values.whatsapp_number ? parsePhoneNumber(values.whatsapp_number) : null;

            if (isEdit) {
                if (clientId === null) {
                    displaySnackbar("Ошибка: ID клиента отсутствует для обновления.", "error");
                    throw new Error("Client ID is missing for update");
                }
    
                const clientDataToUpdate: ClientUpdate = {
                    first_name: values.first_name,
                    last_name: values.last_name,
                    email: values.email,
                    phone_country_code: phoneInfo?.countryCallingCode,
                    phone_number: phoneInfo?.nationalNumber,
                    date_of_birth: values.date_of_birth ? dayjs(values.date_of_birth).format('YYYY-MM-DD') : null,
                    whatsapp_country_code: whatsappInfo?.countryCallingCode,
                    whatsapp_number: whatsappInfo?.nationalNumber,
                };
    
                await updateClient({ clientId: clientId, clientData: clientDataToUpdate }).unwrap();
                displaySnackbar("Клиент успешно обновлен", "success");
            } else {
                const clientDateOfBirth = values.date_of_birth
                    ? dayjs(values.date_of_birth).tz(dayjs.tz.guess()).format('YYYY-MM-DD')
                    : null;
    
                // Date of birth is optional now; backend accepts null. Convert if present.
    
                const studentsToCreate = values.students
                    ?.filter(student => student.date_of_birth != null) 
                    .map(student => {
                        const dob = student.date_of_birth;
                        return {
                            first_name: student.first_name,
                            last_name: student.last_name,
                            date_of_birth: dayjs(dob).tz(dayjs.tz.guess()).format('YYYY-MM-DD'),
                        };
                    }) || [];
    
                const clientDataToCreate: IClientCreatePayload = {
                    first_name: values.first_name,
                    last_name: values.last_name,
                    email: values.email,
                    phone_country_code: phoneInfo?.countryCallingCode || '',
                    phone_number: phoneInfo?.nationalNumber || '',
                    date_of_birth: clientDateOfBirth || '',
                    whatsapp_country_code: whatsappInfo?.countryCallingCode,
                    whatsapp_number: whatsappInfo?.nationalNumber,
                    is_student: values.is_student,
                    students: studentsToCreate,
                };
                await createClient(clientDataToCreate).unwrap();
                displaySnackbar("Клиент успешно создан", "success");
            }
            refetchClients();
            resetForm();
            onClose();
        } catch (error: any) {
            const errorMessage =
                typeof error === "object" &&
                error !== null &&
                'data' in error &&
                typeof error.data === "object" &&
                error.data !== null &&
                "detail" in error.data &&
                typeof (error.data as any).detail === 'string' 
                    ? (error.data as any).detail 
                    : "Что-то пошло не так при сохранении клиента";
    
            displaySnackbar(errorMessage, "error");
            console.error("Client form submission error:", error);
        }
    }

    return (
        <Formik
            initialValues={isEdit ? initialValues : defaultValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({isSubmitting}: FormikProps<IClientUserFormValues>) => (
                <Form>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Основная информация */}
                        <Grid container spacing={2}>
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
                        </Grid>

                        {/* Контактная информация */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormikTextField 
                                    name="email" 
                                    label="Email" 
                                    type="email"
                                    required 
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormikTelInput 
                                    name="phone" 
                                    label="Телефон" 
                                    required 
                                    defaultCountry="SK" 
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormikTelInput 
                                    name="whatsapp_number" 
                                    label="WhatsApp" 
                                    defaultCountry="SK" 
                                    helperText="Номер WhatsApp, если отличается от основного телефона" 
                                />
                            </Grid>
                        </Grid>

                        {/* Личная информация */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormikDatePicker 
                                    name="date_of_birth" 
                                    label="Дата рождения" 
                                    views={['year', 'month', 'day']}
                                />
                            </Grid>
                        </Grid>

                        {/* Статус студента и дети клиента (только при создании) */}
                        {!isEdit && (
                            <>
                                <FormikCheckboxField 
                                    name="is_student" 
                                    label="Сам посещает тренировки" 
                                />
                                
                                <FormikFieldArray 
                                    name="students"
                                    label="Дети клиента"
                                    addButtonText="Добавить ребёнка"
                                    emptyItem={{ first_name: '', last_name: '', date_of_birth: null, gender: 'M' }}
                                >
                                    {(index: number) => (
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} sm={3}>
                                                <FormikTextField 
                                                    name={`students[${index}].first_name`} 
                                                    label="Имя" 
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <FormikTextField 
                                                    name={`students[${index}].last_name`} 
                                                    label="Фамилия" 
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <FormikDatePicker 
                                                    name={`students[${index}].date_of_birth`} 
                                                    label="Дата рождения" 
                                                    views={['year', 'month', 'day']}
                                                />
                                            </Grid>
                                        </Grid>
                                    )}
                                </FormikFieldArray>
                            </>
                        )}

                        <FormActions
                            submitText={isEdit ? 'Обновить клиента' : 'Создать клиента'}
                            isSubmitting={isSubmitting}
                            onCancel={onClose}
                        />
                    </Box>
                </Form>
            )}
        </Formik>
    );
}
