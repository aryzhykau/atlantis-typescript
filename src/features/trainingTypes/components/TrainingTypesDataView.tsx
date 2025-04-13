import {Box, Modal, Typography} from "@mui/material";
import {DataGrid, GridRenderCellParams} from "@mui/x-data-grid";
import TrainingTypeForm from "./TrainingTypeForm.tsx";
import {useState} from "react";
import {useTrainingTypes} from "../hooks/useTrainingTypes.ts";
import {trainingTypeColumns} from "../tables/trainingTypeColumns.tsx";
import {ITrainingType, ITrainingTypeGet} from "../models/trainingType.ts";
import Actions from "../../../components/datagrid/Actions.tsx";
import CreateEntityButton from "../../../components/buttons/CreateEntityButton.tsx";
import {TrainingTypeDeleteModal} from "./TrainingTypeDeleteModal.tsx";
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

const trainingTypeInitialValues = {title: "", price: 0, color: "#FFFFFF", require_subscription: false}

export function TrainingTypesDataView() {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const {trainingTypes, isLoading, deleteTrainingType, refetchTrainingTypes} = useTrainingTypes();
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isCreating, setIsCreating] = useState<boolean>(true);
    const [trainingTypeId, setTrainingTypeId] = useState<number>(0);
    const {displaySnackbar} = useSnackbar();
    const [formInitValues, setFormInitValues] = useState<ITrainingType>(trainingTypeInitialValues)

    const handleCreateButtonClick = () => {
        setFormInitValues(trainingTypeInitialValues)
        setIsCreating(true)
        setModalOpen((prev) => !prev)
    }

    const handleEdit = (row: ITrainingTypeGet) => {
        setFormInitValues({
            price: row.price,
            title: row.title,
            color: row.color,
            require_subscription: row.require_subscription,
        })
        setTrainingTypeId(row.id);
        console.log('Edit:', row);
        setIsCreating(false);
        setModalOpen((prev) => !prev)
        // Add your logic for editing here
    };

    const handleDelete = (id: number) => {
        console.log('Delete ID:', id);
        setIsDeleting(true);
        setTrainingTypeId(id);
        setModalOpen(true);

        // Add your logic for deletion here
    };
    const handleCancel = () => {
        setIsDeleting(false);
        setModalOpen(false);
    }
    const handleDeleteConfirm = async () => {
        try {
            await deleteTrainingType({trainingTypeId}).unwrap();
            await refetchTrainingTypes();
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

    const extendedTrainingTypeColumns = trainingTypeColumns.map((column) => column);
    extendedTrainingTypeColumns.push(
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
                        <Typography variant={"h5"}>Виды тренировок</Typography>
                        <CreateEntityButton onClick={handleCreateButtonClick}>
                            Добавить вид тренировки
                        </CreateEntityButton>
                    </Box>
                    <DataGrid
                        rows={trainingTypes}
                        columns={extendedTrainingTypeColumns}
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
                onClose={() => handleCancel()}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={style}>
                    {isDeleting ? (<TrainingTypeDeleteModal onCancel={handleCancel} onConfirm={handleDeleteConfirm}/>) :
                        (<TrainingTypeForm id={trainingTypeId} initialValues={formInitValues} onClose={onFormClose} isCreating={isCreating} />)}
                </Box>
            </Modal>
    </>
    )
}