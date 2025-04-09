import * as yup from "yup";
import {useClients} from "../hooks/clientManagementHooks.ts";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import {Field, Form, Formik} from "formik";
import {Box, Button,  Divider, Typography} from "@mui/material";

import {DatePicker} from "formik-mui-x-date-pickers";
import {TextField} from "formik-mui";
import {IClientFormValues} from "../models/client.ts";
import {IClientFormField} from "../models/fields.ts";



const defaultValues : IClientFormValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    birth_date: null,
    whatsapp: "",
    parent_name: "",
};


interface ClientsFormProps {
    title?: string;
    initialValues?: IClientFormValues;
    onClose: () => void;
    isEdit?: boolean;
    clientId?: number | null;
}

export function ClientsForm({title, onClose, initialValues = defaultValues,  isEdit = false, clientId = null, }: ClientsFormProps) {



    const {createClient, updateClient, refetchClients} = useClients()
    const {displaySnackbar} = useSnackbar();


    const clientFields : IClientFormField[] = [
        { name: "first_name", label: "Имя", validation: yup.string().required("Имя обязательно"), group: "nameGroup" },
        { name: "last_name", label: "Фамилия", validation: yup.string().required("Фамилия обязательна"), group: "nameGroup" }, // Группируем с first_name
        { name: "email", label: "E-mail", type: "email", validation: yup.string().email("Введите корректный email").required("Email обязателен"), group: "contactsGroup" },
        { name: "phone", label: "Телефон", validation: yup.string().matches(/^[0-9]{10}$/, "Введите корректный номер").required("Телефон обязателен"), group: "contactsGroup" },
        { name: "birth_date", label: "Дата рождения", isDatePicker: true, validation: yup.date().required("Дата рождения обязательна"), group: "infoGroup" }, // Группируем с phone
        { name: "parent_name", label: "Имя родителя", group: "infoGroup" },
        { name: "whatsapp", label: "Номер WhatsApp" },

    ];


    const validationSchema = yup.object(
        clientFields.reduce<Record<string, yup.AnySchema>>((acc, field) => {
            if (field.validation) {
                acc[field.name] = field.validation;
            }
            return acc;
        }, {})
    );


    const handleSubmit = async (values: typeof defaultValues, {resetForm}: {resetForm: () => void}) => {
        try {
            const fullData = {...values, role: "CLIENT" }
            console.log(fullData);
            if (isEdit) {
                if (clientId === null) throw new Error()
                await updateClient({clientId: clientId, clientData: fullData}).unwrap();
                displaySnackbar("Клиент обновлен", "success");
            } else {
                const createData = {...fullData, active: true}
                console.log(fullData);
                await createClient({clientData: createData}).unwrap();
                displaySnackbar("Клиент создан", "success");
            }
            refetchClients();
            resetForm();
            onClose();
        } catch (error: unknown) {
            const errorMessage =
                typeof error === "object" &&
                error !== null &&
                "data" in error &&
                "detail" in (error as { data: { detail?: string } }).data
                    ? (error as { data: { detail?: string } }).data.detail ?? "Что то пошло не так"
                    : "Что то пошло не так";

            displaySnackbar(errorMessage, "error");
        }



    }


    return (
        <>
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
                        >
                            {/* Заголовок */}
                            <Typography variant="h4" textAlign="center">{title || "Форма клиента"}</Typography>
                            <Divider sx = {{my: "16px"}}/>
                            {/* Поля из clientFields */}
                            {Object.entries(
                                clientFields.reduce<Record<string, IClientFormField[]>>((groups, field) => {
                                    if (field.group) {
                                        // Если группа существует, добавляем поле в соответствующую группу
                                        groups[field.group] = groups[field.group] || [];
                                        groups[field.group].push(field);
                                    } else {
                                        // Поля без группы
                                        groups[field.name] = [field];
                                    }
                                    return groups;
                                }, {})
                            ).map(([key, groupFields]: [string, IClientFormField[]]) => (
                                groupFields.length > 1 ? (
                                    // Если группа содержит более 1 поля, показываем их на одной строке
                                    <Box key={key} display="flex" gap={2}>
                                        {groupFields.map((field: IClientFormField) => (
                                            <Field
                                                key={field.name}
                                                component={field.isDatePicker ? DatePicker : TextField}
                                                name={field.name}
                                                label={field.label}
                                                fullWidth
                                                sx = {{width: "100%"}}
                                            />
                                        ))}
                                    </Box>
                                ) : (
                                    // Если это поле вне группы, рендерим его как одиночное
                                    <Field
                                        key={groupFields[0].name}
                                        component={groupFields[0].isDatePicker ? DatePicker : TextField}
                                        name={groupFields[0].name}
                                        label={groupFields[0].label}
                                        fullWidth
                                    />
                                )
                            ))}


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