import {Box, Modal, Typography} from "@mui/material";
import {DataGrid, GridRenderCellParams} from "@mui/x-data-grid";
import SubscriptionForm from "./SubscriptionForm.tsx";
import {useState} from "react";
import {useSubscriptions} from "../hooks/useSubscriptions.ts";
import {subscriptionsColumns} from "../tables/subscriptionsColumns.tsx";
import {ISubscription, ISubscriptionGet} from "../models/subscription.ts";
import Actions from "../../../components/datagrid/Actions.tsx";
import CreateEntityButton from "../../../components/buttons/CreateEntityButton.tsx";
import {SubscriptionDeleteModal} from "./SubscriptionDeleteModal.tsx";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";


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

const subscriptionInitialValues = {title: "", price: 0, active: true, duration: 30, total_sessions: 1}

export function SubscriptionsDataView() {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const {subscriptions, isLoading, deleteSubscription, refetchSubscriptions} = useSubscriptions();
    const [subscriptionId, setSubscriptionId] = useState<number>(0);
    const [formInitValues, setFormInitValues] = useState<ISubscription>(subscriptionInitialValues)
    const [isCreating, setIsCreating] = useState<boolean>(true);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const {displaySnackbar} = useSnackbar();


    const handleCreateButtonClick = () => {
        setIsCreating(true)
        setSubscriptionId(0);
        setFormInitValues(subscriptionInitialValues);
        setModalOpen((prev) => !prev)
    }
    const handleEdit = (row: ISubscriptionGet) => {
        console.log('Edit:', row);
        setSubscriptionId(row.id);
        setFormInitValues({
            price: row.price,
            title: row.title,
            duration: row.duration,
            active: row.active,
            total_sessions: row.total_sessions,
        })
        setIsCreating(false);
        setModalOpen((prev) => !prev)
        // Add your logic for editing here
    };

    const handleDelete = (id: number) => {
        console.log('Delete ID:', id);
        setIsDeleting(true);
        setSubscriptionId(id);
        setModalOpen(true);
    };

    const handleCancel = () => {
        setIsDeleting(false);
        setModalOpen(false);
    }

    const handleDeleteConfirm = async () => {
        try {
            await deleteSubscription({subscriptionId}).unwrap();
            await refetchSubscriptions();
            setIsDeleting(false);
            setModalOpen(false);
            displaySnackbar("Yes", "success")
        }
        catch (e: unknown) {
            console.log(e)
            displaySnackbar("No", "error")

        }

    }


    const onFormClose = () => {
        setModalOpen(false)
    }

    const extendedSubscriptionsColumns = subscriptionsColumns.map((column) => column);
    extendedSubscriptionsColumns.push(
        {
            field: 'actions',
            headerName: 'Действия',
            width: 100,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Actions params={params} handleDelete={handleDelete} handleEdit={handleEdit} />
            ),
        },
    )

    return (
        <>
            <Box width={"49%"}>
                <Box display={"flex"} justifyContent={"flex-start"} alignItems={"center"} flexDirection={"column"}>

                    <Box mb={6} display={"flex"} justifyContent={"space-between"} alignItems={"center"} sx={{ width: '100%' }}>
                        <Typography variant={"h5"}>Абонементы</Typography>
                        <CreateEntityButton onClick={handleCreateButtonClick}>
                            Добавить абонемент
                        </CreateEntityButton>
                    </Box>
                    <DataGrid
                        rows={subscriptions}
                        columns={extendedSubscriptionsColumns}
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
            <Modal
                open={modalOpen}
                onClose={handleCancel}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={style}>
                    {isDeleting ? (<SubscriptionDeleteModal onConfirm={handleDeleteConfirm} onCancel={handleCancel}/>) :
                        (<SubscriptionForm isCreating={isCreating} id={subscriptionId} initialValues={formInitValues} onClose={onFormClose} />)}
                </Box>
            </Modal>
        </>
    )
}