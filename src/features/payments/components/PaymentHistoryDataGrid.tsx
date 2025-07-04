import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridValueGetter } from '@mui/x-data-grid';
import { Box, Paper, Typography, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, useTheme, alpha, Chip, Autocomplete } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useGetPaymentHistoryMutation } from '../../../store/apis/paymentsApi';
import { IPaymentHistoryFilter, IPaymentHistoryItem } from '../models/payment';
import { TrendingUp, FilterList, Refresh, Payment, Cancel, Receipt } from '@mui/icons-material';
import { useGetClientsQuery } from '../../../store/apis/clientsApi';
import { useGetUsersQuery } from '../../../store/apis/userApi';

const PaymentHistoryDataGrid: React.FC = () => {
    const theme = useTheme();
    const [getPaymentHistory, { data, isLoading }] = useGetPaymentHistoryMutation();
    const { data: clients = [] } = useGetClientsQuery();
    const { data: users = [] } = useGetUsersQuery();
    
    const [filters, setFilters] = useState<IPaymentHistoryFilter>({
        skip: 0,
        limit: 50,
    });

    // Градиенты в соответствии с дизайн-системой
    const gradients = {
        primary: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #8e44ad 0%, #6c5ce7 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        success: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
            : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        warning: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
            : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        info: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
            : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    };

    // Опции для автокомплитов
    const clientOptions = clients.map(client => ({
        label: `${client.first_name} ${client.last_name}`,
        id: client.id
    }));

    const userOptions = users.map(user => ({
        label: `${user.first_name} ${user.last_name}`,
        id: user.id
    }));

    useEffect(() => {
        getPaymentHistory(filters);
    }, [filters.skip, filters.limit]);

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

    const handleFilterChange = (field: keyof IPaymentHistoryFilter, value: any) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            skip: 0, // Reset pagination when filters change
        }));
    };

    const handleApplyFilters = () => {
        getPaymentHistory(filters);
    };

    const handleResetFilters = () => {
        setFilters({
            skip: 0,
            limit: 50,
        });
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

            {/* Карточка с фильтрами */}
            <Paper 
                elevation={0}
                sx={{ 
                    mb: 3, 
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    background: theme.palette.background.paper,
                }}
            >
                {/* Заголовок карточки фильтров */}
                <Box sx={{ 
                    p: 2, 
                    background: alpha(theme.palette.primary.main, 0.05),
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FilterList sx={{ mr: 1, color: theme.palette.primary.main }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                Фильтры
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleApplyFilters}
                                sx={{ 
                                    background: gradients.success,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': {
                                        background: theme.palette.mode === 'dark' 
                                            ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
                                            : 'linear-gradient(135deg, #3f87fe 0%, #00d2fe 100%)',
                                    },
                                }}
                            >
                                Применить
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleResetFilters}
                                sx={{ 
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Сбросить
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Контент фильтров */}
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        {/* Тип операции */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Тип операции</InputLabel>
                                <Select
                                    value={filters.operation_type || ''}
                                    label="Тип операции"
                                    onChange={(e) => handleFilterChange('operation_type', e.target.value || undefined)}
                                >
                                    <MenuItem value="">Все операции</MenuItem>
                                    <MenuItem value="PAYMENT">Платеж</MenuItem>
                                    <MenuItem value="CANCELLATION">Отмена платежа</MenuItem>
                                    <MenuItem value="INVOICE_PAYMENT">Оплата инвойса</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Клиент */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Autocomplete
                                options={clientOptions}
                                getOptionLabel={(option) => option.label}
                                value={clientOptions.find(opt => opt.id === filters.client_id) || null}
                                onChange={(_, newValue) => handleFilterChange('client_id', newValue?.id || undefined)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Клиент"
                                        placeholder="Выберите клиента"
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                        </Grid>

                        {/* Создатель */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Autocomplete
                                options={userOptions}
                                getOptionLabel={(option) => option.label}
                                value={userOptions.find(opt => opt.id === filters.created_by_id) || null}
                                onChange={(_, newValue) => handleFilterChange('created_by_id', newValue?.id || undefined)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Создатель"
                                        placeholder="Выберите создателя"
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                        </Grid>

                        {/* Сумма от */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Сумма от"
                                type="number"
                                placeholder="0"
                                value={filters.amount_min || ''}
                                onChange={(e) => handleFilterChange('amount_min', e.target.value ? Number(e.target.value) : undefined)}
                            />
                        </Grid>

                        {/* Сумма до */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Сумма до"
                                type="number"
                                placeholder="10000"
                                value={filters.amount_max || ''}
                                onChange={(e) => handleFilterChange('amount_max', e.target.value ? Number(e.target.value) : undefined)}
                            />
                        </Grid>

                        {/* Дата от */}
                        <Grid item xs={12} sm={6} md={3}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Дата от"
                                    value={filters.date_from ? dayjs(filters.date_from) : null}
                                    onChange={(date) => handleFilterChange('date_from', date ? date.format('YYYY-MM-DD') : undefined)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        {/* Дата до */}
                        <Grid item xs={12} sm={6} md={3}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Дата до"
                                    value={filters.date_to ? dayjs(filters.date_to) : null}
                                    onChange={(date) => handleFilterChange('date_to', date ? date.format('YYYY-MM-DD') : undefined)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

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
                <Box sx={{ p: 2 }}>
                    <DataGrid
                        rows={data?.items || []}
                        columns={columns}
                        loading={isLoading}
                        pagination
                        paginationModel={{
                            page: Math.floor((filters.skip || 0) / (filters.limit || 50)),
                            pageSize: filters.limit || 50,
                        }}
                        onPaginationModelChange={(model) => {
                            const newFilters = {
                                ...filters,
                                skip: model.page * model.pageSize,
                                limit: model.pageSize,
                            };
                            setFilters(newFilters);
                            getPaymentHistory(newFilters);
                        }}
                        pageSizeOptions={[25, 50, 100]}
                        rowCount={data?.total || 0}
                        paginationMode="server"
                        disableRowSelectionOnClick
                        sx={{
                            '& .MuiDataGrid-cell': {
                                fontSize: '0.875rem',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                background: alpha(theme.palette.primary.main, 0.05),
                                fontWeight: 600,
                            },
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default PaymentHistoryDataGrid; 