import React from 'react';
import {Formik, Form, Field} from 'formik';
import * as Yup from 'yup';
import {TextField} from 'formik-mui';
import {Checkbox, FormControlLabel, Button, Box, Typography} from '@mui/material';
import {ITrainingType} from "../models/trainingType.ts";
import {useTrainingTypes} from "../hooks/useTrainingTypes.ts";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";

interface TrainingTypeFormProps {
    initialValues: ITrainingType;
    id: number| null;
    isCreating: boolean;
    onClose: () => void;
}



const TrainingTypeSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    price: Yup.number()
        .required('Price is required')
        .min(0, 'Price must be greater than or equal to 0'),
    require_subscription: Yup.boolean(),
});



const TrainingTypeForm: React.FC<TrainingTypeFormProps> = ({initialValues, onClose, isCreating, id}) => {

    const {createTrainingType, updateTrainingType, refetchTrainingTypes} = useTrainingTypes();
    const {displaySnackbar} = useSnackbar();

    const handleSubmit = async  (values: ITrainingType, {resetForm}: {resetForm: () => void}) => {
        try {
            if (isCreating) {
                await createTrainingType({trainingTypeData: values,}).unwrap();
            }
            else {
                if(id) {
                    await updateTrainingType({trainingTypeId: id, trainingTypeData: values,}).unwrap();
                }
            }
            displaySnackbar("Вид тренировки успешно сохранен", "success");
            refetchTrainingTypes();
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
            validationSchema={TrainingTypeSchema}
            onSubmit={handleSubmit}
        >
            {({isSubmitting}) => (
                <Form>
                    <Box display="flex" flexDirection="column" gap={3} padding={3} borderRadius={2}
                         bgcolor="background.paper">
                        <Typography variant="h6" component="h2" gutterBottom>
                            {isCreating ? "Добавление вида тренировки": "Изменение вида тренировки"}
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
                            label="Стоимость тренировки"
                            component={TextField}
                            type="number"
                            variant="outlined"
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Field
                                    name="require_subscription"
                                    type="checkbox"
                                    as={Checkbox}
                                    color="primary"
                                />
                            }
                            label="Доступна только по подписке"
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

export default TrainingTypeForm;