import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  alpha, 
  InputAdornment,
  TextField,
  Button,
  Dialog,
  DialogContent
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { UnifiedDataGrid } from '../../../components/UnifiedDataGrid';
import { createEnhancedSubscriptionColumns } from '../tables/enhancedSubscriptionColumns';
import { useGetSubscriptionsQuery } from '../../../store/apis/subscriptionsApi';
import { ISubscriptionResponse, ISubscriptionCreatePayload } from '../models/subscription';
import SubscriptionForm from './SubscriptionForm';

const subscriptionInitialValues: ISubscriptionCreatePayload = {
  name: "", 
  price: 0, 
  is_active: true, 
  validity_days: 30, 
  number_of_sessions: 1
};

export const UnifiedSubscriptionsDataView: React.FC = () => {
  const gradients = useGradients();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [searchValue, setSearchValue] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const [formInitValues, setFormInitValues] = useState<Partial<ISubscriptionResponse>>(subscriptionInitialValues);
  const [isCreating, setIsCreating] = useState(true);
  
  const { data: subscriptionsData, isLoading, isError, error } = useGetSubscriptionsQuery();
  const subscriptions = subscriptionsData?.items || [];

  const filteredSubscriptions = useMemo(() => {
    if (!searchValue.trim()) {
      return subscriptions;
    }

    const searchLower = searchValue.toLowerCase();
    return subscriptions.filter(subscription => [
      subscription.name,
      subscription.price?.toString(),
      subscription.number_of_sessions?.toString(),
      subscription.validity_days?.toString()
    ].some(field => field?.toLowerCase().includes(searchLower)));
  }, [subscriptions, searchValue]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleCreateButtonClick = () => {
    setIsCreating(true);
    setSubscriptionId(null);
    setFormInitValues(subscriptionInitialValues);
    setFormModalOpen(true);
  };

  const handleEdit = (row: ISubscriptionResponse) => {
    setSubscriptionId(row.id);
    const initialData: Partial<ISubscriptionResponse> = {
      name: row.name,
      price: row.price,
      validity_days: row.validity_days,
      is_active: row.is_active,
      number_of_sessions: row.number_of_sessions,
      id: row.id
    };
    setFormInitValues(initialData);
    setIsCreating(false);
    setFormModalOpen(true);
  };

  const onFormClose = () => {
    setFormModalOpen(false);
    setSubscriptionId(null);
  };

  const columns = createEnhancedSubscriptionColumns({
    onEdit: handleEdit
  });

  if (isError) {
    return (
      <Box sx={{ width: '49%', display: 'flex', flexDirection: 'column' }}>
        <Typography color="error">
          Ошибка загрузки абонементов: {JSON.stringify(error)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '49%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: gradients.info,
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
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <CardMembershipIcon sx={{ fontSize: 28, mr: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              Абонементы
            </Typography>
          </Box>
          
          <TextField
            id="search-subscriptions"
            placeholder="Поиск..."
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
              width: 200,
              input: { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#fff', 0.3) },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
              '& .MuiInputAdornment-root svg': { color: 'white' },
            }}
          />
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateButtonClick}
            sx={{
              background: 'white',
              color: theme.palette.info.main,
              fontWeight: 600,
              textTransform: 'none',
              px: 2,
              boxShadow: 'none',
              borderRadius: 2,
              fontSize: '0.875rem',
              '&:hover': {
                background: alpha('#ffffff', isDark ? 0.7 : 0.9),
              }
            }}
          >
            Добавить
          </Button>
        </Box>
      </Paper>

      {/* Unified DataGrid */}
      <UnifiedDataGrid
        rows={filteredSubscriptions}
        columns={columns}
        loading={isLoading}
        entityType="subscriptions"
        pageSizeOptions={[10, 25, 50]}
        initialPageSize={10}
        variant="elevated"
        ariaLabel="Таблица абонементов"
      />

      {/* Form Modal */}
      <Dialog
        open={formModalOpen}
        onClose={onFormClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ 
          sx: { 
            m: { xs: 1, sm: 2 }, 
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          } 
        }}
        aria-labelledby="dialog-title-subscription-form"
      >
        <DialogContent sx={{ p: 0, '&:first-of-type': { pt: 0 } }}>
          <SubscriptionForm
            isCreating={isCreating}
            initialValues={formInitValues}
            onClose={onFormClose}
            useDialogContainer={false}
            key={subscriptionId || 'new'}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
