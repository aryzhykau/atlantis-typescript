import React, { useState, useMemo } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, TextField, Paper, FormControlLabel, Switch, InputAdornment, alpha } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { useGetTrainersQuery, useCreateTrainerMutation, useUpdateTrainerMutation, useDeleteTrainerMutation, useUpdateTrainerStatusMutation } from '../../../store/apis/trainersApi';
import { ITrainerResponse, ITrainerCreatePayload, ITrainerUpdatePayload, IStatusUpdatePayload } from '../models/trainer';
import { TrainerForm } from './TrainerForm'; 
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useTheme } from '@mui/material';

export function TrainersListPage() {
    const { data: trainersListResponse, isLoading, isError, error } = useGetTrainersQuery();
    const [createTrainer, { isLoading: isCreating }] = useCreateTrainerMutation();
    const [updateTrainer, { isLoading: isUpdating }] = useUpdateTrainerMutation();
    const [deleteTrainerMutation, { isLoading: isDeleting }] = useDeleteTrainerMutation();
    const [updateTrainerStatus, { isLoading: isUpdatingStatus, originalArgs: updatingStatusArgs }] = useUpdateTrainerStatusMutation();

    const { displaySnackbar } = useSnackbar();
    const gradients = useGradients();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState<Partial<ITrainerResponse> | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [showOnlyActive, setShowOnlyActive] = useState(true);

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

        if (showOnlyActive) {
            trainers = trainers.filter(trainer => trainer.is_active === true);
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
    }, [trainersListResponse, searchText, showOnlyActive]);

    const columns: GridColDef<ITrainerResponse>[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 90,
            renderCell: (params: GridRenderCellParams<ITrainerResponse>) => (
                <RouterLink to={`/home/trainers/${params.row.id}`} style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 500 }}>{params.value}</RouterLink>
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
                    return <span style={{ color: theme.palette.success.main, fontWeight: 600 }}>Да</span>;
                } else if (params.value === false) {
                    return <span style={{ color: theme.palette.text.secondary }}>Нет</span>;
                }
                return <span style={{ color: theme.palette.text.disabled }}>-</span>;
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
        <Box sx={{ width: '100%' }}>
            {/* Фильтры и поиск в отдельной карточке */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: gradients.primary,
                    color: 'white',
                    mb: 3,
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    flexWrap: 'wrap',
                    boxShadow: isDark ? '0 2px 8px 0 rgba(0,0,0,0.25)' : '0 2px 8px 0 rgba(80,0,120,0.08)',
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mr: 2 }}>
                    Тренеры
                </Typography>
                <FormControlLabel
                    control={
                        <Switch
                            checked={showOnlyActive}
                            onChange={e => setShowOnlyActive(e.target.checked)}
                            sx={{
                                '& .MuiSwitch-switchBase': {
                                    color: 'white',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: theme.palette.success.light,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: theme.palette.success.light,
                                    opacity: 1,
                                },
                                '& .MuiSwitch-track': {
                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                    opacity: 1,
                                },
                            }}
                        />
                    }
                    label={<Typography variant="body2" sx={{ fontWeight: 600, color: 'white', textShadow: '0 1px 4px rgba(80,0,120,0.25)' }}>Только активные</Typography>}
                    sx={{ mr: 2 }}
                />
                <TextField
                    id="search-trainer"
                    placeholder="Поиск тренера..."
                    type="search"
                    variant="outlined"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <AddIcon sx={{ color: 'white', opacity: 0 }} />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: 2,
                            background: alpha('#fff', 0.12),
                            color: 'white',
                            '& .MuiInputBase-input': { color: 'white' },
                        }
                    }}
                    sx={{ minWidth: 280, maxWidth: 340, input: { color: 'white' },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#fff', 0.3) },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                        '& .MuiInputAdornment-root svg': { color: 'white' },
                    }}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                    sx={{
                        background: 'white',
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 3,
                        boxShadow: 'none',
                        borderRadius: 2,
                        '&:hover': {
                            background: alpha('#ffffff', isDark ? 0.7 : 0.9),
                        }
                    }}
                >
                    Добавить тренера
                </Button>
            </Paper>

            {/* Таблица без внешнего Paper и заголовка */}
            <Box sx={{ width: '100%', p: 0 }}>
                <DataGrid
                    rows={filteredTrainers || []}
                    loading={isLoading}
                    columns={columns}
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
                        borderRadius: 3,
                        background: isDark ? alpha(theme.palette.background.paper, 0.85) : 'white',
                        fontSize: '1rem',
                        color: theme.palette.text.primary,
                        boxShadow: isDark ? '0 2px 8px 0 rgba(0,0,0,0.18)' : '0 2px 8px 0 rgba(80,0,120,0.06)',
                        '& .MuiDataGrid-columnHeaders': {
                            background: alpha(theme.palette.primary.main, isDark ? 0.13 : 0.07),
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            color: theme.palette.primary.main,
                        },
                        '& .MuiDataGrid-row': {
                            transition: 'background 0.2s',
                        },
                        '& .MuiDataGrid-row:hover': {
                            background: alpha(theme.palette.primary.main, isDark ? 0.13 : 0.07),
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        },
                        '& .MuiDataGrid-footerContainer': {
                            background: 'transparent',
                        },
                        '& .MuiDataGrid-selectedRowCount': {
                            display: 'none',
                        },
                        '& .MuiDataGrid-actionsCell': {
                            display: 'flex',
                            gap: 1,
                        },
                    }}
                />
            </Box>
        </Box>
    );
} 