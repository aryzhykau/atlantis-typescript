import * as yup from "yup";
import { Form, Formik, Field } from "formik";
import { Box, Button, Typography, IconButton, CircularProgress } from "@mui/material";
import { TextField, CheckboxWithLabel } from "formik-mui";
import { DatePicker } from "formik-mui-x-date-pickers";
import { ITrainerCreatePayload, ITrainerUpdatePayload, ITrainerResponse } from "../models/trainer.ts";
import dayjs from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';

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
}

export function TrainerForm({
    title = "Добавить тренера",
    initialValues,
    onSubmit,
    onClose,
    isEdit = false,
    isLoading = false,
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
            {() => (
                <Form>
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap={2}
                        padding={3}
                        position="relative"
                    >
                        <IconButton
                            onClick={onClose}
                            sx={{ position: "absolute", top: 8, right: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                        
                        <Typography variant="h5" textAlign="center" gutterBottom>{title}</Typography>
                        
                        <Typography variant="subtitle1" sx={{ mt: 1 }}>Персональные данные</Typography>
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                            <Field
                                name="first_name"
                                label="Имя"
                                component={TextField}
                                variant="outlined"
                                fullWidth
                            />
                            <Field
                                name="last_name"
                                label="Фамилия"
                                component={TextField}
                                variant="outlined"
                                fullWidth
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
                        />

                        <Typography variant="subtitle1" sx={{ mt: 2 }}>Контактная информация</Typography>
                        <Field
                            name="email"
                            label="E-mail"
                            type="email"
                            component={TextField}
                            variant="outlined"
                            fullWidth
                        />
                        <Field
                            name="phone"
                            label="Телефон"
                            component={TextField}
                            variant="outlined"
                            fullWidth
                            helperText="Формат: +79********* или 89********* (10-15 цифр)"
                        />

                        <Typography variant="subtitle1" sx={{ mt: 2 }}>Информация о зарплате</Typography>
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{sm: "center"}} gap={2}>
                             <Field
                                name="salary"
                                label="Размер зарплаты"
                                type="number"
                                component={TextField}
                                variant="outlined"
                                fullWidth
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                            <Field
                                name="is_fixed_salary"
                                type="checkbox"
                                component={CheckboxWithLabel}
                                Label={{ label: "Фиксированная зарплата" }}
                                sx={{ mt: {xs: 1, sm: 0}, width: {xs: '100%', sm: 'auto'} }}
                            />
                           
                        </Box>

                        <Button
                            sx={{ mt: 3, height: 50 }}
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isLoading}
                            fullWidth
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? "Сохранить изменения" : "Создать тренера")}
                        </Button>
                    </Box>
                </Form>
            )}
        </Formik>
    );
} 