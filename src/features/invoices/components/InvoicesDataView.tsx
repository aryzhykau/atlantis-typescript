import {Autocomplete, Box,  Typography} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import {SyntheticEvent, useEffect, useState} from "react";
import {useGetInvoicesQuery} from "../../../store/apis/invoices.ts";
import {invoicesColumns} from "../tables/invoicesColumns.tsx";

import {useClients} from "../../clients/hooks/clientManagementHooks.ts";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";




export function InvoicesDataView() {
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [onlyUnpaid, setOnlyUnpaid] = useState(false);
    const {data, refetch, isLoading} = useGetInvoicesQuery({user_id: userId, only_unpaid: onlyUnpaid});
    const {clients} = useClients();
    const autocompleteOptions = clients.map(client => {
            return {label: `${client.first_name} ${client.last_name}`, id: client.id}
        });


    const onUnpaidChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOnlyUnpaid(event.target.checked);
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
        setUserId(value ? value.id : undefined);
        refetch();
    }

    useEffect(() => {
        refetch()
    }, []);





    return (
        <>
                <Box display={"flex"} justifyContent={"flex-start"} alignItems={"center"} flexDirection={"column"}>

                    <Box mb={2} display={"flex"} justifyContent={"flex-start"} gap={10} alignItems={"center"} sx={{ width: '100%' }}>
                        <Typography variant={"h5"}>Инвойсы</Typography>
                        <Box>
                            <Typography variant={"caption"}>Показать только неоплаченные</Typography>
                            <Switch checked={onlyUnpaid} onChange={onUnpaidChange}></Switch>
                        </Box>
                        <Box display={"flex"} alignItems={"center"} gap={2}>
                            <Typography variant={"caption"}>Выбрать отдельного клиента</Typography>
                            <Autocomplete sx={{ width: 300 }} onChange={handleAutocompleteChange}  renderInput={(params) => <TextField {...params} label="Клиент" />} options={autocompleteOptions}></Autocomplete>
                        </Box>
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