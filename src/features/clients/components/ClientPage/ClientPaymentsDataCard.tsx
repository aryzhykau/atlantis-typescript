import { Chip, CircularProgress, Typography } from "@mui/material";
import { IconButton } from "@mui/material";
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import { Box } from "@mui/material";
import { IPaymentGet } from "../../../payments/models/payment";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import dayjs from "dayjs";

interface ClientPaymentsDataCardProps {
  payments: IPaymentGet[] | undefined;
  isLoading: boolean;
  handleCancelPayment: (paymentId: number) => void;
}

export const ClientPaymentsDataCard: React.FC<ClientPaymentsDataCardProps> = ({ payments, isLoading, handleCancelPayment } ) => {

  const paymentFields = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
    },
    {
      field: 'payment_date',
      headerName: 'Дата оплаты',
      width: 150,
      valueFormatter: (value: string) => {
        console.log("Payment");
        console.log(value);
        return dayjs(value).format('DD.MM.YYYY');
      }
    },
    {
      field: 'amount',
      headerName: 'Сумма',
      width: 150,
      valueFormatter: (value: number) => {
        return value.toLocaleString('ru-RU', { style: 'currency', currency: 'EUR' });
      }
    },
    {
      field: 'status',
      headerName: 'Статус',
      width: 150,
      renderCell: (params: GridRenderCellParams<IPaymentGet>) => {
        return (
          <Chip label={params.row.cancelled_at ? "Отменен" : "Принят" } color={params.row.cancelled_at ? 'error' : 'success'} />
        )
      } 
    },
    {
      field: 'actions',
      headerName: 'Отменить',
      width: 150,
      renderCell: (params: GridRenderCellParams<IPaymentGet>) => {
        return (
          <Box>
            <IconButton onClick={() => handleCancelPayment(params.row.id)} disabled={params.row.cancelled_at !== null}>
              <DoNotDisturbAltIcon />
            </IconButton>
          </Box>
        )
      }
    },
    
  ]
    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ width: '100%' }}>
          {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                  <CircularProgress />
              </Box>
          ) : payments && payments.length > 0 ? (
              <DataGrid
                  rows={payments}
                  columns={paymentFields}
                  pageSizeOptions={[5, 10, 25]}
                  initialState={{
                      pagination: {
                          paginationModel: {
                              pageSize: 5,
                          },
                      },
                  }}
                  autoHeight
                  disableRowSelectionOnClick
                  sx={{
                      '& .MuiDataGrid-row:hover': {
                          backgroundColor: (theme) => theme.palette.background.paper,
                      },
                  }}
              />
          ) : (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
                  <Typography color="text.secondary">У клиента нет платежей</Typography>
              </Box>
          )}
      </Box>
  </Box>
    )
}