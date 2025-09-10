import { 
  DataGrid, 
  GridRowParams,
  GridEventListener 
} from '@mui/x-data-grid';
import { 
  Box, 
  Paper, 
  Typography, 
  useTheme, 
  alpha,
  Alert 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGradients } from '../../features/trainer-mobile/hooks/useGradients';
import { 
  UnifiedDataGridProps, 
  ENTITY_NAVIGATION_CONFIG 
} from './types';
import { DataGridSkeleton } from './components/DataGridSkeleton';

export const UnifiedDataGrid = <T extends Record<string, any>>({
  rows,
  columns,
  loading = false,
  entityType,
  onRowClick,
  getRowNavigationUrl,
  pageSizeOptions = [10, 25, 50],
  initialPageSize = 10,
  serverSide = false,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  title,
  subtitle,
  icon,
  hideHeader = false,
  variant = 'default',
  height = 400,
  ariaLabel,
  sx,
}: UnifiedDataGridProps<T>) => {
  const theme = useTheme();
  const gradients = useGradients();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const handleRowClick: GridEventListener<'rowClick'> = (params: GridRowParams) => {
    if (onRowClick) {
      onRowClick(params.row);
      return;
    }

    if (entityType) {
      const config = ENTITY_NAVIGATION_CONFIG[entityType];
      
      if (config.hasDetailPage) {
        const idField = config.idField || 'id';
        const entityId = params.row[idField];
        const url = getRowNavigationUrl 
          ? getRowNavigationUrl(params.row)
          : `${config.baseUrl}/${entityId}`;
        navigate(url);
      } else {
        // Show "Coming Soon" alert for entities without detail pages
        alert('Детальная страница скоро будет доступна!');
      }
    }
  };

  const getDataGridStyling = () => {
    const baseStyles = {
      borderRadius: 3,
      fontSize: '1rem',
      color: theme.palette.text.primary,
      '& .MuiDataGrid-columnHeaders': {
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08)} 0%, ${alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06)} 100%)`,
        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderRadius: '12px 12px 0 0',
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: theme.palette.primary.main,
        },
        '& .MuiDataGrid-columnSeparator': {
          color: alpha(theme.palette.primary.main, 0.3),
        },
      },
      '& .MuiDataGrid-row': {
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          background: alpha(theme.palette.primary.main, isDark ? 0.13 : 0.07),
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
        '&:nth-of-type(even)': {
          backgroundColor: alpha(theme.palette.action.hover, 0.02),
        },
      },
      '& .MuiDataGrid-cell': {
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        fontSize: '0.875rem',
        fontWeight: 500,
        padding: '12px 16px',
        lineHeight: 1.5,
        '&:focus': {
          outline: 'none',
        },
        '&:focus-within': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: -2,
        },
      },
      '& .MuiDataGrid-footerContainer': {
        background: 'transparent',
        borderTop: `1px solid ${theme.palette.divider}`,
      },
      '& .MuiDataGrid-selectedRowCount': {
        display: 'none',
      },
      '& .MuiDataGrid-virtualScroller': {
        // Improve scrolling performance
        '&::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '&::-webkit-scrollbar-track': {
          background: alpha(theme.palette.divider, 0.1),
        },
        '&::-webkit-scrollbar-thumb': {
          background: alpha(theme.palette.primary.main, 0.3),
          borderRadius: 4,
          '&:hover': {
            background: alpha(theme.palette.primary.main, 0.5),
          },
        },
      },
    };

    switch (variant) {
      case 'compact':
        return {
          ...baseStyles,
          '& .MuiDataGrid-cell': {
            ...baseStyles['& .MuiDataGrid-cell'],
            paddingTop: 8,
            paddingBottom: 8,
          },
        };
      case 'elevated':
        return {
          ...baseStyles,
          background: isDark 
            ? alpha(theme.palette.background.paper, 0.85) 
            : 'white',
          boxShadow: isDark 
            ? '0 4px 16px 0 rgba(0,0,0,0.25)' 
            : '0 4px 16px 0 rgba(80,0,120,0.08)',
        };
      default:
        return {
          ...baseStyles,
          background: isDark 
            ? alpha(theme.palette.background.paper, 0.95) 
            : 'white',
          boxShadow: isDark 
            ? '0 8px 32px 0 rgba(0,0,0,0.12)' 
            : '0 8px 32px 0 rgba(80,0,120,0.08)',
          borderRadius: '12px',
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          overflow: 'hidden',
        };
    }
  };

  const renderHeader = () => {
    if (hideHeader || !title) return null;

    return (
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
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: subtitle ? 1 : 0 }}>
            {icon && (
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                {icon}
              </Box>
            )}
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              {title}
            </Typography>
          </Box>
          {subtitle && (
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Paper>
    );
  };

  // Show skeleton loader when loading
  if (loading && (!rows || rows.length === 0)) {
    return (
      <Box sx={{ width: '100%', ...sx }}>
        {renderHeader()}
        <DataGridSkeleton 
          height={height}
          showHeader={false}
          rows={10}
          columns={columns.length}
        />
      </Box>
    );
  }

  if (!rows || rows.length === 0 && !loading) {
    return (
      <Box>
        {renderHeader()}
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 3,
            '& .MuiAlert-message': {
              fontWeight: 500,
            }
          }}
        >
          Данные отсутствуют
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {renderHeader()}
      
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={pageSizeOptions}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: initialPageSize,
            },
          },
        }}
        disableRowSelectionOnClick
        onRowClick={handleRowClick}
        // Server-side pagination props
        {...(serverSide && {
          paginationMode: 'server' as const,
          rowCount,
          paginationModel,
          onPaginationModelChange,
        })}
        sx={getDataGridStyling()}
        aria-label={ariaLabel || `Таблица данных${title ? ` для ${title}` : ''}`}
        // Performance optimizations
        rowBufferPx={100}
        columnBufferPx={150}
        disableColumnResize={false}
        disableColumnMenu={false}
        sortingOrder={['asc', 'desc']}
      />
    </Box>
  );
};
