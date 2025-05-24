import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Divider, Button, CircularProgress } from '@mui/material';
import { IStudent, IStudentStatusUpdatePayload } from '../models/student';
import dayjs from 'dayjs';
import { useUpdateStudentStatusMutation } from '../../../store/apis/studentsApi';
import { useSnackbar } from '../../../hooks/useSnackBar';

// Иконки
// import FingerprintIcon from '@mui/icons-material/Fingerprint'; // Удалено, так как ID студента не отображается
import PersonIcon from '@mui/icons-material/Person';
import CakeIcon from '@mui/icons-material/Cake';
import ElderlyIcon from '@mui/icons-material/Elderly'; // Для возраста
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import EventBusyIcon from '@mui/icons-material/EventBusy'; // для даты деактивации

interface StudentInfoCardProps {
    student: IStudent;
    onStatusHasChanged: () => void; // Колбэк для обновления данных на странице
}

// Функция для вычисления возраста, если она еще не импортирована/определена где-то глобально
const calculateAge = (dateOfBirth: string): number => {
    return dayjs().diff(dayjs(dateOfBirth), 'year');
};

// Вспомогательный компонент для строк информации
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; valueColor?: string }> = ({ icon, label, value, valueColor }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}> {/* Увеличил mb для большего расстояния между строками */}
        {icon}
        <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: '120px' }}>{label}:</Typography>
        <Typography variant="body1" sx={{ fontWeight: 'medium', color: valueColor || 'text.primary' }}>{value}</Typography>
    </Box>
);

export const StudentInfoCard: React.FC<StudentInfoCardProps> = ({ student, onStatusHasChanged }) => {
    const { displaySnackbar } = useSnackbar();
    const [updateStudentStatus, { isLoading: isUpdatingStatus }] = useUpdateStudentStatusMutation();

    const handleToggleStatus = async () => {
        const newStatus = !student.is_active;
        const statusUpdatePayload: IStudentStatusUpdatePayload = { is_active: newStatus };
        try {
            await updateStudentStatus({ id: student.id, statusData: statusUpdatePayload }).unwrap();
            displaySnackbar(`Статус студента успешно изменен на "${newStatus ? 'Активен' : 'Неактивен'}"`, 'success');
            onStatusHasChanged(); // Вызываем колбэк для обновления данных на странице
        } catch (error) {
            displaySnackbar('Ошибка при изменении статуса студента', 'error');
            console.error("Ошибка изменения статуса:", error);
        }
    };

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                    Информация об ученике
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                    <InfoRow icon={<PersonIcon color="action" />} label="Имя" value={student.first_name} />
                    <InfoRow icon={<PersonIcon color="action" />} label="Фамилия" value={student.last_name} />
                    <InfoRow icon={<CakeIcon color="action" />} label="Дата рождения" value={dayjs(student.date_of_birth).format('DD.MM.YYYY')} />
                    <InfoRow icon={<ElderlyIcon color="action" />} label="Возраст" value={`${calculateAge(student.date_of_birth)} лет`} />
                    <InfoRow 
                        icon={student.is_active ? <CheckCircleOutlineIcon color="success" /> : <HighlightOffIcon color="error" />}
                        label="Статус"
                        value={<Chip label={student.is_active ? 'Активен' : 'Неактивен'} color={student.is_active ? 'success' : 'error'} size="small" />}
                    />
                    {student.deactivation_date && !student.is_active && (
                        <InfoRow 
                            icon={<EventBusyIcon color="warning" />}
                            label="Деактивирован"
                            value={dayjs(student.deactivation_date).format('DD.MM.YYYY HH:mm')}
                            valueColor="text.secondary"
                        />
                    )}
                </Box>
                <Button 
                    variant="outlined" 
                    onClick={handleToggleStatus}
                    disabled={isUpdatingStatus}
                    sx={{ mt: 2, width: '100%' }}
                    color={student.is_active ? 'error' : 'success'}
                >
                    {isUpdatingStatus ? <CircularProgress size={24} /> : (student.is_active ? 'Деактивировать' : 'Активировать')}
                </Button>
            </CardContent>
        </Card>
    );
}; 