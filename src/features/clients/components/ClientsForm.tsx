import * as yup from "yup";
import {useClients} from "../hooks/clientManagementHooks.ts";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import {Field, FieldArray, Form, Formik, FormikProps} from "formik";
import {
    Box, 
    Button, 
    Checkbox, 
    Divider, 
    FormControlLabel, 
    IconButton, 
    Typography,
    Paper,
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
import {TextField} from "formik-mui";
import { IClientUserFormValues, ClientUpdate, IClientCreatePayload } from "../models/client.ts";
import * as Yup from "yup";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CakeIcon from "@mui/icons-material/Cake";
import SchoolIcon from "@mui/icons-material/School";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";

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
interface StyledFieldProps {
    name: string;
    label: string;
    icon: React.ReactNode;
    color?: 'primary' | 'success' | 'warning' | 'info';
    helperText?: string;
    fullWidth?: boolean;
    component?: any;
    variant?: string;
    views?: string[];
    textField?: any;
    inputFormat?: string;
    InputLabelProps?: any;
    sx?: any;
}

const StyledField: React.FC<StyledFieldProps> = ({ 
    name, 
    label, 
    icon, 
    color = 'primary', 
    helperText,
    fullWidth = true,
    component = TextField,
    variant = "outlined",
    ...props 
}) => {
    const theme = useTheme();
    const gradients = useGradients();
    
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.background.paper,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: theme.shadows[4],
                    borderColor: alpha(theme.palette[color].main, 0.3),
                    background: alpha(theme.palette[color].main, 0.02),
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                    sx={{
                        p: 1,
                        borderRadius: 2,
                        background: gradients[color],
                        color: 'white',
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40,
                        height: 40,
                    }}
                >
                    {icon}
                </Box>
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                    }}
                >
                    {label}
                </Typography>
            </Box>
            <Box sx={{ pl: 6 }}>
                <Field
                    name={name}
                    component={component}
                    variant={variant}
                    fullWidth={fullWidth}
                    helperText={helperText}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette[color].main,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette[color].main,
                                borderWidth: 2,
                            },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: theme.palette[color].main,
                        },
                    }}
                    {...props}
                />
            </Box>
        </Paper>
    );
};

export function ClientsForm({title, initialValues = defaultValues, isEdit = false, clientId = null, onClose }: ClientsFormProps) {
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
            {({isSubmitting, values}: FormikProps<IClientUserFormValues>) => (
                <Form>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Основная информация */}
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                Основная информация
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <StyledField
                                        name="first_name"
                                        label="Имя"
                                        icon={<PersonIcon />}
                                        color="primary"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledField
                                        name="last_name"
                                        label="Фамилия"
                                        icon={<PersonIcon />}
                                        color="primary"
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Контактная информация */}
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                Контактная информация
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <StyledField
                                        name="email"
                                        label="Email"
                                        icon={<EmailIcon />}
                                        color="success"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledField
                                        name="phone"
                                        label="Телефон"
                                        icon={<PhoneIcon />}
                                        color="info"
                                        helperText="Формат: 0987654321"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <StyledField
                                        name="whatsapp_number"
                                        label="WhatsApp"
                                        icon={<WhatsAppIcon />}
                                        color="warning"
                                        helperText="Номер WhatsApp, если отличается от основного телефона"
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Дата рождения */}
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                Личная информация
                            </Typography>
                            <StyledField
                                name="date_of_birth"
                                label="Дата рождения"
                                icon={<CakeIcon />}
                                color="warning"
                                component={DatePicker}
                                views={["year", "month", "date"]}
                                textField={{helperText: "Укажите дату рождения"}}
                                inputFormat="dd.MM.yyyy"
                                InputLabelProps={{shrink: true}}
                            />
                        </Box>

                        {/* Поля is_student и students отображаются только при создании */}
                        {!isEdit && (
                            <>
                                {/* Статус студента */}
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                        Статус
                                    </Typography>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            background: theme.palette.background.paper,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box
                                                sx={{
                                                    p: 1,
                                                    borderRadius: 2,
                                                    background: gradients.info,
                                                    color: 'white',
                                                    mr: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    minWidth: 40,
                                                    height: 40,
                                                }}
                                            >
                                                <SchoolIcon />
                                            </Box>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: 'text.secondary',
                                                    fontWeight: 500,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5
                                                }}
                                            >
                                                Статус клиента
                                            </Typography>
                                        </Box>
                                        <Box sx={{ pl: 6 }}>
                                            <FormControlLabel
                                                control={
                                                    <Field
                                                        name="is_student"
                                                        type="checkbox"
                                                        as={Checkbox}
                                                        sx={{
                                                            color: theme.palette.info.main,
                                                            '&.Mui-checked': {
                                                                color: theme.palette.info.main,
                                                            },
                                                        }}
                                                    />
                                                }
                                                label="Сам посещает тренировки"
                                                sx={{ 
                                                    '& .MuiFormControlLabel-label': {
                                                        fontWeight: 500,
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Paper>
                                </Box>

                                {/* Дети клиента */}
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                        Дети клиента
                                    </Typography>
                                    <FieldArray
                                        name="students"
                                        render={(arrayHelpers) => (
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    background: theme.palette.background.paper,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                                    <Box
                                                        sx={{
                                                            p: 1,
                                                            borderRadius: 2,
                                                            background: gradients.success,
                                                            color: 'white',
                                                            mr: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minWidth: 40,
                                                            height: 40,
                                                        }}
                                                    >
                                                        <FamilyRestroomIcon />
                                                    </Box>
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{ 
                                                            color: 'text.secondary',
                                                            fontWeight: 500,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: 0.5
                                                        }}
                                                    >
                                                        Дети клиента
                                                    </Typography>
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => arrayHelpers.push<IStudentFormShape>({
                                                            first_name: "",
                                                            last_name: values.last_name, 
                                                            date_of_birth: null, 
                                                        })}
                                                        sx={{
                                                            ml: 'auto',
                                                            background: gradients.success,
                                                            color: 'white',
                                                            '&:hover': {
                                                                background: alpha(theme.palette.success.main, 0.8),
                                                            }
                                                        }}
                                                    >
                                                        <AddIcon fontSize="small"/>
                                                    </IconButton>
                                                </Box>
                                                
                                                <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                    {arrayHelpers.form.values.students && arrayHelpers.form.values.students.length > 0 ? (
                                                        arrayHelpers.form.values.students?.map((_student: IStudentFormShape, index: number) => (
                                                            <Paper
                                                                key={index}
                                                                elevation={0}
                                                                sx={{
                                                                    p: 2,
                                                                    mb: 2,
                                                                    borderRadius: 3,
                                                                    border: '1px solid',
                                                                    borderColor: 'divider',
                                                                    background: alpha(theme.palette.success.main, 0.05),
                                                                    transition: 'all 0.3s ease',
                                                                    '&:hover': {
                                                                        boxShadow: theme.shadows[4],
                                                                        borderColor: alpha(theme.palette.success.main, 0.3),
                                                                    }
                                                                }}
                                                            >
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                        Ребенок #{index + 1}
                                                                    </Typography>
                                                                    <Button 
                                                                        variant="outlined" 
                                                                        color="error" 
                                                                        size="small"
                                                                        onClick={() => arrayHelpers.remove(index)}
                                                                        sx={{ textTransform: 'none' }}
                                                                    >
                                                                        Удалить
                                                                    </Button>
                                                                </Box>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={12} sm={6}>
                                                                        <Field
                                                                            name={`students[${index}].first_name`}
                                                                            label="Имя"
                                                                            component={TextField}
                                                                            variant="outlined"
                                                                            fullWidth
                                                                            sx={{
                                                                                '& .MuiOutlinedInput-root': {
                                                                                    borderRadius: 2,
                                                                                },
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6}>
                                                                        <Field
                                                                            name={`students[${index}].last_name`}
                                                                            label="Фамилия"
                                                                            component={TextField}
                                                                            variant="outlined"
                                                                            fullWidth
                                                                            sx={{
                                                                                '& .MuiOutlinedInput-root': {
                                                                                    borderRadius: 2,
                                                                                },
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12}>
                                                                        <Field
                                                                            name={`students[${index}].date_of_birth`}
                                                                            label="Дата рождения"
                                                                            component={DatePicker}
                                                                            variant="outlined"
                                                                            fullWidth
                                                                            views={["year", "month", "date"]}
                                                                            textField={{helperText: "Укажите дату рождения"}}
                                                                            inputFormat="dd.MM.yyyy"
                                                                            InputLabelProps={{shrink: true}}
                                                                            sx={{
                                                                                '& .MuiOutlinedInput-root': {
                                                                                    borderRadius: 2,
                                                                                },
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                </Grid>
                                                            </Paper>
                                                        ))
                                                    ) : (
                                                        <Box sx={{ 
                                                            textAlign: 'center', 
                                                            py: 4,
                                                            color: 'text.secondary',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            <FamilyRestroomIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                                                            <Typography variant="body2">
                                                                Нет добавленных детей
                                                            </Typography>
                                                            <Typography variant="caption">
                                                                Нажмите кнопку "+" чтобы добавить ребенка
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Paper>
                                        )}
                                    />
                                </Box>
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
