import React from 'react';
import {Formik, Form, Field} from 'formik';
import * as Yup from 'yup';
import {TextField} from 'formik-mui';
import {Checkbox, FormControlLabel, Button, Box, Typography} from '@mui/material';
import {ISubscription} from "../models/subscription.ts";
import {useSubscriptions} from "../hooks/useSubscriptions.ts";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";

interface TrainingTypeFormProps {
    initialValues: ISubscription;
    id: number| null;
    isCreating: boolean;
    onClose: () => void;
}



const SubscriptionSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    active: Yup.boolean(),
    duration: Yup.number().required('Duration is required').min(1, 'Duration must be greater than or equal to 1'),
    total_sessions: Yup.number().required('Total sessions is required').min(0, 'Total sessions must be greater than or equal to 0'),
    price: Yup.number()
        .required('Price is required')
        .min(0, 'Price must be greater than or equal to 0'),
});



const SubscriptionForm: React.FC<TrainingTypeFormProps> = ({isCreating, id, initialValues, onClose}) => {

    const {createSubscription,updateSubscription, refetchSubscriptions} = useSubscriptions();
    const {displaySnackbar} = useSnackbar();

    const handleSubmit = async  ( values: ISubscription, {resetForm}: {resetForm: () => void}) => {
        try {
            if (isCreating) {
                await createSubscription({subscriptionData: values,}).unwrap();
            }
            else {
                if(id) {
                    await updateSubscription({subscriptionId: id, subscriptionData: values,}).unwrap();
                }
            }
            displaySnackbar(isCreating ? "Подписка успешно добавлена" : "Подписка успешно изменена", "success");
            refetchSubscriptions();
            resetForm();
            onClose();
        }
        catch (e: unknown) {
            console.log(e)
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={SubscriptionSchema}
            onSubmit={handleSubmit}
        >
            {({isSubmitting}) => (
                <Form>
                    <Box display="flex" flexDirection="column" gap={3} padding={3} borderRadius={2}
                         bgcolor="background.paper">
                        <Typography variant="h6" component="h2" gutterBottom>
                            {isCreating ? "Добавление":"Изменение"}  вида тренировки
                        </Typography>
                        <Field
                            name="title"
                            label="Название"
                            component={TextField}
                            variant="outlined"
                            fullWidth
                        />
                        <Field
                            name="price"
                            label="Стоимость абонемента"
                            component={TextField}
                            type="number"
                            variant="outlined"
                            fullWidth
                        />
                        <Field
                            name="duration"
                            label="Время действия абонемента (количество дней)"
                            component={TextField}
                            type="number"
                            variant="outlined"
                            fullWidth
                        />
                        <Field
                            name="total_sessions"
                            label="Количетсво тренировок в абонементе"
                            component={TextField}
                            type="number"
                            variant="outlined"
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Field
                                    name="active"
                                    type="checkbox"
                                    as={Checkbox}
                                    color="primary"
                                />
                            }
                            label="Активна"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={isSubmitting}
                        >
                            {isCreating ? "Добавить" : "Изменить"} вид тренировки
                        </Button>
                    </Box>
                </Form>
            )}
        </Formik>
    );
};

export default SubscriptionForm;