import React from "react";
import { 
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box, 
    Divider,
    Paper, 
    Typography, 
    Chip, 
    useTheme, 
    alpha,
    Link,
    Switch,
 
} from "@mui/material";
import { IClientUserGet } from "../../models/client";
import dayjs from "dayjs";
import { useUpdateClientStatusMutation } from "../../../../store/apis/clientsApi";
import { useSnackbar } from "../../../../hooks/useSnackBar";
import { useGradients } from "../../../trainer-mobile/hooks/useGradients";


// Иконки
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CakeIcon from '@mui/icons-material/Cake';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useIsMobile from '../../../../hooks/useMobile';


interface ClientInfoCardProps {
    client: IClientUserGet;
    onClientUpdate?: () => void;
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

export const ClientInfoCard: React.FC<ClientInfoCardProps> = ({ client, onClientUpdate }) => {
    const [updateClientStatus, { isLoading: isUpdatingStatus }] = useUpdateClientStatusMutation();
    const { displaySnackbar } = useSnackbar();
    const theme = useTheme();
    const gradients = useGradients();
    const isMobile = useIsMobile();

    const handleToggleActiveStatus = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newIsActive = event.target.checked;

        try {
            await updateClientStatus({ clientId: client.id, is_active: newIsActive }).unwrap();
            displaySnackbar(`Статус клиента обновлен на "${newIsActive ? 'Активен' : 'Неактивен'}"`, 'success');
            onClientUpdate?.();
        } catch (error: any) {
            console.error("Ошибка обновления статуса клиента:", error);
            const errorDetail = error?.data?.detail || 'Ошибка при обновлении статуса';
            displaySnackbar(String(errorDetail), 'error');
        }
    };

    const getStatusColor = () => {
        if (client.is_active === null) return 'default';
        return client.is_active ? 'success' : 'error';
    };

    const getStatusGradient = () => {
        if (client.is_active === null) return gradients.info;
        return client.is_active ? gradients.success : gradients.warning;
    };

    const getStatusIcon = () => {
        if (client.is_active === true) return <CheckCircleOutlineIcon />;
        if (client.is_active === false) return <HighlightOffIcon />;
        return <HelpOutlineIcon />;
    };

    const getStatusText = () => {
        if (client.is_active === null) return "Неизвестно";
        return client.is_active ? "Активен" : "Неактивен";
    };

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
                <Accordion disableGutters defaultExpanded sx={{ background: 'transparent', boxShadow: 'none' }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                        sx={{
                            p: 0,
                            minHeight: 'unset',
                            '& .MuiAccordionSummary-content': { m: 0 },
                            '& .MuiAccordionSummary-expandIconWrapper': { mr: 1.5 },
                            background: gradients.primary,
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
                                <PersonIcon sx={{ fontSize: 20 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Общая информация
                                </Typography>
                            </Box>
                            <Chip
                                label={getStatusText()}
                                size="small"
                                sx={{ background: alpha('#ffffff', 0.2), color: 'white', fontWeight: 700 }}
                            />
                        </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>Статус клиента</Typography>
                            <Switch
                                checked={client.is_active === true}
                                onChange={handleToggleActiveStatus}
                                disabled={isUpdatingStatus || client.is_active === null}
                            />
                        </Box>

                        <Divider sx={{ mb: 1.25 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">ID клиента</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>#{client.id}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">ФИО</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{client.first_name} {client.last_name}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Email</Typography>
                                {client.email ? (
                                    <Link href={`mailto:${client.email}`} sx={{ display: 'block', textDecoration: 'none' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{client.email}</Typography>
                                    </Link>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Не указан</Typography>
                                )}
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Телефон</Typography>
                                {client.phone_country_code ? (
                                    <Link href={`tel:+${client.phone_country_code}${client.phone_number}`} sx={{ display: 'block', textDecoration: 'none' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>+{client.phone_country_code} {client.phone_number}</Typography>
                                    </Link>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Не указан</Typography>
                                )}
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">WhatsApp</Typography>
                                {client.whatsapp_country_code ? (
                                    <Link href={`https://wa.me/${client.whatsapp_country_code}${client.whatsapp_number}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'block', textDecoration: 'none' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>+{client.whatsapp_country_code} {client.whatsapp_number}</Typography>
                                    </Link>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Не указан</Typography>
                                )}
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Дата рождения</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {client.date_of_birth ? dayjs(client.date_of_birth).format('DD.MM.YYYY') : 'Не указана'}
                                </Typography>
                            </Box>
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
                            <PersonIcon sx={{ fontSize: 32, mr: 2 }} />
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Основная информация
                            </Typography>
                        </Box>
                    </Box>
                    
                    {/* Статус клиента */}
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
                                    Статус клиента
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
                        <Switch
                            checked={client.is_active === true}
                            onChange={handleToggleActiveStatus}
                            disabled={isUpdatingStatus || client.is_active === null}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: 'white',
                                    '&:hover': {
                                        background: alpha('#ffffff', 0.2),
                                    }
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    background: 'white',
                                }
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Контент карточки */}
            <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<PersonIcon />}
                        label="ID клиента"
                        value={`#${client.id}`}
                        color="info"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<PersonIcon />}
                        label="ФИО"
                        value={`${client.first_name} ${client.last_name}`}
                        color="primary"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<EmailIcon />}
                        label="Email"
                        value={client.email || "Не указан"}
                        color="info"
                        href={client.email ? `mailto:${client.email}` : undefined}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<PhoneIcon />}
                        label="Телефон"
                        value={`+${client.phone_country_code} ${client.phone_number}` || "Не указан"}
                        color="success"
                        href={client.phone_country_code ? `tel:+${client.phone_country_code}${client.phone_number}` : undefined}
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <InfoItem
                        icon={<WhatsAppIcon />}
                        label="WhatsApp"
                        value={client.whatsapp_number ? `+${client.whatsapp_country_code} ${client.whatsapp_number}` : "Не указан"}
                        color="success"
                        href={client.whatsapp_country_code ? `https://wa.me/${client.whatsapp_country_code}${client.whatsapp_number}` : undefined}
                    />
                </Box>

                <Box>
                    <InfoItem
                        icon={<CakeIcon />}
                        label="Дата рождения"
                        value={client.date_of_birth ? dayjs(client.date_of_birth).format('DD.MM.YYYY') : 'Не указана'}
                        color="warning"
                    />
                </Box>
            </Box>
        </Paper>
    );
}; 