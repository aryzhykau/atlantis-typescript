import React, { useEffect } from 'react';
import { Formik, Form } from 'formik';
import { Box, Typography, IconButton, MenuItem } from '@mui/material';
import { ITrainingType, ITrainingTypeCreate, ITrainingTypeUpdate } from '../../training-types/models/trainingType.ts';
import { useCreateTrainingTypeMutation, useUpdateTrainingTypeMutation } from '../../../store/apis/trainingTypesApi.ts';
import { useSnackbar } from "../../../hooks/useSnackBar.tsx";
import { trainingTypeSchemas } from '../../../utils/validationSchemas';
import CloseIcon from '@mui/icons-material/Close';

// Form Components
import {
  FormikTextField,
  FormikNumberField,
  FormikCheckboxField,
  FormikColorPicker
} from '../../../components/forms/fields';
import { FormikSelectField } from '../../../components/forms/fields/FormikSelectField';
import { FormActions } from '../../../components/forms/layout';




interface TrainingTypeFormProps {
    initialValues?: Partial<ITrainingType>;
    trainingTypeId?: number | null;
    isCreating: boolean;
    onClose: () => void;
}



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
    cancellation_mode: (values as any).cancellation_mode,
    safe_cancel_time_morning: (values as any).safe_cancel_time_morning,
    safe_cancel_time_evening: (values as any).safe_cancel_time_evening,
    safe_cancel_time_morning_prev_day: (values as any).safe_cancel_time_morning_prev_day,
    safe_cancel_time_evening_prev_day: (values as any).safe_cancel_time_evening_prev_day,
    safe_cancel_hours: (values as any).safe_cancel_hours,
    };

    if (isCreating) {
        return {
            name: data.name || '',
            is_subscription_only: data.is_subscription_only === undefined ? false : data.is_subscription_only,
            color: data.color || '#000000',
            price: data.price,
            is_active: data.is_active === undefined ? true : data.is_active,
            max_participants: data.max_participants,
            cancellation_mode: data.cancellation_mode,
            safe_cancel_time_morning: data.safe_cancel_time_morning,
            safe_cancel_time_evening: data.safe_cancel_time_evening,
            safe_cancel_time_morning_prev_day: data.safe_cancel_time_morning_prev_day,
            safe_cancel_time_evening_prev_day: data.safe_cancel_time_evening_prev_day,
            safe_cancel_hours: data.safe_cancel_hours,
        } as ITrainingTypeCreate;
    }
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.is_subscription_only !== undefined) updateData.is_subscription_only = data.is_subscription_only;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.max_participants !== undefined) updateData.max_participants = data.max_participants;
    if (data.cancellation_mode !== undefined) updateData.cancellation_mode = data.cancellation_mode;
    if (data.safe_cancel_time_morning !== undefined) updateData.safe_cancel_time_morning = data.safe_cancel_time_morning;
    if (data.safe_cancel_time_evening !== undefined) updateData.safe_cancel_time_evening = data.safe_cancel_time_evening;
    if (data.safe_cancel_time_morning_prev_day !== undefined) updateData.safe_cancel_time_morning_prev_day = data.safe_cancel_time_morning_prev_day;
    if (data.safe_cancel_time_evening_prev_day !== undefined) updateData.safe_cancel_time_evening_prev_day = data.safe_cancel_time_evening_prev_day;
    if (data.safe_cancel_hours !== undefined) updateData.safe_cancel_hours = data.safe_cancel_hours;
    return updateData as ITrainingTypeUpdate;
};

const TrainingTypeForm: React.FC<TrainingTypeFormProps> = ({initialValues = {}, onClose, isCreating, trainingTypeId}) => {
    const defaultInitialColor = "#111111";

    const [createTrainingType, {isLoading: isCreatingLoading}] = useCreateTrainingTypeMutation();
    const [updateTrainingType, {isLoading: isUpdatingLoading}] = useUpdateTrainingTypeMutation();
    const {displaySnackbar} = useSnackbar();

    const handleSubmit = async (values: Partial<ITrainingType>, {resetForm}: {resetForm: () => void}) => {
        const formValuesForSubmit = prepareSubmitValues(values, isCreating);
        try {
            if (isCreating) {
                await createTrainingType(formValuesForSubmit as ITrainingTypeCreate).unwrap();
                displaySnackbar("Вид тренировки успешно создан", "success");
            } else if (trainingTypeId) {
                const updatePayload: ITrainingTypeUpdate = {};
                if (formValuesForSubmit.name !== undefined) updatePayload.name = formValuesForSubmit.name;
                if (formValuesForSubmit.price !== undefined) updatePayload.price = formValuesForSubmit.price;
                if (formValuesForSubmit.color !== undefined) updatePayload.color = formValuesForSubmit.color;
                if (formValuesForSubmit.is_active !== undefined) updatePayload.is_active = formValuesForSubmit.is_active;
                if (formValuesForSubmit.is_subscription_only !== undefined) updatePayload.is_subscription_only = formValuesForSubmit.is_subscription_only;
                if (formValuesForSubmit.max_participants !== undefined) updatePayload.max_participants = formValuesForSubmit.max_participants;
                    // include cancellation fields in update
                    if ((formValuesForSubmit as any).cancellation_mode !== undefined) updatePayload.cancellation_mode = (formValuesForSubmit as any).cancellation_mode;
                    if ((formValuesForSubmit as any).safe_cancel_time_morning !== undefined) updatePayload.safe_cancel_time_morning = (formValuesForSubmit as any).safe_cancel_time_morning;
                    if ((formValuesForSubmit as any).safe_cancel_time_evening !== undefined) updatePayload.safe_cancel_time_evening = (formValuesForSubmit as any).safe_cancel_time_evening;
                    if ((formValuesForSubmit as any).safe_cancel_time_morning_prev_day !== undefined) updatePayload.safe_cancel_time_morning_prev_day = (formValuesForSubmit as any).safe_cancel_time_morning_prev_day;
                    if ((formValuesForSubmit as any).safe_cancel_time_evening_prev_day !== undefined) updatePayload.safe_cancel_time_evening_prev_day = (formValuesForSubmit as any).safe_cancel_time_evening_prev_day;
                    if ((formValuesForSubmit as any).safe_cancel_hours !== undefined) updatePayload.safe_cancel_hours = (formValuesForSubmit as any).safe_cancel_hours;

                await updateTrainingType({id: trainingTypeId, payload: updatePayload}).unwrap();
                displaySnackbar("Вид тренировки успешно обновлен", "success");
            }
            resetForm();
            onClose();
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
        color: initialValues.color || defaultInitialColor,
        is_active: initialValues.is_active === undefined ? true : initialValues.is_active,
    cancellation_mode: (initialValues as any).cancellation_mode || 'FLEXIBLE',
    safe_cancel_time_morning: (initialValues as any).safe_cancel_time_morning || null,
    safe_cancel_time_evening: (initialValues as any).safe_cancel_time_evening || null,
    safe_cancel_time_morning_prev_day: (initialValues as any).safe_cancel_time_morning_prev_day || false,
    safe_cancel_time_evening_prev_day: (initialValues as any).safe_cancel_time_evening_prev_day || false,
    safe_cancel_hours: (initialValues as any).safe_cancel_hours ?? 12,
    };

    return (
        <Formik
            initialValues={formInitialValues as ITrainingType}
            validationSchema={isCreating ? trainingTypeSchemas.create : trainingTypeSchemas.update}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ setFieldValue, values }) => {
                useEffect(() => {
                    // Clear price when switching to subscription-only
                    if (values.is_subscription_only && values.price !== null) {
                        setFieldValue('price', null);
                    }
                }, [values.is_subscription_only, setFieldValue]);

                return (
                    <Form>
                        <IconButton
                            onClick={onClose}
                            sx={{position: "absolute", top: 8, right: 8, zIndex: 9999}}
                        >
                            <CloseIcon/>
                        </IconButton>
                        
                        <Box sx={{ position: 'relative', minWidth: 400, p: 3 }}>
                            <Typography variant="h6" component="h2" gutterBottom sx={{textAlign: 'center', mb: 3}}>
                                {isCreating ? "Добавление вида тренировки" : "Изменение вида тренировки"}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <FormikTextField
                                    name="name"
                                    label="Название"
                                    required
                                />
                                
                                <FormikNumberField
                                    name="price"
                                    label={values.is_subscription_only ? "Цена недоступна для типа по подписке" : "Стоимость"}
                                    disabled={values.is_subscription_only}
                                    placeholder="Оставьте пустым для бесплатной тренировки"
                                />
                                
                                <FormikNumberField
                                    name="max_participants"
                                    label="Максимальное количество участников"
                                    placeholder="Без ограничений"
                                />
                                
                                <FormikCheckboxField
                                    name="is_subscription_only"
                                    label="Доступна только по подписке"
                                />
                                
                                <FormikCheckboxField
                                    name="is_active"
                                    label="Активен"
                                />
                                
                                <FormikSelectField
                                    name="cancellation_mode"
                                    label="Режим отмены"
                                >
                                    <MenuItem value="FLEXIBLE">Гибкий (по часам)</MenuItem>
                                    <MenuItem value="FIXED">Фиксированный (время для утра/вечера)</MenuItem>
                                </FormikSelectField>

                                {values.cancellation_mode === 'FLEXIBLE' && (
                                    <FormikNumberField
                                        name="safe_cancel_hours"
                                        label="Безопасная отмена (часов до начала)"
                                        placeholder="Например, 12"
                                    />
                                )}

                                {values.cancellation_mode === 'FIXED' && (
                                    <>
                                        <FormikTextField
                                            name="safe_cancel_time_morning"
                                            label="Безопасное время (утренняя тренировка)"
                                            type="time"
                                        />
                                        <FormikCheckboxField
                                            name="safe_cancel_time_morning_prev_day"
                                            label="Относится к предыдущему дню"
                                        />
                                        <FormikTextField
                                            name="safe_cancel_time_evening"
                                            label="Безопасное время (вечерняя тренировка)"
                                            type="time"
                                        />
                                        <FormikCheckboxField
                                            name="safe_cancel_time_evening_prev_day"
                                            label="Относится к предыдущему дню"
                                        />
                                    </>
                                )}

                                <FormikColorPicker
                                    name="color"
                                    label="Цвет отметки"
                                />

                                <FormActions
                                    submitText={isCreating ? "Добавить" : "Изменить"}
                                    isSubmitting={isCreatingLoading || isUpdatingLoading}
                                    onCancel={onClose}
                                    showCancel={false}
                                />
                            </Box>
                        </Box>
                    </Form>
                );
            }}
        </Formik>
    );
};

export default TrainingTypeForm;