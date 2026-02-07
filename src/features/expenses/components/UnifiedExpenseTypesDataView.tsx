import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  Dialog,
  DialogContent,
  useTheme
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { UnifiedDataGrid } from '../../../components/UnifiedDataGrid';
import { useGetExpenseTypesQuery, useDeleteExpenseTypeMutation } from '../../../store/apis/expensesApi';
import { IExpenseType } from '../models';
import ExpenseTypeForm from './ExpenseTypeForm';
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useSnackbar } from '../../../hooks/useSnackBar';

const expenseTypeInitialValues: Partial<IExpenseType> = {
  name: "", 
};

export const UnifiedExpenseTypesDataView: React.FC = () => {
  const gradients = useGradients();
  const theme = useTheme();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(true);
  const [currentExpenseTypeForForm, setCurrentExpenseTypeForForm] = useState<Partial<IExpenseType> | null>(null);
  
  const { data: expenseTypesResponse, isLoading } = useGetExpenseTypesQuery();
  const [deleteExpenseType] = useDeleteExpenseTypeMutation();
  const { displaySnackbar } = useSnackbar();

  const expenseTypes: IExpenseType[] = expenseTypesResponse || [];

  const handleCreateButtonClick = () => {
    setCurrentExpenseTypeForForm(expenseTypeInitialValues);
    setIsCreating(true);
    setModalOpen(true);
  };

  const handleEdit = (expenseType: IExpenseType) => {
    setCurrentExpenseTypeForForm(expenseType);
    setIsCreating(false);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
      if (confirm('Вы уверены, что хотите удалить этот тип расходов?')) {
          try {
              await deleteExpenseType(id).unwrap();
              displaySnackbar('Тип расходов удален', 'success');
          } catch (e) {
              console.error(e);
              displaySnackbar('Ошибка при удалении', 'error');
          }
      }
  }

  const onFormClose = () => {
    setModalOpen(false);
    setCurrentExpenseTypeForForm(null);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Название', flex: 1 },
    {
        field: 'actions',
        type: 'actions',
        headerName: 'Действия',
        width: 100,
        getActions: (params) => [
            <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                onClick={() => handleEdit(params.row as IExpenseType)}
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
            Типы расходов
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Управление категориями расходов
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
          Создать тип
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
          rows={expenseTypes}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Paper>

      <Dialog open={modalOpen} onClose={onFormClose} maxWidth="sm" fullWidth>
        <DialogContent>
           {currentExpenseTypeForForm && (
             <ExpenseTypeForm
               initialValues={currentExpenseTypeForForm}
               id={currentExpenseTypeForForm.id}
               isCreating={isCreating}
               onClose={onFormClose}
             />
           )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
