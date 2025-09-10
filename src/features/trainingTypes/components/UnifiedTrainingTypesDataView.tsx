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
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { UnifiedDataGrid } from '../../../components/UnifiedDataGrid';
import { createEnhancedTrainingTypeColumns } from '../tables/enhancedTrainingTypeColumns';
import { useGetTrainingTypesQuery } from '../../../store/apis/trainingTypesApi';
import { ITrainingType } from '../../training-types/models/trainingType';
import TrainingTypeForm from './TrainingTypeForm';

const trainingTypeInitialValues: Partial<ITrainingType> = {
  name: "", 
  price: null, 
  max_participants: 4, 
  color: "#FFFFFF", 
  is_subscription_only: false, 
  is_active: true
};

export const UnifiedTrainingTypesDataView: React.FC = () => {
  const gradients = useGradients();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [searchValue, setSearchValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(true);
  const [currentTrainingTypeForForm, setCurrentTrainingTypeForForm] = useState<Partial<ITrainingType> | null>(null);
  
  const { data: trainingTypesResponse, isLoading: isLoadingTrainingTypes } = useGetTrainingTypesQuery({});
  const trainingTypes: ITrainingType[] = trainingTypesResponse || [];

  const filteredTrainingTypes = useMemo(() => {
    if (!searchValue.trim()) {
      return trainingTypes;
    }

    const searchLower = searchValue.toLowerCase();
    return trainingTypes.filter(trainingType => [
      trainingType.name,
      trainingType.price?.toString(),
      trainingType.max_participants?.toString()
    ].some(field => field?.toLowerCase().includes(searchLower)));
  }, [trainingTypes, searchValue]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleCreateButtonClick = () => {
    setCurrentTrainingTypeForForm(trainingTypeInitialValues);
    setIsCreating(true);
    setModalOpen(true);
  };

  const handleEdit = (trainingType: ITrainingType) => {
    setCurrentTrainingTypeForForm(trainingType);
    setIsCreating(false);
    setModalOpen(true);
  };

  const onFormClose = () => {
    setModalOpen(false);
    setCurrentTrainingTypeForForm(null);
  };

  const columns = createEnhancedTrainingTypeColumns({
    onEdit: handleEdit
  });

  return (
    <Box sx={{ width: '49%', display: 'flex', flexDirection: 'column' }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <FitnessCenterIcon sx={{ fontSize: 28, mr: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              Виды тренировок
            </Typography>
          </Box>
          
          <TextField
            id="search-training-types"
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
              color: theme.palette.primary.main,
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
        rows={filteredTrainingTypes}
        columns={columns}
        loading={isLoadingTrainingTypes}
        entityType="training-types"
        pageSizeOptions={[10, 25, 50]}
        initialPageSize={10}
        variant="elevated"
        ariaLabel="Таблица видов тренировок"
      />

      {/* Form Modal */}
      <Dialog 
        open={modalOpen} 
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
      >
        <DialogContent sx={{ p: 0, '&:first-of-type': { pt: 0 } }}>
          {currentTrainingTypeForForm && (
            <TrainingTypeForm
              trainingTypeId={currentTrainingTypeForForm.id}
              initialValues={currentTrainingTypeForForm}
              onClose={onFormClose}
              isCreating={isCreating}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
