import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { 
  createClickableColumn, 
  createEmailColumn, 
  createPhoneColumn, 
  createDateColumn, 
  createCurrencyColumn,
  createStatusColumn,
  DateCell
} from "../../../components/UnifiedDataGrid";
import { Typography } from "@mui/material";
import { UserRole } from "../models/trainer";

export const createEnhancedTrainerColumns = (userRole?: UserRole): GridColDef[] => {
  const baseColumns: GridColDef[] = [
    createClickableColumn("id", "ID", {
      navigateUrl: (row) => `/home/trainers/${row.id}`,
      variant: 'link'
    }, {
      width: 90,
      sortable: false,
    }),

    {
      field: 'fullName',
      headerName: 'ФИО',
      flex: 1,
      minWidth: 200,
      valueGetter: (_value, row) => `${row.first_name || ''} ${row.last_name || ''}`,
      renderCell: (params: GridRenderCellParams) => (
        <Typography 
          variant="body2"
          sx={{ 
            cursor: 'pointer',
            fontWeight: 500,
            '&:hover': {
              color: 'primary.main'
            }
          }}
        >
          {params.value}
        </Typography>
      ),
    },

    createEmailColumn("email", "E-mail", {
      enableAccessibility: true,
    }, {
      width: 200,
    }),

    createPhoneColumn("phone", "Телефон", {
      enableAccessibility: true,
    }, {
      width: 150,
      sortable: false,
      valueGetter: (_value, row) => ({
        countryCode: row.phone_country_code,
        number: row.phone_number
      }),
    }),

    createDateColumn("date_of_birth", "Дата рождения", {}, {
      width: 130,
      sortable: true,
    }),

    createStatusColumn("is_active", "Статус", {
      width: 120,
    }),

    {
      field: "deactivation_date",
      headerName: "Дата отключения",
      width: 150,
      sortable: true,
      type: 'dateTime',
      valueGetter: (value: any) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value === 'string') {
          const date = new Date(value);
          return isNaN(date.getTime()) ? null : date;
        }
        return null;
      },
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) {
          return (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          );
        }
        return (
          <DateCell 
            params={params}
            value={params.value}
            includeTime={true}
          />
        );
      }
    },
  ];

  // Add salary column only for owners
  if (userRole === UserRole.OWNER) {
    const salaryColumn: GridColDef = createCurrencyColumn("salary", "Зарплата", {}, {
      width: 120,
      sortable: true,
      renderCell: (params: GridRenderCellParams) => {
        if (params.row.is_fixed_salary) {
          return (
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
              {params.value?.toFixed(2) || '0.00'}€ 
              <Typography component="span" variant="caption" sx={{ ml: 0.5, opacity: 0.7 }}>
                (фикс)
              </Typography>
            </Typography>
          );
        }
        
        if (!params.value) {
          return (
            <Typography variant="body2" color="text.secondary">
              По тренировкам
            </Typography>
          );
        }
        
        return (
          <Typography variant="body2">
            {params.value.toFixed(2)}€
          </Typography>
        );
      }
    });

    // Insert salary column before status column (position 5)
    baseColumns.splice(5, 0, salaryColumn);
  }

  return baseColumns;
};