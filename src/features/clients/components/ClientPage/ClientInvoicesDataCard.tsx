import React from "react";
import { Box, Typography, CircularProgress, Chip } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IInvoiceGet, InvoiceStatus, InvoiceType } from "../../../invoices/models/invoice";
import { EditableInvoiceComment } from "./EditableInvoiceComment";
import useIsMobile from "../../../../hooks/useMobile";
import dayjs from "dayjs";

interface ClientInvoicesDataCardProps {
    invoices: IInvoiceGet[] | undefined;
    isLoading: boolean;
}

export const ClientInvoicesDataCard: React.FC<ClientInvoicesDataCardProps> = ({ 
    invoices, 
    isLoading
}) => {
    const isMobile = useIsMobile();

    const invoiceColumns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'type', headerName: 'Тип', width: 130,
          valueFormatter: (params: InvoiceType ) => {
            switch (params) {
              case "SUBSCRIPTION":
                return "За абонемент";
              case "TRAINING":
                return "За тренировку";
              default:
                return "Другое";
            }
          } 
        },
        { field: 'amount', headerName: 'Сумма', width: 130 },
        { 
            field: 'status', 
            headerName: 'Статус', 
              width: 150,
              renderCell: (params: GridRenderCellParams<{value:InvoiceStatus }>) => {
              
              switch (params.value) {
                case "UNPAID":
                  return <Chip label={"Не оплачен"} color={"error"} />
                case "PAID":
                  return <Chip label={"Оплачен"} color={"success"} />
                case "CANCELLED":
                  return <Chip label={"Отменен"} color={"warning"} />
                default:
                  return <Chip label={"Другое"} color={"warning"} />;
              }
            }
        },
        { 
            field: 'comment', 
            headerName: 'Комментарий', 
            width: 300,
            renderCell: (params: GridRenderCellParams<IInvoiceGet>) => {
                return (
                    <EditableInvoiceComment
                        invoiceId={params.row.id}
                        initialComment={params.row.comment}
                    />
                );
            }
        },
    ];

    const statusMeta = (status: InvoiceStatus) => {
        switch (status) {
          case 'PAID':
            return { label: 'Оплачен', color: 'success' as const };
          case 'CANCELLED':
            return { label: 'Отменен', color: 'error' as const };
          case 'PENDING':
            return { label: 'В ожидании', color: 'default' as const };
          default:
            return { label: 'Не оплачен', color: 'warning' as const };
        }
    };

    const invoiceTypeMeta = (type: InvoiceType) => {
        switch (type) {
          case "SUBSCRIPTION":
            return "За абонемент";
          case "TRAINING":
            return "За тренировку";
          default:
            return "Другое";
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!invoices || invoices.length === 0) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
                <Typography color="text.secondary">У клиента нет инвойсов</Typography>
            </Box>
        );
    }

    if (isMobile) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", mx: -2 }}>
                {invoices.map((invoice) => {
                    const meta = statusMeta(invoice.status);
                    const typeLabel = invoiceTypeMeta(invoice.type);

                    return (
                        <Box
                            key={invoice.id}
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
                                        Инвойс #{invoice.id}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                                        {typeLabel}
                                    </Typography>
                                </Box>

                                <Chip size="small" label={meta.label} color={meta.color} />
                            </Box>

                            <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {invoice.amount.toFixed(2)} €
                                </Typography>
                                {invoice.description && (
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {invoice.description}
                                    </Typography>
                                )}
                                {invoice.comment && (
                                    <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                        {invoice.comment}
                                    </Typography>
                                )}
                                <Typography variant="caption" color="text.disabled">
                                    Создан: {dayjs(invoice.created_at).format('DD.MM.YYYY')}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ width: '100%' }}>
                <DataGrid
                    rows={invoices}
                    columns={invoiceColumns}
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
}; 