import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridValueGetter } from '@mui/x-data-grid';
import { Box, Paper, Typography, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, useTheme, alpha, Chip, Autocomplete } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useGetPaymentHistoryQuery } from '../../../store/apis/paymentsApi';
import { IPaymentHistoryFilter, IPaymentHistoryItem } from '../models/payment';
import { TrendingUp, FilterList, Refresh, Payment, Cancel, Receipt } from '@mui/icons-material';
import { useGetClientsQuery } from '../../../store/apis/clientsApi';
import { useGetUsersQuery } from '../../../store/apis/userApi';
import PaymentHistoryFiltersBar from './PaymentHistoryFiltersBar';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';

const PaymentHistoryDataGrid: React.FC = () => {
    const theme = useTheme();
    const gradients = useGradients();
    const [filters, setFilters] = useState<IPaymentHistoryFilter>({
        skip: 0,
        limit: 50,
    });

    const { data, isLoading } = useGetPaymentHistoryQuery(filters);
    const { data: clients = [] } = useGetClientsQuery();
    const { data: users = [] } = useGetUsersQuery();
    
    // Опции для автокомплитов
    const clientOptions = clients.map(client => ({
        label: `${client.first_name} ${client.last_name}`,
        id: client.id
    }));

    const userOptions = users.map(user => ({
        label: `${user.first_name} ${user.last_name}`,
        id: user.id
    }));

    // Отладка данных
    useEffect(() => {
        if (data?.items) {
            console.log('Payment history data:', data.items);
            if (data.items.length > 0) {
                console.log('First item fields:', Object.keys(data.items[0]));
                console.log('First item amount:', data.items[0].amount);
                console.log('First item balance_before:', data.items[0].balance_before);
                console.log('First item balance_after:', data.items[0].balance_after);
            }
        }
    }, [data]);

    // Обработчик изменения фильтров
    const handleFiltersChange = (newFilters: IPaymentHistoryFilter) => {
        setFilters({ ...newFilters, skip: 0 });
    };

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 80,
        },
        {
            field: 'client_name',
            headerName: 'Клиент',
            width: 200,
            valueGetter: (_, row) => 
                row ? `${row.client_first_name} ${row.client_last_name}` : '',
        },
        {
            field: 'operation_type',
            headerName: 'Тип операции',
            width: 180,
            renderCell: (params: any) => {
                const operationType = params.row?.operation_type;
                let label = '';
                let gradient = '';
                let icon = null;
                
                switch (operationType) {
                    case 'PAYMENT':
                        label = 'Платеж';
                        gradient = gradients.success;
                        icon = <Payment sx={{ fontSize: 16 }} />;
                        break;
                    case 'CANCELLATION':
                        label = 'Отмена';
                        gradient = gradients.warning;
                        icon = <Cancel sx={{ fontSize: 16 }} />;
                        break;
                    case 'INVOICE_PAYMENT':
                        label = 'Оплата инвойса';
                        gradient = gradients.info;
                        icon = <Receipt sx={{ fontSize: 16 }} />;
                        break;
                    default:
                        label = operationType || '';
                        gradient = gradients.primary;
                        icon = <Payment sx={{ fontSize: 16 }} />;
                }
                
                return (
                    <Chip
                        icon={icon}
                        label={label}
                        size="small"
                        sx={{
                            background: gradient,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            borderRadius: 1.5,
                            '& .MuiChip-label': {
                                px: 1,
                            },
                            '& .MuiChip-icon': {
                                color: 'white',
                            },
                            boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
                        }}
                    />
                );
            },
        },
        {
            field: 'amount',
            headerName: 'Сумма',
            width: 120,
            type: 'number',
            renderCell: (params: any) => {
                const amount = params.row?.amount;
                const operationType = params.row?.operation_type;
                
                // Определяем цвет в зависимости от типа операции и знака суммы
                let color = theme.palette.text.primary;
                if (operationType === 'PAYMENT' || (operationType === 'INVOICE_PAYMENT' && amount > 0)) {
                    color = theme.palette.success.main;
                } else if (operationType === 'CANCELLATION' || amount < 0) {
                    color = theme.palette.error.main;
                }
                
                const formattedValue = amount != null ? amount.toFixed(2) + ' €' : '0.00 €';
                
                return (
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            color: color,
                            fontSize: '0.875rem',
                        }}
                    >
                        {formattedValue}
                    </Typography>
                );
            },
        },
        {
            field: 'balance_before',
            headerName: 'Баланс до',
            width: 120,
            type: 'number',
            valueFormatter: (value: number | null) => {
                console.log('balance_before valueFormatter:', value);
                return value != null ? value.toFixed(2) + ' €' : '0.00 €';
            },
        },
        {
            field: 'balance_after',
            headerName: 'Баланс после',
            width: 120,
            type: 'number',
            valueFormatter: (value: number | null) => {
                console.log('balance_after valueFormatter:', value);
                return value != null ? value.toFixed(2) + ' €' : '0.00 €';
            },
        },
        {
            field: 'description',
            headerName: 'Описание',
            width: 200,
            valueGetter: (_, row) => 
                row ? (row.description || row.payment_description || '-') : '',
        },
        {
            field: 'created_by_name',
            headerName: 'Создал',
            width: 150,
            valueGetter: (_, row) => 
                row ? `${row.created_by_first_name} ${row.created_by_last_name}` : '',
        },
        {
            field: 'created_at',
            headerName: 'Дата',
            width: 150,
            type: 'dateTime',
            valueFormatter: (params: any) => dayjs(params.value).format('DD.MM.YYYY HH:mm'),
        },
    ];

    return (
        <Box sx={{ width: '100%' }}>
            {/* Заголовок в стиле дизайн-системы */}
            <Paper 
                elevation={0}
                sx={{ 
                    mb: 3, 
                    p: 3, 
                    background: gradients.primary,
                    borderRadius: 3,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        opacity: 0.3,
                    }
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center' }}>
                        📊 История транзакций
                        <TrendingUp sx={{ ml: 1, fontSize: 32 }} />
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
                        Просмотр всех операций с платежами и балансом
                    </Typography>
                </Box>
            </Paper>

            {/* Новый компонент фильтров */}
            <PaymentHistoryFiltersBar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                clients={clients}
                users={users}
                isLoading={isLoading}
            />

            {/* Карточка с таблицей */}
            <Paper 
                elevation={0}
                sx={{ 
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    background: theme.palette.background.paper,
                }}
            >
                {/* Заголовок карточки таблицы */}
                <Box sx={{ 
                    p: 2, 
                    background: alpha(theme.palette.primary.main, 0.05),
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Refresh sx={{ mr: 1, color: theme.palette.primary.main }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                История транзакций
                            </Typography>
                        </Box>
                        {isLoading && (
                            <Chip 
                                label="Загрузка..." 
                                size="small" 
                                sx={{ 
                                    background: gradients.info,
                                    color: 'white',
                                    fontWeight: 600,
                                }}
                            />
                        )}
                    </Box>
                </Box>

                {/* Таблица */}
                <DataGrid
                    rows={data?.items || []}
                    columns={columns}
                    loading={isLoading}
                    autoHeight
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell': {
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            background: alpha(theme.palette.primary.main, 0.05),
                            borderBottom: `2px solid ${theme.palette.divider}`,
                        },
                        '& .MuiDataGrid-row:hover': {
                            background: alpha(theme.palette.primary.main, 0.02),
                        },
                    }}
                    pagination
                    paginationMode="server"
                    rowCount={data?.total || 0}
                    paginationModel={{
                        page: Math.floor((filters.skip || 0) / (filters.limit || 50)),
                        pageSize: filters.limit || 50,
                    }}
                    onPaginationModelChange={(model) => {
                        const newSkip = model.page * model.pageSize;
                        setFilters(prev => ({ 
                            ...prev, 
                            skip: newSkip,
                            limit: model.pageSize
                        }));
                    }}
                    pageSizeOptions={[25, 50, 100, 200]}
                />
            </Paper>
        </Box>
    );
};

export default PaymentHistoryDataGrid; 