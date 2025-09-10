import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  alpha, 
  InputAdornment,
  TextField,
  FormControlLabel,
  Switch,
  Autocomplete
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useTheme } from '@mui/material/styles';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { UnifiedDataGrid } from '../../../components/UnifiedDataGrid';
import { createEnhancedInvoiceColumns } from '../tables/enhancedInvoiceColumns';
import { useGetInvoicesQuery } from '../../../store/apis/invoices';
import { useClients } from '../../clients/hooks/clientManagementHooks';

interface AutocompleteOption {
  label: string;
  id: number;
}

export const UnifiedInvoicesDataView: React.FC = () => {
  const gradients = useGradients();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [searchValue, setSearchValue] = useState("");
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [clientId, setClientId] = useState<number | undefined>(undefined);
  
  const statusFilter = showUnpaidOnly ? "UNPAID" : undefined;
  const { data, refetch, isLoading } = useGetInvoicesQuery({ 
    client_id: clientId, 
    status: statusFilter 
  });
  const { clients } = useClients();

  const invoices = data?.items || [];

  const autocompleteOptions: AutocompleteOption[] = useMemo(() => 
    clients.map(client => ({
      label: `${client.first_name} ${client.last_name}`,
      id: client.id
    })), 
    [clients]
  );

  const filteredInvoices = useMemo(() => {
    if (!searchValue.trim()) {
      return invoices;
    }

    const searchLower = searchValue.toLowerCase();
    return invoices.filter(invoice => [
      invoice.id.toString(),
      invoice.client?.first_name,
      invoice.client?.last_name,
      `${invoice.client?.first_name} ${invoice.client?.last_name}`,
      invoice.description,
      invoice.type,
      invoice.status,
      invoice.amount?.toString()
    ].some(field => field?.toLowerCase().includes(searchLower)));
  }, [invoices, searchValue]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleUnpaidChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowUnpaidOnly(event.target.checked);
  };

  const handleClientChange = (_event: React.SyntheticEvent, value: AutocompleteOption | null) => {
    setClientId(value ? value.id : undefined);
  };

  // Refetch when filters change
  useEffect(() => {
    refetch();
  }, [clientId, statusFilter, refetch]);

  const columns = createEnhancedInvoiceColumns();

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
            <ReceiptLongIcon sx={{ fontSize: 28, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              Инвойсы
            </Typography>
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={showUnpaidOnly}
                onChange={handleUnpaidChange}
                sx={{
                  '& .MuiSwitch-switchBase': {
                    color: 'white',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.warning.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.warning.light,
                    opacity: 1,
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    opacity: 1,
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                color: 'white', 
                textShadow: '0 1px 4px rgba(80,0,120,0.25)' 
              }}>
                Только неоплаченные
              </Typography>
            }
            sx={{ mr: 2 }}
          />

          <Autocomplete
            sx={{ 
              width: 300,
              '& .MuiInputBase-root': {
                borderRadius: 2,
                background: alpha('#fff', 0.12),
                color: 'white',
              },
              '& .MuiOutlinedInput-notchedOutline': { 
                borderColor: alpha('#fff', 0.3) 
              },
              '&:hover .MuiOutlinedInput-notchedOutline': { 
                borderColor: '#fff' 
              },
              '& .MuiInputBase-input': { 
                color: 'white' 
              },
              '& .MuiInputLabel-root': { 
                color: alpha('#fff', 0.7) 
              },
              '& .MuiSvgIcon-root': { 
                color: 'white' 
              }
            }}
            onChange={handleClientChange}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Выбрать клиента" 
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { 
                    color: alpha('#fff', 0.8),
                    '&.Mui-focused': {
                      color: 'white'
                    }
                  }
                }}
              />
            )}
            options={autocompleteOptions}
          />
          
          <TextField
            id="search-invoices"
            placeholder="Поиск инвойсов..."
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

      {/* Unified DataGrid */}
      <UnifiedDataGrid
        rows={filteredInvoices}
        columns={columns}
        loading={isLoading}
        entityType="invoices"
        pageSizeOptions={[10, 25, 50]}
        initialPageSize={10}
        variant="elevated"
        ariaLabel="Таблица инвойсов"
      />
    </Box>
  );
};
