import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  alpha, 
  InputAdornment,
  TextField,
  FormControlLabel,
  Switch
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import { useTheme } from '@mui/material/styles';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { UnifiedDataGrid } from '../../../components/UnifiedDataGrid';
import { createEnhancedClientContactColumns } from '../tables/enhancedClientContactColumns';
import { useListClientContactsQuery } from '../../../store/apis/clientContactsApi';
import { useClients } from '../../clients/hooks/clientManagementHooks';

export const UnifiedClientContactsDataGrid: React.FC = () => {
  const gradients = useGradients();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [searchValue, setSearchValue] = useState("");
  const [showAll, setShowAll] = useState(false);
  
  const { data, isLoading, refetch } = useListClientContactsQuery({ 
    status: showAll ? undefined : 'PENDING' 
  });
  const { clients } = useClients();
  
  const clientMap = useMemo(() => 
    new Map(clients.map(c => [c.id, c])), 
    [clients]
  );

  const contacts = data || [];

  const filteredContacts = useMemo(() => {
    if (!searchValue.trim()) {
      return contacts;
    }

    const searchLower = searchValue.toLowerCase();
    return contacts.filter(contact => {
      const client = clientMap.get(contact.client_id);
      return [
        contact.id.toString(),
        contact.reason,
        client?.first_name,
        client?.last_name,
        `${client?.first_name} ${client?.last_name}`,
        client?.phone_number,
        contact.note
      ].some(field => field?.toLowerCase().includes(searchLower));
    });
  }, [contacts, searchValue, clientMap]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleShowAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowAll(event.target.checked);
  };

  const columns = createEnhancedClientContactColumns({
    clientMap,
    onUpdate: refetch
  });

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
            <ContactPhoneIcon sx={{ fontSize: 28, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              Контакты клиентов
            </Typography>
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={showAll}
                onChange={handleShowAllChange}
                sx={{
                  '& .MuiSwitch-switchBase': {
                    color: 'white',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.info.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.info.light,
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
                Показать все статусы
              </Typography>
            }
            sx={{ mr: 2 }}
          />
          
          <TextField
            id="search-contacts"
            placeholder="Поиск контактов..."
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
        rows={filteredContacts}
        columns={columns}
        loading={isLoading}
        entityType="client-contacts"
        pageSizeOptions={[10, 25, 50]}
        initialPageSize={10}
        variant="elevated"
        ariaLabel="Таблица контактов клиентов"
      />
    </Box>
  );
};
