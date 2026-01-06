import { Formik, Form } from "formik";
import { Box, Typography, Divider, MenuItem } from "@mui/material";
import { useSnackbar } from "../../../hooks/useSnackBar.tsx";
import { useSubscriptions } from "../../subscriptions/hooks/useSubscriptions.ts";
import { useGetStudentsQuery } from "../../../store/apis/studentsApi.ts";
import { IStudent } from "../models/student.ts";
import { useEffect } from "react";
import { IStudentSubscriptionCreatePayload } from "../../subscriptions/models/subscription.ts";
import { FormikSelectField } from "../../../components/forms/fields/FormikSelectField";
import { FormActions } from "../../../components/forms/layout/FormActions";
import { subscriptionSchemas } from "../../../utils/validationSchemas";

const defaultValues = {
    subscription_id: 0,
};

interface ClientsFormProps {
    student: IStudent;
    onClose: () => void;
}

export function StudentSubscriptionForm({student, onClose }: ClientsFormProps) {
    useEffect(()=> {
        console.log(student)
    },[])

    const {addSubscriptionToStudent} = useSubscriptions();
    const {refetch} = useGetStudentsQuery();
    const {displaySnackbar} = useSnackbar();
    const { subscriptions } = useSubscriptions();

    const validationSchema = subscriptionSchemas.addToStudent;
    const handleSubmit = async (values: typeof defaultValues, {resetForm}: {resetForm: () => void}) => {
        try {
            console.log(student.id)
            console.log(values.subscription_id)
            if (student.id === null) throw new Error()
            const data: IStudentSubscriptionCreatePayload = {
                student_id: student.id,
                subscription_id: values.subscription_id,
                is_auto_renew: true
            }
            await addSubscriptionToStudent(data).unwrap();
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

    return (
        <>
            <Formik initialValues={defaultValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                {({isSubmitting}) => (
                    <Form>
                        <Box
                            display="flex"
                            flexDirection="column"
                            gap={2}
                            padding={3}
                        >
                            {/* Заголовок */}
                            <Typography variant="h4" textAlign="center">
                                Выбор абонемента для клиента {student.first_name} {student.last_name}
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            <FormikSelectField name="subscription_id" label="Абонемент" required>
                                {subscriptions.map(subscription => (
                                    <MenuItem key={subscription.id} value={subscription.id}>
                                        {subscription.name}
                                    </MenuItem>
                                ))}
                            </FormikSelectField>

                            <FormActions
                                onCancel={onClose}
                                submitText="Добавить абонемент клиенту"
                                isSubmitting={isSubmitting}
                            />
                        </Box>
                    </Form>
                )}
            </Formik>
        </>
    );
}