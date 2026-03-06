import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Typography, Button, Chip } from "@mui/material";
import {
  createClickableColumn,
  createStatusColumn
} from "../../../components/UnifiedDataGrid";
import { CardMembership, Euro, Repeat, Edit } from '@mui/icons-material';
import { ISubscriptionResponse } from '../models/subscription';

interface EnhancedSubscriptionColumnsProps {
  onEdit: (subscription: ISubscriptionResponse) => void;
}

export const createEnhancedSubscriptionColumns = ({
  onEdit,
}: EnhancedSubscriptionColumnsProps): GridColDef[] => [
  createClickableColumn("id", "ID", { variant: 'text' }, { width: 70, sortable: false }),

  {
    field: "name",
    headerName: "Название",
    flex: 1,
    minWidth: 160,
    sortable: true,
    renderCell: (params: GridRenderCellParams<ISubscriptionResponse>) => (
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.75 }}
      >
        <CardMembership sx={{ fontSize: 16, color: 'primary.main' }} />
        {params.value}
      </Typography>
    ),
  },

  {
    field: "sessions_per_week",
    headerName: "В неделю",
    width: 140,
    align: "center",
    headerAlign: "center",
    sortable: true,
    renderCell: (params: GridRenderCellParams<ISubscriptionResponse>) => (
      <Chip
        icon={<Repeat style={{ fontSize: 13 }} />}
        label={`${params.value ?? '—'}×/нед`}
        color="primary"
        size="small"
        sx={{ fontWeight: 700 }}
      />
    ),
  },

  {
    field: "price",
    headerName: "Стоимость",
    width: 130,
    type: "number",
    align: "right",
    headerAlign: "right",
    sortable: true,
    renderCell: (params: GridRenderCellParams<ISubscriptionResponse>) => (
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}
      >
        <Euro sx={{ fontSize: 15 }} />
        {params.row.price != null ? params.row.price.toLocaleString('ru-RU') : '—'}
      </Typography>
    ),
  },

  createStatusColumn("is_active", "Статус", { width: 110 }),

  {
    field: "actions",
    headerName: "",
    width: 110,
    sortable: false,
    disableColumnMenu: true,
    align: "center",
    headerAlign: "center",
    renderCell: (params: GridRenderCellParams<ISubscriptionResponse>) => (
      <Button
        variant="outlined"
        size="small"
        startIcon={<Edit sx={{ fontSize: 15 }} />}
        onClick={(e) => { e.stopPropagation(); onEdit(params.row); }}
        sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, borderRadius: 2, px: 1.5 }}
      >
        Изменить
      </Button>
    ),
  },
];
