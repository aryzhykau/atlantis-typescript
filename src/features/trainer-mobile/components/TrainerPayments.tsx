import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  Fade,
  IconButton,
  Grid,
  Slide,
} from '@mui/material';
import { 
  TrendingUp, 
  Payment as PaymentIcon,
  Euro,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useGetCurrentUserQuery } from '../../../store/apis/userApi';
import { 
  useGetTrainerStudentsQuery, 
  useGetTrainerPaymentsMobileQuery,
  useCreateQuickPaymentMutation 
} from '../../../store/apis/trainersApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useGradients } from '../hooks/useGradients';
import { PaymentForm } from './PaymentForm';
import { skipToken } from '@reduxjs/toolkit/query';
import dayjs from 'dayjs';

type PeriodFilter = 'week' | '2weeks';

interface PaymentFormData {
  student_id: number;
  amount: string;
}

export const TrainerPayments: React.FC = () => {
  const theme = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>('week');
  const [expandedPayment, setExpandedPayment] = useState<number | null>(null);

  const { displaySnackbar } = useSnackbar();
  const [createPayment, { isLoading: isCreating }] = useCreateQuickPaymentMutation();

  // Получаем текущего пользователя (тренера)
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();
  const trainerId = user?.id;

  // Получаем студентов тренера для селектора
  const { data: students = [], isLoading: isLoadingStudents } = useGetTrainerStudentsQuery(
    trainerId ? { trainer_id: trainerId } : skipToken
  );

  // Получаем платежи тренера
  const { data: payments, isLoading: isLoadingPayments } = useGetTrainerPaymentsMobileQuery({
    period,
  });


  // Получаем градиенты
  const gradients = useGradients();

  const handleFormSubmit = async (values: PaymentFormData) => {
    const selectedStudent = students.find(s => s.id === values.student_id);
    if (!selectedStudent?.client?.id) {
      displaySnackbar('Ошибка: не найден клиент студента', 'error');
      return;
    }

    try {
      await createPayment({
        client_id: selectedStudent.client.id,
        amount: parseFloat(values.amount),
        description: `Оплатили за ${selectedStudent.first_name} ${selectedStudent.last_name}`,
      }).unwrap();

      displaySnackbar('Платёж успешно зарегистрирован', 'success');
    } catch (error: any) {
      displaySnackbar(
        error?.data?.detail || 'Ошибка при регистрации платежа',
        'error'
      );
      throw error; // Пробрасываем ошибку, чтобы форма не сбрасывалась
    }
  };

  if (isLoadingUser || isLoadingStudents || isLoadingPayments) {
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
          Загрузка данных...
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
            💰 Платежи
            <TrendingUp sx={{ ml: 1, fontSize: 32 }} />
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 300 }}>
            Регистрация и управление платежами клиентов
          </Typography>
        </Box>
      </Paper>


      {/* Форма регистрации платежа */}
      <PaymentForm
        students={students}
        onSubmit={handleFormSubmit}
        isLoading={isCreating}
        showForm={showForm}
        onToggleForm={() => setShowForm(!showForm)}
      />

      {/* Фильтры */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3, 
          p: 2, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
            Период:
          </Typography>
          {(['week', '2weeks'] as PeriodFilter[]).map((p) => (
            <Chip
              key={p}
              label={p === 'week' ? 'Неделя' : '2 Недели'}
              onClick={() => setPeriod(p)}
              variant={period === p ? 'filled' : 'outlined'}
              color={period === p ? 'primary' : 'default'}
              sx={{ 
                borderRadius: 2,
                fontWeight: 500,
                '&.MuiChip-filled': {
                  background: gradients.primary,
                  color: 'white',
                }
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* История платежей */}
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
        <Box sx={{ 
          p: 2, 
          background: alpha(theme.palette.primary.main, 0.05),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                История платежей
              </Typography>
              <Chip 
                label={payments?.length || 0} 
                size="small" 
                sx={{ ml: 1, background: gradients.success, color: 'white' }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          {!payments || payments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <PaymentIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Нет платежей
              </Typography>
              <Typography variant="body2" color="text.secondary">
                За выбранный период платежи не найдены
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {payments.map((payment: any, index: number) => (
                <Fade in timeout={300 + index * 100} key={payment.id}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      background: theme.palette.background.paper,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: theme.palette.mode === 'dark' ? 4 : 2,
                        transform: 'translateY(-1px)',
                      }
                    }}
                    onClick={() => setExpandedPayment(expandedPayment === payment.id ? null : payment.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                          borderRadius: 4,
                          textAlign: 'center',
                          width: 200, 
                          height: 48, 
                          background: gradients.success,
                          fontSize: '1.2rem',
                          fontWeight: 600,
                        }}
                      >
                        {payment.client_first_name} {payment.client_last_name}
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: theme.palette.text.primary }}>
                          {payment.client?.first_name} {payment.client?.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {dayjs(payment.payment_date).format('DD MMMM YYYY в HH:mm')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                          {payment.description}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          icon={<Euro />}
                          label={`${payment.amount.toFixed(2)} €`}
                          size="medium"
                          sx={{ 
                            background: gradients.success,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1rem',
                            mb: 1,
                          }}
                        />
                        <IconButton size="small">
                          {expandedPayment === payment.id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </Box>

                    <Slide direction="down" in={expandedPayment === payment.id} mountOnEnter unmountOnExit>
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              ID платежа
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                              #{payment.id}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Зарегистрировал
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                              {payment.registered_by?.first_name} {payment.registered_by?.last_name}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Slide>
                  </Paper>
                </Fade>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}; 