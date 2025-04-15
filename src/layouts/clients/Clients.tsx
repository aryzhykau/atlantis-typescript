import {Box, Button, IconButton, Modal} from "@mui/material";
import {DataGrid, GridRenderCellParams} from "@mui/x-data-grid";
import { clientColums, } from "../../features/clients/tables/clientsColumns.tsx";

import { useState} from "react";
import { ClientsForm } from "../../features/clients/components/ClientsForm.tsx";
import { useClients } from "../../features/clients/hooks/clientManagementHooks.ts";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import {useSnackbar} from "../../hooks/useSnackBar.tsx";
import Switch from '@mui/material/Switch';
import dayjs from "dayjs";

import TextField from '@mui/material/TextField';
import {IClientFormValues} from "../../features/clients/models/client.ts";
import {ClientDeleteModal} from "../../features/clients/components/ClientDeleteModal.tsx";




export function ClientsLayout() {
    const {clients, displayClients, setDisplayClients, isLoadingClients, deleteClient, refetchClients, updateClient} = useClients();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [formTitle, setFormTitle] = useState<string>("Добавить клиента");
    const [isClientEdit, setIsClientEdit] = useState<boolean>(false);
    const {displaySnackbar} = useSnackbar();
    const [formInitValues, setFormInitValues] = useState<IClientFormValues | undefined>(undefined);
    const [clientId, setClientId] = useState<number | string | null>(null);
    const [isDeletingModal, setIsDeletingModal] = useState<boolean>(false);


    const handleCreateBtnClick = () => {
        setIsDeletingModal(false)
        setFormTitle("Добавить клиента")
        setIsClientEdit(false);
        setModalOpen(true);
        setFormInitValues(undefined);
    }
    const handleDeleteBtnClick = (params: GridRenderCellParams) => {
        setIsDeletingModal(true);
        setModalOpen(true);
        setClientId(params.id);
    }
    const handleDeleteConfirmBtnClick = async () => {
        try {
            if (clientId === null) throw new Error()
            await deleteClient({clientId: Number(clientId)}).unwrap();
            displaySnackbar("Клиент удален", "success");
            refetchClients();
            setModalOpen(false);
            setIsDeletingModal(false);
            setClientId(null);
        }
        catch (e) {
            console.log(e)
            displaySnackbar("Ошибка при удалении клиента", "error");
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

    const handleEditBtnClick = (params: { id: number |string; row: IClientFormValues }) => {
        setIsDeletingModal(false);
        setFormTitle("Изменение клиента")
        setClientId(params.id);
        setIsClientEdit(true);
        setModalOpen(true);
        setFormInitValues({
            ...params.row,
            birth_date: params.row.birth_date ? dayjs(params.row.birth_date): null
        });
    }
    const handleDeleteCancelBtnClick = () => {
        setModalOpen(false);
        setIsDeletingModal(false);
        setClientId(null);
    }

    const handleModalClose = () => setModalOpen(false);


    const style = {
        position: "absolute",
        width: "35%",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        p: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    };

    const extendedClientColumns = clientColums.map((column) => column);

    extendedClientColumns.push({
        field: "active",
        headerName: "Активен",
        sortable: false,
        renderCell: (params) => (
            <Switch
                checked={Boolean(params.row.active)}
                onChange={async (event) => {
                    const isActive = event.target.checked;
                    try {
                        displaySnackbar("Обновляем клиента", "info");
                        await updateClient({
                            clientId: Number(params.id),
                            clientData: {...params.row, active: isActive},
                        }).unwrap();
                        displaySnackbar(
                            `Клиент ${params.row.first_name} ${params.row.last_name} ${isActive ? "теперь активен и может посещать тренировки" : "приостановлен и не сможет посещать тренировки"}`,
                            "success"
                        );
                        await refetchClients();
                    } catch (error) {
                        console.error(error);
                        displaySnackbar(
                            "Ошибка при изменении состояния активности клиента",
                            "error"
                        );
                    }
                }}
                color="primary"
            />
        ),
    });

    extendedClientColumns.push({
        field: "actions",
        headerName: "Действия",
        sortable: false,
        renderCell: (params) => (
            <Box sx={{display: "flex", gap: "8px"}}>
                <IconButton

                    color="primary"
                    onClick={() => {
                        handleEditBtnClick({
                            id:params.id,
                            row:params.row
                        })
                    }}
                >
                    <EditIcon/>
                </IconButton>
                <IconButton
                    color="error"
                    onClick={() => handleDeleteBtnClick(params)}
                >
                    <DeleteOutlineIcon/>
                </IconButton>
            </Box>
        ),
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
                />
            </Box>

            <Modal open={modalOpen} onClose={handleModalClose}>
                <Box sx={style}>
                    { !isDeletingModal ? (
                        <ClientsForm onClose={handleModalClose} isEdit={isClientEdit} title={formTitle} initialValues={formInitValues} clientId={Number(clientId)}></ClientsForm>
                    ) : (
                        <ClientDeleteModal onConfirm={handleDeleteConfirmBtnClick} onCancel={handleDeleteCancelBtnClick}/>
                    )
                    }
                </Box>
            </Modal>


        </Box>
    );
}