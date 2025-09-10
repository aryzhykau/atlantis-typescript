import React from 'react';
import { 
    Paper, 
    Typography, 
    Box, 
    alpha,
    Link,    
} from '@mui/material';
import { IStudentParentClientData } from '../models/student';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useTheme } from '@mui/material';

// Иконки
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';

interface StudentParentInfoCardProps {
    parentData: IStudentParentClientData;
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
                sx={{ 
                    textDecoration: 'none', 
                    display: 'block',
                    '&:hover': {
                        textDecoration: 'none',
                    }
                }}
            >
                {content}
            </Link>
        );
    }

    return content;
};

export const StudentParentInfoCard: React.FC<StudentParentInfoCardProps> = ({ parentData }) => {
    const theme = useTheme();
    const gradients = useGradients();

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
                    background: gradients.success,
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
                        <FamilyRestroomIcon sx={{ fontSize: 32, mr: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            Информация о родителе
                        </Typography>
                    </Box>
                    
                    {/* Имя родителя */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                mr: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 40,
                                height: 40,
                            }}
                        >
                            <SupervisorAccountIcon />
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                                Родитель ученика
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {parentData.first_name} {parentData.last_name}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Контент карточки */}
            <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<SupervisorAccountIcon />}
                        label="ID родителя"
                        value={`#${parentData.id}`}
                        color="info"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<SupervisorAccountIcon />}
                        label="Имя"
                        value={parentData.first_name}
                        color="primary"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<SupervisorAccountIcon />}
                        label="Фамилия"
                        value={parentData.last_name}
                        color="primary"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<EmailIcon />}
                        label="Email"
                        value={parentData.email || 'Не указан'}
                        color="warning"
                        href={parentData.email ? `mailto:${parentData.email}` : undefined}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<PhoneIcon />}
                        label="Телефон"
                        value={parentData.phone || 
                          (parentData.phone_country_code && parentData.phone_number ? 
                            `${parentData.phone_country_code} ${parentData.phone_number}` : 
                            'Не указан')}
                        color="success"
                        href={parentData.phone || 
                          (parentData.phone_country_code && parentData.phone_number ? 
                            `tel:${parentData.phone_country_code}${parentData.phone_number}` : 
                            undefined)}
                    />
                </Box>

                {/* Баланс родителя, если доступен */}
                {parentData.balance !== undefined && (
                    <Box>
                        <InfoItem
                            icon={<SupervisorAccountIcon />}
                            label="Баланс"
                            value={`${parentData.balance} €`}
                            color="info"
                        />
                    </Box>
                )}
            </Box>
        </Paper>
    );
}; 