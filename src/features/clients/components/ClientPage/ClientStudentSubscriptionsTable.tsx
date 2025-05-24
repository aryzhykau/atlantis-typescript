import React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { IStudentSubscriptionView } from '../../../subscriptions/models/subscription';
import { Box, Chip, Typography } from '@mui/material';
import dayjs from 'dayjs';

interface ClientStudentSubscriptionsTableProps {
    subscriptions: IStudentSubscriptionView[];
    isLoading?: boolean;
}

const columns: GridColDef<IStudentSubscriptionView>[] = [
    { 
        field: 'subscription_name', 
        headerName: 'Абонемент',
        flex: 1.5,
        renderCell: (params: GridRenderCellParams<IStudentSubscriptionView, string>) => (
            <Typography variant="body2">{params.value}</Typography>
        )
    },
    {
        field: 'student_name',
        headerName: 'Студент',
        flex: 1.5,
        renderCell: (params: GridRenderCellParams<IStudentSubscriptionView, string>) => (
            <Typography variant="body2">{params.value}</Typography>
        )
    },
    {
        field: 'is_auto_renew',
        headerName: 'Автопродление',
        flex: 1,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<IStudentSubscriptionView, boolean>) => (
            <Chip label={params.value ? "Да" : "Нет"} size="small" color={params.value ? "success" : "default"} />
        )
    },
    {
        field: 'next_payment_date',
        headerName: 'След. платеж',
        flex: 1,
        renderCell: (params: GridRenderCellParams<IStudentSubscriptionView, string>) => {
            if (params.row.is_auto_renew && params.row.end_date) {
                return (
                    <Typography variant="body2" sx={{color: 'primary.main', fontWeight: 'medium'}}>
                        {dayjs(params.row.end_date).add(1, 'day').format('DD.MM.YYYY')}
                    </Typography>
                );
            }
            return <Typography variant="body2" sx={{color: 'text.disabled'}}>-</Typography>;
        }
    },
    {
        field: 'start_date',
        headerName: 'Начало',
        flex: 1,
        renderCell: (params: GridRenderCellParams<IStudentSubscriptionView, string>) => (
            <Typography variant="body2">{dayjs(params.value).format('DD.MM.YYYY')}</Typography>
        )
    },
    {
        field: 'end_date',
        headerName: 'Окончание',
        flex: 1,
        renderCell: (params: GridRenderCellParams<IStudentSubscriptionView, string>) => (
            <Typography variant="body2">{dayjs(params.value).format('DD.MM.YYYY')}</Typography>
        )
    },
    {
        field: 'sessions_left',
        headerName: 'Ост. сессий',
        type: 'number',
        flex: 0.8,
        align: 'center',
        headerAlign: 'center',
    },
    {
        field: 'transferred_sessions',
        headerName: 'Перенесено',
        type: 'number',
        flex: 0.8,
        align: 'center',
        headerAlign: 'center',
    },
    {
        field: 'status',
        headerName: 'Статус',
        flex: 1,
        renderCell: (params: GridRenderCellParams<IStudentSubscriptionView, string>) => {
            let color: "default" | "success" | "warning" | "error" | "info" | "primary" | "secondary" = "default";
            if (params.value?.toUpperCase() === 'ACTIVE') color = 'success';
            else if (params.value?.toUpperCase() === 'FROZEN') color = 'warning';
            else if (params.value?.toUpperCase() === 'EXPIRED') color = 'error';
            else if (params.value?.toUpperCase() === 'PENDING_PAYMENT') color = 'info';
            return <Chip label={params.value} size="small" color={color} />;
        }
    },
    {
        field: 'is_frozen',
        headerName: 'Заморожен',
        flex: 1,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<IStudentSubscriptionView, any>) => {
            const isFrozen = !!params.row.freeze_start_date;
            return <Chip label={isFrozen ? "Да" : "Нет"} size="small" color={isFrozen ? "warning" : "default"} />;
        }
    },
];

export const ClientStudentSubscriptionsTable: React.FC<ClientStudentSubscriptionsTableProps> = ({ subscriptions, isLoading }) => {
    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={subscriptions}
                columns={columns}
                loading={isLoading}
                autoHeight
                density="compact"
                // pageSizeOptions={[5, 10, 25]}
                // initialState={{
                //     pagination: {
                //         paginationModel: { pageSize: 5 },
                //     },
                // }}
                localeText={{
                    noRowsLabel: 'Нет абонементов для отображения',
                    footerTotalVisibleRows: (visibleCount, totalCount) =>
                        `${visibleCount.toLocaleString()} из ${totalCount.toLocaleString()}`,
                }}
                sx={{ 
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: (theme) => theme.palette.action.hover,
                    },
                 }}
            />
        </Box>
    );
}; 