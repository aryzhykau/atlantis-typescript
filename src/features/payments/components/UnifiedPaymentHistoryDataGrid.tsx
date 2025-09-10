import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  alpha, 
  InputAdornment,
  TextField
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useTheme } from '@mui/material/styles';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { UnifiedDataGrid } from '../../../components/UnifiedDataGrid';
import { createEnhancedPaymentColumns } from '../tables/enhancedPaymentColumns';
import { useGetPaymentHistoryQuery } from '../../../store/apis/paymentsApi';
import { useGetClientsQuery } from '../../../store/apis/clientsApi';
import { useGetUsersQuery } from '../../../store/apis/userApi';
import { IPaymentHistoryFilter } from '../models/payment';
import PaymentHistoryFiltersBar from './PaymentHistoryFiltersBar';

export const UnifiedPaymentHistoryDataGrid: React.FC = () => {
  const gradients = useGradients();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<IPaymentHistoryFilter>({
    skip: 0,
    limit: 50,
  });

  const { data, isLoading } = useGetPaymentHistoryQuery(filters);
  const { data: clients = [] } = useGetClientsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const payments = data?.items || [];

  const filteredPayments = useMemo(() => {
    if (!searchValue.trim()) {
      return payments;
    }

    const searchLower = searchValue.toLowerCase();
    return payments.filter(payment =>
      [
        payment.client_first_name,
        payment.client_last_name,
        `${payment.client_first_name} ${payment.client_last_name}`,
        payment.created_by_first_name,
        payment.created_by_last_name,
        `${payment.created_by_first_name} ${payment.created_by_last_name}`,
        payment.description,
        payment.payment_description,
        payment.operation_type,
        payment.amount?.toString()
      ].some(field => field?.toLowerCase().includes(searchLower))
    );
  }, [payments, searchValue]);

  const handleFiltersChange = (newFilters: IPaymentHistoryFilter) => {
    setFilters({ ...newFilters, skip: 0 });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const columns = createEnhancedPaymentColumns();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
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
          boxShadow: isDark ? '0 2px 8px 0 rgba(0,0,0,0.25)' : '0 2px 8px 0 rgba(80,0,120,0.08)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: isDark ? 0.18 : 0.3,
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', width: '100%', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 28, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              История платежей
            </Typography>
          </Box>
          
          <TextField
            id="search-payments"
            placeholder="Поиск по платежам..."
            type="search"
            variant="outlined"
            value={searchValue}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'white' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                background: alpha('#fff', 0.12),
                color: 'white',
                '& .MuiInputBase-input': { color: 'white' },
              }
            }}
            sx={{ 
              minWidth: 280, 
              maxWidth: 340, 
              input: { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#fff', 0.3) },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
              '& .MuiInputAdornment-root svg': { color: 'white' },
            }}
          />
        </Box>
      </Paper>

      {/* Filters Bar */}
      <Box sx={{ mb: 3 }}>
        <PaymentHistoryFiltersBar
          onFiltersChange={handleFiltersChange}
          filters={filters}
          clients={clients}
          users={users}
        />
      </Box>

      {/* Unified DataGrid */}
      <UnifiedDataGrid
        rows={filteredPayments}
        columns={columns}
        loading={isLoading}
        entityType="payments"
        pageSizeOptions={[25, 50, 100]}
        initialPageSize={25}
        variant="elevated"
        ariaLabel="Таблица истории платежей"
      />
    </Box>
  );
};
