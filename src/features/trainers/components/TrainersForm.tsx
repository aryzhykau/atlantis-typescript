import * as yup from "yup";
import {useTrainers} from "../hooks/trainerManagementHooks.ts";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import { Field, Form, Formik } from "formik";
import {Box, Button, Divider, Typography, IconButton} from "@mui/material";
import {TextField, CheckboxWithLabel} from "formik-mui";
import {DatePicker} from "formik-mui-x-date-pickers";
import {ITrainer} from "../models/trainer.ts";
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import CloseIcon from '@mui/icons-material/Close';

// Настраиваем dayjs для работы с временными зонами
dayjs.extend(utc);
dayjs.extend(timezone);

const defaultValues = {
    first_name: "",
    last_name: "",
    date_of_birth: null,
    email: "",
    phone: "",
    salary: null,
    is_fixed_salary: false
};

interface TrainersFormProps {
    title?: string;
    initialValues?: ITrainer;
    onClose: () => void;
    isEdit?: boolean;
    trainerId?: number | null;
}

export function TrainersForm({
    title = "Добавить тренера", 
    initialValues = defaultValues,  
    isEdit = false, 
    trainerId = null, 
    onClose
}: TrainersFormProps) {
    const {createTrainer, updateTrainer, refetchTrainers} = useTrainers();
    const {displaySnackbar} = useSnackbar();

    const validationSchema = yup.object({
        first_name: yup.string().required("Имя обязательно"),
        last_name: yup.string().required("Фамилия обязательна"),
        email: yup.string().email("Введите корректный email").required("Email обязателен"),
        phone: yup.string().matches(/^[0-9]{10}$/, "Введите корректный номер").required("Телефон обязателен"),
        date_of_birth: yup.date().required("Дата рождения обязательна"),
        salary: yup.number().nullable(),
        is_fixed_salary: yup.boolean()
    });

    const handleSubmit = async (values: ITrainer, {resetForm}: {resetForm: () => void}) => {
        try {
            // Обрабатываем дату рождения в правильном формате
            const processedValues = {
                ...values,
                date_of_birth: values.date_of_birth 
                    ? dayjs(values.date_of_birth).tz(dayjs.tz.guess()).format('YYYY-MM-DD') 
                    : null
            };

            if (isEdit) {
                if (trainerId === null) throw new Error();
                await updateTrainer({trainerId: trainerId, trainerData: processedValues}).unwrap();
                displaySnackbar("Тренер обновлен", "success");
            } else {
                const createData = {...processedValues, active: true};
                await createTrainer({trainerData: createData}).unwrap();
                displaySnackbar("Тренер создан", "success");
            }
            refetchTrainers();
            resetForm();
            onClose();
        } catch (error: unknown) {
            const errorMessage =
                typeof error === "object" &&
                error !== null &&
                "data" in error &&
                "detail" in (error as { data: { detail?: string } }).data
                    ? (error as { data: { detail?: string } }).data.detail ?? "Что-то пошло не так"
                    : "Что-то пошло не так";

            displaySnackbar(errorMessage, "error");
        }
    };

    return (
        <Formik
            initialValues={isEdit ? initialValues : defaultValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({isSubmitting}) => (
                <Form>
                    <Box
                        display="flex"
                        flexDirection="column"
                        gap={2}
                        padding={3}
                        bgcolor="paper"
                        borderRadius={2}
                        position="relative"
                    >
                        {/* Кнопка закрытия */}
                        <IconButton 
                            onClick={onClose}
                            sx={{ 
                                position: "absolute", 
                                top: 16, 
                                right: 16
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        
                        {/* Заголовок */}
                        <Typography variant="h4" textAlign="center">{title}</Typography>
                        <Divider sx={{ my: "16px" }}/>
                        
                        {/* Персональные данные */}
                        <Typography variant="subtitle1">Персональные данные</Typography>
                        <Box display="flex" gap={2}>
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
                            variant="outlined"
                            fullWidth
                            views={["year", "month", "day"]}
                            textField={{helperText: "Укажите дату рождения"}}
                            inputFormat="dd.MM.yyyy"
                            InputLabelProps={{shrink: true}}
                        />

                        {/* Контактная информация */}
                        <Typography variant="subtitle1">Контактная информация</Typography>
                        <Box display="flex" gap={2}>
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
                            />
                        </Box>

                        {/* Информация о зарплате */}
                        <Typography variant="subtitle1">Информация о зарплате</Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Field
                                name="is_fixed_salary"
                                type="checkbox"
                                component={CheckboxWithLabel}
                                Label={{label: "Фиксированная зарплата"}}
                            />
                            <Field
                                name="salary"
                                label="Размер зарплаты"
                                type="number"
                                component={TextField}
                                variant="outlined"
                                fullWidth
                            />
                        </Box>

                        {/* Кнопка сохранения */}
                        <Button
                            sx={{ mt: 3, height: 50, width: "50%", mx: "auto" }}
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                        >
                            Сохранить
                        </Button>
                    </Box>
                </Form>
            )}
        </Formik>
    );
}