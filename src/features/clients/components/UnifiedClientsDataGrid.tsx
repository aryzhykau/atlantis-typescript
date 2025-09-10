import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  InputAdornment, 
  alpha, 
  FormControlLabel, 
  Switch 
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { useTheme } from '@mui/material/styles';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { UnifiedDataGrid } from '../../../components/UnifiedDataGrid';
import { createEnhancedClientColumns } from '../tables/enhancedClientsColumns';
import { useClients } from "../hooks/clientManagementHooks";
import { IClientUserFormValues } from "../models/client";

interface UnifiedClientsDataGridProps {
  onClientSelect?: (clientId: number) => void;
  onAddClient?: () => void;
  onEditClient?: (clientId: number, clientData: IClientUserFormValues) => void;
  onDeleteClient?: (clientId: number) => void;
}

export const UnifiedClientsDataGrid: React.FC<UnifiedClientsDataGridProps> = ({ 
  onClientSelect, 
  onAddClient, 
}) => {
  const { clients, displayClients, setDisplayClients, isLoadingClients } = useClients();
  const gradients = useGradients();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  // Apply filters when clients data changes
  useEffect(() => {
    applyFilters(searchValue, showOnlyActive);
  }, [clients, searchValue, showOnlyActive]);

  const applyFilters = (search: string, activeOnly: boolean) => {
    if (!clients) return;
    
    let filteredClients = [...clients];

    // Apply active filter
    if (activeOnly) {
      filteredClients = filteredClients.filter(client => client.is_active);
    }

    // Apply search filter
    if (search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filteredClients = filteredClients.filter(client =>
        [
          client.first_name,
          client.last_name,
          client.email,
          `${client.phone_country_code} ${client.phone_number}`,
          client.whatsapp_country_code && client.whatsapp_number 
            ? `${client.whatsapp_country_code} ${client.whatsapp_number}`
            : ''
        ].some(field => field?.toLowerCase().includes(searchLower))
      );
    }

    setDisplayClients(filteredClients);
  };

  const handleCreateBtnClick = () => {
    if (onAddClient) {
      onAddClient();
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleActiveFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowOnlyActive(event.target.checked);
  };

  const handleRowClick = (row: any) => {
    if (onClientSelect) {
      onClientSelect(row.id);
    }
  };

  const columns = createEnhancedClientColumns();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with filters */}
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
            <PeopleIcon sx={{ fontSize: 28, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              Клиенты
            </Typography>
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyActive}
                onChange={handleActiveFilterChange}
                sx={{
                  '& .MuiSwitch-switchBase': {
                    color: 'white',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.success.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.success.light,
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
                Только активные
              </Typography>
            }
            sx={{ mr: 2 }}
          />
          
          <TextField
            id="search-client"
            placeholder="Поиск клиента..."
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
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateBtnClick}
            sx={{
              background: 'white',
              color: theme.palette.primary.main,
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              boxShadow: 'none',
              borderRadius: 2,
              '&:hover': {
                background: alpha('#ffffff', isDark ? 0.7 : 0.9),
              }
            }}
          >
            Добавить клиента
          </Button>
        </Box>
      </Paper>

      {/* Unified DataGrid */}
      <UnifiedDataGrid
        rows={displayClients || []}
        columns={columns}
        loading={isLoadingClients}
        entityType="clients"
        onRowClick={handleRowClick}
        pageSizeOptions={[10, 25, 50]}
        initialPageSize={10}
        variant="elevated"
        ariaLabel="Таблица клиентов"
      />
    </Box>
  );
};
