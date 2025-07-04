import React, { useState } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Chip,
  Paper,
  InputAdornment,
  Grid,
  Typography,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Collapse,
  Fade,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FilterList, Euro, Person, ExpandMore, ExpandLess, Clear } from '@mui/icons-material';
import dayjs from 'dayjs';
import { IPaymentHistoryFilter } from '../models/payment';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';

interface PaymentHistoryFiltersBarProps {
  filters: IPaymentHistoryFilter;
  onFiltersChange: (filters: IPaymentHistoryFilter) => void;
  clients: { id: number; first_name: string; last_name: string }[];
  users: { id: number; first_name: string; last_name: string; role: string }[];
  isLoading?: boolean;
}

const PaymentHistoryFiltersBar: React.FC<PaymentHistoryFiltersBarProps> = ({
  filters,
  onFiltersChange,
  clients,
  users,
  isLoading = false,
}) => {
  const theme = useTheme();
  const gradients = useGradients();
  const [showFilters, setShowFilters] = useState(false);

  const clientOptions = clients.map(client => ({
    label: `${client.first_name} ${client.last_name}`,
    id: client.id
  }));
  const userOptions = users
    .filter(user => user.role === 'ADMIN' || user.role === 'TRAINER')
    .map(user => ({
      label: `${user.first_name} ${user.last_name} (${user.role === 'ADMIN' ? 'админ' : 'тренер'})`,
      id: user.id
    }));

  const handleChange = (field: keyof IPaymentHistoryFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
      skip: 0,
    });
  };

  const handleClear = () => {
    onFiltersChange({ skip: 0, limit: 50 });
  };

  // Подсчитываем активные фильтры
  const activeFiltersCount = [
    filters.operation_type,
    filters.client_id,
    filters.created_by_id,
    filters.amount_min,
    filters.amount_max,
    filters.date_from,
    filters.date_to,
  ].filter(Boolean).length;

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: showFilters ? alpha(theme.palette.primary.main, 0.3) : 'divider',
        overflow: 'hidden',
        background: showFilters 
          ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.primary.main, 0.02)})`
          : theme.palette.background.paper,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.5),
          boxShadow: theme.palette.mode === 'dark' ? 4 : 2,
        },
      }}
    >
      {/* Заголовок с кнопкой показать/скрыть */}
      <Box
        sx={{
          p: 2.5,
          background: showFilters 
            ? gradients.primary
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.03)})`,
          borderBottom: showFilters ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            background: showFilters 
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.secondary.main, 0.8)})`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.primary.main, 0.06)})`,
            transform: 'translateY(-1px)',
          },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="20" cy="20" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: showFilters ? 0.3 : 0.1,
            transition: 'opacity 0.3s ease-in-out',
          }
        }}
        onClick={() => setShowFilters(!showFilters)}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', width: '100%' }}>
          <FilterList sx={{ 
            mr: 1.5, 
            color: showFilters ? 'white' : theme.palette.primary.main,
            fontSize: 24,
            transition: 'all 0.3s ease-in-out',
          }} />
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: showFilters ? 'white' : theme.palette.text.primary, 
            flex: 1,
            transition: 'color 0.3s ease-in-out',
          }}>
            Фильтры
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                sx={{
                  ml: 1.5,
                  background: showFilters ? 'rgba(255,255,255,0.2)' : gradients.success,
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 24,
                  fontWeight: 600,
                  border: showFilters ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  transition: 'all 0.3s ease-in-out',
                }}
              />
            )}
          </Typography>
          <IconButton 
            size="small" 
            sx={{ 
              color: showFilters ? 'white' : theme.palette.primary.main,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                background: showFilters ? 'rgba(255,255,255,0.1)' : alpha(theme.palette.primary.main, 0.1),
                transform: 'rotate(180deg)',
              }
            }}
          >
            {showFilters ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Collapsible контент фильтров */}
      <Collapse in={showFilters}>
        <Fade in={showFilters} timeout={300}>
          <Box sx={{ p: 3, background: alpha(theme.palette.background.paper, 0.8) }}>
            {/* Основные фильтры в одну строку */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              {/* Тип операции */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel sx={{ 
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                }}>
                  Тип операции
                </InputLabel>
                <Select
                  value={filters.operation_type || ''}
                  label="Тип операции"
                  onChange={e => handleChange('operation_type', e.target.value || undefined)}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  }}
                >
                  <MenuItem value="">Все операции</MenuItem>
                  <MenuItem value="PAYMENT">Платеж</MenuItem>
                  <MenuItem value="CANCELLATION">Отмена платежа</MenuItem>
                  <MenuItem value="INVOICE_PAYMENT">Оплата инвойса</MenuItem>
                </Select>
              </FormControl>

              {/* Клиент */}
              <Autocomplete
                size="small"
                options={clientOptions}
                getOptionLabel={option => option.label}
                value={clientOptions.find(opt => opt.id === filters.client_id) || null}
                onChange={(_, newValue) => handleChange('client_id', newValue?.id || undefined)}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Клиент"
                    placeholder="Выберите клиента"
                    sx={{ 
                      minWidth: 220,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disabled={isLoading}
              />

              {/* Создатель */}
              <Autocomplete
                size="small"
                options={userOptions}
                getOptionLabel={option => option.label}
                value={userOptions.find(opt => opt.id === filters.created_by_id) || null}
                onChange={(_, newValue) => handleChange('created_by_id', newValue?.id || undefined)}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Создатель"
                    placeholder="Выберите создателя"
                    sx={{ 
                      minWidth: 220,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disabled={isLoading}
              />
            </Stack>

            {/* Дополнительные фильтры во вторую строку */}
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              {/* Сумма от */}
              <TextField
                size="small"
                label="Сумма от"
                type="number"
                placeholder="0"
                value={filters.amount_min || ''}
                onChange={e => handleChange('amount_min', e.target.value ? Number(e.target.value) : undefined)}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start"><Euro fontSize="small" /></InputAdornment>,
                  sx: { minWidth: 130 }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  },
                }}
                disabled={isLoading}
              />

              {/* Сумма до */}
              <TextField
                size="small"
                label="Сумма до"
                type="number"
                placeholder="10000"
                value={filters.amount_max || ''}
                onChange={e => handleChange('amount_max', e.target.value ? Number(e.target.value) : undefined)}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start"><Euro fontSize="small" /></InputAdornment>,
                  sx: { minWidth: 130 }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  },
                }}
                disabled={isLoading}
              />

              {/* Дата от */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Дата от"
                  value={filters.date_from ? dayjs(filters.date_from) : null}
                  onChange={date => handleChange('date_from', date ? date.format('YYYY-MM-DD') : undefined)}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                      sx: { 
                        minWidth: 150,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                          },
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2,
                          },
                        },
                      }
                    } 
                  }}
                  disabled={isLoading}
                />
              </LocalizationProvider>

              {/* Дата до */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Дата до"
                  value={filters.date_to ? dayjs(filters.date_to) : null}
                  onChange={date => handleChange('date_to', date ? date.format('YYYY-MM-DD') : undefined)}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                      sx: { 
                        minWidth: 150,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                          },
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2,
                          },
                        },
                      }
                    } 
                  }}
                  disabled={isLoading}
                />
              </LocalizationProvider>

              {/* Кнопка очистить */}
              <Chip
                icon={<Clear sx={{ fontSize: 16 }} />}
                label="Очистить все"
                size="small"
                variant="outlined"
                onClick={handleClear}
                sx={{ 
                  fontSize: '0.75rem', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  color: theme.palette.primary.main,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: gradients.warning,
                    color: 'white',
                    borderColor: 'transparent',
                    transform: 'translateY(-1px)',
                    boxShadow: 2,
                  },
                  '& .MuiChip-icon': {
                    color: 'inherit',
                  }
                }}
              />
            </Stack>
          </Box>
        </Fade>
      </Collapse>
    </Paper>
  );
};

export default PaymentHistoryFiltersBar; 