import React from 'react';
import { 
    Paper, 
    Typography, 
    Chip, 
    Box, 
    Button, 
    CircularProgress,
    alpha,
    Tooltip
} from '@mui/material';
import { IStudent, IStudentStatusUpdatePayload } from '../models/student';
import dayjs from 'dayjs';
import { useUpdateStudentStatusMutation } from '../../../store/apis/studentsApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useTheme } from '@mui/material';

// Иконки
// import FingerprintIcon from '@mui/icons-material/Fingerprint'; // Удалено, так как ID студента не отображается
import PersonIcon from '@mui/icons-material/Person';
import CakeIcon from '@mui/icons-material/Cake';
import ElderlyIcon from '@mui/icons-material/Elderly'; // Для возраста
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import EventBusyIcon from '@mui/icons-material/EventBusy'; // для даты деактивации
import SchoolIcon from '@mui/icons-material/School';

interface StudentInfoCardProps {
    student: IStudent;
    onStatusHasChanged: () => void;
}

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    color?: 'primary' | 'success' | 'warning' | 'info';
    href?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, color = 'primary', href }) => {
    const theme = useTheme();
    const gradients = useGradients();
    
    const content = (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.background.paper,
                transition: 'all 0.3s ease',
                cursor: href ? 'pointer' : 'default',
                '&:hover': {
                    transform: href ? 'translateY(-2px)' : 'none',
                    boxShadow: href ? theme.shadows[8] : theme.shadows[1],
                    borderColor: alpha(theme.palette[color].main, 0.3),
                    background: alpha(theme.palette[color].main, 0.02),
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                    sx={{
                        p: 1,
                        borderRadius: 2,
                        background: gradients[color],
                        color: 'white',
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40,
                        height: 40,
                    }}
                >
                    {icon}
                </Box>
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                    }}
                >
                    {label}
                </Typography>
            </Box>
            <Box sx={{ pl: 6 }}>
                {typeof value === 'string' ? (
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            fontWeight: 500,
                            color: value === 'Не указан' || value === 'Не указана' 
                                ? 'text.secondary' 
                                : 'text.primary'
                        }}
                    >
                        {value}
                    </Typography>
                ) : (
                    value
                )}
            </Box>
        </Paper>
    );

    if (href) {
        return (
            <Box sx={{ textDecoration: 'none', display: 'block' }}>
                {content}
            </Box>
        );
    }

    return content;
};

// Функция для вычисления возраста
const calculateAge = (dateOfBirth: string): number => {
    return dayjs().diff(dayjs(dateOfBirth), 'year');
};

export const StudentInfoCard: React.FC<StudentInfoCardProps> = ({ student, onStatusHasChanged }) => {
    const { displaySnackbar } = useSnackbar();
    const theme = useTheme();
    const gradients = useGradients();
    const [updateStudentStatus, { isLoading: isUpdatingStatus }] = useUpdateStudentStatusMutation();

    const handleToggleStatus = async () => {
        const newStatus = !student.is_active;
        const statusUpdatePayload: IStudentStatusUpdatePayload = { is_active: newStatus };
        try {
            await updateStudentStatus({ id: student.id, statusData: statusUpdatePayload }).unwrap();
            displaySnackbar(`Статус ученика успешно изменен на "${newStatus ? 'Активен' : 'Неактивен'}"`, 'success');
            onStatusHasChanged();
        } catch (error) {
            displaySnackbar('Ошибка при изменении статуса ученика', 'error');
            console.error("Ошибка изменения статуса:", error);
        }
    };

    const getStatusColor = () => {
        return student.is_active ? 'success' : 'error';
    };

    const getStatusGradient = () => {
        return student.is_active ? gradients.success : gradients.warning;
    };

    const getStatusIcon = () => {
        return student.is_active ? <CheckCircleOutlineIcon /> : <HighlightOffIcon />;
    };

    const getStatusText = () => {
        return student.is_active ? "Активен" : "Неактивен";
    };

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                background: theme.palette.background.paper,
            }}
        >
            {/* Градиентный заголовок */}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 32, mr: 2 }} />
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Информация об ученике
                            </Typography>
                        </Box>
                    </Box>
                    
                    {/* Статус студента */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    background: getStatusGradient(),
                                    color: 'white',
                                    mr: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 40,
                                    height: 40,
                                }}
                            >
                                {getStatusIcon()}
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                                    Статус ученика
                                </Typography>
                                <Chip
                                    label={getStatusText()}
                                    color={getStatusColor()}
                                    size="small"
                                    sx={{
                                        background: getStatusGradient(),
                                        color: 'white',
                                        fontWeight: 600,
                                        '& .MuiChip-label': {
                                            color: 'white',
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                        <Tooltip title={student.is_active ? 'Деактивировать' : 'Активировать'}>
                            <Button
                                variant="contained"
                                onClick={handleToggleStatus}
                                disabled={isUpdatingStatus}
                                sx={{
                                    background: 'white',
                                    color: student.is_active ? theme.palette.error.main : theme.palette.success.main,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    px: 2,
                                    py: 1,
                                    '&:hover': {
                                        background: alpha('#ffffff', 0.9),
                                    }
                                }}
                            >
                                {isUpdatingStatus ? <CircularProgress size={20} /> : (student.is_active ? 'Деактивировать' : 'Активировать')}
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* Контент карточки */}
            <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<PersonIcon />}
                        label="ID ученика"
                        value={`#${student.id}`}
                        color="info"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<PersonIcon />}
                        label="Имя"
                        value={student.first_name}
                        color="primary"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<PersonIcon />}
                        label="Фамилия"
                        value={student.last_name}
                        color="primary"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<CakeIcon />}
                        label="Дата рождения"
                        value={dayjs(student.date_of_birth).format('DD.MM.YYYY')}
                        color="warning"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<ElderlyIcon />}
                        label="Возраст"
                        value={`${calculateAge(student.date_of_birth)} лет`}
                        color="info"
                    />
                </Box>

                {student.deactivation_date && !student.is_active && (
                    <Box>
                        <InfoItem
                            icon={<EventBusyIcon />}
                            label="Дата деактивации"
                            value={dayjs(student.deactivation_date).format('DD.MM.YYYY HH:mm')}
                            color="warning"
                        />
                    </Box>
                )}
            </Box>
        </Paper>
    );
}; 