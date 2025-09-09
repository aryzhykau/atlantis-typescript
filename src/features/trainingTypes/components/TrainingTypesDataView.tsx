import {Box, Dialog, DialogContent, Typography, Chip, Button} from "@mui/material";
import {DataGrid, GridRenderCellParams, GridColDef} from "@mui/x-data-grid";
import TrainingTypeForm from "./TrainingTypeForm.tsx";
import {useState} from "react";
import {trainingTypeColumns} from "../tables/trainingTypeColumns.tsx";
import {ITrainingType} from "../../training-types/models/trainingType.ts";
import CreateEntityButton from "../../../components/buttons/CreateEntityButton.tsx";
import {useGetTrainingTypesQuery, useUpdateTrainingTypeMutation} from "../../../store/apis/trainingTypesApi.ts";


const trainingTypeInitialValues: Partial<ITrainingType> = {name: "", price: null, max_participants: 4, color: "#FFFFFF", is_subscription_only: false, is_active: true};

export function TrainingTypesDataView() {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const {data: trainingTypesResponse, isLoading: isLoadingTrainingTypes} = useGetTrainingTypesQuery({});
    const trainingTypes: ITrainingType[] = trainingTypesResponse || [];
    
    const [, {isLoading: isUpdatingStatus}] = useUpdateTrainingTypeMutation();
    
    const [isCreating, setIsCreating] = useState<boolean>(true);
    const [currentTrainingTypeForForm, setCurrentTrainingTypeForForm] = useState<Partial<ITrainingType> | null>(null);

    const handleCreateButtonClick = () => {
        setCurrentTrainingTypeForForm(trainingTypeInitialValues);
        setIsCreating(true);
        setModalOpen(true);
    }

    const handleEdit = (trainingType: ITrainingType) => {
        setCurrentTrainingTypeForForm(trainingType);
        setIsCreating(false);
        setModalOpen(true);
    };

    const onFormClose = () => {
        setModalOpen(false);
        setCurrentTrainingTypeForForm(null);
    }


    const columns: GridColDef<ITrainingType>[] = [
        ...trainingTypeColumns,
        {
            field: 'is_active',
            headerName: 'Статус',
            width: 150,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params: GridRenderCellParams<ITrainingType>) => (
                    <Chip
                        label={params.value ? "Активен" : "Неактивен"}
                        color={params.value ? "success" : "default"}
                        size="small"
                        variant={params.value ? "filled" : "outlined"}
                        sx={{ mr: 1 }}
                    />
                
            ),
        },
        {
            field: 'editAction',
            headerName: 'Изменить',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params: GridRenderCellParams<ITrainingType>) => (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEdit(params.row)}
                >
                    Edit
                </Button>
            ),
        }
    ];

    return (
        <Box width="49%" display="flex" flexDirection="column">
            <Box display={"flex"} justifyContent={"flex-start"} flexDirection={"column"} sx={{ width: '100%' }}>
                <Box mb={2} display={"flex"} justifyContent={"space-between"} alignItems={"center"} sx={{ width: '100%' }}>
                    <Typography variant={"h5"}>Виды тренировок</Typography>
                    <CreateEntityButton onClick={handleCreateButtonClick}>
                        Добавить вид тренировки
                    </CreateEntityButton>
                </Box>
                <DataGrid<ITrainingType>
                    rows={trainingTypes}
                    columns={columns}
                    loading={isLoadingTrainingTypes || isUpdatingStatus}
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
                    getRowId={(row) => row.id}
                />
            </Box>
            <Dialog open={modalOpen} onClose={onFormClose} maxWidth="sm" fullWidth PaperProps={{ sx: { m: { xs: 1, sm: 2 }, borderRadius: 2 } }}>
                <DialogContent sx={{ p: 0, '&:first-of-type': { pt: 0 } }}>
                    {currentTrainingTypeForForm && (
                         <TrainingTypeForm
                            trainingTypeId={currentTrainingTypeForForm.id}
                            initialValues={currentTrainingTypeForForm}
                            onClose={onFormClose}
                            isCreating={isCreating}
                         />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    )
}