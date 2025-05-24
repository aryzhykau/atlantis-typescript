import * as yup from "yup";
import {useClients} from "../hooks/clientManagementHooks.ts";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import {Field, Form, Formik} from "formik";
import {Box, Button,  Divider, Typography} from "@mui/material";


import {Select,} from "formik-mui";
import {IClientGet, IClientSubscriptionFormValues} from "../models/client.ts";
import {IClientFormField} from "../models/fields.ts";
import {useSubscriptions} from "../../subscriptions/hooks/useSubscriptions.ts";
import MenuItem from "@mui/material/MenuItem";




const defaultValues : IClientSubscriptionFormValues = {
    subscription_id: 0,

};


interface ClientsFormProps {
    client: IClientGet;
    onClose: () => void;
}

export function ClientSubscriptionForm({client, onClose }: ClientsFormProps) {



    const { addClientSubscription, refetchClients} = useClients()
    const {displaySnackbar} = useSnackbar();
    const { subscriptions } = useSubscriptions();



    const clientFields : IClientFormField[] = [
        { name: "subscription_id", label: "Абонемент", validation: yup.number().required("Выберите абонемент") },
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
            console.log(client.id)
            if (client.id === null) throw new Error()
            await addClientSubscription({clientId: client.id, data: values}).unwrap();
            displaySnackbar(`Абонемент добавлен клиенту ${client.first_name} ${client.last_name}`, "success");
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
                            <Typography variant="h4" textAlign="center">Выбор абонемента для клиента {client.first_name} {client.last_name}</Typography>
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
                                    return <MenuItem key={subscription.id} value={subscription.id}>{subscription.title}</MenuItem>
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