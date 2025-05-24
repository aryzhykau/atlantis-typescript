import {Box, Button, Dialog, DialogContent, Typography} from "@mui/material";
import {DataGrid, GridRenderCellParams, GridColDef} from "@mui/x-data-grid";
import SubscriptionForm from "./SubscriptionForm.tsx";
import {useState} from "react";
import {
    useGetSubscriptionsQuery,
    useDeleteSubscriptionMutation
} from "../../../store/apis/subscriptionsApi.ts";
import {subscriptionsColumns} from "../tables/subscriptionsColumns.tsx";
import { ISubscriptionResponse, ISubscriptionCreatePayload } from "../models/subscription.ts";
import CreateEntityButton from "../../../components/buttons/CreateEntityButton.tsx";
import {SubscriptionDeleteModal} from "./SubscriptionDeleteModal.tsx";
import {useSnackbar} from "../../../hooks/useSnackBar.tsx";
import { Modal } from "@mui/material";

const modalDeleteStyle = {
    position: "absolute" as "absolute",
    width: "35%",
    minWidth: 320,
    maxWidth: 500,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    borderRadius: '8px',
    boxShadow: 24,
    p: 3,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    outline: 'none',
};

const subscriptionInitialValues: ISubscriptionCreatePayload = {name: "", price: 0, is_active: true, validity_days: 30, number_of_sessions: 1}

export function SubscriptionsDataView() {
    const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

    const {data: subscriptionsData, isLoading, isError, error} = useGetSubscriptionsQuery();
    const subscriptions = subscriptionsData?.items || [];

    const [deleteSubscriptionMutation] = useDeleteSubscriptionMutation();

    const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
    const [formInitValues, setFormInitValues] = useState<Partial<ISubscriptionResponse>>(subscriptionInitialValues)
    const [isCreating, setIsCreating] = useState<boolean>(true);
    const {displaySnackbar} = useSnackbar();

    const handleCreateButtonClick = () => {
        setIsCreating(true)
        setSubscriptionId(null);
        setFormInitValues(subscriptionInitialValues);
        setFormModalOpen(true);
    }
    const handleEdit = (row: ISubscriptionResponse) => {
        setSubscriptionId(row.id);
        const initialData: Partial<ISubscriptionResponse> = {
            name: row.name,
            price: row.price,
            validity_days: row.validity_days,
            is_active: row.is_active,
            number_of_sessions: row.number_of_sessions,
            id: row.id
        };
        setFormInitValues(initialData);
        setIsCreating(false);
        setFormModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setSubscriptionId(id);
        setDeleteModalOpen(true);
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setSubscriptionId(null);
    }

    const handleDeleteConfirm = async () => {
        if (!subscriptionId) return;
        try {
            await deleteSubscriptionMutation({subscriptionId}).unwrap();
            displaySnackbar("Абонемент успешно удален", "success")
        }
        catch (e: unknown) {
            console.error("Ошибка удаления абонемента:", e);
            const errorDetail = (e as any)?.data?.detail || 'Не удалось удалить абонемент';
            displaySnackbar(String(errorDetail), "error");
        } finally {
            setDeleteModalOpen(false);
            setSubscriptionId(null);
        }
    }

    const onFormClose = () => {
        setFormModalOpen(false);
        setSubscriptionId(null);
    }

    const extendedSubscriptionsColumns: GridColDef<ISubscriptionResponse>[] = [
        ...subscriptionsColumns,
        {
            field: 'editAction',
            headerName: 'Изменить',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params: GridRenderCellParams<ISubscriptionResponse>) => (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEdit(params.row)}
                >
                    Edit
                </Button>
            ),
        }
    ]

    if (isError) {
        return <Typography color="error">Ошибка загрузки абонементов: {JSON.stringify(error)}</Typography>;
    }

    return (
        <Box width="49%" display="flex" flexDirection="column">
            <Box display={"flex"} justifyContent={"flex-start"} alignItems={"center"} flexDirection={"column"} sx={{width: "100%"}}>
                <Box mb={2} display={"flex"} justifyContent={"space-between"} alignItems={"center"} sx={{ width: '100%' }}>
                        <Typography variant={"h5"}>Абонементы</Typography>
                        <CreateEntityButton onClick={handleCreateButtonClick}>
                            Добавить абонемент
                        </CreateEntityButton>
                    </Box>
                    <DataGrid
                        rows={subscriptions}
                        columns={extendedSubscriptionsColumns}
                        loading={isLoading}
                    pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                        }}
                        disableRowSelectionOnClick
                    autoHeight
                        sx={{
                            width: '100%',
                        borderRadius: 1,
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: (theme) => theme.palette.background.paper,
                            },
                        }}
                    getRowId={(row: ISubscriptionResponse) => row.id}
                    />
            </Box>
            <Dialog
                open={formModalOpen}
                onClose={onFormClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { m: { xs: 1, sm: 2 }, borderRadius: 2 } }}
                aria-labelledby="dialog-title-subscription-form"
            >
                <DialogContent sx={{ p: 0, '&:first-of-type': { pt: 0 } }}>
                     <SubscriptionForm
                        isCreating={isCreating}
                        initialValues={formInitValues}
                        onClose={onFormClose}
                        key={subscriptionId || 'new'}
                     />
                </DialogContent>
            </Dialog>
                </Box>
    )
}