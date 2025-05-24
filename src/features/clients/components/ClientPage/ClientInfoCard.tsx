import React from "react";
import { Chip, Link, Switch, Box, Typography } from "@mui/material";
import { IClientUserGet } from "../../models/client";
import { InfoCard, IInfoCardItem } from "../InfoCard";
import dayjs from "dayjs";
import { useUpdateClientStatusMutation } from "../../../../store/apis/clientsApi";
import { useSnackbar } from "../../../../hooks/useSnackBar";

// Иконки
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CakeIcon from '@mui/icons-material/Cake';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface ClientInfoCardProps {
    client: IClientUserGet;
    onClientUpdate?: () => void;
}

export const ClientInfoCard: React.FC<ClientInfoCardProps> = ({ client, onClientUpdate }) => {
    const [updateClientStatus, { isLoading: isUpdatingStatus }] = useUpdateClientStatusMutation();
    const { displaySnackbar } = useSnackbar();

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

    const infoItems: IInfoCardItem[] = [
        {
            label: "ID",
            value: client.id
        },
        {
            icon: <PersonIcon />,
            label: "ФИО",
            value: `${client.first_name} ${client.last_name}`
        },
        {
            icon: <EmailIcon />,
            label: "Email",
            value: client.email 
                ? <Link href={`mailto:${client.email}`} target="_blank" rel="noopener noreferrer">{client.email}</Link> 
                : "Не указан"
        },
        {
            icon: <PhoneIcon />,
            label: "Телефон",
            value: client.phone 
                ? <Link href={`tel:${client.phone}`}>{client.phone}</Link> 
                : "Не указан"
        },
        {
            icon: <WhatsAppIcon />,
            label: "WhatsApp",
            value: client.whatsapp_number 
                ? <Link href={`https://wa.me/${client.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">{client.whatsapp_number}</Link> 
                : "Не указан"
        },
        {
            icon: <CakeIcon />,
            label: "Дата рождения",
            value: client.date_of_birth ? dayjs(client.date_of_birth).format('DD.MM.YYYY') : 'Не указана'
        }
    ];

    const statusItem = (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mt:1, mb:1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {client.is_active === true ? <CheckCircleOutlineIcon color="success" sx={{mr:1}} /> : client.is_active === false ? <HighlightOffIcon color="error" sx={{mr:1}}/> : <HelpOutlineIcon sx={{mr:1}}/>}
                <Typography variant="body2" color="text.secondary">Статус:</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                    label={client.is_active === null ? "Неизвестно" : client.is_active ? "Активен" : "Неактивен"}
                    color={client.is_active === null ? "default" : client.is_active ? "success" : "error"}
                    size="small"
                    sx={{ mr: 1 }}
                />
                <Switch
                    checked={client.is_active === true}
                    onChange={handleToggleActiveStatus}
                    disabled={isUpdatingStatus || client.is_active === null}
                    size="small"
                    color={client.is_active === true ? "success" : "default"}
                />
            </Box>
        </Box>
    );

    return (
        <InfoCard 
            title="Основная информация"
            items={infoItems}
        >
            {statusItem}
        </InfoCard>
    );
}; 