import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Typography, Chip } from "@mui/material";
import { 
  createClickableColumn, 
  createDateColumn 
} from "../../../components/UnifiedDataGrid";
import { Payment, Cancel, Receipt } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { IPaymentHistoryItem } from '../models/payment';

export const createEnhancedPaymentColumns = (): GridColDef[] => {
  const theme = useTheme();
  const gradients = useGradients();

  return [
    createClickableColumn("id", "ID", {
      variant: 'text'
    }, {
      width: 90,
      sortable: false,
    }),

    {
      field: "client_name",
      headerName: "Клиент",
      width: 200,
      flex: 1,
      minWidth: 150,
      sortable: true,
      valueGetter: (_value, row: IPaymentHistoryItem) => 
        `${row.client_first_name} ${row.client_last_name}`,
    },

    {
      field: "operation_type",
      headerName: "Тип операции",
      width: 180,
      sortable: true,
      renderCell: (params: GridRenderCellParams<IPaymentHistoryItem>) => {
        const operationType = params.row?.operation_type;
        let label = '';
        let gradient = '';
        let icon = null;
        
        switch (operationType) {
          case 'PAYMENT':
            label = 'Платеж';
            gradient = gradients.success;
            icon = <Payment sx={{ fontSize: 16 }} />;
            break;
          case 'CANCELLATION':
            label = 'Отмена';
            gradient = gradients.warning;
            icon = <Cancel sx={{ fontSize: 16 }} />;
            break;
          case 'INVOICE_PAYMENT':
            label = 'Оплата инвойса';
            gradient = gradients.info;
            icon = <Receipt sx={{ fontSize: 16 }} />;
            break;
          default:
            label = operationType || '';
            gradient = gradients.primary;
            icon = <Payment sx={{ fontSize: 16 }} />;
        }
        
        return (
          <Chip
            icon={icon}
            label={label}
            size="small"
            sx={{
              background: gradient,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: 1.5,
              '& .MuiChip-label': {
                px: 1,
              },
              '& .MuiChip-icon': {
                color: 'white',
              },
              boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
            }}
          />
        );
      },
    },

    {
      field: "amount",
      headerName: "Сумма",
      width: 120,
      type: "number",
      sortable: true,
      renderCell: (params: GridRenderCellParams<IPaymentHistoryItem>) => {
        const amount = params.row?.amount;
        const operationType = params.row?.operation_type;
        
        // Определяем цвет в зависимости от типа операции и знака суммы
        let color = theme.palette.text.primary;
        if (operationType === 'PAYMENT' || (operationType === 'INVOICE_PAYMENT' && amount > 0)) {
          color = theme.palette.success.main;
        } else if (operationType === 'CANCELLATION' || amount < 0) {
          color = theme.palette.error.main;
        }
        
        const formattedValue = amount != null ? amount.toFixed(2) + ' €' : '0.00 €';
        
        return (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: color,
              fontSize: '0.875rem',
            }}
          >
            {formattedValue}
          </Typography>
        );
      },
    },

    {
      field: "balance_before",
      headerName: "Баланс до",
      width: 120,
      type: "number",
      sortable: true,
      renderCell: (params: GridRenderCellParams<IPaymentHistoryItem>) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.row.balance_before != null ? `${params.row.balance_before.toFixed(2)} €` : '0.00 €'}
        </Typography>
      ),
    },

    {
      field: "balance_after",
      headerName: "Баланс после",
      width: 120,
      type: "number",
      sortable: true,
      renderCell: (params: GridRenderCellParams<IPaymentHistoryItem>) => {
        const balanceAfter = params.row.balance_after;
        const color = balanceAfter >= 0 ? theme.palette.success.main : theme.palette.error.main;
        
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600, 
              color: color
            }}
          >
            {balanceAfter != null ? `${balanceAfter.toFixed(2)} €` : '0.00 €'}
          </Typography>
        );
      },
    },

    createDateColumn("created_at", "Дата создания", {}, {
      width: 150,
      sortable: true,
    }),

    {
      field: "created_by_name",
      headerName: "Создан кем",
      width: 180,
      flex: 1,
      minWidth: 120,
      sortable: true,
      valueGetter: (_value, row: IPaymentHistoryItem) => 
        `${row.created_by_first_name} ${row.created_by_last_name}`,
    },

    {
      field: "description",
      headerName: "Описание",
      flex: 2,
      minWidth: 200,
      sortable: true,
      renderCell: (params: GridRenderCellParams<IPaymentHistoryItem>) => (
        <Typography 
          variant="body2" 
          sx={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%'
          }}
          title={params.row.description || params.row.payment_description || ''}
        >
          {params.row.description || params.row.payment_description || '—'}
        </Typography>
      ),
    },
  ];
};
