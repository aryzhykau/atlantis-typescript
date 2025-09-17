import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Typography, Chip } from "@mui/material";
import { 
  createClickableColumn, 
  createDateColumn
} from "../../../components/UnifiedDataGrid";
import { CheckCircle, Cancel, Receipt, FitnessCenter, Repeat, Pending } from '@mui/icons-material';
import { IInvoiceGet, InvoiceType, InvoiceStatus } from '../models/invoice';

export const createEnhancedInvoiceColumns = (): GridColDef[] => [
  createClickableColumn("id", "ID", {
    variant: 'text'
  }, {
    width: 90,
    sortable: false,
  }),

  createDateColumn("created_at", "Дата выставления", {}, {
    width: 150,
    sortable: true,
  }),

  {
    field: "status",
    headerName: "Статус",
    width: 140,
    sortable: true,
    renderCell: (params: GridRenderCellParams<IInvoiceGet>) => {
      const status = params.row.status as InvoiceStatus;
      const isPaid = params.row.paid_at !== null;
      
      let label = '';
      let color: 'success' | 'error' | 'warning' | 'default' = 'default';
      let icon = null;

      if (isPaid || status === 'PAID') {
        label = 'Оплачен';
        color = 'success';
        icon = <CheckCircle sx={{ fontSize: 16 }} />;
      }else if (status === 'CANCELLED') {
        label = 'Отменён';
        color = 'error';
        icon = <Cancel sx={{ fontSize: 16 }} />;
      } else if (status === 'PENDING') {
        label = 'В ожидании';
        color = 'default';
        icon = <Pending sx={{ fontSize: 16 }} />;
      } else {
        label = 'Не оплачен';
        color = 'warning';
      }

      return (
        <Chip
          icon={icon || undefined}
          label={label}
          size="small"
          color={color}
          variant={isPaid ? 'filled' : 'outlined'}
          sx={{
            fontWeight: 500,
            fontSize: '0.75rem',
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
    renderCell: (params: GridRenderCellParams<IInvoiceGet>) => {
      const amount = params.row.amount;
      
      return (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            fontSize: '0.875rem',
          }}
        >
          {amount != null ? `${amount.toFixed(2)} €` : '0.00 €'}
        </Typography>
      );
    },
  },

  {
    field: "client_name",
    headerName: "Клиент",
    width: 200,
    flex: 1,
    minWidth: 150,
    sortable: true,
    valueGetter: (_value, row: IInvoiceGet) => 
      row.client ? `${row.client.first_name} ${row.client.last_name}` : 'Не указан',
    renderCell: (params: GridRenderCellParams<IInvoiceGet>) => (
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 500,
          color: params.row.client ? 'text.primary' : 'text.secondary'
        }}
      >
        {params.value}
      </Typography>
    ),
  },

  {
    field: "type",
    headerName: "Тип",
    width: 180,
    sortable: true,
    renderCell: (params: GridRenderCellParams<IInvoiceGet>) => {
      const invoiceType = params.row.type as InvoiceType;
      let label = '';
      let color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' = 'primary';
      let icon = null;

      switch (invoiceType) {
        case 'SUBSCRIPTION':
          label = 'Оплата подписки';
          color = 'primary';
          icon = params.row.is_auto_renewal ? <Repeat sx={{ fontSize: 16 }} /> : <Receipt sx={{ fontSize: 16 }} />;
          break;
        case 'TRAINING':
          label = 'Разовая тренировка';
          color = 'secondary';
          icon = <FitnessCenter sx={{ fontSize: 16 }} />;
          break;
        default:
          label = 'Неизвестный тип';
          color = 'warning';
      }

      return (
        <Chip
          icon={icon || undefined}
          label={label}
          size="small"
          color={color}
          variant="outlined"
          sx={{
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      );
    },
  },

  createDateColumn("paid_at", "Дата оплаты", {}, {
    width: 150,
    sortable: true,
  }),

  {
    field: "description",
    headerName: "Описание",
    flex: 2,
    minWidth: 200,
    sortable: true,
    renderCell: (params: GridRenderCellParams<IInvoiceGet>) => (
      <Typography 
        variant="body2" 
        sx={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}
        title={params.row.description || ''}
      >
        {params.row.description || '—'}
      </Typography>
    ),
  },
];
