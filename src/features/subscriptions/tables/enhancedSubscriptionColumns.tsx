import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Typography, Button } from "@mui/material";
import { 
  createClickableColumn,
  createStatusColumn
} from "../../../components/UnifiedDataGrid";
import { 
  CardMembership, 
  Schedule, 
  Euro, 
  Edit,
  EventAvailable 
} from '@mui/icons-material';
import { ISubscriptionResponse } from '../models/subscription';

interface EnhancedSubscriptionColumnsProps {
  onEdit: (subscription: ISubscriptionResponse) => void;
}

const priceFormatter = (price: number | undefined | null) => {
  if (price === undefined || price === null || isNaN(price)) {
    return "—";
  }
  return `${price.toLocaleString('ru-RU')} €`;
};

const durationFormatter = (validityDays: number | undefined | null) => {
  if (validityDays === undefined || validityDays === null || isNaN(validityDays)) {
    return "—";
  }
  return `${validityDays} дн.`;
};

const sessionsFormatter = (sessions: number | undefined | null) => {
  if (sessions === undefined || sessions === null || isNaN(sessions)) {
    return "—";
  }
  return sessions.toString();
};

export const createEnhancedSubscriptionColumns = ({ 
  onEdit 
}: EnhancedSubscriptionColumnsProps): GridColDef[] => [
  createClickableColumn("id", "ID", {
    variant: 'text'
  }, {
    width: 90,
    sortable: false,
  }),

  {
    field: "name",
    headerName: "Название",
    flex: 1.5,
    minWidth: 150,
    sortable: true,
    renderCell: (params: GridRenderCellParams<ISubscriptionResponse>) => (
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <CardMembership sx={{ fontSize: 16, color: 'primary.main' }} />
        {params.value}
      </Typography>
    ),
  },

  {
    field: "number_of_sessions",
    headerName: "Занятий",
    width: 120,
    type: "number",
    align: "center",
    headerAlign: "center",
    sortable: true,
    renderCell: (params: GridRenderCellParams<ISubscriptionResponse>) => (
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5
        }}
      >
        <EventAvailable sx={{ fontSize: 16, color: 'success.main' }} />
        {sessionsFormatter(params.row.number_of_sessions)}
      </Typography>
    ),
  },

  {
    field: "validity_days",
    headerName: "Действует",
    width: 120,
    type: "number",
    align: "center",
    headerAlign: "center",
    sortable: true,
    renderCell: (params: GridRenderCellParams<ISubscriptionResponse>) => (
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5
        }}
      >
        <Schedule sx={{ fontSize: 16, color: 'info.main' }} />
        {durationFormatter(params.row.validity_days)}
      </Typography>
    ),
  },

  {
    field: "price",
    headerName: "Стоимость",
    width: 140,
    type: "number",
    align: "right",
    headerAlign: "right",
    sortable: true,
    renderCell: (params: GridRenderCellParams<ISubscriptionResponse>) => (
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: 'success.main',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 0.5
        }}
      >
        <Euro sx={{ fontSize: 16 }} />
        {priceFormatter(params.row.price)}
      </Typography>
    ),
  },

  createStatusColumn("is_active", "Статус", {
    width: 120,
  }),

  {
    field: "actions",
    headerName: "Действия",
    width: 120,
    sortable: false,
    disableColumnMenu: true,
    align: "center",
    headerAlign: "center",
    renderCell: (params: GridRenderCellParams<ISubscriptionResponse>) => (
      <Button
        variant="outlined"
        size="small"
        startIcon={<Edit sx={{ fontSize: 16 }} />}
        onClick={(e) => {
          e.stopPropagation();
          onEdit(params.row);
        }}
        sx={{
          textTransform: 'none',
          fontSize: '0.75rem',
          fontWeight: 600,
          borderRadius: 2,
          minWidth: 'auto',
          px: 1.5,
        }}
      >
        Изменить
      </Button>
    ),
  },
];
