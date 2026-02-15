import { Chip, CircularProgress, Typography, Button, Stack } from "@mui/material";
import { IconButton } from "@mui/material";
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import { Box } from "@mui/material";
import { IPaymentGet } from "../../../payments/models/payment";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import dayjs from "dayjs";
import useIsMobile from "../../../../hooks/useMobile";
import { SwipeableActionCard } from "../../../../components/mobile-kit";
import { useGradients } from "../../../trainer-mobile/hooks/useGradients";

interface ClientPaymentsDataCardProps {
  payments: IPaymentGet[] | undefined;
  isLoading: boolean;
  handleCancelPayment: (paymentId: number) => void;
}

export const ClientPaymentsDataCard: React.FC<ClientPaymentsDataCardProps> = ({ payments, isLoading, handleCancelPayment } ) => {
  const isMobile = useIsMobile();
  const gradients = useGradients();

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

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
        <Typography color="text.secondary">У клиента нет платежей</Typography>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", mx: -2 }}>
        {payments.map((payment) => {
          const isCancelled = payment.cancelled_at !== null;
          const canCancel = !isCancelled;

          return (
            <SwipeableActionCard
              key={payment.id}
              revealContent={(
                <Stack direction="row" sx={{ width: '100%' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={!canCancel}
                    onClick={() => handleCancelPayment(payment.id)}
                    sx={{
                      borderRadius: 0,
                      background: gradients.warning,
                      color: 'white',
                      fontWeight: 700,
                      '&:hover': { background: gradients.warning, filter: 'brightness(0.95)' },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                        color: 'rgba(0, 0, 0, 0.26)',
                      },
                    }}
                  >
                    Отменить
                  </Button>
                </Stack>
              )}
              revealWidth={128}
            >
              <Box
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: 0,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderTop: 'none',
                  p: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                      Платеж #{payment.id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {dayjs(payment.payment_date).format('DD.MM.YYYY')}
                    </Typography>
                  </Box>

                  <Chip 
                    size="small" 
                    label={isCancelled ? "Отменен" : "Принят"} 
                    color={isCancelled ? 'error' : 'success'} 
                  />
                </Box>

                <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {payment.amount.toFixed(2)} €
                  </Typography>
                </Box>
              </Box>
            </SwipeableActionCard>
          );
        })}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ width: '100%' }}>
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
      </Box>
    </Box>
  );
}