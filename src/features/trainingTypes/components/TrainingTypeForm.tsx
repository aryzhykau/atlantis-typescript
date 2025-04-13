import React, {useState} from 'react';
import {Formik, Form, Field} from 'formik';
import * as Yup from 'yup';
import {TextField} from 'formik-mui';
import {Checkbox, FormControlLabel, Button, Box, Typography, ClickAwayListener} from '@mui/material';
import {ColorResult, ChromePicker} from "react-color";
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
    color: Yup.string().required('Color is required'),
});



const TrainingTypeForm: React.FC<TrainingTypeFormProps> = ({initialValues, onClose, isCreating, id}) => {
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [color, setColor] = useState(initialValues.color || "#111111");
    const {createTrainingType, updateTrainingType, refetchTrainingTypes} = useTrainingTypes();
    const {displaySnackbar} = useSnackbar();

    const handleClickAway = () => {
        setColorPickerVisible(false);
    }

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
            {({ isSubmitting, setFieldValue}) => (
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
                        <Box display={"flex"} alignItems={"center"} gap={3}>
                            <Typography variant="body1" gutterBottom>
                                Выберите цвет:
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                                {/* Отображение круга для выбора цвета */}
                                <Box position={"relative"}>
                                <Box
                                    onClick={() => setColorPickerVisible((prev) => !prev)}// Переключение видимости ColorPicker
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        backgroundColor: color,
                                        borderRadius: '50%',
                                        border: '2px solid #ccc',
                                        cursor: 'pointer',
                                    }}
                                />
                                {colorPickerVisible && (
                                    <ClickAwayListener onClickAway={handleClickAway}>
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                zIndex: 10,
                                                left: "50px",
                                                top: "-8px",

                                                backgroundColor: '#fff',
                                                borderRadius: "15px",
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <ChromePicker
                                                color={color}
                                                onChange={(newColor: ColorResult) => {
                                                    setColor(newColor.hex)// Передаём новую функцию для Formik
                                                    setFieldValue('color', newColor.hex);
                                                }}
                                            />
                                        </Box>
                                    </ClickAwayListener>

                                )}
                                </Box>
                            </Box>
                        </Box>
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