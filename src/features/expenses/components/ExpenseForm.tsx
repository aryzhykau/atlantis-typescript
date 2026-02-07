import React, { useMemo } from 'react';
import { Formik, Form } from 'formik';
import { Box, Typography, IconButton, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IExpense, IExpenseCreate } from '../models';
import { useCreateExpenseMutation, useUpdateExpenseMutation, useGetExpenseTypesQuery } from '../../../store/apis/expensesApi';
import { useGetCurrentUserQuery } from '../../../store/apis/userApi';
import { useSnackbar } from "../../../hooks/useSnackBar";
import * as Yup from 'yup';
import dayjs from 'dayjs';

import {
  FormikTextField,
  FormikNumberField,
} from '../../../components/forms/fields';
import { FormikSelectField } from '../../../components/forms/fields/FormikSelectField';
import { FormActions } from '../../../components/forms/layout';

interface ExpenseFormProps {
    initialValues?: Partial<IExpense>;
    expenseId?: number | null;
    isCreating: boolean;
    onClose: () => void;
}

const creationSchema = Yup.object().shape({
    amount: Yup.number().required('Обязательное поле').positive('Должно быть положительным'),
    expense_type_id: Yup.number().required('Обязательное поле'),
    expense_date: Yup.date().required('Обязательное поле'),
    description: Yup.string(),
});

const ExpenseForm: React.FC<ExpenseFormProps> = ({initialValues = {}, onClose, isCreating, expenseId}) => {
    const [createExpense, {isLoading: isCreatingLoading}] = useCreateExpenseMutation();
    const [updateExpense, {isLoading: isUpdatingLoading}] = useUpdateExpenseMutation();
    const { data: expenseTypes } = useGetExpenseTypesQuery();
    const { data: user } = useGetCurrentUserQuery();
    const { displaySnackbar } = useSnackbar();

    const expenseTypeOptions = useMemo(() => {
        return (expenseTypes || []).map(t => ({ value: t.id, label: t.name }));
    }, [expenseTypes]);

    const handleSubmit = async (values: Partial<IExpense>, {resetForm}: {resetForm: () => void}) => {
        try {
            const payload: any = {
                ...values,
                user_id: user?.id,
                expense_date: dayjs(values.expense_date).toISOString(),
            };

            if (isCreating) {
                await createExpense(payload as IExpenseCreate).unwrap();
                displaySnackbar("Расход успешно создан", "success");
            } else if (expenseId) {
                await updateExpense({ expenseId, body: payload }).unwrap();
                displaySnackbar("Расход успешно обновлен", "success");
            }
            onClose();
            resetForm();
        } catch (error) {
            console.error("Failed to save expense", error);
            displaySnackbar("Ошибка сохранения расходов", "error");
        }
    };
    
    // Prepare initial values
    const formInitialValues = {
        amount: initialValues.amount || '',
        description: initialValues.description || '',
        expense_type_id: initialValues.expense_type_id || '',
        expense_date: initialValues.expense_date ? dayjs(initialValues.expense_date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
    };

    return (
        <Box sx={{ width: '100%', p: 2, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {isCreating ? 'Новый расход' : 'Редактировать расход'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            <Formik
                initialValues={formInitialValues as any}
                validationSchema={creationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isValid, dirty }) => (
                    <Form>
                        <Box sx={{ display: 'grid', gap: 3 }}>
                            <FormikNumberField name="amount" label="Сумма" required />
                            <FormikSelectField 
                                name="expense_type_id" 
                                label="Тип расхода" 
                                required 
                            >
                                {expenseTypeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </FormikSelectField>
                            <FormikTextField 
                                name="expense_date" 
                                label="Дата" 
                                type="date" 
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                             <FormikTextField name="description" label="Описание" multiline rows={3} />

                            <FormActions
                                onCancel={onClose}
                                isLoading={isCreatingLoading || isUpdatingLoading}
                                submitText={isCreating ? "Создать" : "Сохранить"}
                                cancelText="Отмена"
                                disabled={!isValid || (!dirty && !isCreating)}
                            />
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default ExpenseForm;
