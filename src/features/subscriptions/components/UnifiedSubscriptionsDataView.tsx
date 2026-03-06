import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  alpha,
  InputAdornment,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogContent,
} from '@mui/material';
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
  name: '',
  price: 0,
  is_active: true,
  validity_days: 30,
  number_of_sessions: 1,
  sessions_per_week: null,
};

export const UnifiedSubscriptionsDataView: React.FC = () => {
  const gradients = useGradients();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [searchValue, setSearchValue] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const [formInitValues, setFormInitValues] = useState<Partial<ISubscriptionResponse>>(subscriptionInitialValues);
  const [isCreating, setIsCreating] = useState(true);

  const { data: subscriptionsData, isLoading, isError } = useGetSubscriptionsQuery();
  const subscriptions = subscriptionsData?.items || [];

  const filteredSubscriptions = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return subscriptions;
    return subscriptions.filter((s) =>
      [s.name, s.price?.toString()].some((f) => f?.toLowerCase().includes(q))
    );
  }, [subscriptions, searchValue]);

  const handleCreateButtonClick = () => {
    setIsCreating(true);
    setSubscriptionId(null);
    setFormInitValues(subscriptionInitialValues);
    setFormModalOpen(true);
  };

  const handleEdit = (row: ISubscriptionResponse) => {
    setSubscriptionId(row.id);
    setFormInitValues({ ...row });
    setIsCreating(false);
    setFormModalOpen(true);
  };

  const onFormClose = () => {
    setFormModalOpen(false);
    setSubscriptionId(null);
  };

  const columns = createEnhancedSubscriptionColumns({ onEdit: handleEdit });

  if (isError) {
    return (
      <Box sx={{ width: '49%' }}>
        <Typography color="error">Ошибка загрузки абонементов</Typography>
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
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='2' fill='%23fff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
            opacity: isDark ? 0.18 : 0.3,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <CardMembershipIcon sx={{ fontSize: 26, mr: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Абонементы
            </Typography>
            <Chip
              label={subscriptions.length}
              size="small"
              sx={{ ml: 1.5, background: alpha('#fff', 0.2), color: 'white', fontWeight: 700, height: 22 }}
            />
          </Box>
          <TextField
            placeholder="Поиск..."
            size="small"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'white', fontSize: 18 }} /></InputAdornment>,
              sx: { borderRadius: 2, background: alpha('#fff', 0.12), color: 'white', '& input': { color: 'white', '&::placeholder': { color: alpha('#fff', 0.7) } } },
            }}
            sx={{
              width: 180,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#fff', 0.3) },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateButtonClick}
            sx={{
              background: 'white',
              color: theme.palette.info.main,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': { background: alpha('#fff', 0.9) },
            }}
          >
            Добавить
          </Button>
        </Box>
      </Paper>

      {/* DataGrid */}
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
        PaperProps={{ sx: { m: { xs: 1, sm: 2 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' } }}
      >
        <DialogContent sx={{ p: 0, '&:first-of-type': { pt: 0 } }}>
          <SubscriptionForm
            isCreating={isCreating}
            initialValues={formInitValues}
            onClose={onFormClose}
            key={subscriptionId ?? 'new'}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
