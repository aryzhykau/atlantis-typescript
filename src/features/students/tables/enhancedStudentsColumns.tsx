import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { 
  createClickableColumn, 
  createEmailColumn, 
  createPhoneColumn, 
  createDateColumn, 
  createStatusColumn,
 
} from "../../../components/UnifiedDataGrid";
import { Typography, Chip, Link } from "@mui/material";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import dayjs from 'dayjs';

const calculateAge = (dateOfBirth: string): number => {
  const dobDayjs = dayjs(dateOfBirth);
  if (!dobDayjs.isValid()) {
    return -1;
  }
  return dayjs().diff(dobDayjs, 'year');
};

export const createEnhancedStudentColumns = (): GridColDef[] => [
  createClickableColumn("id", "ID", {
    navigateUrl: (row) => `/home/students/${row.id}`,
    variant: 'link'
  }, {
    width: 90,
    sortable: false,
  }),

  {
    field: "first_name",
    headerName: "Имя",
    flex: 1,
    minWidth: 150,
    sortable: true,
  },

  {
    field: "last_name",
    headerName: "Фамилия",
    flex: 1,
    minWidth: 150,
    sortable: true,
  },

  createDateColumn("date_of_birth", "Дата рождения", {}, {
    width: 130,
    sortable: true,
  }),

  {
    field: 'age',
    headerName: 'Возраст',
    width: 100,
    sortable: true,
    valueGetter: (_value, row) => row.date_of_birth ? calculateAge(row.date_of_birth) : null,
    renderCell: (params: GridRenderCellParams) => (
      <Typography variant="body2">
        {params.value !== null && params.value >= 0 ? `${params.value} лет` : '—'}
      </Typography>
    ),
  },

  {
    field: 'parentName',
    headerName: 'Родитель',
    valueGetter: (_value, row) => row.client.first_name === row.first_name && row.client.last_name === row.last_name ? `-` :`${row.client.first_name} ${row.client.last_name}`,
    flex: 1,
    minWidth: 150,
    sortable: true,
     renderCell: (params: GridRenderCellParams) => (
      params.value === '-' ? (
        <RemoveCircleOutlineIcon color="error" fontSize="small" />
      ) : (
        <Link
          component="span"
          onClick={(e) => {
            e.stopPropagation();
            // Navigate to parent client page
            window.location.href = `/home/clients/${params.row.client.id}`;
          }}
          sx={{
            cursor: 'pointer',
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 'medium',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {params.value}
        </Link>
      )
    ),
  },

  {
    field: 'hasActiveSubscription',
    headerName: 'Активный абонемент',
    width: 180,
    sortable: true,
    renderCell: (params: GridRenderCellParams) => (
      params.row.active_subscription_id 
        ? <Chip 
            label="Есть" 
            color="success" 
            size="small" 
            sx={{ fontWeight: 500 }}
          /> 
        : <Chip 
            label="Нет" 
            color="default" 
            size="small" 
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
    ),
  },

  createPhoneColumn("client_phone", "Телефон родителя", {
    enableAccessibility: true,
  }, {
    width: 150,
    valueGetter: (_value, row) => {
      // Prefer the combined phone field if available, otherwise construct it
      if (row.client?.phone) {
        return row.client.phone;
      }
      if (row.client?.phone_country_code && row.client?.phone_number) {
        return {
          countryCode: row.client.phone_country_code,
          number: row.client.phone_number
        };
      }
      return null;
    },
  }),

  createEmailColumn("client_email", "Email родителя", {}, {
    width: 200,
    valueGetter: (_value, row) => row.client?.email || '',
  }),

  createStatusColumn("is_active", "Статус", {
    width: 120,
  }),
];
