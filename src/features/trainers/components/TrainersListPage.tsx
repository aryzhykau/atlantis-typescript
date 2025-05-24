import React, { useState, useMemo } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, TextField, Select, MenuItem, FormControl, InputLabel, Switch, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Paper, Chip, Link as MuiLink } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridActionsCellItem } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';
import { AddCircleOutline, Edit, Delete } from '@mui/icons-material';
import { useGetTrainersQuery, useCreateTrainerMutation, useUpdateTrainerMutation, useDeleteTrainerMutation, useUpdateTrainerStatusMutation } from '../../../store/apis/trainersApi';
import { ITrainerResponse, ITrainerCreatePayload, ITrainerUpdatePayload, IStatusUpdatePayload } from '../models/trainer';
import { TrainerForm } from './TrainerForm'; 
import { useSnackbar } from '../../../hooks/useSnackBar';

export function TrainersListPage() {
    const { data: trainersListResponse, isLoading, isError, error } = useGetTrainersQuery();
    const [createTrainer, { isLoading: isCreating }] = useCreateTrainerMutation();
    const [updateTrainer, { isLoading: isUpdating }] = useUpdateTrainerMutation();
    const [deleteTrainerMutation, { isLoading: isDeleting }] = useDeleteTrainerMutation();
    const [updateTrainerStatus, { isLoading: isUpdatingStatus, originalArgs: updatingStatusArgs }] = useUpdateTrainerStatusMutation();

    const { displaySnackbar } = useSnackbar();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState<Partial<ITrainerResponse> | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [trainerToDelete, setTrainerToDelete] = useState<ITrainerResponse | null>(null);

    const handleOpenModal = (trainer?: ITrainerResponse) => {
        if (trainer) {
            setEditingTrainer(trainer);
            setIsEditMode(true);
        } else {
            setEditingTrainer(null);
            setIsEditMode(false);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTrainer(null);
    };

    const handleFormSubmit = async (values: ITrainerCreatePayload | ITrainerUpdatePayload, id?: number) => {
        try {
            if (isEditMode && id) {
                await updateTrainer({ trainerId: id, trainerData: values as ITrainerUpdatePayload }).unwrap();
                displaySnackbar('Тренер успешно обновлен', 'success');
            } else {
                await createTrainer(values as ITrainerCreatePayload).unwrap();
                displaySnackbar('Тренер успешно создан', 'success');
            }
            handleCloseModal();
        } catch (err: any) {
            console.error("Ошибка при сохранении тренера: ", err);
            const errorMessage = err?.data?.detail || (isEditMode ? 'Ошибка обновления тренера' : 'Ошибка создания тренера');
            displaySnackbar(errorMessage, 'error');
        }
    };

    const handleOpenDeleteDialog = (trainer: ITrainerResponse) => {
        setTrainerToDelete(trainer);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setTrainerToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleDeleteConfirm = async () => {
        if (!trainerToDelete) return;
        try {
            await deleteTrainerMutation({ trainerId: trainerToDelete.id }).unwrap();
            displaySnackbar(`Тренер ${trainerToDelete.first_name} ${trainerToDelete.last_name} успешно удален`, 'success');
            handleCloseDeleteDialog();
        } catch (err: any) {
            console.error("Ошибка при удалении тренера: ", err);
            const errorMessage = err?.data?.detail || 'Ошибка удаления тренера';
            displaySnackbar(errorMessage, 'error');
        }
    };

    const handleToggleTrainerStatus = async (trainer: ITrainerResponse) => {
        const newStatus: IStatusUpdatePayload = { is_active: !trainer.is_active };
        try {
            await updateTrainerStatus({ trainerId: trainer.id, statusData: newStatus }).unwrap();
            displaySnackbar(`Статус тренера ${trainer.first_name} ${trainer.last_name} успешно изменен`, 'success');
        } catch (err: any) {
            console.error("Ошибка при изменении статуса тренера: ", err);
            const errorMessage = err?.data?.detail || 'Ошибка изменения статуса';
            displaySnackbar(errorMessage, 'error');
        }
    };

    const filteredTrainers = useMemo(() => {
        if (!trainersListResponse?.trainers) return [];
        let trainers = [...trainersListResponse.trainers];

        if (statusFilter !== 'all') {
            trainers = trainers.filter(trainer => trainer.is_active === (statusFilter === 'active'));
        }

        if (searchText) {
            const lowerSearchText = searchText.toLowerCase();
            trainers = trainers.filter(trainer =>
                (trainer.first_name || '').toLowerCase().includes(lowerSearchText) ||
                (trainer.last_name || '').toLowerCase().includes(lowerSearchText) ||
                (trainer.email || '').toLowerCase().includes(lowerSearchText) ||
                (trainer.phone || '').toLowerCase().includes(lowerSearchText)
            );
        }
        return trainers.sort((a, b) => a.id - b.id); 
    }, [trainersListResponse, searchText, statusFilter]);

    const columns: GridColDef<ITrainerResponse>[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 90,
            renderCell: (params: GridRenderCellParams<ITrainerResponse>) => (
                <MuiLink component={RouterLink} to={`/home/trainers/${params.row.id}`}>
                    {params.value}
                </MuiLink>
            ),
        },
        {
            field: 'fullName',
            headerName: 'ФИО',
            flex: 1,
            minWidth: 150,
            valueGetter: (_value, row) => `${row.first_name || ''} ${row.last_name || ''}`,
        },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
        { field: 'phone', headerName: 'Телефон', flex: 1, minWidth: 130 },
        {
            field: 'salary',
            headerName: 'Оклад',
            type: 'number',
            width: 120,
            valueFormatter: (value: number | null) => value == null ? '-' : `${value}`,
        },
        {
            field: 'is_fixed_salary',
            headerName: 'Фикс. оклад',
            align: 'center',
            width: 130,
            renderCell: (params: GridRenderCellParams<ITrainerResponse, ITrainerResponse['is_fixed_salary']>) => {
                if (params.value === true) {
                    return <Chip label="Да" color="success" size="small" variant="outlined" />;
                } else if (params.value === false) {
                    return <Chip label="Нет" color="default" size="small" variant="outlined" />;
                }
                return <Chip label="-" size="small" variant="outlined" />;
            },
        }
    ];

    if (isLoading && !trainersListResponse) { 
        return <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: '100%', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (isError) {
        console.error("Ошибка загрузки тренеров: ", error);
        return <Alert severity="error">Не удалось загрузить список тренеров. Пожалуйста, попробуйте позже.</Alert>;
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, height: 'calc(100vh - 64px - 32px)', width: '100%' }}> 
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} md={4} lg={5}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Поиск тренера"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        size="small"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>Статус</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                            label="Статус"
                        >
                            <MenuItem value="all">Все</MenuItem>
                            <MenuItem value="active">Активные</MenuItem>
                            <MenuItem value="inactive">Неактивные</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={5} lg={4} sx={{ display: 'flex', justifyContent: {xs: 'flex-start', sm: 'flex-end'} }}>
                    <Button
                        variant="contained"
                        startIcon={<AddCircleOutline />}
                        onClick={() => handleOpenModal()}
                    >
                        Добавить тренера
                    </Button>
                </Grid>
            </Grid>

            <Box sx={{ width: '100%' }}>
                <DataGrid
                    rows={filteredTrainers}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10, page: 0 },
                        },
                    }}
                    loading={isLoading || isCreating || isUpdating || isDeleting || isUpdatingStatus}
                    disableRowSelectionOnClick
                    sx={{
                        
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: (theme) => theme.palette.background.paper,
                        },
                    }}
                />
            </Box>   

            <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: { m: 1, borderRadius: 2 } }}>
                <DialogContent sx={{ p: 0, '&:first-of-type': { pt: 0 } }}> 
                    <TrainerForm
                        title={isEditMode ? "Редактировать тренера" : "Добавить тренера"}
                        initialValues={editingTrainer || undefined} 
                        onSubmit={handleFormSubmit}
                        onClose={handleCloseModal}
                        isEdit={isEditMode}
                        isLoading={isCreating || isUpdating}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
} 