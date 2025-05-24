import * as yup from "yup";

import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import {Field, Form, Formik} from "formik";
import {Box, Button,  Divider, Typography} from "@mui/material";


import {Select,} from "formik-mui";


import {useSubscriptions} from "../../subscriptions/hooks/useSubscriptions.ts";
import MenuItem from "@mui/material/MenuItem";
import {useAddStudentSubscriptionMutation, useGetStudentsQuery} from "../../../store/apis/studentsApi.ts";
import {IStudentGet, IStudentSubscriptionFormValues} from "../models/student.ts";
import {useEffect} from "react";
import { ISubscriptionToStudent } from "../../subscriptions/models/subscription.ts";




const defaultValues : IStudentSubscriptionFormValues = {
    subscription_id: 0,

};


interface ClientsFormProps {
    student: IStudentGet;
    onClose: () => void;
}

export function StudentSubscriptionForm({student, onClose }: ClientsFormProps) {
    useEffect(()=> {
        console.log(student)
    },[])



    const {addSubscriptionToStudent, isAddSubscriptionToStudentLoading, isAddSubscriptionToStudentError, isAddSubscriptionToStudentSuccess, addSubscriptionToStudentData, addSubscriptionToStudentError} = useSubscriptions();
    const {refetch} = useGetStudentsQuery();
    const {displaySnackbar} = useSnackbar();
    const { subscriptions } = useSubscriptions();


    const validationSchema = yup.object({
        subscription_id: yup.number().required("Выберите абонемент")
    });


    const handleSubmit = async (values: typeof defaultValues, {resetForm}: {resetForm: () => void}) => {
        try {
            console.log(student.id)
            console.log(values.subscription_id)
            if (student.id === null) throw new Error()
            const data: ISubscriptionToStudent = {
                student_id: student.id,
                subscription_id: values.subscription_id,
                is_auto_renew: true
            }
            await addSubscriptionToStudent({data}).unwrap();
            displaySnackbar(`Абонемент добавлен ученику ${student.first_name} ${student.last_name}`, "success");
            refetch();
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

    const sxFormControl = {
        margin: 2,
        width: '100%',
    };

    return (
        <>
            <Formik
                initialValues={defaultValues}
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
                            <Typography variant="h4" textAlign="center">Выбор абонемента для клиента {student.first_name} {student.last_name}</Typography>
                            <Divider sx = {{my: "16px"}}/>
                            <Field
                                component={Select}
                                formControl={{ sx: sxFormControl }}
                                formHelperText={"Выберите абонемент"}
                                id="subscription_id"
                                name="subscription_id"
                                labelId="subscription_id"
                                label="Абонемент"
                            >
                                {subscriptions.map(subscription => {
                                    return <MenuItem key={subscription.id} value={subscription.id}>{subscription.name}</MenuItem>
                                })}
                            </Field>

                            {/* Кнопка */}
                            <Button
                                sx={{ mt: 2, height: 50 ,width: "50%", mx: "auto" }}
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting}
                            >
                                Добавить абонемент клиенту
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </>
    );
}