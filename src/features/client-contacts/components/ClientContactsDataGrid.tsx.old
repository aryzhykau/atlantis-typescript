import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Paper, Typography, alpha, useTheme, Button } from '@mui/material';
import { useListClientContactsQuery, useUpdateClientContactMutation } from '../../../store/apis/clientContactsApi';
import { useClients } from '../../clients/hooks/clientManagementHooks';

export const ClientContactsDataGrid: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { data, isLoading, refetch } = useListClientContactsQuery({ status: 'PENDING' });
  const { clients } = useClients();
  const clientMap = React.useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);
  const [update] = useUpdateClientContactMutation();

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'client_name', headerName: 'Клиент', width: 200, valueGetter: (_v, row) => {
      const c = clientMap.get(row.client_id);
      return c ? `${c.first_name} ${c.last_name}` : row.client_id;
    } },
    { field: 'phone', headerName: 'Телефон', width: 160, valueGetter: (_v, row) => {
      const c = clientMap.get(row.client_id);
      return c ? `${c.phone_country_code} ${c.phone_number}` : '';
    } },
    { field: 'reason', headerName: 'Причина', width: 140 },
    { field: 'created_at', headerName: 'Создано', width: 180 },
    { field: 'last_activity_at', headerName: 'Активность', width: 180 },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 160,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={async () => {
            await update({ task_id: Number(params.row.id), data: { status: 'DONE' } });
            refetch();
          }}
        >
          Позвонил
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: isDark ? alpha(theme.palette.background.paper, 0.85) : 'white',
          mb: 3,
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Контакты клиентов (PENDING)</Typography>
      </Paper>

      <DataGrid
        rows={data ?? []}
        loading={isLoading}
        columns={columns}
        getRowId={(row) => row.id}
        pageSizeOptions={[10]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        disableRowSelectionOnClick
        sx={{
          borderRadius: 3,
          background: isDark ? alpha(theme.palette.background.paper, 0.85) : 'white',
        }}
      />
    </Box>
  );
};


