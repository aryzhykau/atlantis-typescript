import {Box, Typography} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import {useState} from "react";
import {useGetInvoicesQuery} from "../../../store/apis/invoices.ts";
import {invoicesColumns} from "../tables/invoicesColumns.tsx";
import {IInvoiceGet} from "../models/invoice.ts";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import { useGetClientsQuery } from "../../../store/apis/clientsApi.ts";



export function InvoicesDataView() {
    const [userId, setUserId] = useState(undefined);
    const [onlyUnpaid, setOnlyUnpaid] = useState(false);
    const {data, refetch, isLoading, isError} = useGetInvoicesQuery({user_id: userId, only_unpaid: onlyUnpaid});


    return (
        <>
            <Box width={"49%"}>
                <Box display={"flex"} justifyContent={"flex-start"} alignItems={"center"} flexDirection={"column"}>

                    <Box mb={6} display={"flex"} justifyContent={"space-between"} alignItems={"center"} sx={{ width: '100%' }}>
                        <Typography variant={"h5"}>Инвойсы</Typography>
                    </Box>
                    <DataGrid
                        rows={data}
                        columns={invoicesColumns}
                        loading={isLoading}

                        pageSizeOptions={[10]}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                        }}
                        disableRowSelectionOnClick
                        sx={{

                            width: '100%',
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: (theme) => theme.palette.background.paper,
                            },
                        }}
                        getRowId={(row) => row.id}
                    />
                </Box>
            </Box>
        </>
    )
}