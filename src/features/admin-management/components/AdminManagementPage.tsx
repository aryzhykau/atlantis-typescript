import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, Edit, Block, CheckCircle } from '@mui/icons-material';
import { useGetAdminsQuery, useUpdateAdminStatusMutation } from '../../../store/apis/adminManagementApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { IAdminResponse } from '../models/admin';
import AdminForm from './AdminForm';

export const AdminManagementPage: React.FC = () => {
  const { data: adminsData, isLoading } = useGetAdminsQuery();
  const [updateAdminStatus] = useUpdateAdminStatusMutation();
  const { displaySnackbar } = useSnackbar();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<IAdminResponse | null>(null);

  const handleCreateAdmin = () => {
    setEditingAdmin(null);
    setOpenDialog(true);
  };

  const handleEditAdmin = (admin: IAdminResponse) => {
    setEditingAdmin(admin);
    setOpenDialog(true);
  };

  const handleToggleAdminStatus = async (admin: IAdminResponse) => {
    try {
      await updateAdminStatus({
        adminId: admin.id,
        statusData: { is_active: !admin.is_active }
      }).unwrap();
      
      displaySnackbar(
        `Администратор ${admin.is_active ? 'отключен' : 'активирован'} успешно`,
        'success'
      );
    } catch (error: any) {
      displaySnackbar(
        error.data?.detail || 'Не удалось обновить статус администратора',
        'error'
      );
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAdmin(null);
  };

  const columns: GridColDef<IAdminResponse>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'first_name', headerName: 'Имя', width: 130 },
    { field: 'last_name', headerName: 'Фамилия', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    { 
      field: 'phone', 
      headerName: 'Телефон', 
      width: 150,
      valueGetter: (_, row) => `${row.phone_country_code}${row.phone_number}`
    },
    {
      field: 'is_active',
      headerName: 'Статус',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.is_active ? 'Активен' : 'Отключен'}
          color={params.row.is_active ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Действия',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Редактировать"
          onClick={() => handleEditAdmin(params.row as IAdminResponse)}
        />,
        <GridActionsCellItem
          icon={params.row.is_active ? <Block /> : <CheckCircle />}
          label={params.row.is_active ? 'Отключить' : 'Активировать'}
          onClick={() => handleToggleAdminStatus(params.row as IAdminResponse)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Управление администраторами
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateAdmin}
          sx={{ borderRadius: 2 }}
        >
          Добавить администратора
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={adminsData?.admins || []}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'background.paper',
              fontWeight: 600,
            },
          }}
        />
      </Box>

      {/* Admin Form Dialog */}
      <AdminForm
        open={openDialog}
        onClose={handleCloseDialog}
        admin={editingAdmin}
      />
    </Box>
  );
};

export default AdminManagementPage;
