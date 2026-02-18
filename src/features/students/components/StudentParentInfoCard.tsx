import React from 'react';
import { 
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Paper, 
    Typography, 
    Box, 
    alpha,
    Link,    
    Chip,
    Divider,
} from '@mui/material';
import { IStudentParentClientData } from '../models/student';
import { useGradients } from '../../trainer-mobile/hooks/useGradients';
import { useTheme } from '@mui/material';

// Иконки
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMobile from '../../../hooks/useMobile';

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
    const isMobile = useMobile();

    const parentPhone = parentData.phone ||
      (parentData.phone_country_code && parentData.phone_number
        ? `${parentData.phone_country_code} ${parentData.phone_number}`
        : 'Не указан');

    const parentTelHref = parentData.phone ||
      (parentData.phone_country_code && parentData.phone_number
        ? `tel:${parentData.phone_country_code}${parentData.phone_number}`
        : undefined);

    if (isMobile) {
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
                <Accordion disableGutters defaultExpanded={false} sx={{ background: 'transparent', boxShadow: 'none' }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                        sx={{
                            p: 0,
                            minHeight: 'unset',
                            '& .MuiAccordionSummary-content': { m: 0 },
                            '& .MuiAccordionSummary-expandIconWrapper': { mr: 1.5 },
                            background: gradients.success,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                                opacity: 0.3,
                            }
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1, px: 2, py: 1.75, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FamilyRestroomIcon sx={{ fontSize: 20 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Родитель
                                </Typography>
                            </Box>
                            <Chip
                                label={`${parentData.first_name} ${parentData.last_name}`}
                                size="small"
                                sx={{ background: alpha('#ffffff', 0.2), color: 'white', fontWeight: 700 }}
                            />
                        </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">ID родителя</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>#{parentData.id}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">ФИО</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{parentData.first_name} {parentData.last_name}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Email</Typography>
                                {parentData.email ? (
                                    <Link href={`mailto:${parentData.email}`} sx={{ display: 'block', textDecoration: 'none' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{parentData.email}</Typography>
                                    </Link>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Не указан</Typography>
                                )}
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Телефон</Typography>
                                {parentTelHref ? (
                                    <Link href={parentTelHref} sx={{ display: 'block', textDecoration: 'none' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{parentPhone}</Typography>
                                    </Link>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">{parentPhone}</Typography>
                                )}
                            </Box>
                            {parentData.balance !== undefined && (
                                <>
                                    <Divider />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Баланс</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{parentData.balance} €</Typography>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </Paper>
        );
    }

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