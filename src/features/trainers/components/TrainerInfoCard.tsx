import React from 'react';
import { 
    Paper, 
    Typography, 
    Box, 
    Chip, 
    Link, 
    IconButton,
    alpha,
    Tooltip
} from '@mui/material';
import { ITrainerResponse } from '../models/trainer';
import dayjs from 'dayjs';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useTheme } from '@mui/material';

// Иконки
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface TrainerInfoCardProps {
    trainer: ITrainerResponse;
    onEdit: () => void;
    onStatusChange: () => void;
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
            <Link 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ textDecoration: 'none', display: 'block' }}
            >
                {content}
            </Link>
        );
    }

    return content;
};

export const TrainerInfoCard: React.FC<TrainerInfoCardProps> = ({ trainer, onEdit, onStatusChange }) => {
    const theme = useTheme();
    const gradients = useGradients();

    const getStatusColor = () => {
        return trainer.is_active ? 'success' : 'error';
    };

    const getStatusGradient = () => {
        return trainer.is_active ? gradients.success : gradients.warning;
    };

    const getStatusIcon = () => {
        return trainer.is_active ? <CheckCircleOutlineIcon /> : <HighlightOffIcon />;
    };

    const getStatusText = () => {
        return trainer.is_active ? "Активен" : "Неактивен";
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
                            <TrendingUpIcon sx={{ fontSize: 32, mr: 2 }} />
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Основная информация
                            </Typography>
                        </Box>
                        <Tooltip title="Редактировать">
                            <IconButton
                                sx={{
                                    color: 'white',
                                    '&:hover': {
                                        background: alpha('#ffffff', 0.2),
                                    }
                                }}
                                onClick={onEdit}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    
                    {/* Статус тренера */}
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
                                    Статус тренера
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
                                    onClick={onStatusChange}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Контент карточки */}
            <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<PersonIcon />}
                        label="ID тренера"
                        value={`#${trainer.id}`}
                        color="info"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<PersonIcon />}
                        label="ФИО"
                        value={`${trainer.first_name} ${trainer.last_name}`}
                        color="primary"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<CakeOutlinedIcon />}
                        label="Дата рождения"
                        value={dayjs(trainer.date_of_birth).format('DD.MM.YYYY')}
                        color="warning"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<EmailOutlinedIcon />}
                        label="Email"
                        value={trainer.email}
                        color="info"
                        href={`mailto:${trainer.email}`}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<PhoneOutlinedIcon />}
                        label="Телефон"
                        value={`${trainer.phone_country_code} ${trainer.phone_number}`}
                        color="success"
                        href={`tel:+${trainer.phone_country_code}${trainer.phone_number}`}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<AttachMoneyOutlinedIcon />}
                        label="Оклад"
                        value={trainer.salary !== null ? `${trainer.salary} €` : 'Не указан'}
                        color="success"
                    />
                </Box>

                <Box>
                    <InfoItem
                        icon={<WorkOutlineIcon />}
                        label="Тип оклада"
                        value={
                            <Chip 
                                label={trainer.is_fixed_salary ? 'Фиксированный' : 'Процентный'} 
                                size="small" 
                                color={trainer.is_fixed_salary ? 'info' : 'default'}
                                variant="outlined"
                                sx={{ ml: 0.5 }}
                            />
                        }
                        color="info"
                    />
                </Box>
            </Box>
        </Paper>
    );
}; 