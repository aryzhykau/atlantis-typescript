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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { 
  ReceiptLong, 
  Add,
  Euro,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useGradients } from '../hooks/useGradients';
import { 
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from '../../../store/apis/trainersApi';
import { useGetCurrentUserQuery } from '../../../store/apis/userApi';
import dayjs from 'dayjs';
import { Expense } from '../models/index';

const validationSchema = yup.object({
  amount: yup
    .number()
    .typeError('Сумма должна быть числом')
    .positive('Сумма должна быть положительной')
    .required('Сумма обязательна'),
  description: yup.string().optional(),
  expense_date: yup.date().required('Дата обязательна'),
});

export const TrainerExpenses: React.FC = () => {
  const theme = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);

  const { displaySnackbar } = useSnackbar();
  const gradients = useGradients();

  const { data: user } = useGetCurrentUserQuery();
  
  const twoWeeksAgo = React.useMemo(() => dayjs().subtract(2, 'week').toISOString(), []);
  const { data: expenses, isLoading: isLoadingExpenses, isError, error } = useGetExpensesQuery({ start_date: twoWeeksAgo, user_id: user?.id }, { skip: !user });
  console.log({ isLoadingExpenses, isError, error });
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const formik = useFormik({
    initialValues: {
      amount: '',
      description: '',
      expense_date: dayjs().format('YYYY-MM-DD'),
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
          expense_date: new Date(values.expense_date).toISOString(),
        }).unwrap();
        displaySnackbar('Расход успешно добавлен', 'success');
        resetForm();
        setShowForm(false);
      } catch (error: any) {
        displaySnackbar(error?.data?.detail || 'Ошибка при добавлении расхода', 'error');
      }
    },
  });

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleDeleteClick = (expenseId: number) => {
    setExpenseToDelete(expenseId);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (expenseToDelete) {
      try {
        await deleteExpense(expenseToDelete).unwrap();
        displaySnackbar('Расход успешно удален', 'success');
        setOpenDeleteDialog(false);
        setExpenseToDelete(null);
      } catch (error: any) {
        displaySnackbar(error?.data?.detail || 'Ошибка при удалении расхода', 'error');
      }
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingExpense) return;
    try {
      await updateExpense({
        expenseId: editingExpense.id,
        body: {
          amount: parseFloat(values.amount),
          description: values.description,
          expense_date: new Date(values.expense_date).toISOString(),
        },
      }).unwrap();
      displaySnackbar('Расход успешно обновлен', 'success');
      setEditingExpense(null);
    } catch (error: any) {
      displaySnackbar(error?.data?.detail || 'Ошибка при обновлении расхода', 'error');
    }
  };

  const editFormik = useFormik({
    initialValues: {
      amount: editingExpense?.amount.toString() || '',
      description: editingExpense?.description || '',
      expense_date: dayjs(editingExpense?.expense_date).format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: handleEditSubmit,
  });

  const totalExpenses = expenses?.reduce((acc: number, exp: Expense) => acc + exp.amount, 0) || 0;

  const sortedExpenses = expenses ? [...expenses].sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()) : [];

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
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Всего расходов за 2 недели</Typography>
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
                <TextField
                  fullWidth
                  id="expense_date"
                  name="expense_date"
                  label="Дата расхода"
                  type="date"
                  value={formik.values.expense_date}
                  onChange={formik.handleChange}
                  error={formik.touched.expense_date && Boolean(formik.errors.expense_date)}
                  helperText={formik.touched.expense_date && formik.errors.expense_date}
                  InputLabelProps={{
                    shrink: true,
                  }}
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

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ p: 2, background: alpha(theme.palette.primary.main, 0.05), borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>История расходов</Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          {sortedExpenses && sortedExpenses.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sortedExpenses.map((expense: Expense, index: number) => (
                <Fade in timeout={300 + index * 100} key={expense.id}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{expense.description || 'Проход в бассейн'}</Typography>
                        <Typography variant="caption" color="text.secondary">{dayjs(expense.expense_date).format('DD MMMM YYYY, HH:mm')}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={<Euro />}
                          label={`${expense.amount.toFixed(2)}`}
                          sx={{ background: gradients.warning, color: 'white', fontWeight: 600 }}
                        />
                        <IconButton size="small" onClick={() => handleEditClick(expense)} sx={{ color: theme.palette.info.main }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteClick(expense.id)} sx={{ color: theme.palette.error.main }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
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

      {/* Edit Expense Dialog */}
      <Dialog open={!!editingExpense} onClose={() => setEditingExpense(null)}>
        <DialogTitle>Редактировать расход</DialogTitle>
        <DialogContent>
          <form onSubmit={editFormik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="edit-amount"
                  name="amount"
                  label="Сумма расхода (€)"
                  type="number"
                  value={editFormik.values.amount}
                  onChange={editFormik.handleChange}
                  error={editFormik.touched.amount && Boolean(editFormik.errors.amount)}
                  helperText={editFormik.touched.amount && editFormik.errors.amount}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="edit-description"
                  name="description"
                  label="Описание (необязательно)"
                  value={editFormik.values.description}
                  onChange={editFormik.handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="edit-expense_date"
                  name="expense_date"
                  label="Дата расхода"
                  type="date"
                  value={editFormik.values.expense_date}
                  onChange={editFormik.handleChange}
                  error={editFormik.touched.expense_date && Boolean(editFormik.errors.expense_date)}
                  helperText={editFormik.touched.expense_date && editFormik.errors.expense_date}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingExpense(null)} color="inherit">Отмена</Button>
          <Button onClick={editFormik.submitForm} disabled={isUpdating} variant="contained" color="primary">
            {isUpdating ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Expense Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Удалить расход?"}</DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
            Вы уверены, что хотите удалить этот расход? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">Отмена</Button>
          <Button onClick={handleConfirmDelete} autoFocus disabled={isDeleting} variant="contained" color="error">
            {isDeleting ? <CircularProgress size={24} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 