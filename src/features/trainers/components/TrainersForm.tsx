import * as yup from "yup";
import {useTrainers} from "../hooks/trainerManagementHooks.ts";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import { Field, Form, Formik} from "formik";
import {Box, Button, Divider, Typography} from "@mui/material";


import {TextField, CheckboxWithLabel} from "formik-mui";
import {AnySchema} from "yup";
import {ITrainer} from "../models/trainer.ts";


const defaultValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    salary: null,
    fixed_salary: false
};

interface TrainersFormProps {
    title?: string;
    initialValues?: ITrainer;
    onClose: () => void;
    isEdit?: boolean;
    trainerId?: number | null;
}
interface TrainerField {
    name: string; // Field name (key in form values)
    label: string; // User-facing label
    validation?: yup.AnySchema; // Optional Yup validation schema
    type?: string; // Field type (e.g., "text", "email", etc.)
    isCheckbox?: boolean; // Whether the field is a checkbox
    group?: string; // Group name for fields (e.g., "contactsGroup")
}


export function TrainersForm({title, onClose, initialValues = defaultValues,  isEdit = false, trainerId = null, }: TrainersFormProps) {




    const {createTrainer, updateTrainer, refetchTrainers} = useTrainers()
    const {displaySnackbar} = useSnackbar();


    const trainerFields = [
        { name: "first_name", label: "Имя", validation: yup.string().required("Имя обязательно"), group: "nameGroup" },
        { name: "last_name", label: "Фамилия", validation: yup.string().required("Фамилия обязательна"), group: "nameGroup" }, // Группируем с first_name
        { name: "email", label: "E-mail", type: "email", validation: yup.string().email("Введите корректный email").required("Email обязателен"), group: "contactsGroup" },
        { name: "phone", label: "Телефон", validation: yup.string().matches(/^[0-9]{10}$/, "Введите корректный номер").required("Телефон обязателен"), group: "contactsGroup" },
        { name: "fixed_salary", label: "Фиксированная заплата", isCheckbox: true }, // Группируем с phone
        { name: "salary", label: "Размер зарплаты" },

    ];


    const validationSchema = yup.object(
        trainerFields.reduce<Record<string, AnySchema>>((acc, field) => {
            if (field.validation) {
                acc[field.name] = field.validation;
            }
            return acc;
        }, {})
    );


    const handleSubmit = async (values: ITrainer ,{resetForm} : {resetForm: () => void}) => {
        try {
            console.log(values);
            const fullData: ITrainer = {...values, role: "TRAINER" }
            if (isEdit) {
                if (trainerId === null) throw new Error()
                await updateTrainer({trainerId: trainerId, trainerData: fullData}).unwrap();
                displaySnackbar("Тренер обновлен", "success");
            } else {
                const createData = {...fullData, active: true}
                console.log(fullData);
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
                            {/* Поля из trainerFields */}
                            {Object.entries(
                                trainerFields.reduce<Record<string, TrainerField[]>>((groups, field) => {
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
                            ).map(([key, groupFields]: [string, TrainerField[]]) => (
                                groupFields.length > 1 ? (
                                    // Если группа содержит более 1 поля, показываем их на одной строке
                                    <Box key={key} display="flex" gap={2}>
                                        {groupFields.map((field: TrainerField) => (

                                                <Field
                                                    key={field.name}
                                                    type = {field.isCheckbox ? "checkbox": null}
                                                    component={field.isCheckbox ? CheckboxWithLabel : TextField}
                                                    name={field.name}
                                                    label={field.isCheckbox ? {label: field.label} : field.label}
                                                    fullWidth
                                                    sx = {{width: "100%"}}
                                                />
                                            ))}

                                    </Box>
                                ) : (
                                    // Если это поле вне группы, рендерим его как одиночное
                                    <Field
                                        key={groupFields[0].name}
                                        type = {groupFields[0].isCheckbox ? "checkbox": null}
                                        component={groupFields[0].isCheckbox ? CheckboxWithLabel : TextField}
                                        name={groupFields[0].name}
                                        Label={groupFields[0].isCheckbox ? {label: groupFields[0].label} : null}
                                        label={!groupFields[0].isCheckbox ? groupFields[0].label : null}
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