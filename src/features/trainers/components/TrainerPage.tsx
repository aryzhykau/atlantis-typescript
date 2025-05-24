import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, IconButton, Paper, Tabs, Tab, Button, Grid, Dialog, DialogContent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGetTrainerByIdQuery, useUpdateTrainerStatusMutation, useUpdateTrainerMutation } from '../../../store/apis/trainersApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { TrainerInfoCard } from './TrainerInfoCard';
import { TrainerForm } from './TrainerForm';
import { ITrainerUpdatePayload, IStatusUpdatePayload, ITrainerResponse } from '../models/trainer';
import dayjs from 'dayjs';

// Пока без карточек, добавим их позже
// import { TrainerInfoCard } from './TrainerInfoCard'; 

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`trainer-tabpanel-${index}`}
            aria-labelledby={`trainer-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `trainer-tab-${index}`,
        'aria-controls': `trainer-tabpanel-${index}`,
    };
}

export function TrainerPage() {
    const { trainerId } = useParams<{ trainerId: string }>();
    const navigate = useNavigate();
    const { displaySnackbar } = useSnackbar();
    const [activeTab, setActiveTab] = React.useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTrainerData, setEditingTrainerData] = useState<Partial<ITrainerResponse> | null>(null);

    const { 
        data: trainer,
        isLoading,
        isError,
        error,
        refetch: refetchTrainer
    } = useGetTrainerByIdQuery(Number(trainerId), {
        skip: !trainerId, 
        refetchOnMountOrArgChange: true,
    });

    const [updateTrainer, { isLoading: isUpdatingTrainer }] = useUpdateTrainerMutation();
    const [updateTrainerStatus, { isLoading: isUpdatingStatus }] = useUpdateTrainerStatusMutation();

    useEffect(() => {
        if (isError) {
            displaySnackbar('Ошибка загрузки данных тренера', 'error');
            console.error('TrainerPage Error:', error);
        }
    }, [isError, error, displaySnackbar]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleOpenEditModal = () => {
        if (trainer) {
            setEditingTrainerData(trainer); // Заполняем форму текущими данными тренера
            setIsEditModalOpen(true);
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingTrainerData(null);
    };

    const handleEditFormSubmit = async (values: ITrainerUpdatePayload, id?: number) => {
        if (!id) {
            displaySnackbar('ID тренера не найден для обновления', 'error');
            return;
        }
        try {
            await updateTrainer({ trainerId: id, trainerData: values }).unwrap();
            displaySnackbar('Данные тренера успешно обновлены', 'success');
            refetchTrainer();
            handleCloseEditModal();
        } catch (err: any) {
            console.error("Ошибка при обновлении тренера: ", err);
            const errorMessage = err?.data?.detail || 'Ошибка обновления тренера';
            displaySnackbar(errorMessage, 'error');
        }
    };

    const handleChangeStatus = async () => {
        if (!trainer) return;
        const newStatusPayload: IStatusUpdatePayload = { is_active: !trainer.is_active };
        try {
            await updateTrainerStatus({ trainerId: trainer.id, statusData: newStatusPayload }).unwrap();
            displaySnackbar(`Статус тренера ${trainer.first_name} ${trainer.last_name} успешно изменен`, 'success');
            refetchTrainer(); // Обновляем данные тренера на странице
        } catch (err: any) {
            console.error("Ошибка при изменении статуса тренера: ", err);
            const errorMessage = err?.data?.detail || 'Ошибка изменения статуса';
            displaySnackbar(errorMessage, 'error');
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!trainer) {
        return (
            <Box sx={{ p:3, textAlign: 'center' }}>
                <Typography variant="h5">Тренер не найден</Typography>
                <Button onClick={handleBackClick} sx={{mt: 2}}>Назад к списку</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <IconButton onClick={handleBackClick} sx={{ mb: 2 }}>
                <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" gutterBottom>
                Тренер: {trainer.first_name} {trainer.last_name}
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="Trainer details tabs">
                    <Tab label="Обзор" {...a11yProps(0)} />
                    <Tab label="Тренировки" {...a11yProps(1)} />
                </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={5}>
                        <TrainerInfoCard 
                            trainer={trainer} 
                            onEdit={handleOpenEditModal} 
                            onStatusChange={handleChangeStatus} 
                        />
                    </Grid>
                    {/* Можно добавить другие карточки сюда, например, для статистики или связанных данных */}
                </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <Typography>Информация о тренировках будет здесь.</Typography>
            </TabPanel>

            {editingTrainerData && (
                 <Dialog open={isEditModalOpen} onClose={handleCloseEditModal} maxWidth="sm" fullWidth PaperProps={{ sx: { m: 1, borderRadius: 2 } }}>
                    <DialogContent sx={{ p: 0, '&:first-of-type': { pt: 0 } }}> 
                        <TrainerForm
                            title="Редактировать тренера"
                            initialValues={editingTrainerData}
                            onSubmit={handleEditFormSubmit}
                            onClose={handleCloseEditModal}
                            isEdit={true}
                            isLoading={isUpdatingTrainer}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    );
} 