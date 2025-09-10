import React, { useState, useMemo } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  InputAdornment, 
  alpha, 
  FormControlLabel, 
  Switch,
  Dialog,
  DialogContent,
  IconButton
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { UnifiedDataGrid } from '../../../components/UnifiedDataGrid';
import { createEnhancedTrainerColumns } from '../tables/enhancedTrainersColumns';
import { useGetTrainersQuery, useCreateTrainerMutation } from '../../../store/apis/trainersApi';
import { ITrainerCreatePayload, ITrainerUpdatePayload, UserRole } from '../models/trainer';
import { TrainerForm } from './TrainerForm';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useCurrentUser } from '../../../hooks/usePermissions';

export const UnifiedTrainersDataGrid: React.FC = () => {
  const { data: trainersListResponse, isLoading, refetch } = useGetTrainersQuery();
  const [createTrainer, { isLoading: isCreating }] = useCreateTrainerMutation();
  const { displaySnackbar } = useSnackbar();
  const { user } = useCurrentUser();
  
  const gradients = useGradients();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const trainers = trainersListResponse?.trainers || [];

  const filteredTrainers = useMemo(() => {
    let filtered = [...trainers];

    // Apply active filter
    if (showOnlyActive) {
      filtered = filtered.filter(trainer => trainer.is_active);
    }

    // Apply search filter
    if (searchValue.trim() !== '') {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(trainer =>
        [
          trainer.first_name,
          trainer.last_name,
          trainer.email,
          `${trainer.phone_country_code} ${trainer.phone_number}`,
          `${trainer.first_name} ${trainer.last_name}`
        ].some(field => field?.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [trainers, showOnlyActive, searchValue]);

  const handleCreateBtnClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleActiveFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowOnlyActive(event.target.checked);
  };

  const handleCreateTrainer = async (values: ITrainerCreatePayload | ITrainerUpdatePayload) => {
    try {
      // For create, we need to ensure all required fields are present
      const createPayload = values as ITrainerCreatePayload;
      await createTrainer(createPayload).unwrap();
      displaySnackbar('Тренер успешно создан', 'success');
      handleCloseModal();
      refetch();
    } catch (error: any) {
      displaySnackbar(error?.data?.detail || 'Ошибка при создании тренера', 'error');
    }
  };

  const columns = createEnhancedTrainerColumns(user?.role as UserRole);

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
            <GroupIcon sx={{ fontSize: 28, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              Тренеры
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
            id="search-trainer"
            placeholder="Поиск тренера..."
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
            Добавить тренера
          </Button>
        </Box>
      </Paper>

      {/* Unified DataGrid */}
      <UnifiedDataGrid
        rows={filteredTrainers}
        columns={columns}
        loading={isLoading}
        entityType="trainers"
        pageSizeOptions={[10, 25, 50]}
        initialPageSize={10}
        variant="elevated"
        ariaLabel="Таблица тренеров"
      />

      {/* Create Trainer Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }
        }}
      >
        {/* Gradient header */}
        <Box
          sx={{
            p: 3,
            background: gradients.primary,
            color: 'white',
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
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              <GroupIcon sx={{ fontSize: 28, mr: 1 }} /> Добавить тренера
            </Typography>
            <IconButton
              aria-label="Закрыть"
              onClick={handleCloseModal}
              sx={{
                color: 'white',
                ml: 2,
                '&:hover': {
                  background: alpha('#ffffff', 0.15),
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 3, '&:first-of-type': { pt: 0 } }}>
          <TrainerForm
            title="Добавить тренера"
            isEdit={false}
            onSubmit={handleCreateTrainer}
            onClose={handleCloseModal}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
