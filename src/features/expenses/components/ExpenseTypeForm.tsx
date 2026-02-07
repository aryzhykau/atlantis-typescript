import React from 'react';
import { Formik, Form } from 'formik';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IExpenseType, IExpenseTypeCreate } from '../models';
import { useCreateExpenseTypeMutation, useUpdateExpenseTypeMutation } from '../../../store/apis/expensesApi';
import { useSnackbar } from "../../../hooks/useSnackBar";
import * as Yup from 'yup';

import {
  FormikTextField,
} from '../../../components/forms/fields';
import { FormActions } from '../../../components/forms/layout';

interface ExpenseTypeFormProps {
    initialValues?: Partial<IExpenseType>;
    id?: number | null;
    isCreating: boolean;
    onClose: () => void;
}

const creationSchema = Yup.object().shape({
    name: Yup.string().required('Обязательное поле'),
});

const ExpenseTypeForm: React.FC<ExpenseTypeFormProps> = ({initialValues = {}, onClose, isCreating, id}) => {
    const [createExpenseType, {isLoading: isCreatingLoading}] = useCreateExpenseTypeMutation();
    const [updateExpenseType, {isLoading: isUpdatingLoading}] = useUpdateExpenseTypeMutation();
    const {displaySnackbar} = useSnackbar();

    const handleSubmit = async (values: Partial<IExpenseType>, {resetForm}: {resetForm: () => void}) => {
        try {
            if (isCreating) {
                await createExpenseType(values as IExpenseTypeCreate).unwrap();
                displaySnackbar("Тип расхода успешно создан", "success");
            } else if (id) {
                await updateExpenseType({ id, body: values as IExpenseTypeCreate }).unwrap();
                displaySnackbar("Тип расхода успешно обновлен", "success");
            }
            onClose();
            resetForm();
        } catch (error) {
            console.error("Failed to save expense type", error);
            displaySnackbar("Ошибка сохранения типа расхода", "error");
        }
    };

    return (
        <Box sx={{ width: '100%', p: 2, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {isCreating ? 'Новый тип расхода' : 'Редактировать тип расхода'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            <Formik
                initialValues={initialValues}
                validationSchema={creationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isValid, dirty }) => (
                    <Form>
                        <Box sx={{ display: 'grid', gap: 3 }}>
                            <FormikTextField name="name" label="Название" required />
                            <FormActions
                                onCancel={onClose}
                                isLoading={isCreatingLoading || isUpdatingLoading}
                                submitLabel={isCreating ? "Создать" : "Сохранить"}
                                cancelLabel="Отмена"
                                disabled={!isValid || (!dirty && !isCreating)}
                            />
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default ExpenseTypeForm;
