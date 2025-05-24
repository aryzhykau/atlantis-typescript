import React from 'react';
import { Card, CardContent, Typography, Grid, Box, Chip, Link as MuiLink, IconButton } from '@mui/material';
import { ITrainerResponse } from '../models/trainer';
import dayjs from 'dayjs';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'; // Для типа оклада
import EditIcon from '@mui/icons-material/Edit'; // Для кнопки редактирования
import ToggleOnIcon from '@mui/icons-material/ToggleOn'; // Для активного статуса
import ToggleOffIcon from '@mui/icons-material/ToggleOff'; // Для неактивного статуса

interface TrainerInfoCardProps {
    trainer: ITrainerResponse;
    onEdit: () => void; // Функция для открытия модального окна редактирования
    onStatusChange: () => void; // Функция для изменения статуса (откроет модалку или выполнит действие)
}

export const TrainerInfoCard: React.FC<TrainerInfoCardProps> = ({ trainer, onEdit, onStatusChange }) => {
    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                        Основная информация
                    </Typography>
                    <Box>
                        <IconButton onClick={onEdit} size="small" title="Редактировать">
                            <EditIcon />
                        </IconButton>
                    </Box>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <CakeOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            Дата рождения: {dayjs(trainer.date_of_birth).format('DD.MM.YYYY')}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <MuiLink href={`mailto:${trainer.email}`} variant="body2" sx={{ wordBreak: 'break-all'}}>
                            {trainer.email}
                        </MuiLink>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <MuiLink href={`tel:${trainer.phone}`} variant="body2">
                            {trainer.phone}
                        </MuiLink>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoneyOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            Оклад: {trainer.salary !== null ? `${trainer.salary} €` : 'Не указан'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkOutlineIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            Тип оклада: 
                            <Chip 
                                label={trainer.is_fixed_salary ? 'Фиксированный' : 'Процентный'} 
                                size="small" 
                                color={trainer.is_fixed_salary ? 'info' : 'default'}
                                variant="outlined"
                                sx={{ ml: 0.5 }}
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                         <Typography variant="body2" color="text.secondary">
                            Статус: 
                            <IconButton onClick={onStatusChange} size="small" title={trainer.is_active ? "Деактивировать" : "Активировать"}>
                                {trainer.is_active ? <ToggleOnIcon color="success" /> : <ToggleOffIcon color="action" />}
                            </IconButton>
                            <Chip 
                                label={trainer.is_active ? 'Активен' : 'Неактивен'} 
                                size="small" 
                                color={trainer.is_active ? 'success' : 'error'}
                                variant="outlined"
                                sx={{ ml: 0.5 }}
                            />
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}; 