import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Typography, Chip, Button } from "@mui/material";
import { 
  createClickableColumn,
  createStatusColumn
} from "../../../components/UnifiedDataGrid";
import { FitnessCenter, Edit } from '@mui/icons-material';
import { ITrainingType } from '../../training-types/models/trainingType';
import TrainingTypeColorCircle from '../components/TrainingTypeColorCircle';

interface EnhancedTrainingTypeColumnsProps {
  onEdit: (trainingType: ITrainingType) => void;
}

const priceFormatter = (value: number | null | undefined, row?: ITrainingType) => {
  if (row?.is_subscription_only) {
    return '—';
  }
  if (value === undefined || value === null) {
    return "Не указана цена";
  }
  return `${value}€`;
};

export const createEnhancedTrainingTypeColumns = ({ 
  onEdit 
}: EnhancedTrainingTypeColumnsProps): GridColDef[] => [
  createClickableColumn("id", "ID", {
    variant: 'text'
  }, {
    width: 90,
    sortable: false,
  }),

  {
    field: "color",
    headerName: "#",
    width: 60,
    align: "center",
    headerAlign: "center",
    sortable: false,
    renderCell: (params: GridRenderCellParams<ITrainingType>) => (
      <TrainingTypeColorCircle circleColor={params.row.color} />
    ),
  },

  {
    field: "name",
    headerName: "Название",
    flex: 1.5,
    minWidth: 150,
    sortable: true,
    renderCell: (params: GridRenderCellParams<ITrainingType>) => (
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <FitnessCenter sx={{ fontSize: 16, color: 'text.secondary' }} />
        {params.value}
      </Typography>
    ),
  },

  {
    field: "price",
    headerName: "Стоимость",
    width: 120,
    type: "number",
    sortable: true,
    renderCell: (params: GridRenderCellParams<ITrainingType>) => {
      const formattedPrice = priceFormatter(params.row.price, params.row);
      const isSubscriptionOnly = params.row.is_subscription_only;
      
      return (
        <Typography
          variant="body2"
          sx={{
            fontWeight: isSubscriptionOnly ? 400 : 600,
            color: isSubscriptionOnly ? 'text.secondary' : 'text.primary',
            fontSize: '0.875rem',
          }}
        >
          {formattedPrice}
        </Typography>
      );
    },
  },

  {
    field: "max_participants",
    headerName: "Макс. участников",
    width: 140,
    type: "number",
    align: "center",
    headerAlign: "center",
    sortable: true,
    renderCell: (params: GridRenderCellParams<ITrainingType>) => (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {params.row.max_participants || '—'}
      </Typography>
    ),
  },

  {
    field: "is_subscription_only",
    headerName: "Только по подписке",
    width: 160,
    sortable: true,
    renderCell: (params: GridRenderCellParams<ITrainingType>) => (
      <Chip
        label={params.value ? "Да" : "Нет"}
        color={params.value ? "primary" : "default"}
        size="small"
        variant="outlined"
        sx={{
          fontWeight: 500,
          fontSize: '0.75rem',
        }}
      />
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
    renderCell: (params: GridRenderCellParams<ITrainingType>) => (
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
