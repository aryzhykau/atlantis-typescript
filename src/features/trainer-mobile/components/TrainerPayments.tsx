import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Divider,
  Chip,
  Avatar,
  FormControlLabel,
  Switch,
  CircularProgress,
  Paper,
  Fade,
  Slide,
  IconButton,
  Tooltip,
  LinearProgress,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Person,
  Euro,
  Add as AddIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  TrendingUp,
  AccountBalance,
  Receipt,
  Close,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import { TextField as FormikTextField, Select as FormikSelect } from 'formik-mui';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { useCreateQuickPaymentMutation, useGetTrainerTrainingsRangeQuery, useGetTrainerPaymentsQuery, useGetTrainerStudentsQuery } from '../api/trainerApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useAuth } from '../../../hooks/useAuth';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useGetCurrentUserQuery } from '../../../store/apis/userApi';
import { StatsGrid } from './StatsGrid';

type PeriodFilter = 'week' | 'month' | '3months';

interface PaymentFormData {
  student_id: number;
  amount: string;
}

const PaymentSchema = Yup.object({
  student_id: Yup.number().required('Выберите студента'),
  amount: Yup.number()
    .required('Введите сумму')
    .positive('Сумма должна быть больше 0')
    .min(0.01, 'Минимальная сумма 0.01 €'),
});

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
  const { data: payments, isLoading: isLoadingPayments } = useGetTrainerPaymentsQuery({
    period,
  });

  // Вычисляем статистику
  const totalAmount = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const todayPayments = payments?.filter(p => 
    dayjs(p.payment_date).isSame(dayjs(), 'day')
  ) || [];
  const todayAmount = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);

  // Динамические градиенты в зависимости от темы
  const gradients = {
    primary: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #8e44ad 0%, #6c5ce7 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
      : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
      : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    info: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
      : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  };

  // Данные для статистических карточек
  const statsItems = [
    {
      icon: AccountBalance,
      value: `${totalAmount.toFixed(2)} €`,
      label: 'Общая сумма',
      gradient: 'success' as const,
    },
    {
      icon: Receipt,
      value: `${todayAmount.toFixed(2)} €`,
      label: 'Сегодня',
      gradient: 'warning' as const,
    },
  ];

  const handleFormSubmit = async (values: PaymentFormData, { resetForm }: any) => {
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
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      displaySnackbar(
        error?.data?.detail || 'Ошибка при регистрации платежа',
        'error'
      );
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
      pb: 4,
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

      {/* Статистика */}
      <StatsGrid items={statsItems} columns={2} />

      {/* Форма регистрации платежа */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3, 
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
              <AddIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Регистрация платежа
              </Typography>
            </Box>
            <Tooltip title={showForm ? 'Скрыть форму' : 'Показать форму'}>
              <IconButton 
                onClick={() => setShowForm(!showForm)}
                sx={{ 
                  background: showForm ? theme.palette.primary.main : 'transparent',
                  color: showForm ? 'white' : theme.palette.primary.main,
                  '&:hover': {
                    background: showForm ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                {showForm ? <Close /> : <AddIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Slide direction="down" in={showForm} mountOnEnter unmountOnExit>
          <Box sx={{ p: 3 }}>
            {students.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Person sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
                <Typography color="text.secondary" variant="h6">
                  Нет доступных студентов
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Для регистрации платежа нужны активные студенты
                </Typography>
              </Box>
            ) : (
              <Formik
                initialValues={{
                  student_id: 0,
                  amount: '',
                }}
                validationSchema={PaymentSchema}
                onSubmit={handleFormSubmit}
              >
                {({ isSubmitting, values }) => (
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <FormControl fullWidth size="medium">
                          <InputLabel>Выберите студента</InputLabel>
                          <Field
                            component={FormikSelect}
                            name="student_id"
                            label="Выберите студента"
                            formControl={{ fullWidth: true }}
                          >
                            {students.map((student) => (
                              <MenuItem key={student.id} value={student.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                                  <Avatar 
                                    sx={{ 
                                      width: 32, 
                                      height: 32, 
                                      background: gradients.primary,
                                      fontSize: '0.875rem',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {student.first_name[0]}{student.last_name[0]}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                                      {student.first_name} {student.last_name}
                                    </Typography>
                                    {student.client && (
                                      <Typography variant="caption" color="text.secondary">
                                        Клиент: {student.client.first_name} {student.client.last_name}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </MenuItem>
                            ))}
                          </Field>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Field
                          component={FormikTextField}
                          name="amount"
                          label="Сумма платежа"
                          type="number"
                          fullWidth
                          size="medium"
                          InputProps={{
                            startAdornment: <Euro sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                            sx: { borderRadius: 2 }
                          }}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          size="large"
                          disabled={isSubmitting || isCreating || !values.student_id || !values.amount}
                          sx={{ 
                            background: gradients.success,
                            borderRadius: 2,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                              background: theme.palette.mode === 'dark' 
                                ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
                                : 'linear-gradient(135deg, #3f87fe 0%, #00d2fe 100%)',
                            },
                            '&:disabled': {
                              background: theme.palette.mode === 'dark' ? '#424242' : '#e0e0e0',
                              color: theme.palette.mode === 'dark' ? '#757575' : '#9e9e9e',
                            }
                          }}
                          startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                        >
                          {isCreating ? 'Регистрация...' : 'Зарегистрировать платёж'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            )}
          </Box>
        </Slide>
      </Paper>

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
          {(['week', 'month', '3months'] as PeriodFilter[]).map((p) => (
            <Chip
              key={p}
              label={p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : '3 месяца'}
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
              <HistoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
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
                      <Avatar 
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          background: gradients.success,
                          fontSize: '1.2rem',
                          fontWeight: 600,
                        }}
                      >
                        {payment.client?.first_name?.[0]}{payment.client?.last_name?.[0]}
                      </Avatar>
                      
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