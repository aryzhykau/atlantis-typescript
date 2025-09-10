import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { UnifiedDataGrid } from '../../../components/UnifiedDataGrid/UnifiedDataGrid';
import { useGetAdminsQuery, useUpdateAdminStatusMutation } from '../../../store/apis/adminManagementApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { IAdminResponse } from '../models/admin';
import { createEnhancedAdminColumns } from '../tables/enhancedAdminColumns';
import AdminForm from './AdminForm';

export const UnifiedAdminManagementDataGrid: React.FC = () => {
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

  const columns = createEnhancedAdminColumns({
    onEdit: handleEditAdmin,
    onToggleStatus: handleToggleAdminStatus,
  });

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 0.5,
            }}
          >
            Управление администраторами
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            Управление пользователями с административными правами
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateAdmin}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)',
              boxShadow: '0 12px 28px rgba(102, 126, 234, 0.45)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Добавить администратора
        </Button>
      </Box>

      {/* Data Grid */}
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <UnifiedDataGrid
          entityType="admins"
          rows={adminsData?.admins || []}
          columns={columns}
          loading={isLoading}
          title="Администраторы"
          subtitle={`Всего администраторов: ${adminsData?.admins?.length || 0}`}
          pageSizeOptions={[5, 10, 25, 50]}
          initialPageSize={10}
          height="100%"
          ariaLabel="Таблица администраторов системы"
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

export default UnifiedAdminManagementDataGrid;
