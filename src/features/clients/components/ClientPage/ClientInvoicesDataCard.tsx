import React, { useState } from "react";
import { Box, Typography, CircularProgress, Chip } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IInvoiceGet, InvoiceStatus, InvoiceType } from "../../../invoices/models/invoice";

interface ClientInvoicesDataCardProps {
    invoices: IInvoiceGet[] | undefined;
    isLoading: boolean;
}

export const ClientInvoicesDataCard: React.FC<ClientInvoicesDataCardProps> = ({ 
    invoices, 
    isLoading
}) => {
    const invoiceColumns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'type', headerName: 'Тип', width: 130,
          valueFormatter: (params: InvoiceType ) => {
            console.log(params)
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
              return 
            }
        }
    ];

    return (
                        
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <Box sx={{ width: '100%' }}>
                                {isLoading ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                                        <CircularProgress />
                                    </Box>
                                ) : invoices && invoices.length > 0 ? (
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
                                ) : (
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
                                        <Typography color="text.secondary">У клиента нет инвойсов</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
    );
}; 