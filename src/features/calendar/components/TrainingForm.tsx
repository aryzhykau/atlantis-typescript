import React from 'react';
import {Formik, Form, Field} from 'formik';
import * as Yup from 'yup';
import {Select} from 'formik-mui';
import { Button, Box, Typography, Divider, IconButton} from '@mui/material';
// import {useTrainings} from "../hooks/useTrainings.ts";
// import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import {ITraining, /*ITrainingClient*/} from "../models/training.ts";
// import {useClients} from "../../clients/hooks/clientManagementHooks.ts";
import {useTrainers} from "../../trainers/hooks/trainerManagementHooks.ts";
import {useTrainingTypes} from "../../trainingTypes/hooks/useTrainingTypes.ts";

import MenuItem from '@mui/material/MenuItem';

import {DesktopDatePicker, DesktopTimePicker} from "formik-mui-x-date-pickers";
import AddIcon from "@mui/icons-material/Add";

interface TrainingFormProps {
    initialValues: ITraining;
    onClose: () => void;
}



const TrainingSchema = Yup.object({
    trainer: Yup.string().required('Title is required'),
    training_date: Yup.date().required('Date is required'),
    training_time: Yup.date().required('Time is required'),
    clients: Yup.array().required('Clients is required').length(1, 'Clients must be at least 1'),
    training_type: Yup.string().required('Training type is required')
});



const TrainingForm: React.FC<TrainingFormProps> = ({initialValues, onClose}) => {

    // const {createTraining, refetchTrainings} = useTrainings();
    // const {displaySnackbar} = useSnackbar();
    // const {clients} = useClients();
    const {trainers} = useTrainers();
    const {trainingTypes} = useTrainingTypes();

    const handleSubmit = async  (values: ITraining, {resetForm}: {resetForm: () => void}) => {
        try {
            console.log("emulating submit", values);
            resetForm();
            onClose();
        }
        catch (e: unknown) {
            console.log(e)
        }
    };



    const sxFormControl = {
        margin: 2,
        width: '100%',
    };


    return (
        <Formik
            initialValues={initialValues}
            validationSchema={TrainingSchema}
            onSubmit={handleSubmit}
        >
            {({isSubmitting}) => (
                <Form>
                    <Box display="flex" flexDirection="column" gap={3} padding={3} borderRadius={2}
                         bgcolor="background.paper">
                        <Typography variant="h6" component="h2" gutterBottom>
                            Добавление тренировки
                        </Typography>
                        <Box display={"flex"} gap={2} sx={{width: "100%"}}>
                            <Field
                                component={Select}
                                formControl={{sx: sxFormControl}}
                                formHelperText = {"Выберите тренера"}
                                id = "trainer_id"
                                name = "trainer_id"
                                label = "Тренер"
                                variant="outlined"
                                fullWidth
                            >
                                {trainers.map((trainer) => (
                                    <MenuItem key={trainer.id} value={trainer.id}>{trainer.first_name} {trainer.last_name}</MenuItem>
                                ))}
                            </Field>
                            <Field
                                id="training_type_id"
                                name="training_type_id"
                                formControl={{sx: sxFormControl}}
                                formHelperText = {"Выберите вид тренировки"}
                                label="Вид тренировки"
                                component={Select}
                                variant="outlined"
                                fullWidth
                            >
                                {trainingTypes.map((trainingType) => (
                                    <MenuItem key={trainingType.id} value={trainingType.id}>{trainingType.title}</MenuItem>
                                ))}
                            </Field>
                            <Divider/>
                            <Box>
                                <Typography variant={"h5"}>Клиенты</Typography>
                                <IconButton onClick={() => console.log("add client")}>
                                    <AddIcon/>
                                </IconButton>
                            </Box>
                            <Box display={"flex"} flexDirection={"column"}></Box>
                        </Box>
                        <Box display={"flex"} gap={2} sx={{width: "100%"}}>
                            <Field component={DesktopDatePicker} label="Дата" name="training_date"  />
                            <Field component={DesktopTimePicker} label="Время" name="training_time" />
                        </Box>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={isSubmitting}
                        >
                            Добавить тренировку
                        </Button>
                    </Box>
                </Form>
            )}
        </Formik>
    );
};

export default TrainingForm;