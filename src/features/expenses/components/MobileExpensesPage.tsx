import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Fab,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SavingsIcon from '@mui/icons-material/Savings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaidIcon from '@mui/icons-material/Paid';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import dayjs from 'dayjs';

import {
  MetricPillCard,
  MobileCollapsibleSearch,
  MobileFilterBottomSheet,
  MobileFormBottomSheet,
  MobilePageShell,
  MobileRefreshContainer,
  QuickAddBottomSheet,
  SwipeableActionCard,
} from '../../../components/mobile-kit';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseTypesQuery,
  useGetExpensesQuery,
  useUpdateExpenseMutation,
} from '../../../store/apis/expensesApi';
import { useGetCurrentUserQuery } from '../../../store/apis/userApi';
import { IExpense } from '../models';
import { useSnackbar } from '../../../hooks/useSnackBar';

interface ExpenseFormValues {
  amount: string;
  expense_type_id: string;
  expense_date: string;
  description: string;
}

const createDefaultFormValues = (): ExpenseFormValues => ({
  amount: '',
  expense_type_id: '',
  expense_date: dayjs().format('YYYY-MM-DD'),
  description: '',
});

const mapExpenseToForm = (expense: IExpense): ExpenseFormValues => ({
  amount: expense.amount?.toString() ?? '',
  expense_type_id: expense.expense_type_id?.toString() ?? '',
  expense_date: dayjs(expense.expense_date).format('YYYY-MM-DD'),
  description: expense.description ?? '',
});

export function MobileExpensesPage() {
  const gradients = useGradients();
  const { displaySnackbar } = useSnackbar();

  const [searchValue, setSearchValue] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showOnlyThisMonth, setShowOnlyThisMonth] = useState(false);
  const [expenseTypeFilter, setExpenseTypeFilter] = useState<'ALL' | number>('ALL');

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddValues, setQuickAddValues] = useState<ExpenseFormValues>(createDefaultFormValues());

  const [expenseToEdit, setExpenseToEdit] = useState<IExpense | null>(null);
  const [editValues, setEditValues] = useState<ExpenseFormValues>(createDefaultFormValues());

  const [expenseToDelete, setExpenseToDelete] = useState<IExpense | null>(null);

  const { data: currentUser } = useGetCurrentUserQuery();
  const {
    data: expensesResponse,
    isLoading: isLoadingExpenses,
    isFetching: isFetchingExpenses,
    isError: isErrorExpenses,
    refetch,
  } = useGetExpensesQuery({});
  const { data: expenseTypesResponse = [], isLoading: isLoadingTypes } = useGetExpenseTypesQuery();

  const [createExpense, { isLoading: isCreatingExpense }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdatingExpense }] = useUpdateExpenseMutation();
  const [deleteExpense, { isLoading: isDeletingExpense }] = useDeleteExpenseMutation();

  const expenses = expensesResponse || [];
  const expenseTypes = expenseTypesResponse;

  const expenseTypeMap = useMemo(
    () => new Map(expenseTypes.map((type) => [type.id, type.name])),
    [expenseTypes]
  );

  const filteredExpenses = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return expenses.filter((expense) => {
      if (expenseTypeFilter !== 'ALL' && expense.expense_type_id !== expenseTypeFilter) {
        return false;
      }

      if (showOnlyThisMonth) {
        if (!dayjs(expense.expense_date).isSame(dayjs(), 'month')) {
          return false;
        }
      }

      if (!query) return true;

      const expenseTypeName = expenseTypeMap.get(expense.expense_type_id) ?? '';
      const userName = expense.user ? `${expense.user.first_name} ${expense.user.last_name}` : '';

      return [
        expense.id.toString(),
        expenseTypeName,
        userName,
        expense.description,
        expense.amount.toString(),
        dayjs(expense.expense_date).format('DD.MM.YYYY'),
      ].some((field) => field?.toLowerCase().includes(query));
    });
  }, [expenses, expenseTypeFilter, showOnlyThisMonth, searchValue, expenseTypeMap]);

  const stats = useMemo(() => {
    const total = expenses.length;
    const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    const thisMonth = expenses.filter((expense) => dayjs(expense.expense_date).isSame(dayjs(), 'month'));
    const thisMonthCount = thisMonth.length;
    const thisMonthAmount = thisMonth.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    return { total, totalAmount, thisMonthCount, thisMonthAmount };
  }, [expenses]);

  const isOverlayOpen = filtersOpen || quickAddOpen || Boolean(expenseToEdit) || Boolean(expenseToDelete);

  const handleRefresh = async () => {
    await refetch();
  };

  const validateForm = (values: ExpenseFormValues) => {
    if (!values.amount || Number(values.amount) <= 0) {
      displaySnackbar('Укажите корректную сумму', 'warning');
      return false;
    }
    if (!values.expense_type_id) {
      displaySnackbar('Выберите тип расхода', 'warning');
      return false;
    }
    if (!values.expense_date) {
      displaySnackbar('Укажите дату расхода', 'warning');
      return false;
    }
    if (!currentUser?.id) {
      displaySnackbar('Не удалось определить текущего пользователя', 'error');
      return false;
    }

    return true;
  };

  const submitCreate = async (keepOpen: boolean) => {
    if (!validateForm(quickAddValues)) return;

    try {
      await createExpense({
        user_id: currentUser!.id,
        expense_type_id: Number(quickAddValues.expense_type_id),
        amount: Number(quickAddValues.amount),
        expense_date: dayjs(quickAddValues.expense_date).toISOString(),
        description: quickAddValues.description || undefined,
      }).unwrap();

      displaySnackbar('Расход добавлен', 'success');

      if (keepOpen) {
        setQuickAddValues((prev) => ({
          ...prev,
          amount: '',
          description: '',
          expense_date: dayjs().format('YYYY-MM-DD'),
        }));
      } else {
        setQuickAddOpen(false);
        setQuickAddValues(createDefaultFormValues());
      }

      await refetch();
    } catch {
      displaySnackbar('Ошибка создания расхода', 'error');
    }
  };

  const submitEdit = async () => {
    if (!expenseToEdit) return;
    if (!validateForm(editValues)) return;

    try {
      await updateExpense({
        expenseId: expenseToEdit.id,
        body: {
          user_id: currentUser!.id,
          expense_type_id: Number(editValues.expense_type_id),
          amount: Number(editValues.amount),
          expense_date: dayjs(editValues.expense_date).toISOString(),
          description: editValues.description || undefined,
        },
      }).unwrap();

      displaySnackbar('Расход обновлен', 'success');
      setExpenseToEdit(null);
      await refetch();
    } catch {
      displaySnackbar('Ошибка обновления расхода', 'error');
    }
  };

  const submitDelete = async () => {
    if (!expenseToDelete) return;

    try {
      await deleteExpense(expenseToDelete.id).unwrap();
      displaySnackbar('Расход удален', 'success');
      setExpenseToDelete(null);
      await refetch();
    } catch {
      displaySnackbar('Ошибка удаления расхода', 'error');
    }
  };

  return (
    <MobileRefreshContainer
      onRefresh={handleRefresh}
      isRefreshing={isFetchingExpenses || isCreatingExpense || isUpdatingExpense || isDeletingExpense}
      disabled={isOverlayOpen}
      showManualRefreshButton={false}
    >
      <MobilePageShell
        title="Расходы"
        subtitle="Быстрый мобильный учет"
        icon={<ReceiptLongIcon />}
        actions={(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Создание и редактирование типов расходов доступно только в десктоп-версии" arrow>
              <IconButton
                aria-label="expense-types-desktop-only-info"
                onClick={() => displaySnackbar('Типы расходов можно создавать и редактировать только в десктоп-версии', 'info')}
              >
                <InfoOutlinedIcon sx={{ color: 'white' }} />
              </IconButton>
            </Tooltip>
            <MobileCollapsibleSearch
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Поиск по расходам"
              onDarkBackground
            />
            <IconButton aria-label="open-expenses-filters" onClick={() => setFiltersOpen(true)}>
              <FilterListIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>
        )}
        stats={(
          <Grid container spacing={1.25}>
            <Grid item xs={6}>
              <MetricPillCard label="Всего" value={stats.total} gradient={gradients.primary} icon={<ReceiptLongIcon fontSize="small" />} />
            </Grid>
            <Grid item xs={6}>
              <MetricPillCard label="Сумма" value={`${stats.totalAmount.toFixed(0)} €`} gradient={gradients.success} icon={<SavingsIcon fontSize="small" />} />
            </Grid>
            <Grid item xs={6}>
              <MetricPillCard label="Месяц" value={stats.thisMonthCount} gradient={gradients.info} icon={<CalendarMonthIcon fontSize="small" />} />
            </Grid>
            <Grid item xs={6}>
              <MetricPillCard label="За месяц" value={`${stats.thisMonthAmount.toFixed(0)} €`} gradient={gradients.warning} icon={<PaidIcon fontSize="small" />} />
            </Grid>
          </Grid>
        )}
        fab={(
          <Fab
            aria-label="add-expense"
            sx={{
              position: 'fixed',
              right: 16,
              bottom: 16,
              background: gradients.primary,
              color: 'white',
              '&:hover': {
                background: gradients.primary,
                filter: 'brightness(0.95)',
              },
            }}
            onClick={() => setQuickAddOpen(true)}
          >
            <AddIcon />
          </Fab>
        )}
      >
        <Box sx={{ mx: -2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Список расходов
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Найдено: {filteredExpenses.length}
            </Typography>
          </Box>

          {(isLoadingExpenses || isLoadingTypes) && (
            <CircularProgress size={24} sx={{ alignSelf: 'center', my: 2, mx: 'auto', display: 'block' }} />
          )}

          {isErrorExpenses && (
            <Typography color="error" sx={{ px: 2, pb: 2 }}>Ошибка загрузки расходов.</Typography>
          )}

          {!isLoadingExpenses && !isErrorExpenses && filteredExpenses.length === 0 && (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 2, px: 2 }}>
              Расходы не найдены.
            </Typography>
          )}

          {filteredExpenses.map((expense) => (
            <SwipeableActionCard
              key={expense.id}
              disabled={isOverlayOpen}
              revealContent={(
                <Stack direction="row" sx={{ width: '100%' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      setExpenseToEdit(expense);
                      setEditValues(mapExpenseToForm(expense));
                    }}
                    sx={{
                      borderRadius: 0,
                      background: gradients.primary,
                      color: 'white',
                      fontWeight: 700,
                      '&:hover': {
                        background: gradients.primary,
                        filter: 'brightness(0.95)',
                      },
                    }}
                  >
                    Редакт.
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setExpenseToDelete(expense)}
                    sx={{
                      borderRadius: 0,
                      background: gradients.warning,
                      color: 'white',
                      fontWeight: 700,
                      '&:hover': {
                        background: gradients.warning,
                        filter: 'brightness(0.95)',
                      },
                    }}
                  >
                    Удалить
                  </Button>
                </Stack>
              )}
              revealWidth={176}
            >
              <Box
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: 0,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderTop: 'none',
                  p: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                      {expenseTypeMap.get(expense.expense_type_id) || `Тип #${expense.expense_type_id}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Расход #{expense.id}
                    </Typography>
                  </Box>

                  <Chip size="small" color="warning" label={`${Number(expense.amount || 0).toFixed(2)} €`} />
                </Box>

                <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {expense.description || 'Без описания'}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Дата: {dayjs(expense.expense_date).format('DD.MM.YYYY')}
                  </Typography>
                  {expense.user && (
                    <Typography variant="caption" color="text.disabled">
                      Добавил: {expense.user.first_name} {expense.user.last_name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </SwipeableActionCard>
          ))}
        </Box>
      </MobilePageShell>

      <MobileFilterBottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={() => setFiltersOpen(false)}
        onReset={() => {
          setShowOnlyThisMonth(false);
          setExpenseTypeFilter('ALL');
          setSearchValue('');
          setFiltersOpen(false);
        }}
        title="Фильтры расходов"
      >
        <Stack spacing={1.5}>
          <FormControlLabel
            control={(
              <Switch
                checked={showOnlyThisMonth}
                onChange={(event) => setShowOnlyThisMonth(event.target.checked)}
              />
            )}
            label="Только текущий месяц"
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Тип расхода
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              variant={expenseTypeFilter === 'ALL' ? 'contained' : 'outlined'}
              onClick={() => setExpenseTypeFilter('ALL')}
            >
              Все
            </Button>
            {expenseTypes.map((type) => (
              <Button
                key={type.id}
                size="small"
                variant={expenseTypeFilter === type.id ? 'contained' : 'outlined'}
                onClick={() => setExpenseTypeFilter(type.id)}
              >
                {type.name}
              </Button>
            ))}
          </Stack>
        </Stack>
      </MobileFilterBottomSheet>

      <QuickAddBottomSheet
        open={quickAddOpen}
        onClose={() => {
          setQuickAddOpen(false);
          setQuickAddValues(createDefaultFormValues());
        }}
        title="⚡ Быстро добавить расход"
        onSubmit={() => void submitCreate(false)}
        onSubmitAndAddAnother={() => void submitCreate(true)}
        submitLabel="Сохранить"
        submitAnotherLabel="Сохранить и добавить ещё"
      >
        <Stack spacing={2}>
          <TextField
            label="Сумма"
            type="number"
            value={quickAddValues.amount}
            onChange={(event) => setQuickAddValues((prev) => ({ ...prev, amount: event.target.value }))}
            inputProps={{ min: 0, step: '0.01' }}
            fullWidth
          />

          <TextField
            select
            label="Тип расхода"
            value={quickAddValues.expense_type_id}
            onChange={(event) => setQuickAddValues((prev) => ({ ...prev, expense_type_id: event.target.value }))}
            fullWidth
          >
            {expenseTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Дата"
            type="date"
            value={quickAddValues.expense_date}
            onChange={(event) => setQuickAddValues((prev) => ({ ...prev, expense_date: event.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Описание"
            value={quickAddValues.description}
            onChange={(event) => setQuickAddValues((prev) => ({ ...prev, description: event.target.value }))}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </QuickAddBottomSheet>

      <MobileFormBottomSheet
        open={Boolean(expenseToEdit)}
        onClose={() => setExpenseToEdit(null)}
        title="✏️ Редактировать расход"
      >
        <Stack spacing={2}>
          <TextField
            label="Сумма"
            type="number"
            value={editValues.amount}
            onChange={(event) => setEditValues((prev) => ({ ...prev, amount: event.target.value }))}
            inputProps={{ min: 0, step: '0.01' }}
            fullWidth
          />

          <TextField
            select
            label="Тип расхода"
            value={editValues.expense_type_id}
            onChange={(event) => setEditValues((prev) => ({ ...prev, expense_type_id: event.target.value }))}
            fullWidth
          >
            {expenseTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Дата"
            type="date"
            value={editValues.expense_date}
            onChange={(event) => setEditValues((prev) => ({ ...prev, expense_date: event.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Описание"
            value={editValues.description}
            onChange={(event) => setEditValues((prev) => ({ ...prev, description: event.target.value }))}
            multiline
            minRows={2}
            fullWidth
          />

          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => void submitEdit()}
            disabled={isUpdatingExpense}
          >
            Сохранить изменения
          </Button>
        </Stack>
      </MobileFormBottomSheet>

      <Dialog
        open={Boolean(expenseToDelete)}
        onClose={() => setExpenseToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Удалить расход?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {expenseToDelete ? `#${expenseToDelete.id} • ${Number(expenseToDelete.amount).toFixed(2)} €` : ''}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" color="inherit" onClick={() => setExpenseToDelete(null)}>
              Отмена
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<DeleteIcon />}
              onClick={() => void submitDelete()}
              disabled={isDeletingExpense}
            >
              Удалить
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </MobileRefreshContainer>
  );
}
