import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  Fade,
  Button,
  TextField,
  Grid,
  Slide,
  IconButton,
} from '@mui/material';
import { 
  ReceiptLong, 
  Add,
  Euro,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useGradients } from '../hooks/useGradients';
import { 
  useGetExpensesQuery,
  useCreateExpenseMutation 
} from '../../../store/apis/trainersApi';
import { useGetCurrentUserQuery } from '../../../store/apis/userApi';
import dayjs from 'dayjs';
import { Expense } from '../models/expense';

type PeriodFilter = 'week' | '2weeks' | 'month';

const validationSchema = yup.object({
  amount: yup
    .number()
    .typeError('Сумма должна быть числом')
    .positive('Сумма должна быть положительной')
    .required('Сумма обязательна'),
  description: yup.string().optional(),
});

export const TrainerExpenses: React.FC = () => {
  const theme = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>('week');

  const { displaySnackbar } = useSnackbar();
  const gradients = useGradients();

  const { data: user } = useGetCurrentUserQuery();
  const { data: expenses, isLoading: isLoadingExpenses } = useGetExpensesQuery({ period });
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();

  const formik = useFormik({
    initialValues: {
      amount: '',
      description: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (!user) throw new Error('Пользователь не найден');
        await createExpense({
          amount: parseFloat(values.amount),
          description: values.description,
          user_id: user.id,
          expense_type_id: 1, // "Проход в бассейн"
          expense_date: new Date().toISOString(),
        }).unwrap();
        displaySnackbar('Расход успешно добавлен', 'success');
        resetForm();
        setShowForm(false);
      } catch (error: any) {
        displaySnackbar(error?.data?.detail || 'Ошибка при добавлении расхода', 'error');
      }
    },
  });

  const totalExpenses = expenses?.reduce((acc: number, exp: Expense) => acc + exp.amount, 0) || 0;

  if (isLoadingExpenses) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 10, background: theme.palette.background.default, minHeight: '100%' }}>
      <Paper 
        elevation={0}
        sx={{ mb: 3, p: 3, background: gradients.primary, borderRadius: 3, color: 'white' }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
          <ReceiptLong sx={{ mr: 1.5, fontSize: 32 }} />
          Расходы
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
          Учет ежедневных расходов на проход в бассейн
        </Typography>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2, background: gradients.info, borderRadius: 3, color: 'white', textAlign: 'center' }}>
            <Euro sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{totalExpenses.toFixed(2)} €</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Всего расходов за {period === 'week' ? 'неделю' : period === '2weeks' ? '2 недели' : 'месяц'}</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
            startIcon={<Add />}
            onClick={() => setShowForm(!showForm)}
            variant="contained"
            sx={{
                background: showForm ? alpha(theme.palette.primary.main, 0.1) : gradients.primary,
                color: showForm ? theme.palette.primary.main : 'white',
                '&:hover': {
                    background: showForm ? alpha(theme.palette.primary.main, 0.2) : gradients.primary,
                },
                borderRadius: 2
            }}
        >
            {showForm ? 'Отмена' : 'Добавить расход'}
        </Button>
      </Box>

      <Slide direction="down" in={showForm} mountOnEnter unmountOnExit>
        <Paper elevation={0} sx={{ mb: 3, p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="amount"
                  name="amount"
                  label="Сумма расхода (€)"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                  type="number"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Описание (необязательно)"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  fullWidth 
                  size="large"
                  type="submit" 
                  disabled={isCreating}
                  sx={{ 
                    py: 1.5,
                    fontWeight: 600,
                    background: gradients.success, 
                    color: 'white',
                    '&:disabled': {
                        background: alpha(theme.palette.success.main, 0.5)
                    }
                }}
                >
                  {isCreating ? <CircularProgress size={24} color="inherit" /> : 'Добавить'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Slide>

      <Paper elevation={0} sx={{ mb: 3, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>Период:</Typography>
          {(['week', '2weeks', 'month'] as PeriodFilter[]).map((p) => (
            <Chip
              key={p}
              label={p === 'week' ? 'Неделя' : p === '2weeks' ? '2 Недели' : 'Месяц'}
              onClick={() => setPeriod(p)}
              variant={period === p ? 'filled' : 'outlined'}
              color={period === p ? 'primary' : 'default'}
              sx={{ borderRadius: 2, fontWeight: 500, '&.MuiChip-filled': { background: gradients.primary, color: 'white' } }}
            />
          ))}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ p: 2, background: alpha(theme.palette.primary.main, 0.05), borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>История расходов</Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          {expenses && expenses.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {expenses.map((expense: Expense, index: number) => (
                <Fade in timeout={300 + index * 100} key={expense.id}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{expense.description || 'Проход в бассейн'}</Typography>
                        <Typography variant="caption" color="text.secondary">{dayjs(expense.expense_date).format('DD MMMM YYYY, HH:mm')}</Typography>
                      </Box>
                      <Chip
                        icon={<Euro />}
                        label={`${expense.amount.toFixed(2)}`}
                        sx={{ background: gradients.warning, color: 'white', fontWeight: 600 }}
                      />
                    </Box>
                  </Paper>
                </Fade>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <ReceiptLong sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary">Расходов не найдено</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}; 