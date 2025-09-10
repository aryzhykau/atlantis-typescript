import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { 
  createClickableColumn, 
  createEmailColumn, 
  createPhoneColumn, 
  createDateColumn, 
  createCurrencyColumn 
} from "../../../components/UnifiedDataGrid";
import { Box, Typography } from "@mui/material";
import ClientBalanceCell from "../components/ClientBalanceCell";

const fieldWidth = 150;

export const createEnhancedClientColumns = (): GridColDef[] => [
  createClickableColumn("id", "ID", {
    navigateUrl: (row) => `/home/clients/${row.id}`,
    variant: 'link'
  }, {
    width: 100,
    sortable: false,
  }),

  {
    field: "first_name",
    headerName: "Имя",
    width: fieldWidth,
    sortable: true,
  },

  {
    field: "last_name",
    headerName: "Фамилия",
    width: fieldWidth,
    sortable: true,
  },

  createEmailColumn("email", "E-mail", {
    enableAccessibility: true,
  }, {
    width: fieldWidth,
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
    sortable: false,
  }),

  {
    field: "balance",
    headerName: "Баланс",
    width: 120,
    sortable: true,
    type: "number",
    renderCell: (params: GridRenderCellParams) => (
      <ClientBalanceCell balance={params.row.balance} />
    )
  },

  createCurrencyColumn("unpaid_sum", "Задолженность", {
    colorizeByValue: true,
  }, {
    width: 130,
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <Box
        sx={{
          color: theme => params.row.unpaid_sum > 0 
            ? theme.palette.error.main 
            : theme.palette.text.primary,
          fontWeight: params.row.unpaid_sum > 0 ? 600 : 400,
        }}
      >
        {params.row.unpaid_sum}€
      </Box>
    )
  }),

  {
    field: "unpaid_count",
    headerName: "Неоплач. инвойсов",
    width: 130,
    sortable: false,
    renderCell: (params: GridRenderCellParams) => (
      <Box
        sx={{
          color: theme => params.row.unpaid_count > 0 
            ? theme.palette.error.main 
            : theme.palette.text.primary,
          fontWeight: params.row.unpaid_count > 0 ? 600 : 400,
        }}
      >
        {params.row.unpaid_count}
      </Box>
    )
  },

  createPhoneColumn("whatsapp", "WhatsApp", {
    enableAccessibility: true,
  }, {
    width: fieldWidth,
    sortable: false,
    valueGetter: (_value, row) => {
      if (row.whatsapp_country_code && row.whatsapp_number) {
        return {
          countryCode: row.whatsapp_country_code,
          number: row.whatsapp_number
        };
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
      return createPhoneColumn("whatsapp", "WhatsApp", {
        enableAccessibility: true,
      }).renderCell!(params);
    }
  }),

  createDateColumn("created_at", "Добавлен", {}, {
    width: 120,
    sortable: true,
  }),
];
