import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    MenuItem,
    Button,
    IconButton,
    Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Refresh as RefreshIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { useGetTrainerRegisteredPaymentsQuery } from '../../../store/apis/trainersApi';
import { IPaymentGet } from '../../payments/models/payment';
import dayjs from 'dayjs';

interface TrainerPaymentsTabProps {
    trainerId: number;
}

const TrainerPaymentsTab: React.FC<TrainerPaymentsTabProps> = ({ trainerId }) => {
    const [filters, setFilters] = useState({
        period: 'all',
        client_id: '',
        amount_min: '',
        amount_max: '',
        date_from: '',
        date_to: '',
        description_search: '',
    });

    const [pagination, setPagination] = useState({
        skip: 0,
        limit: 50,
    });

    const { data, isLoading, error, refetch } = useGetTrainerRegisteredPaymentsQuery({
        trainerId,
        filters: {
            ...pagination,
            ...(filters.period !== 'all' && { period: filters.period }),
            ...(filters.client_id && { client_id: parseInt(filters.client_id) }),
            ...(filters.amount_min && { amount_min: parseFloat(filters.amount_min) }),
            ...(filters.amount_max && { amount_max: parseFloat(filters.amount_max) }),
            ...(filters.date_from && { date_from: filters.date_from }),
            ...(filters.date_to && { date_to: filters.date_to }),
            ...(filters.description_search && { description_search: filters.description_search }),
        },
    });

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, skip: 0 })); // Сбрасываем пагинацию при изменении фильтров
    };

    const handleResetFilters = () => {
        setFilters({
            period: 'all',
            client_id: '',
            amount_min: '',
            amount_max: '',
            date_from: '',
            date_to: '',
            description_search: '',
        });
        setPagination({ skip: 0, limit: 50 });
    };

    const columns: GridColDef<IPaymentGet>[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 80,
            sortable: false,
        },
        {
            field: 'payment_date',
            headerName: 'Дата',
            width: 150,
            valueFormatter: (value: any) => dayjs(value).format('DD.MM.YYYY HH:mm'),
            sortable: false,
        },
        {
            field: 'client_id',
            headerName: 'ID клиента',
            width: 120,
            sortable: false,
        },
        {
            field: 'amount',
            headerName: 'Сумма',
            width: 120,
            valueFormatter: (value: any) => {
                return value ? `${Number(value).toFixed(2)} €` : "Нет информации";
            },
            sortable: false,
        },
        {
            field: 'description',
            headerName: 'Описание',
            flex: 1,
            sortable: false,
        },
        {
            field: 'cancelled_at',
            headerName: 'Статус',
            width: 120,
            renderCell: (params: any) => (
                <Chip
                    label={params.value ? 'Отменён' : 'Активен'}
                    color={params.value ? 'error' : 'success'}
                    size="small"
                />
            ),
            sortable: false,
        },
    ];

    if (error) {
        return (
            <Box p={3}>
                <Typography color="error" variant="h6">
                    Ошибка загрузки платежей: {error.toString()}
                </Typography>
            </Box>
        );
    }

    return (
        <Box p={3} >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h2">
                    Платежи тренера
                </Typography>
                <Box>
                    <IconButton onClick={() => refetch()} disabled={isLoading}>
                        <RefreshIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Фильтры */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <FilterIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Фильтры</Typography>
                </Box>
                
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            select
                            fullWidth
                            label="Период"
                            value={filters.period}
                            onChange={(e) => handleFilterChange('period', e.target.value)}
                            size="small"
                        >
                            <MenuItem value="all">Все время</MenuItem>
                            <MenuItem value="week">Неделя</MenuItem>
                            <MenuItem value="month">Месяц</MenuItem>
                            <MenuItem value="3months">3 месяца</MenuItem>
                        </TextField>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label="ID клиента"
                            value={filters.client_id}
                            onChange={(e) => handleFilterChange('client_id', e.target.value)}
                            size="small"
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label="Сумма от"
                            type="number"
                            value={filters.amount_min}
                            onChange={(e) => handleFilterChange('amount_min', e.target.value)}
                            size="small"
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label="Сумма до"
                            type="number"
                            value={filters.amount_max}
                            onChange={(e) => handleFilterChange('amount_max', e.target.value)}
                            size="small"
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label="Дата от"
                            type="date"
                            value={filters.date_from}
                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label="Дата до"
                            type="date"
                            value={filters.date_to}
                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            label="Поиск по описанию"
                            value={filters.description_search}
                            onChange={(e) => handleFilterChange('description_search', e.target.value)}
                            size="small"
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <Button
                            variant="outlined"
                            onClick={handleResetFilters}
                            fullWidth
                            size="small"
                        >
                            Сбросить фильтры
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Статистика */}
            {data && (
                <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                        Всего записей: {data.total} | 
                        Показано: {data.payments?.length || 0} | 
                        Пропущено: {data.skip}
                    </Typography>
                </Box>
            )}

            {/* Таблица */}
            <Paper sx={{ height: 600, width: '100%', maxHeight: '60vh', overflow: 'auto' }}>
                <DataGrid
                    rows={data?.payments || []}
                    columns={columns}
                    loading={isLoading}
                    pagination
                    paginationMode="server"
                    rowCount={data?.total || 0}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                page: Math.floor(pagination.skip / pagination.limit),
                                pageSize: pagination.limit,
                            },
                        },
                    }}
                    onPaginationModelChange={(model) => {
                        setPagination(prev => ({
                            ...prev,
                            skip: model.page * model.pageSize,
                            limit: model.pageSize
                        }));
                    }}
                    pageSizeOptions={[25, 50, 100]}
                    disableRowSelectionOnClick
                    disableColumnFilter
                    disableColumnSelector
                    disableDensitySelector
                />
            </Paper>
        </Box>
    );
};

export default TrainerPaymentsTab; 