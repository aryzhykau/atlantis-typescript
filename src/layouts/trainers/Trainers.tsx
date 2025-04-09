import {Box, Button, IconButton, Modal} from "@mui/material";
import {DataGrid, GridRenderCellParams} from "@mui/x-data-grid";
import { trainerColums, } from "../../features/trainers/tables/trainersColumns.tsx";
import { useState } from "react";
import { TrainersForm } from "../../features/trainers/components/TrainersForm.tsx";
import { useTrainers } from "../../features/trainers/hooks/trainerManagementHooks.ts";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import {useSnackbar} from "../../hooks/useSnackBar.tsx";
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import {TrainerDeleteModal} from "../../features/trainers/components/TrainerDeleteModal.tsx";
import {ITrainer} from "../../features/trainers/models/trainer.ts";
//import {TrainerDeleteModal} from "../features/trainers/components/TrainerDeleteModal.tsx";



export function TrainersLayout() {

    const {
        trainers,
        displayTrainers,
        setDisplayTrainers,
        isLoadingTrainers,
        deleteTrainer,
        refetchTrainers,
        updateTrainer
    } = useTrainers();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [formTitle, setFormTitle] = useState<string>("Добавить клиента");
    const [isTrainerEdit, setIsTrainerEdit] = useState<boolean>(false);
    const {displaySnackbar} = useSnackbar();
    const [formInitValues, setFormInitValues] = useState<ITrainer | undefined>(undefined);
    const [trainerId, setTrainerId] = useState<number | null>(null);
    const [isDeletingModal, setIsDeletingModal] = useState<boolean>(false);

    const handleCreateBtnClick = () => {
        setIsDeletingModal(false)
        setFormTitle("Добавить тренера")
        setIsTrainerEdit(false);
        setModalOpen(true);
        setFormInitValues(undefined);
    }
    const handleDeleteBtnClick = (params: GridRenderCellParams) => {
        setIsDeletingModal(true);
        setModalOpen(true);
        setTrainerId(Number(params.id));
    }
    const handleDeleteConfirmBtnClick = async () => {
        try {
            if (trainerId === null) throw new Error()
            await deleteTrainer({trainerId: trainerId}).unwrap();
            displaySnackbar("Тренер удален", "success");
            refetchTrainers();
            setModalOpen(false);
            setIsDeletingModal(false);
            setTrainerId(null);
        } catch (e) {
            console.log(e)
            displaySnackbar("Ошибка при удалении тренера", "error");
        }
    }
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === "") {
            setDisplayTrainers(trainers);
        } else {
            setDisplayTrainers(trainers.filter((trainer) =>
                [trainer.first_name, trainer.last_name, trainer.email]
                    .some(field => field?.toLowerCase().startsWith(e.target.value.toLowerCase()))
            ));
        }
    }

    const handleEditBtnClick = (params: GridRenderCellParams) => {
        setIsDeletingModal(false);
        setFormTitle("Изменение Тренера")
        setTrainerId(Number(params.id));
        setIsTrainerEdit(true);
        setModalOpen(true);
        setFormInitValues(params.row);
    }
    const handleDeleteCancelBtnClick = () => {
        setModalOpen(false);
        setIsDeletingModal(false);
        setTrainerId(null);
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

    const extendedTrainerColumns = trainerColums.map((column) => column);
    extendedTrainerColumns.push({
        field: "active",
        headerName: "Активен",
        headerAlign: "center",
        align: "center",
        sortable: false,
        renderCell: (params) => (
            <Switch
                checked={Boolean(params.row.active)}
                onChange={async (event) => {
                    const isActive = event.target.checked;
                    try {
                        console.log(params.row)
                        await updateTrainer({
                            trainerId: Number(params.id),
                            trainerData: {...params.row, active: isActive},
                        }).unwrap();
                        displaySnackbar(
                            `Тренер ${params.row.first_name} ${params.row.last_name} ${isActive ? "теперь активен и может проводить тренировки" : "приостановлен и не сможет проводить тренировки"}`,
                            "success"
                        );
                        await refetchTrainers();
                        console.log(trainers)
                    } catch (error) {
                        console.error(error);
                        displaySnackbar(
                            "Ошибка при изменении состояния активности тренера",
                            "error"
                        );
                    }
                }}
                color="primary"
            />
        ),
    });

    extendedTrainerColumns.push({
        field: "actions",
        headerName: "Действия",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => (
            <Box sx={{display: "flex", gap: "8px"}}>
                <IconButton

                    color="primary"
                    onClick={() => {
                        handleEditBtnClick(params)
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
        <Box sx={{display: "flex", flexDirection: "column"}}>
            <Box sx={{display: "flex", justifyContent: "space-between", mb: "32px"}}>
                <TextField
                    id="filled-search"
                    label="Поиск тренера"
                    type="search"
                    variant="outlined"
                    onChange={handleSearchChange}
                ></TextField>
                <Button variant={"contained"} onClick={handleCreateBtnClick}>
                    Добавить тренера
                </Button>
            </Box>
            <Box sx={{width: "100%"}}>
                <DataGrid
                    rows={displayTrainers || []}
                    loading={isLoadingTrainers}
                    columns={extendedTrainerColumns}

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
                    {!isDeletingModal ? (
                        <TrainersForm onClose={handleModalClose} isEdit={isTrainerEdit} title={formTitle}
                                     initialValues={formInitValues} trainerId={trainerId}></TrainersForm>
                    ) : (
                        <TrainerDeleteModal onConfirm={handleDeleteConfirmBtnClick}
                                           onCancel={handleDeleteCancelBtnClick}/>
                    )
                    }
                </Box>
            </Modal>


        </Box>
    );
}