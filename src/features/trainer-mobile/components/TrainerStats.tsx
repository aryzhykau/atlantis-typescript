import React from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Schedule,
  Star,
} from '@mui/icons-material';
import { useGetTrainerPaymentsQuery, useGetTrainerTrainingsRangeQuery } from '../api/trainerApi';
import { useAuth } from '../../../hooks/useAuth';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useGetCurrentUserQuery } from '../../../store/apis/userApi';
import { StatsGrid } from './StatsGrid';
import { useGradients } from '../hooks/useGradients';
import dayjs from 'dayjs';

export const TrainerStats: React.FC = () => {
  const theme = useTheme();
  const gradients = useGradients();

  // Получаем текущего пользователя (тренера)
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();
  const trainerId = user?.id;

  // Получаем платежи тренера за последний месяц
  const { data: payments, isLoading: isLoadingPayments } = useGetTrainerPaymentsQuery({
    period: 'month',
  });

  // Получаем тренировки тренера за последний месяц
  const { data: trainings, isLoading: isLoadingTrainings } = useGetTrainerTrainingsRangeQuery(
    {
      start_date: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
      end_date: dayjs().format('YYYY-MM-DD'),
    }
  );

  // Вычисляем статистику
  const totalAmount = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const totalPayments = payments?.length || 0;
  const totalTrainings = trainings?.length || 0;
  const averageRating = 4.8; // Пока заглушка, потом добавим реальную логику

  // Данные для статистических карточек
  const statsItems = [
    {
      icon: TrendingUp,
      value: `${totalAmount.toFixed(2)} €`,
      label: 'Общий доход',
      gradient: 'success' as const,
    },
    {
      icon: People,
      value: totalPayments.toString(),
      label: 'Платежей',
      gradient: 'primary' as const,
    },
    {
      icon: Schedule,
      value: totalTrainings.toString(),
      label: 'Тренировок',
      gradient: 'warning' as const,
    },
    {
      icon: Star,
      value: averageRating.toFixed(1),
      label: 'Рейтинг',
      gradient: 'info' as const,
    },
  ];

  if (isLoadingUser || isLoadingPayments || isLoadingTrainings) {
    return (
      <Box sx={{ 
        p: 2, 
        pb: 10, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh',
        background: gradients.info,
        borderRadius: 3,
        mx: 1,
      }}>
        <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
          Загрузка статистики...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 2, 
      pb: 10,
      background: theme.palette.background.default, 
      minHeight: '100%',
    }}>
      {/* Красивый хедер с градиентом */}
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
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center' }}>
            📊 Статистика
            <TrendingUp sx={{ ml: 1, fontSize: 32 }} />
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
            Ваши показатели за последний месяц
          </Typography>
        </Box>
      </Paper>

      {/* Статистика */}
      <StatsGrid items={statsItems} columns={2} />

      {/* Дополнительная информация */}
      <Paper 
        elevation={0}
        sx={{ 
          mt: 3, 
          p: 3, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: theme.palette.background.paper,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
          Дополнительная информация
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          • Средний доход за тренировку: {totalTrainings > 0 ? (totalAmount / totalTrainings).toFixed(2) : '0'} €
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          • Активных студентов: {payments?.filter((p, index, arr) => 
            arr.findIndex(p2 => p2.client?.id === p.client?.id) === index
          ).length || 0}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Период: {dayjs().subtract(1, 'month').format('DD MMMM')} - {dayjs().format('DD MMMM YYYY')}
        </Typography>
      </Paper>
    </Box>
  );
}; 