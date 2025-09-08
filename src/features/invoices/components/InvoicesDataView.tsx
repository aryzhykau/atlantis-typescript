import {Autocomplete, Box,  Typography} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import {SyntheticEvent, useEffect, useState} from "react";
import {useGetInvoicesQuery} from "../../../store/apis/invoices.ts";
import {invoicesColumns} from "../tables/invoicesColumns.tsx";

import {useClients} from "../../clients/hooks/clientManagementHooks.ts";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";




export function InvoicesDataView() {
    const [clientId, setClientId] = useState<number | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const {data, refetch, isLoading} = useGetInvoicesQuery({client_id: clientId, status: statusFilter});
    const {clients} = useClients();
    const autocompleteOptions = clients.map(client => {
            return {label: `${client.first_name} ${client.last_name}`, id: client.id}
        });


    const onUnpaidChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStatusFilter(event.target.checked ? "UNPAID" : undefined);
        refetch();
    }

    interface IAutocompleteOption {
        label: string;
        id: number;
    }

    const handleAutocompleteChange = (
        event: SyntheticEvent<Element, Event>
        , value: IAutocompleteOption | null
    ) => {
        console.log(event.target);
        setClientId(value ? value.id : undefined);
        refetch();
    }

    useEffect(() => {
        refetch()
    }, []);





    return (
        <>
                <Box display={"flex"} justifyContent={"flex-start"} alignItems={"center"} flexDirection={"column"} flex={1}>

                    <Box mb={2} display={"flex"} justifyContent={"flex-start"} gap={10} alignItems={"center"} sx={{ width: '100%' }}>
                        <Typography variant={"h5"}>Инвойсы</Typography>
                        <Box>
                            <Typography variant={"caption"}>Показать только неоплаченные</Typography>
                            <Switch checked={statusFilter === "UNPAID"} onChange={onUnpaidChange}></Switch>
                        </Box>
                        <Box display={"flex"} alignItems={"center"} gap={2}>
                            <Typography variant={"caption"}>Выбрать отдельного клиента</Typography>
                            <Autocomplete sx={{ width: 300 }} onChange={handleAutocompleteChange}  renderInput={(params) => <TextField {...params} label="Клиент" />} options={autocompleteOptions}></Autocomplete>
                        </Box>
                    </Box>
                    <DataGrid
                        rows={data?.items || []}
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
                        rowHeight={50}
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
        </>
    )
}