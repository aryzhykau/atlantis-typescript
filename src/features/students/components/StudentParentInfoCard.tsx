import React from 'react';
import { Card, CardContent, Typography, Box, Divider, Link } from '@mui/material';
import { IStudentParentClientData } from '../models/student'; // Используем IStudentParentClientData для родителя

// Иконки
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
// import FingerprintIcon from '@mui/icons-material/Fingerprint'; // Удаляем, так как Client ID убираем

interface StudentParentInfoCardProps {
    parentData: IStudentParentClientData;
}

// Вспомогательный компонент для строк информации (аналогично другим карточкам)
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; valueColor?: string; href?: string }> = ({ icon, label, value, valueColor, href }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        {icon}
        <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '100px' }}>{label}:</Typography>
        {href ? (
            <Link href={href} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 'medium', color: valueColor || 'primary.main', wordBreak: 'break-word', textDecorationColor: valueColor || 'primary.main' }}>
                {value}
            </Link>
        ) : (
            <Typography variant="body1" sx={{ fontWeight: 'medium', color: valueColor || 'text.primary', wordBreak: 'break-word' }}>
                {value}
            </Typography>
        )}
    </Box>
);

export const StudentParentInfoCard: React.FC<StudentParentInfoCardProps> = ({ parentData }) => {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                    Информация о родителе
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                    {/* <InfoRow icon={<FingerprintIcon color="action" />} label="Client ID" value={parentData.id} /> // Удалено по запросу */}
                    <InfoRow icon={<SupervisorAccountIcon color="action" />} label="Имя" value={`${parentData.first_name} ${parentData.last_name}`} />
                    <InfoRow 
                        icon={<EmailIcon color="action" />}
                        label="Email"
                        value={parentData.email || 'Не указан'}
                        href={parentData.email ? `mailto:${parentData.email}` : undefined}
                        valueColor={parentData.email ? undefined : 'text.secondary'} // Если нет email, текст серый
                    />
                    <InfoRow 
                        icon={<PhoneIcon color="action" />}
                        label="Телефон"
                        value={parentData.phone || 'Не указан'}
                        href={parentData.phone ? `tel:${parentData.phone}` : undefined}
                        valueColor={parentData.phone ? undefined : 'text.secondary'} // Если нет телефона, текст серый
                    />
                    {/* Можно добавить баланс родителя, если это необходимо: */}
                    {/* <InfoRow icon={<AccountBalanceWalletIcon color="action" />} label="Баланс" value={`${parentData.balance ?? 0} €`} /> */}
                </Box>
            </CardContent>
        </Card>
    );
}; 