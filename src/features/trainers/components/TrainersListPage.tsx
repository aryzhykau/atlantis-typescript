import React, { useState, useMemo } from 'react';
import { Box, Button, Typography, TextField, Paper, FormControlLabel, Switch, InputAdornment, alpha, Dialog, DialogContent } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { useGetTrainersQuery, useCreateTrainerMutation, useUpdateTrainerMutation, useDeleteTrainerMutation, useUpdateTrainerStatusMutation } from '../../../store/apis/trainersApi';
import { ITrainerResponse, ITrainerCreatePayload, ITrainerUpdatePayload, IStatusUpdatePayload } from '../models/trainer';
import { TrainerForm } from './TrainerForm'; 
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';

export function TrainersListPage() {
    const { data: trainersListResponse, isLoading, isError, error } = useGetTrainersQuery();
    const [createTrainer, { isLoading: isCreating }] = useCreateTrainerMutation();
    const [updateTrainer, { isLoading: isUpdating }] = useUpdateTrainerMutation();
    const [deleteTrainerMutation, { isLoading: isDeleting }] = useDeleteTrainerMutation();
    const [updateTrainerStatus, { isLoading: isUpdatingStatus, originalArgs: updatingStatusArgs }] = useUpdateTrainerStatusMutation();

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
            } else {
                await createTrainer(values as ITrainerCreatePayload).unwrap();
            }
            handleCloseModal();
        } catch (err: any) {
            console.error("Ошибка при сохранении тренера: ", err);
            const errorMessage = err?.data?.detail || (isEditMode ? 'Ошибка обновления тренера' : 'Ошибка создания тренера');
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
        } catch (err: any) {
            console.error("Ошибка при удалении тренера: ", err);
            const errorMessage = err?.data?.detail || 'Ошибка удаления тренера';
        }
    };

    const handleToggleTrainerStatus = async (trainer: ITrainerResponse) => {
        const newStatus: IStatusUpdatePayload = { is_active: !trainer.is_active };
        try {
            await updateTrainerStatus({ trainerId: trainer.id, statusData: newStatus }).unwrap();
        } catch (err: any) {
            console.error("Ошибка при изменении статуса тренера: ", err);
            const errorMessage = err?.data?.detail || 'Ошибка изменения статуса';
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

            {/* Модальное окно для создания/редактирования тренера */}
            {isModalOpen && (
                <Dialog
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                        }
                    }}
                >
                    {/* Градиентный заголовок модального окна */}
                    <Box
                        sx={{
                            p: 3,
                            background: gradients.primary,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                background: 'url("data:image/svg+xml,%3Csvg width=\\"60\\" height=\\"60\\" viewBox=\\"0 0 60 60\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"none\\" fill-rule=\\"evenodd\\"%3E%3Cg fill=\\"%23ffffff\\" fill-opacity=\\"0.1\\"%3E%3Ccircle cx=\\"30\\" cy=\\"30\\" r=\\"2\\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                                opacity: isDark ? 0.18 : 0.3,
                            }
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                <AddIcon sx={{ fontSize: 28, mr: 1 }} />
                                {isEditMode ? 'Редактировать тренера' : 'Добавить тренера'}
                            </Typography>
                            <Button
                                aria-label="Закрыть"
                                onClick={handleCloseModal}
                                sx={{
                                    color: 'white',
                                    minWidth: 0,
                                    p: 1.2,
                                    ml: 2,
                                    borderRadius: 2,
                                    '&:hover': {
                                        background: alpha('#ffffff', 0.15),
                                    }
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                            </Button>
                        </Box>
                    </Box>
                    {/* Контент модального окна */}
                    <DialogContent sx={{ p: 3, '&:first-of-type': { pt: 0 }, background: isDark ? 'rgba(40,40,50,0.45)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)' }}>
                        <TrainerForm
                            title={isEditMode ? 'Редактировать тренера' : 'Добавить тренера'}
                            initialValues={editingTrainer || undefined}
                            onSubmit={handleFormSubmit}
                            onClose={handleCloseModal}
                            isEdit={isEditMode}
                            isLoading={isCreating || isUpdating}
                            stickyActions
                        />
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    );
} 