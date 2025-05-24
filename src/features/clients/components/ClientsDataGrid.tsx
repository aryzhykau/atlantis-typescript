import { Box, TextField, Button } from "@mui/material";
import { DataGrid, GridRenderCellParams, GridCellParams } from "@mui/x-data-grid";
import { clientColums } from "../tables/clientsColumns";
import { useClients } from "../hooks/clientManagementHooks";
import { useSnackbar } from "../../../hooks/useSnackBar";
import { IClientUserFormValues } from "../models/client";
import Actions from "../../../components/datagrid/Actions";

interface ClientsDataGridProps {
    onClientSelect?: (clientId: number) => void;
    onAddClient?: () => void;
    onEditClient?: (clientId: number, clientData: IClientUserFormValues) => void;
    onDeleteClient?: (clientId: number) => void;
}

export function ClientsDataGrid({ 
    onClientSelect, 
    onAddClient, 
    onEditClient, 
    onDeleteClient 
}: ClientsDataGridProps) {
    const { clients, displayClients, setDisplayClients, isLoadingClients, refetchClients } = useClients();
    const { displaySnackbar } = useSnackbar();

    const handleCreateBtnClick = () => {
        if (onAddClient) {
            onAddClient();
        }
    }

    const handleDeleteBtnClick = (params: GridRenderCellParams) => {
        if (onDeleteClient) {
            onDeleteClient(Number(params.id));
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === "") {
            setDisplayClients(clients);
        }
        else {
            setDisplayClients(clients.filter((client) =>
                [client.first_name, client.last_name, client.email]
                    .some(field => field?.toLowerCase().startsWith(e.target.value.toLowerCase()))
            ));
        }
    }

    const handleEditBtnClick = (params: { id: number | string; row: IClientUserFormValues }) => {
        if (onEditClient) {
            onEditClient(Number(params.id), params.row);
        }
    }

    const handleCellClick = (params: GridCellParams) => {
        if (params.field === 'id' && onClientSelect) {
            onClientSelect(Number(params.id));
        }
    };

    const extendedClientColumns = [...clientColums];

    extendedClientColumns.push({
        field: "actions",
        headerName: "Действия",
        sortable: false,
        renderCell: (params) => (
            <Actions
                params={params}
                handleEdit={() => { handleEditBtnClick({ id: params.id, row: params.row }) }}
                handleDelete={() => handleDeleteBtnClick(params)}
            />)
    });

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: "32px" }}>
                <TextField
                    id="filled-search"
                    label="Поиск клиента"
                    type="search"
                    variant="outlined"
                    onChange={handleSearchChange}
                ></TextField>
                <Button variant={"contained"} onClick={handleCreateBtnClick}>
                    Добавить клиента
                </Button>
            </Box>
            <Box sx={{ width: "100%" }}>
                <DataGrid
                    rows={displayClients || []}
                    loading={isLoadingClients}
                    columns={extendedClientColumns}
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
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: (theme) => theme.palette.background.paper,
                        },
                    }}
                    onCellClick={handleCellClick}
                />
            </Box>
        </Box>
    );
} 