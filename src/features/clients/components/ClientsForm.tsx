import * as yup from "yup";
import {useClients} from "../hooks/clientManagementHooks.ts";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import {Field, FieldArray, Form, Formik, FormikProps} from "formik";
import {Box, Button, Checkbox, Divider, FormControlLabel, IconButton, Typography} from "@mui/material";
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import {DatePicker} from "formik-mui-x-date-pickers";
import {TextField} from "formik-mui";
import { IClientUserFormValues, ClientUpdate, IClientCreatePayload } from "../models/client.ts";
import * as Yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

dayjs.extend(utc);
dayjs.extend(timezone);

// Новый интерфейс для формы студента
export interface IStudentFormShape {
    id?: number; // id может понадобиться, если мы решим редактировать студентов внутри этой формы
    first_name: string;
    last_name: string;
    date_of_birth: Date | null | dayjs.Dayjs; // Используем Date | null для DatePicker
}

const defaultValues : IClientUserFormValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: null,
    whatsapp_number: "",
    is_student: false,
    students: [] // Теперь это IStudentFormShape[]
};


interface ClientsFormProps {
    title?: string;
    initialValues?: IClientUserFormValues;
    onClose: () => void;
    isEdit?: boolean;
    clientId?: number | null;
}

export function ClientsForm({title, initialValues = defaultValues,  isEdit = false, clientId = null, onClose }: ClientsFormProps) {
    const {createClient, updateClient, refetchClients} = useClients()
    const {displaySnackbar} = useSnackbar();

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
        <>
            <Formik
                initialValues={isEdit ? initialValues : defaultValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({isSubmitting, values}: FormikProps<IClientUserFormValues>) => (
                    <Form>
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
                        <Box
                            display="flex"
                            flexDirection="column"
                            gap={2}
                            padding={3}
                            bgcolor="paper"
                            borderRadius={2}
                        >
                            {/* Заголовок */}
                            <Typography variant="h4" textAlign="center">{title || "Форма клиента"}</Typography>
                            <Divider/>
                            <Box display="flex" gap={2} sx = {{my: "8px"}}>
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
                            <Box display="flex" gap={2} sx = {{my: "8px"}}>
                                <Field
                                    name="email"
                                    label="Email"
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
                            <Box display="flex" gap={2} >
                                <Field
                                    name="whatsapp_number"
                                    label="WhatsApp (номер)"
                                    component={TextField}
                                    variant="outlined"
                                    fullWidth
                                    helperText="Номер WhatsApp, если отличается от основного телефона"
                                />
                            </Box>

                            {/* Поля is_student и students отображаются только при isEdit === false (создание) */}
                            {!isEdit && (
                                <>
                                    <Box display="flex"  alignItems={"flex-start"} gap={5} >
                                        <Field
                                            name="date_of_birth"
                                            label="Дата рождения"
                                            component={DatePicker}
                                            variant="outlined"
                                            fullWidth
                                            views = {["year", "month", "date"]}
                                            textField = {{helperText: "Укажите дату рождения"}}
                                            inputFormat="dd.MM.yyyy"
                                            InputLabelProps={{shrink: true}}
                                            sx={{width: "50%"}}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Field
                                                    name="is_student"
                                                    type="checkbox"
                                                    as={Checkbox}
                                                    color="primary"
                                                />
                                            }
                                            label="Cам посещает тренировки?"
                                            sx={{width: "50%"}}
                                        />
                                    </Box>
                                    <Box>
                                        <Box>
                                            <FieldArray
                                                name={"students"}
                                                render={(arrayHelpers) => (
                                                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column'}}>
                                                        <Box display="flex" gap={1} alignItems={"center"} sx = {{mb: 1, flexShrink: 0}}>
                                                            <Typography variant="subtitle2">Дети клиента:</Typography>
                                                            <IconButton 
                                                                size="small"
                                                                onClick={() => arrayHelpers.push<IStudentFormShape>({
                                                                    first_name: "",
                                                                    last_name: values.last_name, 
                                                                    date_of_birth: null, 
                                                                })}
                                                                title="Добавить ребенка"
                                                            >
                                                                <AddIcon  sx = {{color: "primary.main"}} fontSize="small"/>
                                                            </IconButton>
                                                        </Box>
                                                        <Box 
                                                            p={1} 
                                                            sx={{
                                                                border: '1px dashed',
                                                                borderColor: 'divider',
                                                                borderRadius: 1, 
                                                                maxHeight: '203px',
                                                                overflowY: 'auto',
                                                                minHeight: '50px',
                                                                flexGrow: 1,
                                                            }}
                                                        >
                                                            {arrayHelpers.form.values.students && arrayHelpers.form.values.students.length > 0 ? (
                                                                arrayHelpers.form.values.students?.map((_student: IStudentFormShape, index: number) => (
                                                                    <Box key={index} mb={1} p={1} sx={{border: '1px solid', borderColor: 'action.hover', borderRadius: 1}}>
                                                                        <Box display="flex" gap={1.5} alignItems={"center"} sx = {{mb: 0.5}}>
                                                                            <Field
                                                                                name={`students[${index}].first_name`}
                                                                                label="Имя"
                                                                                component={TextField}
                                                                                variant="outlined"
                                                                                fullWidth
                                                                            />
                                                                            <Field
                                                                                name={`students[${index}].last_name`}
                                                                                label="Фамилия"
                                                                                component={TextField}
                                                                                variant="outlined"
                                                                                fullWidth
                                                                            />
                                                                        </Box>
                                                                        <Box display="flex" gap={2} alignItems={"center"} justifyContent={"space-between"} sx = {{my: "8px"}}>
                                                                            <Field
                                                                                name={`students[${index}].date_of_birth`}
                                                                                label="Дата рождения"
                                                                                component={DatePicker}
                                                                                variant="outlined"
                                                                                fullWidth
                                                                                views = {["year", "month", "date"]}
                                                                                textField = {{helperText: "Укажите дату рождения"}}
                                                                                inputFormat="dd.MM.yyyy"
                                                                                InputLabelProps={{shrink: true}}
                                                                                sx={{width: "50%"}}
                                                                            />
            
                                                                            <Button variant={"outlined"} color={"error"} onClick={() => {arrayHelpers.remove(index)}}>
                                                                                Убрать ученика
                                                                            </Button>
                                                                        </Box>
                                                                        <Divider sx = {{my: 1}}/>
                                                                    </Box>
                                                                ))
                                                            ) : (
                                                                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{py: 1, fontStyle: 'italic'}}>
                                                                    Нет добавленных детей
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                )}
                                            />
                                        </Box>
                                    </Box>
                                </>
                            )}

                            {/* Поле date_of_birth должно быть видимо всегда, если isEdit === true, но is_student и students скрыты */}
                            {isEdit && (
                                <Box display="flex"  alignItems={"flex-start"} gap={5} sx = {{my: "8px"}}>
                                    <Field
                                        name="date_of_birth"
                                        label="Дата рождения"
                                        component={DatePicker}
                                        variant="outlined"
                                        fullWidth
                                        views = {["year", "month", "date"]}
                                        textField = {{helperText: "Укажите дату рождения"}}
                                        inputFormat="dd.MM.yyyy"
                                        InputLabelProps={{shrink: true}}
                                    />
                                </Box>
                            )}

                            {/* Кнопка */}
                            <Button
                                sx={{ mt: 2, height: 50 ,width: "50%", mx: "auto" }}
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
        </>
    );
}
