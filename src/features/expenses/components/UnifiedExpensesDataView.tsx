import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  Dialog,
  DialogContent,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { UnifiedDataGrid } from '../../../components/UnifiedDataGrid';
import { useGetExpensesQuery, useDeleteExpenseMutation, useGetExpenseTypesQuery } from '../../../store/apis/expensesApi';
import { IExpense } from '../models';
import ExpenseForm from './ExpenseForm';
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useSnackbar } from '../../../hooks/useSnackBar';
import dayjs from 'dayjs';

const expenseInitialValues: Partial<IExpense> = {
  amount: 0, 
  description: '',
};

export const UnifiedExpensesDataView: React.FC = () => {
  const gradients = useGradients();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(true);
  const [currentExpenseForForm, setCurrentExpenseForForm] = useState<Partial<IExpense> | null>(null);
  
  const { data: expensesResponse, isLoading } = useGetExpensesQuery({});
  const { data: expenseTypes } = useGetExpenseTypesQuery();
  const [deleteExpense] = useDeleteExpenseMutation();
  const { displaySnackbar } = useSnackbar();

  const expenses: IExpense[] = expensesResponse || [];

  const handleCreateButtonClick = () => {
    setCurrentExpenseForForm(expenseInitialValues);
    setIsCreating(true);
    setModalOpen(true);
  };

  const handleEdit = (expense: IExpense) => {
    setCurrentExpenseForForm(expense);
    setIsCreating(false);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
      if (confirm('Вы уверены, что хотите удалить этот расход?')) {
          try {
              await deleteExpense(id).unwrap();
              displaySnackbar('Расход удален', 'success');
          } catch (e) {
              console.error(e);
              displaySnackbar('Ошибка при удалении', 'error');
          }
      }
  }

  const onFormClose = () => {
    setModalOpen(false);
    setCurrentExpenseForForm(null);
  };

  const getTypeName = (id: number) => {
      const type = expenseTypes?.find(t => t.id === id);
      return type ? type.name : id;
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
        field: 'expense_date', 
        headerName: 'Дата', 
        width: 120,
        valueFormatter: (value) => dayjs(value).format('DD.MM.YYYY')
    },
    { 
        field: 'amount', 
        headerName: 'Сумма', 
        width: 100,
        valueFormatter: (value) => `${Number(value).toFixed(2)} €`
    },
    { 
        field: 'expense_type_id', 
        headerName: 'Категория', 
        width: 150,
        valueGetter: (value) => getTypeName(value)
    },
    { field: 'description', headerName: 'Описание', flex: 1 },
    {
        field: 'actions',
        type: 'actions',
        headerName: 'Действия',
        width: 100,
        getActions: (params) => [
            <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                onClick={() => handleEdit(params.row as IExpense)}
                key="edit"
            />,
            <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={() => handleDelete(params.row.id)}
                key="delete"
            />,
        ],
    },
  ];

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: gradients.primary,
          color: 'white',
          mb: 3,
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          flexWrap: 'wrap',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Расходы
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Учет и анализ расходов
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateButtonClick}
          sx={{
            py: 1.5,
            px: 3,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              boxShadow: 'none',
            }
          }}
        >
          Добавить расход
        </Button>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <UnifiedDataGrid
          rows={expenses}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'expense_date', sort: 'desc' }] },
          }}
        />
      </Paper>

      <Dialog open={modalOpen} onClose={onFormClose} maxWidth="sm" fullWidth>
        <DialogContent>
           {currentExpenseForForm && (
             <ExpenseForm
               initialValues={currentExpenseForForm}
               expenseId={currentExpenseForForm.id}
               isCreating={isCreating}
               onClose={onFormClose}
             />
           )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
