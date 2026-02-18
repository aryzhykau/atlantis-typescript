import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    IconButton, 
    Paper, 
    Tabs, 
    Tab, 
    Button, 
    Grid, 
    Dialog, 
    DialogContent,
    alpha,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGetTrainerByIdQuery, useUpdateTrainerStatusMutation, useUpdateTrainerMutation } from '../../../store/apis/trainersApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { TrainerInfoCard } from './TrainerInfoCard';
import { TrainerForm } from './TrainerForm';
import { ITrainerUpdatePayload, IStatusUpdatePayload, ITrainerResponse } from '../models/trainer';
import dayjs from 'dayjs';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useTheme } from '@mui/material';
import TrainerPaymentsTab from './TrainerPaymentsTab';
import TrainerSalaryTab from './TrainerSalaryTab';
import { useIsOwner } from '../../../hooks/usePermissions';
import { MobileFormBottomSheet } from '../../../components/mobile-kit';

// Иконки для статистики
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import useMobile from '../../../hooks/useMobile.tsx';
import AnimatedLogoLoader from '../../calendar-v2/components/common/loaders/AnimatedLogoLoader';

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
            style={{ height: '100%' }}
            {...other}
        >
            {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `trainer-tab-${index}`,
        'aria-controls': `trainer-tabpanel-${index}`,
    };
}

// Компонент статистической карточки
interface StatCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, gradient }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                background: gradient,
                borderRadius: 3,
                color: 'white',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                }
            }}
        >
            <Box sx={{ mb: 1 }}>
                {icon}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {value}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {label}
            </Typography>
        </Paper>
    );
};

// Компонент статистики тренера
interface TrainerStatsProps {
    age: number;
    salary: number;
    isActive: boolean;
    isFixedSalary: boolean;
    showSalary?: boolean;
}

const TrainerStats: React.FC<TrainerStatsProps> = ({ age, salary, isActive, isFixedSalary, showSalary = true }) => {
    const gradients = useGradients();
    
    return (
        <Grid container spacing={2}>
            <Grid item xs={showSalary ? 6 : 12} sm={showSalary ? 3 : 4}>
                <StatCard
                    icon={<PersonIcon sx={{ fontSize: 32 }} />}
                    value={`${age} лет`}
                    label="Возраст"
                    gradient={gradients.primary}
                />
            </Grid>
            {showSalary && (
                <>
                    <Grid item xs={6} sm={3}>
                        <StatCard
                            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
                            value={`${salary} €`}
                            label="Оклад"
                            gradient={gradients.success}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <StatCard
                            icon={<WorkIcon sx={{ fontSize: 32 }} />}
                            value={isFixedSalary ? "Фиксированный" : "Процентный"}
                            label="Тип оклада"
                            gradient={gradients.info}
                        />
                    </Grid>
                </>
            )}
            <Grid item xs={showSalary ? 6 : 12} sm={showSalary ? 3 : 4}>
                <StatCard
                    icon={<CheckCircleOutlineIcon sx={{ fontSize: 32 }} />}
                    value={isActive ? "Активен" : "Неактивен"}
                    label="Статус"
                    gradient={isActive ? gradients.success : gradients.warning}
                />
            </Grid>
        </Grid>
    );
};

export function TrainerPage() {
    const isMobile = useMobile();
    const isBottomSheetFormEnabled = isMobile && import.meta.env.VITE_MOBILE_CLIENT_FORM_VARIANT === 'bottomsheet';
    const { trainerId } = useParams<{ trainerId: string }>();
    const navigate = useNavigate();
    const { displaySnackbar } = useSnackbar();
    const theme = useTheme();
    const gradients = useGradients();
    const isOwner = useIsOwner();
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
    const [updateTrainerStatus] = useUpdateTrainerStatusMutation();

    useEffect(() => {
        if (isError) {
            displaySnackbar('Ошибка загрузки данных тренера', 'error');
            console.error('TrainerPage Error:', error);
        }
    }, [isError, error, displaySnackbar]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleOpenEditModal = () => {
        if (trainer) {
            setEditingTrainerData(trainer);
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
            refetchTrainer();
        } catch (err: any) {
            console.error("Ошибка при изменении статуса тренера: ", err);
            const errorMessage = err?.data?.detail || 'Ошибка изменения статуса';
            displaySnackbar(errorMessage, 'error');
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ position: 'relative', minHeight: '100vh' }}>
                <AnimatedLogoLoader open={true} message="Загружается карточка тренера..." />
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

    // Вычисляем статистику
    const salary = trainer.salary || 0;
    const isActive = trainer.is_active ?? false;
    const isFixedSalary = trainer.is_fixed_salary ?? false;
    const age = dayjs().diff(dayjs(trainer.date_of_birth), 'year');

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxHeight: "90vh", overflow: 'scroll' }}>
            {/* Градиентный заголовок */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    p: 3,
                    background: gradients.primary,
                    borderRadius: 3,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        opacity: 0.3,
                    }
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton 
                            onClick={handleBackClick} 
                            sx={{ 
                                color: 'white',
                                mr: 2,
                                '&:hover': {
                                    background: alpha('#ffffff', 0.2),
                                }
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center' }}>
                                🏋️ {trainer.first_name} {trainer.last_name}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
                                Карточка тренера #{trainer.id}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Статистика тренера */}
            <TrainerStats
                age={age}
                salary={salary}
                isActive={isActive}
                isFixedSalary={isFixedSalary}
                showSalary={isOwner}
            />

            {/* Стилизованные табы */}
            <Paper
                elevation={0}
                sx={{
                    mt: 3,
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                }}
            >
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    aria-label="Trainer details tabs"
                    sx={{
                        background: alpha(theme.palette.primary.main, 0.05),
                        '& .MuiTab-root': {
                            minHeight: 64,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            color: 'text.secondary',
                            '&.Mui-selected': {
                                color: theme.palette.primary.main,
                                background: theme.palette.background.paper,
                            },
                            '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                            }
                        },
                        '& .MuiTabs-indicator': {
                            background: gradients.primary,
                            height: 3,
                        }
                    }}
                >
                    <Tab label="📊 Обзор" {...a11yProps(0)} />
                    <Tab label="🏋️ Тренировки" {...a11yProps(1)} />
                    <Tab label="💰 Платежи" {...a11yProps(2)} />
                    {!isFixedSalary && isOwner && <Tab label="💸 Зарплата" {...a11yProps(3)} />}
                </Tabs>
            </Paper>

            <Box sx={{ flexGrow: 1 }}>
                <TabPanel value={activeTab} index={0}>
                    <TrainerInfoCard 
                        trainer={trainer} 
                        onEdit={handleOpenEditModal} 
                        onStatusChange={handleChangeStatus}
                        showSalary={isOwner}
                        hideActions={isMobile}
                    />
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    <Typography>Информация о тренировках будет здесь.</Typography>
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                    <TrainerPaymentsTab trainerId={trainer.id} />
                </TabPanel>

                {!isFixedSalary && isOwner && (
                    <TabPanel value={activeTab} index={3}>
                        <TrainerSalaryTab trainerId={trainer.id} />
                    </TabPanel>
                )}
            </Box>
            
            {isBottomSheetFormEnabled ? (
                <MobileFormBottomSheet
                    open={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    title="✏️ Редактировать тренера"
                >
                    {editingTrainerData && (
                        <TrainerForm
                            title="Редактировать тренера"
                            initialValues={editingTrainerData}
                            onSubmit={handleEditFormSubmit}
                            onClose={handleCloseEditModal}
                            isEdit={true}
                            isLoading={isUpdatingTrainer}
                            useDialogContainer={false}
                        />
                    )}
                </MobileFormBottomSheet>
            ) : (
                <Dialog 
                    open={isEditModalOpen} 
                    onClose={handleCloseEditModal} 
                    maxWidth="sm" 
                    fullWidth 
                    PaperProps={{ 
                        sx: { 
                            m: 1, 
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
                                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                                opacity: 0.3,
                            }
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                                ✏️ Редактировать тренера
                            </Typography>
                        </Box>
                    </Box>
                    
                    <DialogContent sx={{ p: 0, '&:first-of-type': { pt: 0 } }}> 
                        {editingTrainerData && (
                            <TrainerForm
                                title="Редактировать тренера"
                                initialValues={editingTrainerData}
                                onSubmit={handleEditFormSubmit}
                                onClose={handleCloseEditModal}
                                isEdit={true}
                                isLoading={isUpdatingTrainer}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            )}

            {isMobile && (
                <SpeedDial
                    ariaLabel="Trainer detail actions"
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        '& .MuiFab-primary': {
                            background: gradients.primary,
                            color: 'white',
                            '&:hover': {
                                background: gradients.primary,
                                filter: 'brightness(0.95)',
                            },
                        },
                    }}
                    icon={<SpeedDialIcon />}
                >
                    <SpeedDialAction
                        icon={<EditIcon />}
                        tooltipTitle="Редактировать тренера"
                        onClick={handleOpenEditModal}
                        FabProps={{
                            sx: {
                                background: gradients.primary,
                                color: 'white',
                                '&:hover': { background: gradients.primary, filter: 'brightness(0.95)' },
                            },
                        }}
                    />
                </SpeedDial>
            )}
        </Box>
    );
} 