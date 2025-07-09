import React from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { IStudentSubscriptionView } from '../../subscriptions/models/subscription';
import dayjs from 'dayjs';

interface StudentSubscriptionsTableProps {
    subscriptions: IStudentSubscriptionView[];
    isLoading: boolean;
}

export const StudentSubscriptionsTable: React.FC<StudentSubscriptionsTableProps> = ({ subscriptions, isLoading }) => {
    const columns: GridColDef<IStudentSubscriptionView>[] = [
        { field: 'subscription_name', headerName: 'Название абонемента', flex: 1, minWidth: 150 },
        {
            field: 'status',
            headerName: 'Статус',
            width: 130,
            renderCell: (params: GridRenderCellParams<IStudentSubscriptionView>) => {
                let chipColor: 'success' | 'error' | 'warning' | 'info' | 'default' = 'default';
                if (params.value === 'ACTIVE') chipColor = 'success';
                else if (params.value === 'EXPIRED' || params.value === 'CANCELLED') chipColor = 'error';
                else if (params.value === 'FROZEN') chipColor = 'info';
                else if (params.value === 'PENDING_PAYMENT') chipColor = 'warning';
                return <Chip label={params.value} color={chipColor} size="small" />;
            }
        },
        { 
            field: 'start_date', 
            headerName: 'Начало', 
            width: 150,
            valueFormatter: (value: string) => dayjs(value).format('DD.MM.YYYY HH:mm') 
        },
        { 
            field: 'end_date', 
            headerName: 'Окончание', 
            width: 150, 
            valueFormatter: (value: string) => dayjs(value).format('DD.MM.YYYY HH:mm')
        },
        { field: 'sessions_left', headerName: 'Ост. занятий', width: 120 },
        { field: 'transferred_sessions', headerName: 'Перенесено', width: 120 },
        {
            field: 'is_auto_renew',
            headerName: 'Автопродление',
            width: 150,
            renderCell: (params: GridRenderCellParams<IStudentSubscriptionView>) => (
                params.value ? <Chip label="Да" color="success" size="small" /> : <Chip label="Нет" color="default" size="small" />
            )
        },
        {
            field: 'freeze_period',
            headerName: 'Заморозка',
            width: 200,
            valueGetter: (_, row: IStudentSubscriptionView) => 
                row.freeze_start_date 
                ? `${dayjs(row.freeze_start_date).format('DD.MM.YY')} - ${row.freeze_end_date ? dayjs(row.freeze_end_date).format('DD.MM.YY') : '...'}` 
                : 'Нет',
        },
        // auto_renewal_invoice_id можно добавить при необходимости
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!subscriptions || subscriptions.length === 0) {
        return <Typography sx={{p: 2, textAlign: 'center'}}>У студента нет абонементов.</Typography>;
    }

    return (
        <DataGrid
            rows={subscriptions}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
                pagination: {
                    paginationModel: { pageSize: 5 },
                },
            }}
            disableRowSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: (theme) => theme.palette.background.paper,
                        },
                    }}
            autoHeight
            
        />
    );
}; 