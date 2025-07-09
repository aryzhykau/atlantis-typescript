import React, {useState, useEffect, useRef} from 'react';
import {Formik, Form, Field} from 'formik';
import * as Yup from 'yup';
import {TextField} from 'formik-mui';
import {Checkbox, FormControlLabel, Button, Box, Typography, ClickAwayListener, IconButton, CircularProgress, Portal, Popper} from '@mui/material';
import {ColorResult, ChromePicker} from "react-color";
import { ITrainingType, ITrainingTypeCreate, ITrainingTypeUpdate } from '../../training-types/models/trainingType.ts';
import {useCreateTrainingTypeMutation, useUpdateTrainingTypeMutation} from '../../../store/apis/trainingTypesApi.ts';
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import CloseIcon from '@mui/icons-material/Close';


interface TrainingTypeFormProps {
    initialValues?: Partial<ITrainingType>;
    trainingTypeId?: number | null;
    isCreating: boolean;
    onClose: () => void;
}

const TrainingTypeSchema = Yup.object({
    name: Yup.string().min(2, 'Название должно содержать минимум 2 символа').max(50, 'Название не должно превышать 50 символов').required('Название обязательно'),
    price: Yup.number()
        .nullable()
        .min(0, 'Цена не может быть отрицательной'),
    max_participants: Yup.number()
        .nullable()
        .min(1, 'Максимальное количество учеников не может быть меньше 1'),
    is_subscription_only: Yup.boolean().required(),
    color: Yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Цвет должен быть в формате HEX (#RRGGBB)').required('Цвет обязателен'),
    is_active: Yup.boolean().required(),
});

const prepareSubmitValues = (values: Partial<ITrainingType>, isCreating: boolean): ITrainingTypeCreate | ITrainingTypeUpdate => {
    const priceAsNumberOrNull = (values.price === null || values.price === undefined || isNaN(Number(values.price)))
        ? null
        : Number(values.price);

    const data: Partial<ITrainingTypeCreate | ITrainingTypeUpdate> = {
        name: values.name,
        is_subscription_only: values.is_subscription_only,
        price: priceAsNumberOrNull,
        max_participants: values.max_participants,
        color: values.color,
        is_active: values.is_active,
    };

    if (isCreating) {
        return {
            name: data.name || '',
            is_subscription_only: data.is_subscription_only === undefined ? false : data.is_subscription_only,
            color: data.color || '#000000',
            price: data.price,
            is_active: data.is_active === undefined ? true : data.is_active,
            max_participants: data.max_participants,
        } as ITrainingTypeCreate;
    }
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.is_subscription_only !== undefined) updateData.is_subscription_only = data.is_subscription_only;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.max_participants !== undefined) updateData.max_participants = data.max_participants;
    return updateData as ITrainingTypeUpdate;
};

const TrainingTypeForm: React.FC<TrainingTypeFormProps> = ({initialValues = {}, onClose, isCreating, trainingTypeId}) => {
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const defaultInitialColor = "#111111";
    const [selectedColor, setSelectedColor] = useState(initialValues.color || defaultInitialColor);

    const [createTrainingType, {isLoading: isCreatingLoading}] = useCreateTrainingTypeMutation();
    const [updateTrainingType, {isLoading: isUpdatingLoading}] = useUpdateTrainingTypeMutation();
    const {displaySnackbar} = useSnackbar();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const colorIndicatorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialValues.color) {
            setSelectedColor(initialValues.color);
        } else {
            setSelectedColor(defaultInitialColor);
        }
    }, [initialValues.color]);

    const handleColorIndicatorClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
        setColorPickerVisible((prev) => !prev);
    };

    const handleClickAway = () => {
        setAnchorEl(null);
        setColorPickerVisible(false);
    }

    const handleSubmit = async (values: Partial<ITrainingType>, {resetForm}: {resetForm: () => void}) => {
        console.log(values)
        const formValuesForSubmit = prepareSubmitValues(values, isCreating);
        try {
            if (isCreating) {
                await createTrainingType(formValuesForSubmit as ITrainingTypeCreate).unwrap();
                displaySnackbar("Вид тренировки успешно создан", "success");
            } else if (trainingTypeId) {
                console.log(formValuesForSubmit)
                const updatePayload: ITrainingTypeUpdate = {};
                if (formValuesForSubmit.name !== undefined) updatePayload.name = formValuesForSubmit.name;
                if (formValuesForSubmit.price !== undefined) updatePayload.price = formValuesForSubmit.price;
                if (formValuesForSubmit.color !== undefined) updatePayload.color = formValuesForSubmit.color;
                if (formValuesForSubmit.is_active !== undefined) updatePayload.is_active = formValuesForSubmit.is_active;
                if (formValuesForSubmit.is_subscription_only !== undefined) updatePayload.is_subscription_only = formValuesForSubmit.is_subscription_only;
                if (formValuesForSubmit.max_participants !== undefined) updatePayload.max_participants = formValuesForSubmit.max_participants;

                await updateTrainingType({id: trainingTypeId, payload: updatePayload}).unwrap();
                displaySnackbar("Вид тренировки успешно обновлен", "success");
            }
            resetForm();
            onClose();
            handleClickAway();
        } catch (error: any) {
            console.error("Ошибка сохранения вида тренировки:", error);
            const errorDetail = error?.data?.detail || 'Ошибка при сохранении вида тренировки';
            displaySnackbar(String(errorDetail), 'error');
        }
    };

    const formInitialValues = {
        name: initialValues.name || '',
        price: initialValues.price === undefined || initialValues.price === null ? null : initialValues.price,
        is_subscription_only: initialValues.is_subscription_only === undefined ? false : initialValues.is_subscription_only,
        max_participants: initialValues.max_participants === undefined || initialValues.max_participants === null ? null : initialValues.max_participants,
        color: initialValues.color || selectedColor,
        is_active: initialValues.is_active === undefined ? true : initialValues.is_active,
    };

    const openPopper = Boolean(anchorEl) && colorPickerVisible;

    return (
        <Formik
            initialValues={formInitialValues as ITrainingType}
            validationSchema={TrainingTypeSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({isSubmitting, setFieldValue, values, errors, touched}) => (
                <Form>
                    <IconButton
                        onClick={() => {
                            onClose();
                            handleClickAway();
                        }}
                        sx={{position: "absolute", top: 8, right: 8, zIndex: 9999}}
                    >
                        <CloseIcon/>
                    </IconButton>
                    <Box display="flex" flexDirection="column" gap={2} padding={3} borderRadius={1} sx={{position: 'relative', minWidth: 400, p: 3}}>
                        <Typography variant="h6" component="h2" gutterBottom sx={{textAlign: 'center', mb: 2}}>
                            {isCreating ? "Добавление вида тренировки": "Изменение вида тренировки"}
                        </Typography>
                        <Field
                            name="name"
                            label="Название"
                            component={TextField}
                            variant="outlined"
                            fullWidth
                            error={touched.name && Boolean(errors.name)}
                            helperText={touched.name && errors.name}
                        />
                        <Field
                            name="price"
                            label="Стоимость (оставьте пустым для бесплатной)"
                            component={TextField}
                            type="number"
                            variant="outlined"
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            error={touched.price && Boolean(errors.price)}
                            helperText={touched.price && errors.price}
                        />
                        <Field
                            name="max_participants"
                            label="Максимум участников"
                            component={TextField}
                            type="number"
                            variant="outlined"
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            error={touched.max_participants && Boolean(errors.max_participants)}
                            helperText={touched.max_participants && errors.max_participants}
                        />
                        <FormControlLabel
                            control={
                                <Field
                                    name="is_subscription_only"
                                    type="checkbox"
                                    as={Checkbox}
                                    checked={values.is_subscription_only}
                                    color="primary"
                                />
                            }
                            label="Доступна только по подписке"
                        />
                        <FormControlLabel
                            control={
                                <Field
                                    name="is_active"
                                    type="checkbox"
                                    as={Checkbox}
                                    checked={values.is_active}
                                    color="primary"
                                />
                            }
                            label="Активен"
                        />
                        <Box display={"flex"} alignItems={"center"} gap={1} sx={{ mt: 1 }}>
                            <Typography variant="body1" sx={{minWidth: '120px'}}>
                                Цвет отметки:
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2} sx={{position: "relative"}}>
                                <Box
                                    ref={colorIndicatorRef}
                                    onClick={handleColorIndicatorClick}
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        backgroundColor: selectedColor,
                                        borderRadius: '50%',
                                        border: '1px solid #bdbdbd',
                                        cursor: 'pointer',
                                        transition: 'box-shadow 0.2s ease-in-out',
                                        '&:hover': {
                                            boxShadow: '0 0 6px rgba(0,0,0,0.3)',
                                        }
                                    }}
                                />
                                {openPopper && (
                                    <Portal>
                                        <Popper
                                            open={openPopper}
                                            anchorEl={anchorEl}
                                            placement="bottom-start"
                                            modifiers={[
                                                {
                                                    name: 'offset',
                                                    options: {
                                                        offset: [0, 8],
                                                    },
                                                },
                                            ]}
                                            sx={{ zIndex: 1300 }}
                                        >
                                            <ClickAwayListener onClickAway={handleClickAway}>
                                                <ChromePicker
                                                    color={selectedColor}
                                                    onChange={(newColor: ColorResult) => {
                                                        setSelectedColor(newColor.hex);
                                                        setFieldValue('color', newColor.hex);
                                                    }}
                                                    disableAlpha={true}
                                                    styles={{default: {picker: {boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px', background: '#fff'}}}}
                                                />
                                            </ClickAwayListener>
                                        </Popper>
                                    </Portal>
                                )}
                            </Box>
                        </Box>
                        {touched.color && errors.color && (
                            <Typography color="error" variant="caption">{errors.color as string}</Typography>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={isCreatingLoading || isUpdatingLoading || isSubmitting}
                            startIcon={(isCreatingLoading || isUpdatingLoading) ? <CircularProgress size={20} color="inherit"/> : null}
                            sx={{mt: 2}}
                        >
                            {isCreating ? "Добавить" : "Изменить"}
                        </Button>
                    </Box>
                </Form>
            )}
        </Formik>
    );
};

export default TrainingTypeForm;