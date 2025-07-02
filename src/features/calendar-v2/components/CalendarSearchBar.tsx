import React, { useMemo } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Chip,
  Paper,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { Search, FilterList, Person, School, FitnessCenter } from '@mui/icons-material';

export interface CalendarFilters {
  searchText: string;
  trainerIds: number[];
  trainingTypeIds: number[];
  studentIds: number[];
}

export interface FilterOption {
  id: number;
  label: string;
  type: 'trainer' | 'trainingType' | 'student';
}

interface CalendarSearchBarProps {
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
  trainerOptions: FilterOption[];
  trainingTypeOptions: FilterOption[];
  studentOptions: FilterOption[];
  isLoading?: boolean;
}

const CalendarSearchBar: React.FC<CalendarSearchBarProps> = ({
  filters,
  onFiltersChange,
  trainerOptions,
  trainingTypeOptions,
  studentOptions,
  isLoading = false,
}) => {
  const theme = useTheme();

  // Объединяем все опции для общего поиска
  const allOptions = useMemo(() => [
    ...trainerOptions,
    ...trainingTypeOptions,
    ...studentOptions,
  ], [trainerOptions, trainingTypeOptions, studentOptions]);

  // Выбранные опции для отображения в чипах
  const selectedOptions = useMemo(() => {
    const selected: FilterOption[] = [];
    
    filters.trainerIds.forEach(id => {
      const option = trainerOptions.find(o => o.id === id);
      if (option) selected.push(option);
    });
    
    filters.trainingTypeIds.forEach(id => {
      const option = trainingTypeOptions.find(o => o.id === id);
      if (option) selected.push(option);
    });
    
    filters.studentIds.forEach(id => {
      const option = studentOptions.find(o => o.id === id);
      if (option) selected.push(option);
    });
    
    return selected;
  }, [filters, trainerOptions, trainingTypeOptions, studentOptions]);

  const handleSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchText: event.target.value,
    });
  };

  const handleFilterChange = (event: any, newValue: FilterOption[]) => {
    const newFilters = {
      ...filters,
      trainerIds: newValue.filter(o => o.type === 'trainer').map(o => o.id),
      trainingTypeIds: newValue.filter(o => o.type === 'trainingType').map(o => o.id),
      studentIds: newValue.filter(o => o.type === 'student').map(o => o.id),
    };
    onFiltersChange(newFilters);
  };

  const handleRemoveFilter = (optionToRemove: FilterOption) => {
    const newSelected = selectedOptions.filter(option => 
      !(option.id === optionToRemove.id && option.type === optionToRemove.type)
    );
    handleFilterChange(null, newSelected);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchText: '',
      trainerIds: [],
      trainingTypeIds: [],
      studentIds: [],
    });
  };

  const getOptionIcon = (type: 'trainer' | 'trainingType' | 'student') => {
    switch (type) {
      case 'trainer': return <Person sx={{ fontSize: 16 }} />;
      case 'trainingType': return <FitnessCenter sx={{ fontSize: 16 }} />;
      case 'student': return <School sx={{ fontSize: 16 }} />;
    }
  };

  const getOptionColor = (type: 'trainer' | 'trainingType' | 'student') => {
    switch (type) {
      case 'trainer': return theme.palette.primary.main;
      case 'trainingType': return theme.palette.secondary.main;
      case 'student': return theme.palette.success.main;
    }
  };

  const hasActiveFilters = filters.searchText || selectedOptions.length > 0;

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 1,
        background: hasActiveFilters 
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`
          : undefined,
        border: hasActiveFilters 
          ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          : `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
      }}
    >
      <Stack spacing={2}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList sx={{ color: theme.palette.text.secondary }} />
          <Typography variant="subtitle2" color="text.secondary">
            Поиск и фильтрация тренировок
          </Typography>
          {hasActiveFilters && (
            <Chip
              label="Очистить все"
              size="small"
              variant="outlined"
              onClick={clearAllFilters}
              sx={{ ml: 'auto', fontSize: '0.7rem' }}
            />
          )}
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* Поиск по тексту */}
          <TextField
            placeholder="Поиск по названию, тренеру, студенту..."
            value={filters.searchText}
            onChange={handleSearchTextChange}
            disabled={isLoading}
            size="small"
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Фильтры по категориям */}
          <Autocomplete
            multiple
            size="small"
            options={allOptions}
            value={selectedOptions}
            onChange={handleFilterChange}
            disabled={isLoading}
            groupBy={(option) => {
              switch (option.type) {
                case 'trainer': return '👨‍💼 Тренеры';
                case 'trainingType': return '🏃‍♂️ Типы тренировок';
                case 'student': return '🎓 Студенты';
              }
            }}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => 
              option.id === value.id && option.type === value.type
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Выберите фильтры..."
                sx={{
                  minWidth: { xs: '100%', sm: 300 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  }
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={`${option.type}-${option.id}`}
                  label={option.label}
                  size="small"
                  icon={getOptionIcon(option.type)}
                  onDelete={() => handleRemoveFilter(option)}
                  sx={{
                    backgroundColor: alpha(getOptionColor(option.type), 0.1),
                    borderColor: getOptionColor(option.type),
                    color: getOptionColor(option.type),
                    '& .MuiChip-icon': {
                      color: getOptionColor(option.type),
                    },
                    '& .MuiChip-deleteIcon': {
                      color: getOptionColor(option.type),
                    },
                  }}
                  variant="outlined"
                />
              ))
            }
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getOptionIcon(option.type)}
                <Typography variant="body2">{option.label}</Typography>
              </Box>
            )}
          />
        </Stack>

        {/* Активные фильтры */}
        {selectedOptions.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Активные фильтры:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {selectedOptions.map((option) => (
                <Chip
                  key={`${option.type}-${option.id}`}
                  label={option.label}
                  size="small"
                  icon={getOptionIcon(option.type)}
                  onDelete={() => handleRemoveFilter(option)}
                  sx={{
                    backgroundColor: alpha(getOptionColor(option.type), 0.1),
                    borderColor: getOptionColor(option.type),
                    color: getOptionColor(option.type),
                    '& .MuiChip-icon': {
                      color: getOptionColor(option.type),
                    },
                    '& .MuiChip-deleteIcon': {
                      color: getOptionColor(option.type),
                    },
                  }}
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default CalendarSearchBar; 