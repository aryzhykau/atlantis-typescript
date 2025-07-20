import * as yup from "yup";
import {useClients} from "../hooks/clientManagementHooks.ts";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import {Field, FieldArray, Form, Formik, FormikProps} from "formik";
import {
    Box, 
    Button, 
    alpha,
    CircularProgress,
    Grid
} from "@mui/material";
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useTheme } from '@mui/material';

import {DatePicker} from "formik-mui-x-date-pickers";
import {TextField, Checkbox} from "formik-mui";
import { IClientUserFormValues, ClientUpdate, IClientCreatePayload } from "../models/client.ts";
import * as Yup from "yup";


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
    const theme = useTheme();
    const gradients = useGradients();

    const validationSchema = yup.object({
        first_name: yup.string().required("Имя обязательно"),
        last_name: yup.string().required("Фамилия обязательна"),
        email: yup.string().email("Введите корректный email").required("Email обязателен"),
        phone: yup.string().matches(/^[0-9]{10}$/, "Формат: 0987654321").required("Телефон обязателен"),
        date_of_birth: yup.date().required("Дата рождения обязательна"),
        whatsapp_number: yup.string(),
        is_student: yup.boolean(),
        students: Yup.array().of(
            Yup.object().shape({
                first_name: Yup.string().required('Имя обязательно'),
                last_name: Yup.string().required('Фамилия обязательна'),
                date_of_birth: yup.date().required("Дата рождения обязательна"),
            })
        ).notRequired()
    });

    const handleSubmit = async (values: IClientUserFormValues, {resetForm}: {resetForm: () =>  void}) => {
        try {
            const clientFirstName = values.first_name;
            const clientLastName = values.last_name;
            const clientEmail = values.email;
            const clientPhone = values.phone;
            const clientDateOfBirth = values.date_of_birth
                ? dayjs(values.date_of_birth).tz(dayjs.tz.guess()).format('YYYY-MM-DD')
                : null;
            const clientWhatsappNumber = values.whatsapp_number === "" ? null : values.whatsapp_number;
    
            if (isEdit) {
                if (clientId === null) {
                    displaySnackbar("Ошибка: ID клиента отсутствует для обновления.", "error");
                    throw new Error("Client ID is missing for update");
                }
    
                const clientDataToUpdate: ClientUpdate = {
                    first_name: clientFirstName,
                    last_name: clientLastName,
                    email: clientEmail,
                    phone: clientPhone,
                    date_of_birth: clientDateOfBirth,
                    whatsapp_number: clientWhatsappNumber,
                };
    
                await updateClient({ clientId: clientId, clientData: clientDataToUpdate }).unwrap();
                displaySnackbar("Клиент успешно обновлен", "success");
            } else {
                if (!clientDateOfBirth) { 
                    displaySnackbar("Дата рождения клиента обязательна.", "error");
                    return; 
                }
    
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
                    first_name: clientFirstName,
                    last_name: clientLastName,
                    email: clientEmail,
                    phone: clientPhone,
                    date_of_birth: clientDateOfBirth,
                    whatsapp_number: clientWhatsappNumber,
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
                error.data && 
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
                        <Grid container spacing={1} sx={{ mb: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Field name="first_name" label="Имя" component={TextField} fullWidth required variant="outlined" size="small" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Field name="last_name" label="Фамилия" component={TextField} fullWidth required variant="outlined" size="small" />
                            </Grid>
                        </Grid>

                        {/* Контактная информация */}
                        <Grid container spacing={1} sx={{ mb: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Field name="email" label="Email" component={TextField} fullWidth required variant="outlined" size="small" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Field name="phone" label="Телефон" component={TextField} fullWidth required helperText="Формат: 0987654321" variant="outlined" size="small" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Field name="whatsapp_number" label="WhatsApp" component={TextField} fullWidth helperText="Номер WhatsApp, если отличается от основного телефона" variant="outlined" size="small" />
                            </Grid>
                        </Grid>

                        {/* Личная информация */}
                        <Field name="date_of_birth" label="Дата рождения" component={DatePicker} views={["year", "month", "date"]} textField={{helperText: "Укажите дату рождения"}} inputFormat="dd.MM.yyyy" InputLabelProps={{shrink: true}} fullWidth required size="small" sx={{ mb: 1 }} />

                        {/* Статус студента и дети клиента (только при создании) */}
                        {!isEdit && (
                            <>
                                <Box sx={{ mb: 1 }}>
                                    <Field name="is_student" type="checkbox" component={Checkbox} /> Сам посещает тренировки
                                </Box>
                                <FieldArray name="students" render={arrayHelpers => (
                                    <Box>
                                        {arrayHelpers.form.values.students && arrayHelpers.form.values.students.length > 0 && arrayHelpers.form.values.students.map((_: any, index: number) => (
                                            <Grid container spacing={1} alignItems="center" key={index} sx={{ mb: 0.5 }}>
                                                <Grid item xs={12} sm={3}>
                                                    <Field name={`students[${index}].first_name`} label="Имя" component={TextField} fullWidth variant="outlined" size="small" />
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <Field name={`students[${index}].last_name`} label="Фамилия" component={TextField} fullWidth variant="outlined" size="small" />
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <Field name={`students[${index}].date_of_birth`} label="Дата рождения" component={DatePicker} views={["year", "month", "date"]} textField={{helperText: ""}} inputFormat="dd.MM.yyyy" InputLabelProps={{shrink: true}} fullWidth size="small" />
                                                </Grid>
                                                <Grid item xs={12} sm={2}>
                                                    <Button variant="outlined" color="error" size="small" onClick={() => arrayHelpers.remove(index)} sx={{ minWidth: 0, px: 0.5 }}>✕</Button>
                                                </Grid>
                                            </Grid>
                                        ))}
                                        <Button variant="outlined" size="small" onClick={() => arrayHelpers.push({ first_name: '', last_name: '', date_of_birth: null })} sx={{ mt: 0.5, minWidth: 0, px: 1 }}>
                                            + Добавить ребёнка
                                        </Button>
                                    </Box>
                                )} />
                            </>
                        )}

                        {/* Кнопка сохранения */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting}
                                sx={{
                                    background: gradients.primary,
                                    color: 'white',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    fontSize: '1.1rem',
                                    '&:hover': {
                                        background: alpha(theme.palette.primary.main, 0.8),
                                    },
                                    '&:disabled': {
                                        background: theme.palette.action.disabled,
                                    }
                                }}
                            >
                                {isSubmitting ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={20} sx={{ color: 'white' }} />
                                        Сохранение...
                                    </Box>
                                ) : (
                                    isEdit ? 'Обновить клиента' : 'Создать клиента'
                                )}
                            </Button>
                        </Box>
                    </Box>
                </Form>
            )}
        </Formik>
    );
}
