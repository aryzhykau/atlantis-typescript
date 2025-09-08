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
  useGetTrainerRegisteredPaymentsQuery,
  useCreateQuickPaymentMutation 
} from '../../../store/apis/trainersApi';
import { useSnackbar } from '../../../hooks/useSnackBar';
import { useGradients } from '../hooks/useGradients';
import { PaymentForm } from './PaymentForm';
import { skipToken } from '@reduxjs/toolkit/query';
import dayjs from 'dayjs';

interface PaymentFormData {
  student_id: number;
  amount: string;
}

export const TrainerPayments: React.FC = () => {
  const theme = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [expandedPayment, setExpandedPayment] = useState<number | null>(null);

  const { displaySnackbar } = useSnackbar();
  const [createPayment, { isLoading: isCreating }] = useCreateQuickPaymentMutation();

  // Получаем текущего пользователя (тренера)
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();
  const trainerId = user?.id;

  // Получаем студентов тренера для селектора
  const { data: students = [], isLoading: isLoadingStudents, error: studentsError } = useGetTrainerStudentsQuery(
    trainerId ? { trainer_id: trainerId } : skipToken
  );

  // Отладка студентов
  console.log('TrainerPayments - trainerId:', trainerId);
  console.log('TrainerPayments - students:', students);
  console.log('TrainerPayments - isLoadingStudents:', isLoadingStudents);
  console.log('TrainerPayments - studentsError:', studentsError);

  // Получаем зарегистрированные платежи тренера за последние 2 недели
  const { data: paymentsData, isLoading: isLoadingPayments } = useGetTrainerRegisteredPaymentsQuery(
    trainerId ? { 
      trainerId, 
      filters: { period: '2weeks' } 
    } : skipToken
  );

  const payments = paymentsData?.payments || [];


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
            Ваши зарегистрированные платежи за последние 2 недели
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {payments.map((payment: any, index: number) => (
                <Fade in timeout={300 + index * 100} key={payment.id}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      background: theme.palette.background.paper,
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: theme.shadows[4],
                        transform: 'translateY(-2px)',
                      }
                    }}
                    onClick={() => setExpandedPayment(expandedPayment === payment.id ? null : payment.id)}
                  >
                    {/* Header with gradient background */}
                    <Box sx={{ 
                      p: 2.5, 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      borderBottom: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.1),
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        {/* Left side - Student initials and info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                          <Box sx={{ 
                            minWidth: 60,
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: gradients.success,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.3rem',
                            boxShadow: theme.shadows[3],
                            flexShrink: 0,
                          }}>
                            {(() => {
                              // Extract student name from description "Оплатили за Имя Фамилия"
                              const match = payment.description?.match(/за\s+([А-Яа-яA-Za-z]+)\s+([А-Яа-яA-Za-z]+)/);
                              if (match) {
                                const firstName = match[1];
                                const lastName = match[2];
                                return `${firstName[0]}${lastName[0]}`.toUpperCase();
                              }
                              return '👤';
                            })()}
                          </Box>
                          
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700, 
                              mb: 0.5, 
                              color: theme.palette.text.primary,
                              fontSize: '1.1rem'
                            }}>
                              {payment.client_first_name} {payment.client_last_name}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: theme.palette.text.secondary,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mb: 0.5
                            }}>
                              📅 {dayjs(payment.payment_date).format('DD MMMM YYYY в HH:mm')}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 500, 
                              color: theme.palette.text.primary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {payment.description}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Right side - Amount and expand button */}
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'flex-end',
                          gap: 1,
                          flexShrink: 0,
                        }}>
                          <Chip
                            icon={<Euro sx={{ fontSize: '1.1rem' }} />}
                            label={`${payment.amount.toFixed(2)} €`}
                            size="medium"
                            sx={{ 
                              background: gradients.success,
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '1.1rem',
                              height: 36,
                              boxShadow: theme.shadows[2],
                              '& .MuiChip-icon': {
                                color: 'white',
                              }
                            }}
                          />
                          <IconButton 
                            size="small"
                            sx={{
                              background: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.2),
                              }
                            }}
                          >
                            {expandedPayment === payment.id ? 
                              <ExpandLess sx={{ color: theme.palette.primary.main }} /> : 
                              <ExpandMore sx={{ color: theme.palette.primary.main }} />
                            }
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>

                    {/* Expandable details section */}
                    <Slide direction="down" in={expandedPayment === payment.id} mountOnEnter unmountOnExit>
                      <Box sx={{ 
                        p: 2.5, 
                        background: alpha(theme.palette.background.default, 0.5),
                      }}>
                        <Grid container spacing={3}>
                          <Grid item xs={6}>
                            <Box sx={{
                              p: 2,
                              borderRadius: 2,
                              background: theme.palette.background.paper,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}>
                              <Typography variant="caption" sx={{ 
                                color: theme.palette.text.secondary,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5
                              }}>
                                ID платежа
                              </Typography>
                              <Typography variant="body1" sx={{ 
                                fontWeight: 600, 
                                color: theme.palette.text.primary,
                                mt: 0.5
                              }}>
                                #{payment.id}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{
                              p: 2,
                              borderRadius: 2,
                              background: theme.palette.background.paper,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}>
                              <Typography variant="caption" sx={{ 
                                color: theme.palette.text.secondary,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5
                              }}>
                                Дата регистрации
                              </Typography>
                              <Typography variant="body1" sx={{ 
                                fontWeight: 600, 
                                color: theme.palette.text.primary,
                                mt: 0.5
                              }}>
                                {dayjs(payment.payment_date).format('DD.MM.YYYY HH:mm')}
                              </Typography>
                            </Box>
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