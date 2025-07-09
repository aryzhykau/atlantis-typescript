import * as yup from "yup";
import { Form, Formik, Field } from "formik";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { TextField, CheckboxWithLabel } from "formik-mui";
import { DatePicker } from "formik-mui-x-date-pickers";
import { ITrainerCreatePayload, ITrainerUpdatePayload, ITrainerResponse } from "../models/trainer.ts";
import dayjs from 'dayjs';



// Начальные значения для формы СОЗДАНИЯ тренера (поля как в ITrainerCreatePayload)
const defaultCreateValues: ITrainerCreatePayload = {
    first_name: "",
    last_name: "",
    date_of_birth: "", // Для payload это строка, но в форме будет Dayjs
    email: "",
    phone: "",
    salary: null, 
    is_fixed_salary: false,
};

// Типы для значений формы внутри Formik
interface TrainerFormValues {
    first_name: string;
    last_name: string;
    date_of_birth: dayjs.Dayjs | null;
    email: string;
    phone: string;
    salary: number | null | undefined; // Может быть не определено в форме
    is_fixed_salary: boolean | null | undefined; // Может быть не определено в форме
}

interface TrainerFormProps {
    title?: string;
    initialValues?: Partial<ITrainerResponse>; 
    onSubmit: (values: ITrainerCreatePayload | ITrainerUpdatePayload, id?: number) => Promise<void>;
    onClose: () => void;
    isEdit?: boolean;
    isLoading?: boolean;
    stickyActions?: boolean;
}

export function TrainerForm({
    initialValues,
    onSubmit,
    onClose,
    isEdit = false,
    isLoading = false,
    stickyActions = false,
}: TrainerFormProps) {

    const validationSchema = yup.object({
        first_name: yup.string().required("Имя обязательно").min(2, "Минимум 2 символа").max(50, "Максимум 50 символов"),
        last_name: yup.string().required("Фамилия обязательна").min(2, "Минимум 2 символа").max(50, "Максимум 50 символов"),
        email: yup.string().email("Введите корректный email").required("Email обязателен"),
        phone: yup.string().required("Телефон обязателен").min(10, "Минимум 10 символов").max(15, "Максимум 15 символов"),
        date_of_birth: yup.date().nullable().required("Дата рождения обязательна"),
        salary: yup.number().nullable().min(0, "Зарплата не может быть отрицательной"),
        is_fixed_salary: yup.boolean().nullable(),
    });

    const formikInitialValues: TrainerFormValues = isEdit && initialValues
        ? {
            first_name: initialValues.first_name || "",
            last_name: initialValues.last_name || "",
            email: initialValues.email || "",
            phone: initialValues.phone || "",
            date_of_birth: initialValues.date_of_birth ? dayjs(initialValues.date_of_birth) : null,
            salary: initialValues.salary, // undefined или null или number
            is_fixed_salary: initialValues.is_fixed_salary, // undefined или null или boolean
          }
        : {
            first_name: defaultCreateValues.first_name,
            last_name: defaultCreateValues.last_name,
            date_of_birth: null, // Для DatePicker начальное значение null
            email: defaultCreateValues.email,
            phone: defaultCreateValues.phone,
            salary: defaultCreateValues.salary, // null
            is_fixed_salary: defaultCreateValues.is_fixed_salary, // false
          };

    const handleFormSubmit = async (values: TrainerFormValues) => {
        // Готовим данные для отправки, где date_of_birth - строка
        const payload: Partial<ITrainerCreatePayload | ITrainerUpdatePayload> = {
            ...values,
            date_of_birth: values.date_of_birth ? dayjs(values.date_of_birth).format('YYYY-MM-DD') : undefined,
            salary: values.salary === undefined ? null : values.salary, // Гарантируем null если undefined
            is_fixed_salary: values.is_fixed_salary === undefined ? false : (values.is_fixed_salary === null ? false : values.is_fixed_salary), // Гарантируем false если undefined или null
        };
        
        // Удаляем ключи со значением undefined, чтобы они не отправлялись (важно для PATCH)
        Object.keys(payload).forEach(key => {
            if (payload[key as keyof typeof payload] === undefined) {
                delete payload[key as keyof typeof payload];
            }
        });

        if (isEdit && initialValues?.id) {
            await onSubmit(payload as ITrainerUpdatePayload, initialValues.id);
        } else {
            // Для создания, все обязательные поля должны быть, date_of_birth не может быть undefined
            if (!payload.date_of_birth) {
                payload.date_of_birth = dayjs().format('YYYY-MM-DD'); // или обработать ошибку, если дата обязательна
            }
            await onSubmit(payload as ITrainerCreatePayload);
        }
    };

    return (
        <Formik
            initialValues={formikInitialValues}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
            enableReinitialize 
        >
            {({ errors, touched }) => (
                <Form>
                    <Box sx={{ p: 3, pt: 1, display: 'flex', flexDirection: 'column', gap: 3, borderRadius: 3, }}>
                        {/* Персональные данные */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>Персональные данные</Typography>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                            <Field
                                name="first_name"
                                label="Имя"
                                component={TextField}
                                fullWidth
                                required
                                error={touched.first_name && !!errors.first_name}
                                helperText={touched.first_name && errors.first_name}
                                variant="outlined"
                            />
                            <Field
                                name="last_name"
                                label="Фамилия"
                                component={TextField}
                                fullWidth
                                required
                                error={touched.last_name && !!errors.last_name}
                                helperText={touched.last_name && errors.last_name}
                                variant="outlined"
                            />
                        </Box>
                        <Field
                            name="date_of_birth"
                            label="Дата рождения"
                            component={DatePicker}
                            inputFormat="DD.MM.YYYY"
                            textField={{ helperText: "Укажите дату рождения" }}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            required
                            error={touched.date_of_birth && !!errors.date_of_birth}
                            helperText={touched.date_of_birth && errors.date_of_birth}
                        />
                        {/* Контактная информация */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', mt: 2 }}>Контактная информация</Typography>
                        <Field
                            name="email"
                            label="E-mail"
                            type="email"
                            component={TextField}
                            fullWidth
                            required
                            error={touched.email && !!errors.email}
                            helperText={touched.email && errors.email}
                            variant="outlined"
                        />
                        <Field
                            name="phone"
                            label="Телефон"
                            component={TextField}
                            fullWidth
                            required
                            helperText="Формат: +79********* или 89********* (10-15 цифр)"
                            error={touched.phone && !!errors.phone}
                            variant="outlined"
                        />
                        {/* Информация о зарплате */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', mt: 2 }}>Информация о зарплате</Typography>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' } }}>
                            <Field
                                name="salary"
                                label="Размер зарплаты"
                                type="number"
                                component={TextField}
                                fullWidth
                                error={touched.salary && !!errors.salary}
                                helperText={touched.salary && errors.salary}
                                variant="outlined"
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                            <Field
                                name="is_fixed_salary"
                                type="checkbox"
                                component={CheckboxWithLabel}
                                Label={{ label: "Фиксированная зарплата" }}
                                sx={{ mt: { xs: 1, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}
                            />
                        </Box>
                        {/* Кнопки */}
                        <Box
                            sx={stickyActions ? {
                                position: 'sticky',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                zIndex: 10,
                                pt: 2,
                                pb: 2,
                                mt: 4,
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 2,
                                borderTop: '1px solid',
                                borderColor: 'divider',
                            } : {
                                display: 'flex',
                                justifyContent: 'flex-end',
                                mt: 4,
                                gap: 2,
                            }}
                        >
                            <Button onClick={onClose} disabled={isLoading} variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 500 }}>
                                Отмена
                            </Button>
                            <Button type="submit" variant="contained" disabled={isLoading} sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 2, px: 4, py: 1.5 }}>
                                {isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Сохранить'}
                            </Button>
                        </Box>
                    </Box>
                </Form>
            )}
        </Formik>
    );
} 