import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Typography, Chip, Box } from "@mui/material";
import { 
  createDateColumn, 
  createClickableColumn
} from "../../../components/UnifiedDataGrid";
import { 
  CardMembership, 
  FitnessCenter, 
  AcUnit,
  Autorenew
} from '@mui/icons-material';
import { IStudentSubscriptionView } from '../../subscriptions/models/subscription';
import dayjs from 'dayjs';

interface EnhancedStudentSubscriptionColumnsProps {
  onSubscriptionClick?: (subscription: IStudentSubscriptionView) => void;
}

export const createEnhancedStudentSubscriptionColumns = ({ 
  onSubscriptionClick 
}: EnhancedStudentSubscriptionColumnsProps = {}): GridColDef<IStudentSubscriptionView>[] => {
  return [
    createClickableColumn("id", "ID", {
      variant: 'text',
      onClick: onSubscriptionClick
    }, {
      width: 80,
      sortable: false,
    }),

    {
      field: "subscription_name",
      headerName: "Название абонемента",
      flex: 1.5,
      minWidth: 180,
      sortable: true,
      renderCell: (params: GridRenderCellParams<IStudentSubscriptionView, string>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CardMembership sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },

    {
      field: 'status',
      headerName: 'Статус',
      width: 120,
      renderCell: (params: GridRenderCellParams<IStudentSubscriptionView>) => {
        let chipColor: 'success' | 'error' | 'warning' | 'info' | 'default' = 'default';
        let chipLabel = params.value || 'Неизвестно';

        switch (params.value?.toUpperCase()) {
          case 'ACTIVE':
            chipColor = 'success';
            chipLabel = 'Активный';
            break;
          case 'EXPIRED':
          case 'CANCELLED':
            chipColor = 'error';
            chipLabel = 'Истёк';
            break;
          case 'FROZEN':
            chipColor = 'info';
            chipLabel = 'Заморожен';
            break;
          case 'PENDING_PAYMENT':
            chipColor = 'warning';
            chipLabel = 'Ожидает оплаты';
            break;
          default:
            chipColor = 'default';
        }

        return (
          <Chip 
            label={chipLabel} 
            color={chipColor} 
            size="small"
            sx={{ fontWeight: 500 }}
          />
        );
      }
    },

    createDateColumn('start_date', 'Начало', {
      dateFormat: 'DD.MM.YYYY',
      includeTime: false
    }, {
      width: 120,
    }),

    createDateColumn('end_date', 'Окончание', {
      dateFormat: 'DD.MM.YYYY',
      includeTime: false
    }, {
      width: 120,
    }),

    {
      field: 'sessions_left',
      headerName: 'Остаток',
      width: 100,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<IStudentSubscriptionView>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FitnessCenter sx={{ fontSize: 16, color: 'success.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value ?? 0}
          </Typography>
        </Box>
      ),
    },

    {
      field: 'transferred_sessions',
      headerName: 'Перенесено',
      width: 110,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<IStudentSubscriptionView>) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {params.value ?? 0}
        </Typography>
      ),
    },

    {
      field: 'is_auto_renew',
      headerName: 'Автопродление',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<IStudentSubscriptionView>) => {
        const isAutoRenew = params.value;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Autorenew sx={{ 
              fontSize: 16, 
              color: isAutoRenew ? 'success.main' : 'text.disabled' 
            }} />
            <Chip 
              label={isAutoRenew ? "Да" : "Нет"} 
              color={isAutoRenew ? "success" : "default"} 
              size="small"
              variant="outlined"
            />
          </Box>
        );
      }
    },

    {
      field: 'freeze_period',
      headerName: 'Заморозка',
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams<IStudentSubscriptionView>) => {
        const row = params.row;
        
        if (row.freeze_start_date && row.freeze_end_date) {
          const startDate = dayjs(row.freeze_start_date).format('DD.MM.YY');
          const endDate = dayjs(row.freeze_end_date).format('DD.MM.YY');
          
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AcUnit sx={{ fontSize: 16, color: 'info.main' }} />
              <Typography variant="body2" sx={{ color: 'info.main' }}>
                {startDate} - {endDate}
              </Typography>
            </Box>
          );
        }
        
        if (row.freeze_start_date) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AcUnit sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography variant="body2" sx={{ color: 'warning.main' }}>
                С {dayjs(row.freeze_start_date).format('DD.MM.YY')}
              </Typography>
            </Box>
          );
        }
        
        return (
          <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
            Нет
          </Typography>
        );
      }
    },
  ];
};
